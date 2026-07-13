const Cliente = require('../models/Cliente');
const BaseService = require('./BaseService');
const { ConflictError, ValidationError } = require('../errors/AppError');

class ClienteService extends BaseService {
  constructor() {
    super(Cliente);
  }

  /**
   * Criar cliente com validação de CPF único
   * @param {Object} data - Dados do cliente
   * @returns {Promise<Object>}
   */
  async create(data) {
    const { cpf } = data;

    // Verificar se CPF já existe
    if (cpf) {
      const existingCliente = await this.findOne({ cpf }, false);
      if (existingCliente) {
        throw new ConflictError('Já existe um cliente cadastrado com este CPF');
      }
    }

    return super.create(data);
  }

  /**
   * Atualizar cliente por CPF
   * @param {string} cpf - CPF do cliente
   * @param {Object} dadosAtualizados - Dados para atualização
   * @returns {Promise<Object>}
   */
  async updateByCpf(cpf, dadosAtualizados) {
    // Se estiver tentando alterar o CPF, verificar se já existe
    if (dadosAtualizados.cpf && dadosAtualizados.cpf !== cpf) {
      const existingCliente = await this.findOne({ cpf: dadosAtualizados.cpf }, false);
      if (existingCliente) {
        throw new ConflictError('Já existe um cliente cadastrado com este CPF');
      }
    }

    return super.updateOne({ cpf }, dadosAtualizados);
  }

  /**
   * Buscar cliente por CPF
   * @param {string} cpf - CPF do cliente
   * @param {boolean} throwNotFound - Lançar erro se não encontrado
   * @returns {Promise<Object|null>}
   */
  async findByCpf(cpf, throwNotFound = false) {
    return super.findOne({ cpf }, throwNotFound);
  }

  /**
   * Deletar cliente por CPF
   * @param {string} cpf - CPF do cliente
   * @returns {Promise<Object>}
   */
  async deleteByCpf(cpf) {
    const cliente = await this.findByCpf(cpf, true);
    return super.delete(cliente._id.toString());
  }

  /**
   * Adicionar telefone ao cliente
   * @param {string} cpf - CPF do cliente
   * @param {Object} telefone - Dados do telefone (tipo, numero)
   * @returns {Promise<Object>}
   */
  async addTelefone(cpf, telefone) {
    const cliente = await this.findByCpf(cpf, true);
    
    if (!cliente.telefones) {
      cliente.telefones = [];
    }
    
    cliente.telefones.push(telefone);
    await cliente.save();
    
    return cliente.toObject();
  }

  /**
   * Remover telefone do cliente por índice
   * @param {string} cpf - CPF do cliente
   * @param {number} indice - Índice do telefone na lista
   * @returns {Promise<Object>}
   */
  async removeTelefone(cpf, indice) {
    const cliente = await this.findByCpf(cpf, true);
    
    if (indice < 0 || indice >= cliente.telefones.length) {
      throw new ValidationError('Índice de telefone inválido');
    }
    
    cliente.telefones.splice(indice, 1);
    await cliente.save();
    
    return cliente.toObject();
  }

  /**
   * Listar clientes ordenados por nome
   * @param {Object} options - Opções de consulta
   * @returns {Promise<Object>}
   */
  async listAll(options = {}) {
    return super.findAll({
      ...options,
      sort: options.sort || { nome: 1 }
    });
  }
}

module.exports = new ClienteService();
