const FuncaoService = require('../services/FuncaoService');

class FuncaoController {
  // Criar nova função
  async criar(req, res, next) {
    try {
      const funcao = await FuncaoService.create(req.body);
      res.status(201).json(funcao);
    } catch (error) {
      next(error);
    }
  }

  // Listar todas as funções
  async listar(req, res, next) {
    try {
      const { ativo } = req.query;
      const funcoes = await FuncaoService.listar({ ativo });
      res.json(funcoes);
    } catch (error) {
      next(error);
    }
  }

  // Buscar função por ID
  async buscarPorId(req, res, next) {
    try {
      const { id } = req.params;
      const funcao = await FuncaoService.findById(id);
      res.json(funcao);
    } catch (error) {
      next(error);
    }
  }

  // Buscar função por código
  async buscarPorCodigo(req, res, next) {
    try {
      const { codigo } = req.params;
      const funcao = await FuncaoService.buscarPorCodigo(codigo);
      res.json(funcao);
    } catch (error) {
      next(error);
    }
  }

  // Atualizar função
  async atualizar(req, res, next) {
    try {
      const { id } = req.params;
      const funcao = await FuncaoService.update(id, req.body);
      res.json(funcao);
    } catch (error) {
      next(error);
    }
  }

  // Excluir função (soft delete)
  async excluir(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = await FuncaoService.excluir(id);
      res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  // Listar módulos disponíveis
  listarModulos(req, res) {
    const modulos = FuncaoService.listarModulos();
    res.json(modulos);
  }
}

module.exports = new FuncaoController();
