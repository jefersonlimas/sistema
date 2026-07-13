const NotaFiscalService = require('../services/NotaFiscalService');

class NotaFiscalController {
    async index(req, res, next) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const resultado = await NotaFiscalService.listar({ page, limit, search });
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async show(req, res, next) {
        try {
            const notaFiscal = await NotaFiscalService.buscarComDetalhes(req.params.id);
            res.json(notaFiscal);
        } catch (error) {
            next(error);
        }
    }

    async store(req, res, next) {
        try {
            const notaCompleta = await NotaFiscalService.criar(req.body);
            res.status(201).json({
                message: 'Nota fiscal registrada e estoque atualizado com sucesso',
                notaFiscal: notaCompleta
            });
        } catch (error) {
            next(error);
        }
    }

    async destroy(req, res, next) {
        try {
            const resultado = await NotaFiscalService.excluir(req.params.id);
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async getRelatorio(req, res, next) {
        try {
            const { dataInicio, dataFim } = req.query;
            const relatorio = await NotaFiscalService.gerarRelatorio({ dataInicio, dataFim });
            res.json(relatorio);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new NotaFiscalController();
