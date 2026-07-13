const TipoUnidade = require('../models/TipoUnidade');
const BaseService = require('./BaseService');
const { ConflictError } = require('../errors/AppError');

class TipoUnidadeService extends BaseService {
  constructor() {
    super(TipoUnidade);
  }

  /**
   * Normalizar código para maiúsculas
   * @param {string} codigo - Código do tipo de unidade
   * @returns {string}
   */
  _normalizarCodigo(codigo) {
    return codigo ? codigo.toUpperCase() : codigo;
  }

  /**
   * Criar tipo de unidade com validação de código único
   * @param {Object} data - Dados do tipo de unidade
   * @returns {Promise<Object>}
   */
  async create(data) {
    const { codigo, descricao } = data;
    
    if (codigo) {
      const codigoNormalizado = this._normalizarCodigo(codigo);
      const existingTipo = await this.findOne({ codigo: codigoNormalizado }, false);
      if (existingTipo) {
        throw new ConflictError('Já existe um tipo de unidade cadastrado com este código');
      }
      
      return super.create({ codigo: codigoNormalizado, descricao });
    }
    
    return super.create(data);
  }

  /**
   * Atualizar tipo de unidade por código
   * @param {string} codigo - Código do tipo de unidade
   * @param {Object} dadosAtualizados - Dados para atualização
   * @returns {Promise<Object>}
   */
  async updateByCodigo(codigo, dadosAtualizados) {
    const codigoNormalizado = this._normalizarCodigo(codigo);
    
    // Se estiver tentando alterar o código, verificar se já existe
    if (dadosAtualizados.codigo && dadosAtualizados.codigo !== codigo) {
      const codigoAtualizado = this._normalizarCodigo(dadosAtualizados.codigo);
      const existingTipo = await this.findOne({ codigo: codigoAtualizado }, false);
      if (existingTipo) {
        throw new ConflictError('Já existe um tipo de unidade cadastrado com este código');
      }
      
      dadosAtualizados.codigo = codigoAtualizado;
    }
    
    return super.updateOne({ codigo: codigoNormalizado }, dadosAtualizados);
  }

  /**
   * Buscar tipo de unidade por código
   * @param {string} codigo - Código do tipo de unidade
   * @param {boolean} throwNotFound - Lançar erro se não encontrado
   * @returns {Promise<Object|null>}
   */
  async findByCodigo(codigo, throwNotFound = false) {
    const codigoNormalizado = this._normalizarCodigo(codigo);
    return super.findOne({ codigo: codigoNormalizado }, throwNotFound);
  }

  /**
   * Deletar tipo de unidade por código
   * @param {string} codigo - Código do tipo de unidade
   * @returns {Promise<Object>}
   */
  async deleteByCodigo(codigo) {
    const codigoNormalizado = this._normalizarCodigo(codigo);
    const tipoUnidade = await this.findByCodigo(codigoNormalizado, true);
    return super.delete(tipoUnidade._id.toString());
  }

  /**
   * Listar tipos de unidade ordenados por descrição
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

module.exports = new TipoUnidadeService();
