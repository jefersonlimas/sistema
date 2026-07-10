const express = require('express');
const router = express.Router();
const FornecedorController = require('../controllers/FornecedorController');

// GET /api/fornecedores - Listar todos os fornecedores (com paginação)
router.get('/', FornecedorController.index);

// GET /api/fornecedores/:id - Buscar um fornecedor específico
router.get('/:id', FornecedorController.show);

// POST /api/fornecedores - Cadastrar novo fornecedor
router.post('/', FornecedorController.store);

// PUT /api/fornecedores/:id - Atualizar fornecedor
router.put('/:id', FornecedorController.update);

// DELETE /api/fornecedores/:id - Excluir fornecedor
router.delete('/:id', FornecedorController.destroy);

module.exports = router;
