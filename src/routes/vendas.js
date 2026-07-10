const express = require('express');
const router = express.Router();
const VendaController = require('../controllers/VendaController');

// GET /api/vendas - Listar todas as vendas
router.get('/', VendaController.index.bind(VendaController));

// GET /api/vendas/:id - Buscar venda por ID
router.get('/:id', VendaController.show.bind(VendaController));

// POST /api/vendas - Criar nova venda
router.post('/', VendaController.store.bind(VendaController));

// PUT /api/vendas/:id/cancelar - Cancelar venda
router.put('/:id/cancelar', VendaController.cancel.bind(VendaController));

// GET /api/vendas/relatorio - Relatório de vendas
router.get('/relatorio', VendaController.getRelatorio.bind(VendaController));

module.exports = router;
