const Fornecedor = require('../models/Fornecedor');
const BaseService = require('./BaseService');
const { ConflictError } = require('../errors/AppError');

class FornecedorService extends BaseService {
  constructor() {
    super(Fornecedor);
  }

  /**
   * Criar fornecedor com validação de código único
   * @param {Object} data - Dados do fornecedor
   * @returns {Promise<Object>}
   */
  async create(data) {
    const { codigo } = data;

    // Verificar se código já existe
    if (codigo) {
      const existingFornecedor = await this.findOne({ codigo }, false);
      if (existingFornecedor) {
        throw new ConflictError('Código de fornecedor já cadastrado');
      }
    }

    return super.create(data);
  }

  /**
   * Atualizar fornecedor por ID
   * @param {string} id - ID do fornecedor
   * @param {Object} dadosAtualizados - Dados para atualização
   * @returns {Promise<Object>}
   */
  async update(id, dadosAtualizados) {
    // Se estiver tentando alterar o código, verificar se já existe
    if (dadosAtualizados.codigo) {
      const existingFornecedor = await this.findOne(
        { codigo: dadosAtualizados.codigo, _id: { $ne: id } },
        false
      );
      if (existingFornecedor) {
        throw new ConflictError('Código de fornecedor já cadastrado');
      }
    }

    return super.update(id, dadosAtualizados);
  }

  /**
   * Buscar fornecedor por ID
   * @param {string} id - ID do fornecedor
   * @param {boolean} throwNotFound - Lançar erro se não encontrado
   * @returns {Promise<Object|null>}
   */
  async findById(id, throwNotFound = false) {
    return super.findById(id, throwNotFound);
  }

  /**
   * Deletar fornecedor por ID
   * @param {string} id - ID do fornecedor
   * @returns {Promise<Object>}
   */
  async delete(id) {
    return super.delete(id);
  }

  /**
   * Listar fornecedores com paginação e busca
   * @param {Object} options - Opções de consulta
   * @returns {Promise<Object>}
   */
  async listAll(options = {}) {
    const { page = 1, limit = 10, search } = options;
    
    const query = search ? { 
      $or: [
        { nome: { $regex: search, $options: 'i' } },
        { codigo: { $regex: search, $options: 'i' } }
      ]
    } : {};

    return super.findAll({
      page,
      limit,
      sort: { nome: 1 },
      filters: query
    });
  }
}

module.exports = new FornecedorService();
