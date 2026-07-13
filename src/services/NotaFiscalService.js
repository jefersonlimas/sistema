const BaseService = require('./BaseService');
const NotaFiscal = require('../models/NotaFiscal');
const Produto = require('../models/Produto');
const AppError = require('../errors/AppError');

/**
 * Serviço para operações de Notas Fiscais
 * Estende BaseService para operações CRUD básicas
 */
class NotaFiscalService extends BaseService {
  constructor() {
    super(NotaFiscal);
  }

  /**
   * Listar notas fiscais com paginação e busca
   * @param {Object} options - Opções de consulta
   * @returns {Promise<Object>}
   */
  async listar({ page = 1, limit = 10, search } = {}) {
    const query = search ? { 
      $or: [
        { numero: { $regex: search, $options: 'i' } },
        { serie: { $regex: search, $options: 'i' } }
      ]
    } : {};
    
    const notasFiscais = await NotaFiscal.find(query)
      .populate('fornecedor', 'nome codigo')
      .populate('itens.produto', 'descricao codigoBarras')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ dataEntrada: -1 });
    
    const count = await NotaFiscal.countDocuments(query);
    
    return {
      notasFiscais,
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
   * Buscar nota fiscal por ID com populates
   * @param {string} id - ID da nota fiscal
   * @returns {Promise<Object>}
   */
  async buscarComDetalhes(id) {
    const notaFiscal = await NotaFiscal.findById(id)
      .populate('fornecedor', 'nome codigo endereco telefone contato')
      .populate('itens.produto', 'descricao codigoBarras quantidadeEstoque');
    
    if (!notaFiscal) {
      throw new AppError.NotFoundError('Nota fiscal');
    }
    
    return notaFiscal;
  }

  /**
   * Criar nota fiscal e atualizar estoque
   * @param {Object} data - Dados da nota fiscal
   * @returns {Promise<Object>}
   */
  async criar(data) {
    const session = await NotaFiscal.startSession();
    
    try {
      await session.startTransaction();
      
      const { numero, serie, fornecedor, dataEmissao, dataEntrada, valorTotal, itens } = data;
      
      // Verificar se nota fiscal já existe (mesmo número e série)
      const existingNota = await NotaFiscal.findOne({ numero, serie }).session(session);
      if (existingNota) {
        await session.abortTransaction();
        throw new AppError.BadRequestError('Nota fiscal já cadastrada com este número e série');
      }
      
      // Validar itens
      if (!itens || itens.length === 0) {
        await session.abortTransaction();
        throw new AppError.BadRequestError('Nota fiscal deve conter pelo menos um item');
      }
      
      // Criar nota fiscal
      const notaFiscal = new NotaFiscal({
        numero,
        serie,
        fornecedor,
        dataEmissao: dataEmissao || Date.now(),
        dataEntrada: dataEntrada || Date.now(),
        valorTotal,
        itens
      });
      
      await notaFiscal.save({ session });
      
      // Atualizar estoque de cada produto
      for (const item of itens) {
        await Produto.findByIdAndUpdate(
          item.produto,
          { 
            $inc: { quantidadeEstoque: item.quantidade },
            $set: { precoCompra: item.precoUnitario }
          },
          { session, runValidators: true }
        );
      }
      
      await session.commitTransaction();
      
      // Buscar nota fiscal completa após salvar
      return await this.buscarComDetalhes(notaFiscal._id);
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Excluir nota fiscal e reverter estoque
   * @param {string} id - ID da nota fiscal
   * @returns {Promise<Object>}
   */
  async excluir(id) {
    const session = await NotaFiscal.startSession();
    
    try {
      await session.startTransaction();
      
      const notaFiscal = await NotaFiscal.findById(id).session(session);
      
      if (!notaFiscal) {
        await session.abortTransaction();
        throw new AppError.NotFoundError('Nota fiscal');
      }
      
      // Reverter estoque dos produtos
      for (const item of notaFiscal.itens) {
        await Produto.findByIdAndUpdate(
          item.produto,
          { $inc: { quantidadeEstoque: -item.quantidade } },
          { session }
        );
      }
      
      await NotaFiscal.findByIdAndDelete(id).session(session);
      await session.commitTransaction();
      
      return { message: 'Nota fiscal excluída e estoque revertido com sucesso' };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Gerar relatório de notas fiscais
   * @param {Object} filters - Filtros do relatório
   * @returns {Promise<Object>}
   */
  async gerarRelatorio({ dataInicio, dataFim } = {}) {
    const query = {};
    if (dataInicio && dataFim) {
      query.dataEntrada = {
        $gte: new Date(dataInicio),
        $lte: new Date(dataFim)
      };
    }
    
    const notasFiscais = await NotaFiscal.find(query)
      .populate('fornecedor', 'nome')
      .populate('itens.produto', 'descricao');
    
    return {
      totalNotas: notasFiscais.length,
      valorTotalEntradas: notasFiscais.reduce((acc, nf) => acc + nf.valorTotal, 0),
      produtosRecebidos: notasFiscais.reduce((acc, nf) => {
        nf.itens.forEach(item => {
          acc += item.quantidade;
        });
        return acc;
      }, 0),
      notas: notasFiscais
    };
  }
}

module.exports = new NotaFiscalService();
