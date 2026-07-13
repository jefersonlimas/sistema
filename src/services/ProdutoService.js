const Produto = require('../models/Produto');
const BaseService = require('./BaseService');
const { ConflictError } = require('../errors/AppError');

class ProdutoService extends BaseService {
  constructor() {
    super(Produto);
  }

  /**
   * Criar produto com validação de código de barras único
   * @param {Object} data - Dados do produto
   * @returns {Promise<Object>}
   */
  async create(data) {
    const { codigoBarras } = data;

    // Verificar se código de barras já existe
    if (codigoBarras) {
      const existingProduto = await this.findOne({ codigoBarras }, false);
      if (existingProduto) {
        throw new ConflictError('Já existe um produto cadastrado com este código de barras');
      }
    }

    return super.create(data);
  }

  /**
   * Atualizar produto por código de barras
   * @param {string} codigoBarras - Código de barras do produto
   * @param {Object} dadosAtualizados - Dados para atualização
   * @returns {Promise<Object>}
   */
  async updateByCodigoBarras(codigoBarras, dadosAtualizados) {
    // Se estiver tentando alterar o código de barras, verificar se já existe
    if (dadosAtualizados.codigoBarras && dadosAtualizados.codigoBarras !== codigoBarras) {
      const existingProduto = await this.findOne({ codigoBarras: dadosAtualizados.codigoBarras }, false);
      if (existingProduto) {
        throw new ConflictError('Já existe um produto cadastrado com este código de barras');
      }
    }

    return super.updateOne({ codigoBarras }, dadosAtualizados);
  }

  /**
   * Buscar produto por código de barras
   * @param {string} codigoBarras - Código de barras do produto
   * @param {boolean} throwNotFound - Lançar erro se não encontrado
   * @returns {Promise<Object|null>}
   */
  async findByCodigoBarras(codigoBarras, throwNotFound = false) {
    return super.findOne({ codigoBarras }, throwNotFound);
  }

  /**
   * Deletar produto por código de barras
   * @param {string} codigoBarras - Código de barras do produto
   * @returns {Promise<Object>}
   */
  async deleteByCodigoBarras(codigoBarras) {
    const produto = await this.findByCodigoBarras(codigoBarras, true);
    return super.delete(produto._id.toString());
  }

  /**
   * Listar produtos ordenados por descrição
   * @param {Object} options - Opções de consulta
   * @returns {Promise<Object>}
   */
  async listAll(options = {}) {
    return super.findAll({
      ...options,
      sort: options.sort || { descricao: 1 }
    });
  }
}

module.exports = new ProdutoService();
