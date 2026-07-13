const express = require('express');
const router = express.Router();
const ClienteController = require('../controllers/ClienteController');
const { errorHandler } = require('../middlewares/errorHandler');

// Rotas para CRUD de Clientes
router.post('/clientes', (req, res, next) => ClienteController.criarCliente(req, res, next).catch(next));
router.get('/clientes', (req, res, next) => ClienteController.listarClientes(req, res, next).catch(next));
router.get('/clientes/:cpf', (req, res, next) => ClienteController.buscarClientePorCPF(req, res, next).catch(next));
router.put('/clientes/:cpf', (req, res, next) => ClienteController.atualizarCliente(req, res, next).catch(next));
router.delete('/clientes/:cpf', (req, res, next) => ClienteController.removerCliente(req, res, next).catch(next));

// Rotas para gerenciamento de telefones
router.post('/clientes/:cpf/telefones', (req, res, next) => ClienteController.adicionarTelefone(req, res, next).catch(next));
router.delete('/clientes/:cpf/telefones/:indice', (req, res, next) => ClienteController.removerTelefone(req, res, next).catch(next));

module.exports = router;
