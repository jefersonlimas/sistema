const usuarioService = require('../services/UsuarioService');

class UsuarioController {
  async criar(req, res, next) {
    try {
      const usuario = await usuarioService.create(req.body);
      res.status(201).json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async listar(req, res, next) {
    try {
      const { ativo, funcaoId } = req.query;
      const usuarios = await usuarioService.listAll({ ativo, funcaoId });
      res.json(usuarios);
    } catch (error) {
      next(error);
    }
  }

  async buscarPorId(req, res, next) {
    try {
      const usuario = await usuarioService.findById(req.params.id, true);
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async buscarPorNomeUsuario(req, res, next) {
    try {
      const usuario = await usuarioService.findByNomeUsuario(req.params.nomeUsuario, true);
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async atualizar(req, res, next) {
    try {
      const usuario = await usuarioService.update(req.params.id, req.body);
      res.json(usuario);
    } catch (error) {
      next(error);
    }
  }

  async excluir(req, res, next) {
    try {
      const resultado = await usuarioService.delete(req.params.id);
      res.json({ mensagem: 'Usuário desativado com sucesso', usuario: resultado });
    } catch (error) {
      next(error);
    }
  }

  async alterarSenha(req, res, next) {
    try {
      const resultado = await usuarioService.alterarSenha(req.params.id, req.body);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async autenticar(req, res, next) {
    try {
      const resultado = await usuarioService.autenticar(req.body);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UsuarioController();
