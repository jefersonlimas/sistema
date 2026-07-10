const express = require('express');
const router = express.Router();
const ContaPagarController = require('../controllers/ContaPagarController');

// GET /api/contas-pagar - Listar todas as contas a pagar
router.get('/', ContaPagarController.index.bind(ContaPagarController));

// GET /api/contas-pagar/:id - Buscar conta a pagar por ID
router.get('/:id', ContaPagarController.show.bind(ContaPagarController));

// PUT /api/contas-pagar/:id/pagar - Registrar pagamento
router.put('/:id/pagar', ContaPagarController.baixarPagamento.bind(ContaPagarController));

// GET /api/contas-pagar/relatorio - Relatório de contas a pagar
router.get('/relatorio', ContaPagarController.getRelatorio.bind(ContaPagarController));

// GET /api/contas-pagar/cliente/:clienteId - Contas por cliente
router.get('/cliente/:clienteId', ContaPagarController.getPorCliente.bind(ContaPagarController));

module.exports = router;
