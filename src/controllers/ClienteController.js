const Cliente = require('../models/Cliente');
const clienteService = require('../services/ClienteService');
const { errorHandler } = require('../middlewares/errorHandler');

class ClienteController {
    // Create - Criar novo cliente
    static async criarCliente(req, res, next) {
        try {
            const cliente = await clienteService.create(req.body);
            res.status(201).json(cliente);
        } catch (error) {
            next(error);
        }
    }

    // Read - Listar todos os clientes
    static async listarClientes(req, res, next) {
        try {
            const resultado = await clienteService.listAll();
            res.json(resultado.data);
        } catch (error) {
            next(error);
        }
    }

    // Read - Buscar cliente por CPF
    static async buscarClientePorCPF(req, res, next) {
        try {
            const { cpf } = req.params;
            const cliente = await clienteService.findByCpf(cpf, true);
            res.json(cliente);
        } catch (error) {
            next(error);
        }
    }

    // Update - Atualizar cliente
    static async atualizarCliente(req, res, next) {
        try {
            const { cpf } = req.params;
            const cliente = await clienteService.updateByCpf(cpf, req.body);
            res.json(cliente);
        } catch (error) {
            next(error);
        }
    }

    // Delete - Remover cliente
    static async removerCliente(req, res, next) {
        try {
            const { cpf } = req.params;
            await clienteService.deleteByCpf(cpf);
            res.json({ message: 'Cliente removido com sucesso' });
        } catch (error) {
            next(error);
        }
    }

    // Adicionar telefone
    static async adicionarTelefone(req, res, next) {
        try {
            const { cpf } = req.params;
            const { tipo, numero } = req.body;
            const cliente = await clienteService.addTelefone(cpf, { tipo, numero });
            res.json(cliente);
        } catch (error) {
            next(error);
        }
    }

    // Remover telefone
    static async removerTelefone(req, res, next) {
        try {
            const { cpf, indice } = req.params;
            const cliente = await clienteService.removeTelefone(cpf, parseInt(indice));
            res.json(cliente);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ClienteController;
