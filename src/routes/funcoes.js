const express = require('express');
const router = express.Router();
const FuncaoController = require('../controllers/FuncaoController');

// Rotas para funções
router.post('/', FuncaoController.criar.bind(FuncaoController));
router.get('/', FuncaoController.listar.bind(FuncaoController));
router.get('/modulos', FuncaoController.listarModulos.bind(FuncaoController));
router.get('/:id', FuncaoController.buscarPorId.bind(FuncaoController));
router.get('/codigo/:codigo', FuncaoController.buscarPorCodigo.bind(FuncaoController));
router.put('/:id', FuncaoController.atualizar.bind(FuncaoController));
router.delete('/:id', FuncaoController.excluir.bind(FuncaoController));

module.exports = router;
