const RelatorioService = require('../services/RelatorioService');

class RelatorioController {
    async vendasDiarias(req, res, next) {
        try {
            const { data } = req.query;
            const resultado = await RelatorioService.vendasDiarias(data);
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async vendasPorFuncionario(req, res, next) {
        try {
            const { inicio, fim, funcionarioId } = req.query;
            const resultado = await RelatorioService.vendasPorFuncionario({ inicio, fim, funcionarioId });
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async contasReceberPorCliente(req, res, next) {
        try {
            const { clienteId, inicio, fim } = req.query;
            const resultado = await RelatorioService.contasReceberPorCliente({ clienteId, inicio, fim });
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async produtosMaisVendidos(req, res, next) {
        try {
            const { inicio, fim, limite = 10 } = req.query;
            const resultado = await RelatorioService.produtosMaisVendidos({ inicio, fim, limite });
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async clientesAniversariantes(req, res, next) {
        try {
            const { inicio, fim } = req.query;
            const resultado = await RelatorioService.clientesAniversariantes({ inicio, fim });
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async estoqueBaixo(req, res, next) {
        try {
            const { limite = 10 } = req.query;
            const resultado = await RelatorioService.estoqueBaixo(limite);
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new RelatorioController();
