const express = require('express');
const router = express.Router();
const ConfiguracaoController = require('../controllers/ConfiguracaoController');

// Middleware de upload
const uploadLogo = ConfiguracaoController.uploadLogo;

// Rotas
router.get('/', ConfiguracaoController.getConfiguracoes);
router.put('/', uploadLogo, ConfiguracaoController.atualizarConfiguracoes);

module.exports = router;
