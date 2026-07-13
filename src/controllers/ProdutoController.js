const produtoService = require('../services/ProdutoService');
const { errorHandler } = require('../middlewares/errorHandler');

class ProdutoController {
    // Create - Criar novo produto
    static async criarProduto(req, res, next) {
        try {
            const produto = await produtoService.create(req.body);
            res.status(201).json(produto);
        } catch (error) {
            next(error);
        }
    }

    // Read - Listar todos os produtos
    static async listarProdutos(req, res, next) {
        try {
            const resultado = await produtoService.listAll();
            res.json(resultado.data);
        } catch (error) {
            next(error);
        }
    }

    // Read - Buscar produto por código de barras
    static async buscarProdutoPorCodigoBarras(req, res, next) {
        try {
            const { codigoBarras } = req.params;
            const produto = await produtoService.findByCodigoBarras(codigoBarras, true);
            res.json(produto);
        } catch (error) {
            next(error);
        }
    }

    // Update - Atualizar produto
    static async atualizarProduto(req, res, next) {
        try {
            const { codigoBarras } = req.params;
            const produto = await produtoService.updateByCodigoBarras(codigoBarras, req.body);
            res.json(produto);
        } catch (error) {
            next(error);
        }
    }

    // Delete - Remover produto
    static async removerProduto(req, res, next) {
        try {
            const { codigoBarras } = req.params;
            await produtoService.deleteByCodigoBarras(codigoBarras);
            res.json({ message: 'Produto removido com sucesso' });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = ProdutoController;
