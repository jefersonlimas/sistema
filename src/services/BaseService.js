/**
 * Serviço base para operações comuns de CRUD
 * Forrece métodos genéricos que podem ser estendidos pelos serviços específicos
 */
class BaseService {
  constructor(model) {
    this.model = model;
  }

  /**
   * Buscar todos os registros com paginação e ordenação
   * @param {Object} options - Opções de consulta
   * @param {number} options.page - Página atual (padrão: 1)
   * @param {number} options.limit - Limite por página (padrão: 10)
   * @param {Object} options.sort - Campos de ordenação (padrão: { createdAt: -1 })
   * @param {Object} options.filters - Filtros da consulta
   * @returns {Promise<Object>} - Dados paginados
   */
  async findAll({ page = 1, limit = 10, sort = { createdAt: -1 }, filters = {} } = {}) {
    const query = this.model.find(filters);
    
    const total = await this.model.countDocuments(filters);
    const totalPages = Math.ceil(total / limit);
    
    const data = await query
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    return {
      data,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    };
  }

  /**
   * Buscar um registro por ID
   * @param {string} id - ID do documento
   * @param {boolean} throwNotFound - Lançar erro se não encontrado (padrão: true)
   * @returns {Promise<Object|null>}
   */
  async findById(id, throwNotFound = true) {
    const document = await this.model.findById(id).lean();
    
    if (!document && throwNotFound) {
      const notFoundError = require('../errors/AppError').NotFoundError;
      throw new notFoundError(this.model.modelName);
    }
    
    return document;
  }

  /**
   * Buscar um registro por qualquer campo
   * @param {Object} criteria - Critérios de busca
   * @param {boolean} throwNotFound - Lançar erro se não encontrado (padrão: true)
   * @returns {Promise<Object|null>}
   */
  async findOne(criteria, throwNotFound = false) {
    const document = await this.model.findOne(criteria).lean();
    
    if (!document && throwNotFound) {
      const notFoundError = require('../errors/AppError').NotFoundError;
      throw new notFoundError(this.model.modelName);
    }
    
    return document;
  }

  /**
   * Criar um novo registro
   * @param {Object} data - Dados para criação
   * @returns {Promise<Object>}
   */
  async create(data) {
    const document = new this.model(data);
    await document.save();
    return document.toObject();
  }

  /**
   * Atualizar um registro por ID
   * @param {string} id - ID do documento
   * @param {Object} data - Dados para atualização
   * @param {Object} options - Opções adicionais
   * @returns {Promise<Object>}
   */
  async update(id, data, options = {}) {
    const { runValidators = true, newDocument = true } = options;
    
    const document = await this.model.findByIdAndUpdate(
      id,
      data,
      { 
        new: newDocument, 
        runValidators,
        lean: true
      }
    );
    
    if (!document) {
      const notFoundError = require('../errors/AppError').NotFoundError;
      throw new notFoundError(this.model.modelName);
    }
    
    return document;
  }

  /**
   * Atualizar um registro por critérios
   * @param {Object} criteria - Critérios de busca
   * @param {Object} data - Dados para atualização
   * @returns {Promise<Object>}
   */
  async updateOne(criteria, data) {
    const document = await this.model.findOneAndUpdate(
      criteria,
      data,
      { new: true, runValidators: true, lean: true }
    );
    
    if (!document) {
      const notFoundError = require('../errors/AppError').NotFoundError;
      throw new notFoundError(this.model.modelName);
    }
    
    return document;
  }

  /**
   * Deletar um registro por ID
   * @param {string} id - ID do documento
   * @param {boolean} softDelete - Usar soft delete se disponível (padrão: false)
   * @returns {Promise<Object>}
   */
  async delete(id, softDelete = false) {
    if (softDelete && this.model.schema.path('ativo')) {
      return await this.update(id, { ativo: false });
    }
    
    const document = await this.model.findByIdAndDelete(id);
    
    if (!document) {
      const notFoundError = require('../errors/AppError').NotFoundError;
      throw new notFoundError(this.model.modelName);
    }
    
    return { deleted: true, id };
  }

  /**
   * Verificar se existe registro com critérios
   * @param {Object} criteria - Critérios de busca
   * @returns {Promise<boolean>}
   */
  async exists(criteria) {
    const count = await this.model.countDocuments(criteria);
    return count > 0;
  }

  /**
   * Contar registros com filtros
   * @param {Object} filters - Filtros da consulta
   * @returns {Promise<number>}
   */
  async count(filters = {}) {
    return await this.model.countDocuments(filters);
  }
}

module.exports = BaseService;
