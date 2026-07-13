const Usuario = require('../models/Usuario');
const Funcao = require('../models/Funcao');
const BaseService = require('./BaseService');
const { ConflictError, NotFoundError, ValidationError, UnauthorizedError } = require('../errors/AppError');

class UsuarioService extends BaseService {
  constructor() {
    super(Usuario);
  }

  /**
   * Validar dados do usuário
   * @param {Object} data - Dados do usuário
   */
  _validarDados(data) {
    const { codigo, nome, funcaoId, nomeUsuario, senha } = data;

    if (!codigo || !nome || !funcaoId || !nomeUsuario || !senha) {
      throw new ValidationError('Código, nome, função, nome de usuário e senha são obrigatórios');
    }

    if (senha.length < 6) {
      throw new ValidationError('A senha deve ter pelo menos 6 caracteres');
    }
  }

  /**
   * Verificar duplicidade de código
   * @param {string} codigo - Código do usuário
   * @param {string} excludeId - ID para excluir da verificação
   */
  async _verificarCodigoDuplicado(codigo, excludeId = null) {
    if (!codigo) return;

    const criteria = { codigo };
    if (excludeId) {
      criteria._id = { $ne: excludeId };
    }

    const usuarioExistente = await this.findOne(criteria, false);
    if (usuarioExistente) {
      throw new ConflictError('Já existe um usuário com este código');
    }
  }

  /**
   * Verificar duplicidade de nome de usuário
   * @param {string} nomeUsuario - Nome de usuário
   * @param {string} excludeId - ID para excluir da verificação
   */
  async _verificarNomeUsuarioDuplicado(nomeUsuario, excludeId = null) {
    if (!nomeUsuario) return;

    const criteria = { nomeUsuario: nomeUsuario.toLowerCase() };
    if (excludeId) {
      criteria._id = { $ne: excludeId };
    }

    const usuarioExistente = await this.findOne(criteria, false);
    if (usuarioExistente) {
      throw new ConflictError('Já existe um usuário com este nome de usuário');
    }
  }

  /**
   * Verificar se função existe
   * @param {string} funcaoId - ID da função
   */
  async _verificarFuncao(funcaoId) {
    if (!funcaoId) return;

    const FuncaoModel = require('../models/Funcao');
    const funcao = await FuncaoModel.findById(funcaoId);
    if (!funcao) {
      throw new NotFoundError('Função');
    }
  }

  /**
   * Remover senha do objeto
   * @param {Object} usuario - Usuário
   * @returns {Object}
   */
  _removerSenha(usuario) {
    if (!usuario) return null;
    const usuarioObj = typeof usuario.toObject === 'function' ? usuario.toObject() : usuario;
    delete usuarioObj.senha;
    return usuarioObj;
  }

  /**
   * Criar usuário com validações
   * @param {Object} data - Dados do usuário
   * @returns {Promise<Object>}
   */
  async create(data) {
    this._validarDados(data);
    
    await this._verificarCodigoDuplicado(data.codigo);
    await this._verificarNomeUsuarioDuplicado(data.nomeUsuario);
    await this._verificarFuncao(data.funcaoId);

    const usuario = new Usuario({
      codigo: data.codigo,
      nome: data.nome,
      funcao: data.funcaoId,
      nomeUsuario: data.nomeUsuario,
      senha: data.senha
    });

    await usuario.save();
    return this._removerSenha(usuario);
  }

  /**
   * Atualizar usuário por ID
   * @param {string} id - ID do usuário
   * @param {Object} dadosAtualizados - Dados para atualização
   * @returns {Promise<Object>}
   */
  async update(id, dadosAtualizados) {
    const { codigo, nomeUsuario, funcaoId, senha } = dadosAtualizados;

    const usuarioExistente = await this.findById(id, true);

    // Verificar duplicidade de código se estiver alterando
    if (codigo && codigo !== usuarioExistente.codigo) {
      await this._verificarCodigoDuplicado(codigo, id);
    }

    // Verificar duplicidade de nome de usuário se estiver alterando
    if (nomeUsuario && nomeUsuario.toLowerCase() !== usuarioExistente.nomeUsuario) {
      await this._verificarNomeUsuarioDuplicado(nomeUsuario, id);
    }

    // Verificar se função existe se estiver alterando
    if (funcaoId && funcaoId !== usuarioExistente.funcao.toString()) {
      await this._verificarFuncao(funcaoId);
    }

    // Validar senha se estiver alterando
    if (senha && senha.length < 6) {
      throw new ValidationError('A senha deve ter pelo menos 6 caracteres');
    }

    const dadosAtualizacao = { 
      codigo, 
      nome: dadosAtualizados.nome, 
      funcao: funcaoId, 
      ativo: dadosAtualizados.ativo 
    };
    
    // Só atualiza senha se foi fornecida
    if (senha) {
      dadosAtualizacao.senha = senha;
    }

    const usuarioAtualizado = await super.update(id, dadosAtualizacao);
    return this._removerSenha(usuarioAtualizado);
  }

  /**
   * Buscar usuário por ID
   * @param {string} id - ID do usuário
   * @param {boolean} throwNotFound - Lançar erro se não encontrado
   * @returns {Promise<Object|null>}
   */
  async findById(id, throwNotFound = false) {
    const usuario = await this.model.findById(id)
      .populate('funcao', 'codigo descricao modulosAcesso')
      .lean();
    
    if (!usuario && throwNotFound) {
      throw new NotFoundError('Usuário');
    }
    
    return this._removerSenha(usuario);
  }

  /**
   * Buscar usuário por nome de usuário
   * @param {string} nomeUsuario - Nome de usuário
   * @param {boolean} throwNotFound - Lançar erro se não encontrado
   * @returns {Promise<Object|null>}
   */
  async findByNomeUsuario(nomeUsuario, throwNotFound = false) {
    const usuario = await this.model.findOne({ nomeUsuario: nomeUsuario.toLowerCase() })
      .populate('funcao', 'codigo descricao modulosAcesso')
      .lean();
    
    if (!usuario && throwNotFound) {
      throw new NotFoundError('Usuário');
    }
    
    return this._removerSenha(usuario);
  }

  /**
   * Listar usuários com filtros
   * @param {Object} options - Opções de consulta
   * @returns {Promise<Array>}
   */
  async listAll(options = {}) {
    const { ativo, funcaoId } = options;
    const filtro = {};

    if (ativo !== undefined) {
      filtro.ativo = ativo === 'true';
    }

    if (funcaoId) {
      filtro.funcao = funcaoId;
    }

    const usuarios = await this.model.find(filtro)
      .populate('funcao', 'codigo descricao')
      .sort({ nome: 1 })
      .lean();

    return usuarios.map(usuario => this._removerSenha(usuario));
  }

  /**
   * Deletar usuário (soft delete)
   * @param {string} id - ID do usuário
   * @returns {Promise<Object>}
   */
  async delete(id) {
    const usuario = await this.findById(id, true);

    // Não permitir exclusão de usuário imutável (admin)
    if (usuario.imutavel) {
      throw new Error('Não é possível excluir este usuário. Este é um usuário do sistema e não pode ser removido.');
    }

    // Soft delete - apenas desativa
    return super.update(id, { ativo: false });
  }

  /**
   * Alterar senha do usuário
   * @param {string} id - ID do usuário
   * @param {Object} data - Dados da senha
   * @returns {Promise<Object>}
   */
  async alterarSenha(id, { senhaAtual, novaSenha }) {
    if (!senhaAtual || !novaSenha) {
      throw new ValidationError('Senha atual e nova senha são obrigatórias');
    }

    if (novaSenha.length < 6) {
      throw new ValidationError('A nova senha deve ter pelo menos 6 caracteres');
    }

    const usuario = await this.model.findById(id);
    if (!usuario) {
      throw new NotFoundError('Usuário');
    }

    // Verificar senha atual
    const senhaValida = await usuario.compararSenha(senhaAtual);
    if (!senhaValida) {
      throw new UnauthorizedError('Senha atual inválida');
    }

    // Atualizar senha (o middleware do schema fará o hash)
    usuario.senha = novaSenha;
    await usuario.save();

    return { mensagem: 'Senha alterada com sucesso' };
  }

  /**
   * Autenticar usuário
   * @param {Object} credentials - Credenciais
   * @returns {Promise<Object>}
   */
  async autenticar({ nomeUsuario, senha }) {
    if (!nomeUsuario || !senha) {
      throw new ValidationError('Nome de usuário e senha são obrigatórios');
    }

    const usuario = await this.model.findOne({ nomeUsuario: nomeUsuario.toLowerCase() })
      .populate('funcao', 'codigo descricao modulosAcesso');
    
    if (!usuario) {
      throw new NotFoundError('Usuário');
    }

    if (!usuario.ativo) {
      throw new Error('Usuário desativado');
    }

    const senhaValida = await usuario.compararSenha(senha);
    if (!senhaValida) {
      throw new UnauthorizedError('Senha inválida');
    }

    return { 
      mensagem: 'Autenticação bem-sucedida', 
      usuario: this._removerSenha(usuario) 
    };
  }

  /**
   * Criar usuário administrador inicial
   * @returns {Promise<void>}
   */
  async criarAdminSeNecessario() {
    const totalUsuarios = await this.model.countDocuments();
    
    if (totalUsuarios === 0) {
      // Criar função "Administrador" com todos os módulos se não existir
      const FuncaoModel = require('../models/Funcao');
      let funcaoAdmin = await FuncaoModel.findOne({ codigo: 'ADMIN' });
      
      if (!funcaoAdmin) {
        funcaoAdmin = new FuncaoModel({
          codigo: 'ADMIN',
          descricao: 'Administrador do Sistema',
          modulosAcesso: [
            'clientes',
            'produtos',
            'tipos-unidade',
            'fornecedores',
            'notas-fiscais',
            'vendas',
            'contas-pagar',
            'funcoes',
            'usuarios',
            'configuracoes'
          ],
          ativo: true,
          imutavel: true
        });
        await funcaoAdmin.save();
        console.log('Função Administrador criada com sucesso');
      }
      
      // Criar usuário admin
      const usuarioAdmin = new Usuario({
        codigo: 'ADMIN001',
        nome: 'Administrador',
        funcao: funcaoAdmin._id,
        nomeUsuario: 'admin',
        senha: 'admin123',
        ativo: true,
        imutavel: true
      });
      
      await usuarioAdmin.save();
      console.log('Usuário administrador criado com sucesso');
      console.log('Login: admin | Senha: admin123');
    }
  }
}

module.exports = new UsuarioService();
