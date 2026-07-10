const Produto = require('../models/Produto');

class ProdutoController {
    // Create - Criar novo produto
    static async criarProduto(req, res) {
        try {
            const { codigoBarras, descricao, tipoUnidade, precoCompra, precoVenda } = req.body;

            const produtoExistente = await Produto.findOne({ codigoBarras });
            if (produtoExistente) {
                return res.status(400).json({ 
                    error: 'Já existe um produto cadastrado com este código de barras' 
                });
            }

            const produto = new Produto({
                codigoBarras,
                descricao,
                tipoUnidade,
                precoCompra,
                precoVenda
            });

            await produto.save();
            // Popula o campo tipoUnidade para retornar os dados completos
            await produto.populate('tipoUnidade');
            res.status(201).json(produto);
        } catch (error) {
            if (error.name === 'ValidationError') {
                const mensagens = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ erros: mensagens });
            }
            res.status(500).json({ error: 'Erro ao criar produto', detalhes: error.message });
        }
    }

    // Read - Listar todos os produtos
    static async listarProdutos(req, res) {
        try {
            const produtos = await Produto.find().populate('tipoUnidade').sort({ descricao: 1 });
            res.json(produtos);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar produtos', detalhes: error.message });
        }
    }

    // Read - Buscar produto por código de barras
    static async buscarProdutoPorCodigoBarras(req, res) {
        try {
            const { codigoBarras } = req.params;
            const produto = await Produto.findOne({ codigoBarras }).populate('tipoUnidade');

            if (!produto) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            res.json(produto);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar produto', detalhes: error.message });
        }
    }

    // Update - Atualizar produto
    static async atualizarProduto(req, res) {
        try {
            const { codigoBarras } = req.params;
            const dadosAtualizados = req.body;

            // Se estiver tentando alterar o código de barras, verificar se já existe
            if (dadosAtualizados.codigoBarras && dadosAtualizados.codigoBarras !== codigoBarras) {
                const produtoExistente = await Produto.findOne({ codigoBarras: dadosAtualizados.codigoBarras });
                if (produtoExistente) {
                    return res.status(400).json({ 
                        error: 'Já existe um produto cadastrado com este código de barras' 
                    });
                }
            }

            const produto = await Produto.findOneAndUpdate(
                { codigoBarras },
                dadosAtualizados,
                { new: true, runValidators: true }
            ).populate('tipoUnidade');

            if (!produto) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            res.json(produto);
        } catch (error) {
            if (error.name === 'ValidationError') {
                const mensagens = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ erros: mensagens });
            }
            res.status(500).json({ error: 'Erro ao atualizar produto', detalhes: error.message });
        }
    }

    // Delete - Remover produto
    static async removerProduto(req, res) {
        try {
            const { codigoBarras } = req.params;
            const produto = await Produto.findOneAndDelete({ codigoBarras });

            if (!produto) {
                return res.status(404).json({ error: 'Produto não encontrado' });
            }

            res.json({ message: 'Produto removido com sucesso' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao remover produto', detalhes: error.message });
        }
    }
}

module.exports = ProdutoController;
