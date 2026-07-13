const BaseService = require('./BaseService');
const Venda = require('../models/Venda');
const ContaPagar = require('../models/ContaPagar');
const Produto = require('../models/Produto');
const Cliente = require('../models/Cliente');
const AppError = require('../errors/AppError');
const mongoose = require('mongoose');

/**
 * Serviço para operações de Vendas
 * Estende BaseService para operações CRUD básicas
 */
class VendaService extends BaseService {
  constructor() {
    super(Venda);
  }

  /**
   * Listar vendas com paginação e filtros
   * @param {Object} options - Opções de consulta
   * @returns {Promise<Object>}
   */
  async listar({ page = 1, limit = 10, search, formaPagamento, status } = {}) {
    const query = {};
    
    if (formaPagamento) {
      query.formaPagamento = formaPagamento;
    }
    
    if (status) {
      query.status = status;
    }

    // Busca por texto (cliente ou produtos)
    if (search) {
      const vendas = await Venda.find({})
        .populate('cliente', 'nome cpf')
        .populate('itens.produto', 'descricao codigoBarras');
      
      const filteredVendas = vendas.filter(venda => {
        const clienteMatch = venda.cliente && 
          (venda.cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
           venda.cliente.cpf.includes(search));
        
        const produtoMatch = venda.itens.some(item => 
          item.produto && 
          (item.produto.descricao.toLowerCase().includes(search.toLowerCase()) ||
           item.produto.codigoBarras.includes(search))
        );
        
        return clienteMatch || produtoMatch;
      });
      
      return {
        vendas: filteredVendas,
        pagination: {
          total: filteredVendas.length,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(filteredVendas.length / limit),
          currentPage: parseInt(page)
        }
      };
    }
    
    const vendas = await Venda.find(query)
      .populate('cliente', 'nome cpf')
      .populate('itens.produto', 'descricao codigoBarras')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ dataVenda: -1 });
    
    const count = await Venda.countDocuments(query);
    
    return {
      vendas,
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
   * Buscar venda por ID com populates
   * @param {string} id - ID da venda
   * @returns {Promise<Object>}
   */
  async buscarComDetalhes(id) {
    const venda = await Venda.findById(id)
      .populate('cliente', 'nome cpf endereco telefones limiteCredito')
      .populate('itens.produto', 'descricao codigoBarras quantidadeEstoque');
    
    if (!venda) {
      throw new AppError.NotFoundError('Venda');
    }
    
    return venda;
  }

  /**
   * Criar venda com validação de estoque e limite de crédito
   * @param {Object} data - Dados da venda
   * @returns {Promise<Object>}
   */
  async criar(data) {
    const session = await Venda.startSession();
    
    try {
      await session.startTransaction();
      
      const { cliente, formaPagamento, itens, dataVencimento } = data;
      
      // Validar itens
      if (!itens || itens.length === 0) {
        await session.abortTransaction();
        throw new AppError.BadRequestError('A venda deve conter pelo menos um item');
      }
      
      // Verificar estoque e calcular total
      let valorTotal = 0;
      for (const item of itens) {
        const produto = await Produto.findById(item.produto).session(session);
        
        if (!produto) {
          await session.abortTransaction();
          throw new AppError.NotFoundError(`Produto não encontrado: ${item.produto}`);
        }
        
        if (produto.quantidadeEstoque < item.quantidade) {
          await session.abortTransaction();
          throw new AppError.BadRequestError(`Estoque insuficiente para o produto: ${produto.descricao}. Disponível: ${produto.quantidadeEstoque}, Solicitado: ${item.quantidade}`);
        }
        
        valorTotal += item.subtotal;
      }
      
      // Se for venda a prazo, validar cliente e limite de crédito
      if (formaPagamento === 'prazo') {
        if (!cliente) {
          await session.abortTransaction();
          throw new AppError.BadRequestError('Cliente é obrigatório para vendas a prazo');
        }
        
        const clienteDoc = await Cliente.findById(cliente).session(session);
        
        if (!clienteDoc) {
          await session.abortTransaction();
          throw new AppError.NotFoundError('Cliente');
        }
        
        // Calcular total já comprometido em contas pendentes
        const contasPendentes = await ContaPagar.aggregate([
          { $match: { 
            cliente: new mongoose.Types.ObjectId(cliente),
            status: { $in: ['pendente', 'parcial'] }
          }},
          { $group: { _id: null, total: { $sum: '$valorRestante' } } }
        ]).session(session);
        
        const totalComprometido = contasPendentes.length > 0 ? contasPendentes[0].total : 0;
        
        // Verificar se nova compra excede limite
        if ((totalComprometido + valorTotal) > clienteDoc.limiteCredito) {
          await session.abortTransaction();
          throw new AppError.BadRequestError(`Limite de crédito excedido. Limite: R$ ${clienteDoc.limiteCredito.toFixed(2)}, Comprometido: R$ ${totalComprometido.toFixed(2)}, Nova compra: R$ ${valorTotal.toFixed(2)}`);
        }
      }
      
      // Criar venda
      const venda = new Venda({
        cliente: formaPagamento === 'prazo' ? cliente : null,
        formaPagamento,
        valorTotal,
        itens,
        status: 'concluida'
      });
      
      await venda.save({ session });
      
      // Baixar estoque de cada produto
      for (const item of itens) {
        await Produto.findByIdAndUpdate(
          item.produto,
          { $inc: { quantidadeEstoque: -item.quantidade } },
          { session, runValidators: true }
        );
      }
      
      // Se for venda a prazo, criar conta a pagar
      if (formaPagamento === 'prazo') {
        const contaPagar = new ContaPagar({
          cliente,
          venda: venda._id,
          dataVencimento: dataVencimento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          valorOriginal: valorTotal,
          valorPago: 0,
          valorRestante: valorTotal,
          status: 'pendente'
        });
        
        await contaPagar.save({ session });
      }
      
      await session.commitTransaction();
      
      // Buscar venda completa após salvar
      return await this.buscarComDetalhes(venda._id);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Cancelar venda e estornar estoque
   * @param {string} id - ID da venda
   * @returns {Promise<Object>}
   */
  async cancelar(id) {
    const session = await Venda.startSession();
    
    try {
      await session.startTransaction();
      
      const venda = await Venda.findById(id).session(session);
      
      if (!venda) {
        await session.abortTransaction();
        throw new AppError.NotFoundError('Venda');
      }
      
      if (venda.status === 'cancelada') {
        await session.abortTransaction();
        throw new AppError.BadRequestError('Venda já está cancelada');
      }
      
      // Estornar estoque
      for (const item of venda.itens) {
        await Produto.findByIdAndUpdate(
          item.produto,
          { $inc: { quantidadeEstoque: item.quantidade } },
          { session }
        );
      }
      
      // Se foi venda a prazo, cancelar conta a pagar
      if (venda.formaPagamento === 'prazo') {
        await ContaPagar.findOneAndUpdate(
          { venda: venda._id },
          { status: 'cancelada' },
          { session }
        );
      }
      
      venda.status = 'cancelada';
      await venda.save({ session });
      
      await session.commitTransaction();
      
      return { message: 'Venda cancelada com sucesso' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Gerar relatório de vendas
   * @param {Object} filters - Filtros do relatório
   * @returns {Promise<Object>}
   */
  async gerarRelatorio({ dataInicio, dataFim, formaPagamento } = {}) {
    const query = {};
    if (dataInicio && dataFim) {
      query.dataVenda = {
        $gte: new Date(dataInicio),
        $lte: new Date(dataFim)
      };
    }
    
    if (formaPagamento) {
      query.formaPagamento = formaPagamento;
    }
    
    const vendas = await Venda.find(query)
      .populate('cliente', 'nome')
      .populate('itens.produto', 'descricao');
    
    const relatorio = {
      totalVendas: vendas.length,
      valorTotalVendido: vendas.reduce((acc, v) => acc + v.valorTotal, 0),
      vendasPorFormaPagamento: {},
      vendas: vendas
    };
    
    // Agrupar por forma de pagamento
    const formasPagamento = ['dinheiro', 'pix', 'cartao', 'prazo'];
    for (const forma of formasPagamento) {
      const vendasForma = vendas.filter(v => v.formaPagamento === forma);
      relatorio.vendasPorFormaPagamento[forma] = {
        quantidade: vendasForma.length,
        valor: vendasForma.reduce((acc, v) => acc + v.valorTotal, 0)
      };
    }
    
    return relatorio;
  }
}

module.exports = new VendaService();
