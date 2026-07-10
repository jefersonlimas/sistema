const Cliente = require('../models/Cliente');

class ClienteController {
    // Create - Criar novo cliente
    static async criarCliente(req, res) {
        try {
            const { nome, cpf, dataNascimento, endereco, telefones, limiteCredito } = req.body;

            const clienteExistente = await Cliente.findOne({ cpf });
            if (clienteExistente) {
                return res.status(400).json({ 
                    error: 'Já existe um cliente cadastrado com este CPF' 
                });
            }

            const cliente = new Cliente({
                nome,
                cpf,
                dataNascimento,
                endereco,
                telefones,
                limiteCredito
            });

            await cliente.save();
            res.status(201).json(cliente);
        } catch (error) {
            if (error.name === 'ValidationError') {
                const mensagens = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ erros: mensagens });
            }
            res.status(500).json({ error: 'Erro ao criar cliente', detalhes: error.message });
        }
    }

    // Read - Listar todos os clientes
    static async listarClientes(req, res) {
        try {
            const clientes = await Cliente.find().sort({ nome: 1 });
            res.json(clientes);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar clientes', detalhes: error.message });
        }
    }

    // Read - Buscar cliente por CPF
    static async buscarClientePorCPF(req, res) {
        try {
            const { cpf } = req.params;
            const cliente = await Cliente.findOne({ cpf });

            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado' });
            }

            res.json(cliente);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar cliente', detalhes: error.message });
        }
    }

    // Update - Atualizar cliente
    static async atualizarCliente(req, res) {
        try {
            const { cpf } = req.params;
            const dadosAtualizados = req.body;

            // Se estiver tentando alterar o CPF, verificar se já existe
            if (dadosAtualizados.cpf && dadosAtualizados.cpf !== cpf) {
                const clienteExistente = await Cliente.findOne({ cpf: dadosAtualizados.cpf });
                if (clienteExistente) {
                    return res.status(400).json({ 
                        error: 'Já existe um cliente cadastrado com este CPF' 
                    });
                }
            }

            const cliente = await Cliente.findOneAndUpdate(
                { cpf },
                dadosAtualizados,
                { new: true, runValidators: true }
            );

            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado' });
            }

            res.json(cliente);
        } catch (error) {
            if (error.name === 'ValidationError') {
                const mensagens = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ erros: mensagens });
            }
            res.status(500).json({ error: 'Erro ao atualizar cliente', detalhes: error.message });
        }
    }

    // Delete - Remover cliente
    static async removerCliente(req, res) {
        try {
            const { cpf } = req.params;
            const cliente = await Cliente.findOneAndDelete({ cpf });

            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado' });
            }

            res.json({ message: 'Cliente removido com sucesso' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao remover cliente', detalhes: error.message });
        }
    }

    // Adicionar telefone
    static async adicionarTelefone(req, res) {
        try {
            const { cpf } = req.params;
            const { tipo, numero } = req.body;

            const cliente = await Cliente.findOne({ cpf });
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado' });
            }

            cliente.telefones.push({ tipo, numero });
            await cliente.save();

            res.json(cliente);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao adicionar telefone', detalhes: error.message });
        }
    }

    // Remover telefone
    static async removerTelefone(req, res) {
        try {
            const { cpf, indice } = req.params;

            const cliente = await Cliente.findOne({ cpf });
            if (!cliente) {
                return res.status(404).json({ error: 'Cliente não encontrado' });
            }

            if (indice < 0 || indice >= cliente.telefones.length) {
                return res.status(400).json({ error: 'Índice de telefone inválido' });
            }

            cliente.telefones.splice(indice, 1);
            await cliente.save();

            res.json(cliente);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao remover telefone', detalhes: error.message });
        }
    }
}

module.exports = ClienteController;
