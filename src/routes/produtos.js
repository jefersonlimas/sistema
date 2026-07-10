const express = require('express');
const router = express.Router();
const ProdutoController = require('../controllers/ProdutoController');

// Rotas para CRUD de Produtos
router.post('/produtos', ProdutoController.criarProduto);
router.get('/produtos', ProdutoController.listarProdutos);
router.get('/produtos/:codigoBarras', ProdutoController.buscarProdutoPorCodigoBarras);
router.put('/produtos/:codigoBarras', ProdutoController.atualizarProduto);
router.delete('/produtos/:codigoBarras', ProdutoController.removerProduto);

module.exports = router;
