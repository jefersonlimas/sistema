const VendaService = require('../services/VendaService');

class VendaController {
    async index(req, res, next) {
        try {
            const { page = 1, limit = 10, search, formaPagamento, status } = req.query;
            const resultado = await VendaService.listar({ page, limit, search, formaPagamento, status });
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async show(req, res, next) {
        try {
            const venda = await VendaService.buscarComDetalhes(req.params.id);
            res.json(venda);
        } catch (error) {
            next(error);
        }
    }

    async store(req, res, next) {
        try {
            const vendaCompleta = await VendaService.criar(req.body);
            res.status(201).json({
                message: 'Venda realizada com sucesso',
                venda: vendaCompleta
            });
        } catch (error) {
            next(error);
        }
    }

    async cancel(req, res, next) {
        try {
            const resultado = await VendaService.cancelar(req.params.id);
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async getRelatorio(req, res, next) {
        try {
            const { dataInicio, dataFim, formaPagamento } = req.query;
            const relatorio = await VendaService.gerarRelatorio({ dataInicio, dataFim, formaPagamento });
            res.json(relatorio);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new VendaController();
