const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/RelatorioController');

// 1. Vendas Diárias
router.get('/vendas-diarias', relatorioController.vendasDiarias);

// 2. Vendas por Funcionário
router.get('/vendas-funcionario', relatorioController.vendasPorFuncionario);

// 3. Contas a Receber por Cliente e Período
router.get('/contas-receber', relatorioController.contasReceberPorCliente);

// 4. Produtos Mais Vendidos
router.get('/produtos-mais-vendidos', relatorioController.produtosMaisVendidos);

// 5. Clientes Aniversariantes
router.get('/aniversariantes', relatorioController.clientesAniversariantes);

// 6. Produtos com Estoque Baixo
router.get('/estoque-baixo', relatorioController.estoqueBaixo);

module.exports = router;
