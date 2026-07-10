const express = require('express');
const router = express.Router();
const TipoUnidadeController = require('../controllers/TipoUnidadeController');

// Rotas para CRUD de Tipos de Unidade
router.post('/tipos-unidade', TipoUnidadeController.criarTipoUnidade);
router.get('/tipos-unidade', TipoUnidadeController.listarTiposUnidade);
router.get('/tipos-unidade/:codigo', TipoUnidadeController.buscarTipoUnidadePorCodigo);
router.put('/tipos-unidade/:codigo', TipoUnidadeController.atualizarTipoUnidade);
router.delete('/tipos-unidade/:codigo', TipoUnidadeController.removerTipoUnidade);

module.exports = router;
