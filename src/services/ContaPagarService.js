const BaseService = require('./BaseService');
const ContaPagar = require('../models/ContaPagar');
const AppError = require('../errors/AppError');
const mongoose = require('mongoose');

/**
 * Serviço para operações de Contas a Pagar
 * Estende BaseService para operações CRUD básicas
 */
class ContaPagarService extends BaseService {
  constructor() {
    super(ContaPagar);
  }

  /**
   * Listar contas a pagar com paginação e filtros
   * @param {Object} options - Opções de consulta
   * @returns {Promise<Object>}
   */
  async listar({ page = 1, limit = 10, cliente, status } = {}) {
    const query = {};
    
    if (cliente) {
      query.cliente = cliente;
    }
    
    if (status) {
      query.status = status;
    }

    const contasPagar = await ContaPagar.find(query)
      .populate('cliente', 'nome cpf')
      .populate('venda', 'dataVenda formaPagamento valorTotal')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ dataVencimento: 1 });
    
    const count = await ContaPagar.countDocuments(query);
    
    return {
      contasPagar,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page)
      }
    };
  }

  /**
   * Buscar conta a pagar por ID com populates
   * @param {string} id - ID da conta
   * @returns {Promise<Object>}
   */
  async buscarComDetalhes(id) {
    const contaPagar = await ContaPagar.findById(id)
      .populate('cliente', 'nome cpf endereco telefones')
      .populate('venda');
    
    if (!contaPagar) {
      throw new AppError.NotFoundError('Conta a pagar');
    }
    
    return contaPagar;
  }

  /**
   * Registrar pagamento de conta
   * @param {string} id - ID da conta
   * @param {Object} data - Dados do pagamento
   * @returns {Promise<Object>}
   */
  async baixarPagamento(id, { valorPago, observacoes }) {
    const session = await ContaPagar.startSession();
    
    try {
      await session.startTransaction();
      
      const contaPagar = await ContaPagar.findById(id).session(session);
      
      if (!contaPagar) {
        await session.abortTransaction();
        throw new AppError.NotFoundError('Conta a pagar');
      }
      
      if (contaPagar.status === 'pago') {
        await session.abortTransaction();
        throw new AppError.BadRequestError('Conta já está quitada');
      }
      
      if (contaPagar.status === 'cancelada') {
        await session.abortTransaction();
        throw new AppError.BadRequestError('Conta está cancelada');
      }
      
      // Adicionar valor ao pagamento
      const novoValorPago = contaPagar.valorPago + (valorPago || contaPagar.valorRestante);
      
      if (novoValorPago > contaPagar.valorOriginal) {
        await session.abortTransaction();
        throw new AppError.BadRequestError(`Valor do pagamento excede o restante. Restante: R$ ${contaPagar.valorRestante.toFixed(2)}`);
      }
      
      contaPagar.valorPago = novoValorPago;
      if (observacoes) {
        contaPagar.observacoes = observacoes;
      }
      
      await contaPagar.save({ session });
      await session.commitTransaction();
      
      // Buscar conta atualizada
      return await this.buscarComDetalhes(contaPagar._id);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Gerar relatório de contas a pagar
   * @param {Object} filters - Filtros do relatório
   * @returns {Promise<Object>}
   */
  async gerarRelatorio({ cliente, dataInicio, dataFim } = {}) {
    const query = {};
    
    if (cliente) {
      query.cliente = cliente;
    }
    
    if (dataInicio && dataFim) {
      query.dataVencimento = {
        $gte: new Date(dataInicio),
        $lte: new Date(dataFim)
      };
    }
    
    const contasPagar = await ContaPagar.find(query)
      .populate('cliente', 'nome')
      .populate('venda');
    
    return {
      totalContas: contasPagar.length,
      valorTotalReceber: contasPagar.reduce((acc, c) => acc + c.valorOriginal, 0),
      valorTotalRecebido: contasPagar.reduce((acc, c) => acc + c.valorPago, 0),
      valorTotalPendente: contasPagar.reduce((acc, c) => acc + c.valorRestante, 0),
      porStatus: {
        pendente: contasPagar.filter(c => c.status === 'pendente').length,
        parcial: contasPagar.filter(c => c.status === 'parcial').length,
        pago: contasPagar.filter(c => c.status === 'pago').length,
        vencido: contasPagar.filter(c => c.status === 'vencido').length
      },
      contas: contasPagar
    };
  }

  /**
   * Buscar contas por cliente
   * @param {string} clienteId - ID do cliente
   * @returns {Promise<Object>}
   */
  async buscarPorCliente(clienteId) {
    const contasPagar = await ContaPagar.find({ cliente: clienteId })
      .populate('cliente', 'nome cpf limiteCredito')
      .populate('venda', 'dataVenda formaPagamento')
      .sort({ dataVencimento: 1 });
    
    const totalPendente = contasPagar
      .filter(c => c.status === 'pendente' || c.status === 'parcial')
      .reduce((acc, c) => acc + c.valorRestante, 0);
    
    const cliente = contasPagar.length > 0 ? contasPagar[0].cliente : null;
    const limiteDisponivel = cliente ? cliente.limiteCredito - totalPendente : 0;
    
    return {
      cliente,
      totalPendente,
      limiteDisponivel,
      contas: contasPagar
    };
  }
}

module.exports = new ContaPagarService();
