const BaseService = require('./BaseService');
const Funcao = require('../models/Funcao');
const AppError = require('../errors/AppError');

/**
 * Serviço para operações de Função/Cargo
 * Estende BaseService para operações CRUD básicas
 */
class FuncaoService extends BaseService {
  constructor() {
    super(Funcao);
  }

  /**
   * Criar nova função com validação de código único
   * @param {Object} data - Dados da função
   * @returns {Promise<Object>}
   */
  async create(data) {
    const { codigo, descricao, modulosAcesso } = data;

    // Validar campos obrigatórios
    if (!codigo || !descricao || !modulosAcesso || modulosAcesso.length === 0) {
      throw new AppError.BadRequestError('Código, descrição e pelo menos um módulo de acesso são obrigatórios');
    }

    // Verificar se código já existe
    const funcaoExistente = await this.findOne({ codigo }, false);
    if (funcaoExistente) {
      throw new AppError.ConflictError('Já existe uma função com este código');
    }

    return super.create(data);
  }

  /**
   * Listar funções com filtros opcionais
   * @param {Object} filters - Filtros da consulta
   * @param {string} filters.ativo - Status ativo/inativo
   * @returns {Promise<Array>}
   */
  async listar(filters = {}) {
    const query = {};
    
    if (filters.ativo !== undefined) {
      query.ativo = filters.ativo === 'true';
    }

    return await Funcao.find(query)
      .sort({ descricao: 1 })
      .populate('modulosAcesso')
      .lean();
  }

  /**
   * Buscar função por código
   * @param {string} codigo - Código da função
   * @returns {Promise<Object|null>}
   */
  async buscarPorCodigo(codigo) {
    const funcao = await Funcao.findOne({ codigo }).lean();
    
    if (!funcao) {
      throw new AppError.NotFoundError('Função');
    }
    
    return funcao;
  }

  /**
   * Atualizar função com validação de código único
   * @param {string} id - ID da função
   * @param {Object} data - Dados para atualização
   * @returns {Promise<Object>}
   */
  async update(id, data) {
    const { codigo } = data;
    
    const funcaoExistente = await this.findById(id, true);
    
    // Verificar duplicidade de código se estiver alterando
    if (codigo && codigo !== funcaoExistente.codigo) {
      const outraFuncao = await this.findOne({ codigo, _id: { $ne: id } }, false);
      if (outraFuncao) {
        throw new AppError.ConflictError('Já existe outra função com este código');
      }
    }

    return super.update(id, data);
  }

  /**
   * Excluir função (soft delete - desativa)
   * @param {string} id - ID da função
   * @returns {Promise<Object>}
   */
  async excluir(id) {
    const funcao = await this.findById(id, true);
    
    // Soft delete - apenas desativa
    funcao.ativo = false;
    await funcao.save();
    
    return { mensagem: 'Função desativada com sucesso', funcao };
  }

  /**
   * Listar módulos disponíveis do sistema
   * @returns {Array<Object>}
   */
  listarModulos() {
    return [
      { id: 'clientes', nome: 'Clientes' },
      { id: 'produtos', nome: 'Produtos' },
      { id: 'tipos-unidade', nome: 'Tipos de Unidade' },
      { id: 'fornecedores', nome: 'Fornecedores' },
      { id: 'notas-fiscais', nome: 'Notas Fiscais' },
      { id: 'vendas', nome: 'Vendas' },
      { id: 'contas-pagar', nome: 'Contas a Pagar' },
      { id: 'funcoes', nome: 'Funções' },
      { id: 'usuarios', nome: 'Usuários' },
      { id: 'configuracoes', nome: 'Configurações' }
    ];
  }
}

module.exports = new FuncaoService();
