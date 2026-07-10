const ContaPagar = require('../models/ContaPagar');
const mongoose = require('mongoose');

class ContaPagarController {
    async index(req, res) {
        try {
            const { page = 1, limit = 10, cliente, status } = req.query;
            const query = {};
            
            if (cliente) {
                query.cliente = cliente;
            }
            
            if (status) {
                query.status = status;
            }
            
            const contasPagar = await ContaPagar.find(query)
                .populate('cliente', 'nome cpf')
                .populate('venda', 'dataVenda formaPagamento valorTotal')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ dataVencimento: 1 });
            
            const count = await ContaPagar.countDocuments(query);
            
            res.json({
                contasPagar,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count
            });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar contas a pagar', error: error.message });
        }
    }

    async show(req, res) {
        try {
            const contaPagar = await ContaPagar.findById(req.params.id)
                .populate('cliente', 'nome cpf endereco telefones')
                .populate('venda');
            
            if (!contaPagar) {
                return res.status(404).json({ message: 'Conta a pagar não encontrada' });
            }
            res.json(contaPagar);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar conta a pagar', error: error.message });
        }
    }

    async baixarPagamento(req, res) {
        const session = await ContaPagar.startSession();
        
        try {
            await session.startTransaction();
            
            const { valorPago, observacoes } = req.body;
            const contaPagar = await ContaPagar.findById(req.params.id).session(session);
            
            if (!contaPagar) {
                await session.abortTransaction();
                return res.status(404).json({ message: 'Conta a pagar não encontrada' });
            }
            
            if (contaPagar.status === 'pago') {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Conta já está quitada' });
            }
            
            if (contaPagar.status === 'cancelada') {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Conta está cancelada' });
            }
            
            // Adicionar valor ao pagamento
            const novoValorPago = contaPagar.valorPago + (valorPago || contaPagar.valorRestante);
            
            if (novoValorPago > contaPagar.valorOriginal) {
                await session.abortTransaction();
                return res.status(400).json({ 
                    message: `Valor do pagamento excede o restante. Restante: R$ ${contaPagar.valorRestante.toFixed(2)}` 
                });
            }
            
            contaPagar.valorPago = novoValorPago;
            if (observacoes) {
                contaPagar.observacoes = observacoes;
            }
            
            await contaPagar.save({ session });
            
            await session.commitTransaction();
            
            // Buscar conta atualizada
            const contaAtualizada = await ContaPagar.findById(contaPagar._id)
                .populate('cliente', 'nome cpf')
                .populate('venda');
            
            res.json({
                message: 'Pagamento registrado com sucesso',
                contaPagar: contaAtualizada
            });
        } catch (error) {
            await session.abortTransaction();
            res.status(500).json({ 
                message: 'Erro ao registrar pagamento', 
                error: error.message 
            });
        } finally {
            session.endSession();
        }
    }

    async getRelatorio(req, res) {
        try {
            const { cliente, dataInicio, dataFim } = req.query;
            
            const query = {};
            
            if (cliente) {
                query.cliente = cliente;
            }
            
            if (dataInicio && dataFim) {
                query.dataVencimento = {
                    $gte: new Date(dataInicio),
                    $lte: new Date(dataFim)
                };
            }
            
            const contasPagar = await ContaPagar.find(query)
                .populate('cliente', 'nome')
                .populate('venda');
            
            const relatorio = {
                totalContas: contasPagar.length,
                valorTotalReceber: contasPagar.reduce((acc, c) => acc + c.valorOriginal, 0),
                valorTotalRecebido: contasPagar.reduce((acc, c) => acc + c.valorPago, 0),
                valorTotalPendente: contasPagar.reduce((acc, c) => acc + c.valorRestante, 0),
                porStatus: {
                    pendente: contasPagar.filter(c => c.status === 'pendente').length,
                    parcial: contasPagar.filter(c => c.status === 'parcial').length,
                    pago: contasPagar.filter(c => c.status === 'pago').length,
                    vencido: contasPagar.filter(c => c.status === 'vencido').length
                },
                contas: contasPagar
            };
            
            res.json(relatorio);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao gerar relatório', error: error.message });
        }
    }

    async getPorCliente(req, res) {
        try {
            const { clienteId } = req.params;
            
            const contasPagar = await ContaPagar.find({ cliente: clienteId })
                .populate('cliente', 'nome cpf limiteCredito')
                .populate('venda', 'dataVenda formaPagamento')
                .sort({ dataVencimento: 1 });
            
            const totalPendente = contasPagar
                .filter(c => c.status === 'pendente' || c.status === 'parcial')
                .reduce((acc, c) => acc + c.valorRestante, 0);
            
            const cliente = contasPagar.length > 0 ? contasPagar[0].cliente : null;
            const limiteDisponivel = cliente ? cliente.limiteCredito - totalPendente : 0;
            
            res.json({
                cliente,
                totalPendente,
                limiteDisponivel,
                contas: contasPagar
            });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar contas do cliente', error: error.message });
        }
    }
}

module.exports = new ContaPagarController();
