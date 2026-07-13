const ContaPagarService = require('../services/ContaPagarService');

class ContaPagarController {
    async index(req, res, next) {
        try {
            const { page = 1, limit = 10, cliente, status } = req.query;
            const resultado = await ContaPagarService.listar({ page, limit, cliente, status });
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async show(req, res, next) {
        try {
            const contaPagar = await ContaPagarService.buscarComDetalhes(req.params.id);
            res.json(contaPagar);
        } catch (error) {
            next(error);
        }
    }

    async baixarPagamento(req, res, next) {
        try {
            const { valorPago, observacoes } = req.body;
            const contaAtualizada = await ContaPagarService.baixarPagamento(req.params.id, { valorPago, observacoes });
            res.json({
                message: 'Pagamento registrado com sucesso',
                contaPagar: contaAtualizada
            });
        } catch (error) {
            next(error);
        }
    }

    async getRelatorio(req, res, next) {
        try {
            const { cliente, dataInicio, dataFim } = req.query;
            const relatorio = await ContaPagarService.gerarRelatorio({ cliente, dataInicio, dataFim });
            res.json(relatorio);
        } catch (error) {
            next(error);
        }
    }

    async getPorCliente(req, res, next) {
        try {
            const { clienteId } = req.params;
            const dados = await ContaPagarService.buscarPorCliente(clienteId);
            res.json(dados);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ContaPagarController();
