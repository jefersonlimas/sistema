const express = require('express');
const router = express.Router();
const NotaFiscalController = require('../controllers/NotaFiscalController');

// GET /api/notas-fiscais - Listar todas as notas fiscais (com paginação)
router.get('/', NotaFiscalController.index);

// GET /api/notas-fiscais/:id - Buscar uma nota fiscal específica
router.get('/:id', NotaFiscalController.show);

// POST /api/notas-fiscais - Registrar nova nota fiscal (entrada de mercadorias)
router.post('/', NotaFiscalController.store);

// DELETE /api/notas-fiscais/:id - Excluir nota fiscal (reverte estoque)
router.delete('/:id', NotaFiscalController.destroy);

// GET /api/notas-fiscais/relatorio - Relatório de entradas
router.get('/relatorio', NotaFiscalController.getRelatorio);

module.exports = router;
