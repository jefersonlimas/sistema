const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/ClienteController');

// Rotas para CRUD de Clientes
router.post('/clientes', ClienteController.criarCliente);
router.get('/clientes', ClienteController.listarClientes);
router.get('/clientes/:cpf', ClienteController.buscarClientePorCPF);
router.put('/clientes/:cpf', ClienteController.atualizarCliente);
router.delete('/clientes/:cpf', ClienteController.removerCliente);

// Rotas para gerenciamento de telefones
router.post('/clientes/:cpf/telefones', ClienteController.adicionarTelefone);
router.delete('/clientes/:cpf/telefones/:indice', ClienteController.removerTelefone);

module.exports = router;
