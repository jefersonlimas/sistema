const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const connectDB = require('./config/database');
const clientesRoutes = require('./routes/clientes');
const tiposUnidadeRoutes = require('./routes/tipos-unidade');
const produtosRoutes = require('./routes/produtos');
const fornecedoresRoutes = require('./routes/fornecedores');
const notasFiscaisRoutes = require('./routes/notas-fiscais');
const vendasRoutes = require('./routes/vendas');
const contasPagarRoutes = require('./routes/contas-pagar');
const configuracoesRoutes = require('./routes/configuracoes');
const funcoesRoutes = require('./routes/funcoes');
const usuariosRoutes = require('./routes/usuarios');

const app = express();
const PORT = process.env.PORT || 3000;

// Conectar ao MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos (Views e Public)
app.use(express.static(path.join(__dirname, 'views')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rotas da API
app.use('/api/clientes', clientesRoutes);
app.use('/api/tipos-unidade', tiposUnidadeRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/api/fornecedores', fornecedoresRoutes);
app.use('/api/notas-fiscais', notasFiscaisRoutes);
app.use('/api/vendas', vendasRoutes);
app.use('/api/contas-pagar', contasPagarRoutes);
app.use('/api/configuracoes', configuracoesRoutes);
app.use('/api/funcoes', funcoesRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Rota para servir a página principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`API disponível em http://localhost:${PORT}/api`);
});
