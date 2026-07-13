const fornecedorService = require('../services/FornecedorService');

class FornecedorController {
    async index(req, res, next) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const resultado = await fornecedorService.listAll({ page, limit, search });
            res.json(resultado);
        } catch (error) {
            next(error);
        }
    }

    async show(req, res, next) {
        try {
            const fornecedor = await fornecedorService.findById(req.params.id, true);
            res.json(fornecedor);
        } catch (error) {
            next(error);
        }
    }

    async store(req, res, next) {
        try {
            const fornecedor = await fornecedorService.create(req.body);
            res.status(201).json(fornecedor);
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const fornecedor = await fornecedorService.update(req.params.id, req.body);
            res.json(fornecedor);
        } catch (error) {
            next(error);
        }
    }

    async destroy(req, res, next) {
        try {
            await fornecedorService.delete(req.params.id);
            res.json({ message: 'Fornecedor excluído com sucesso' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new FornecedorController();
