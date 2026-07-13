const tipoUnidadeService = require('../services/TipoUnidadeService');

class TipoUnidadeController {
    // Create - Criar novo tipo de unidade
    static async criarTipoUnidade(req, res, next) {
        try {
            const tipoUnidade = await tipoUnidadeService.create(req.body);
            res.status(201).json(tipoUnidade);
        } catch (error) {
            next(error);
        }
    }

    // Read - Listar todos os tipos de unidade
    static async listarTiposUnidade(req, res, next) {
        try {
            const resultado = await tipoUnidadeService.listAll();
            res.json(resultado.data);
        } catch (error) {
            next(error);
        }
    }

    // Read - Buscar tipo de unidade por código
    static async buscarTipoUnidadePorCodigo(req, res, next) {
        try {
            const { codigo } = req.params;
            const tipoUnidade = await tipoUnidadeService.findByCodigo(codigo, true);
            res.json(tipoUnidade);
        } catch (error) {
            next(error);
        }
    }

    // Update - Atualizar tipo de unidade
    static async atualizarTipoUnidade(req, res, next) {
        try {
            const { codigo } = req.params;
            const tipoUnidade = await tipoUnidadeService.updateByCodigo(codigo, req.body);
            res.json(tipoUnidade);
        } catch (error) {
            next(error);
        }
    }

    // Delete - Remover tipo de unidade
    static async removerTipoUnidade(req, res, next) {
        try {
            const { codigo } = req.params;
            await tipoUnidadeService.deleteByCodigo(codigo);
            res.json({ message: 'Tipo de unidade removido com sucesso' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = TipoUnidadeController;
