const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

// Configuração do MongoDB
const connectDB = require('./config/database');

// Importação de middlewares
const { errorHandler } = require('./middlewares/errorHandler');
const { authMiddleware } = require('./middlewares/auth');

// Importação de rotas da API
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
const relatoriosRoutes = require('./routes/relatorios');

// Importação de função de inicialização
const usuarioService = require('./services/UsuarioService');

// Inicialização do Express
const app = express();
const PORT = process.env.PORT || 3000;

// Conectar ao MongoDB
connectDB();

// Criar usuário admin se for o primeiro acesso
usuarioService.criarAdminSeNecessario();

// Middlewares globais
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos (Views e Public)
app.use(express.static(path.join(__dirname, 'views')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middleware de autenticação (aplicado a todas as rotas da API)
app.use('/api', authMiddleware);

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
app.use('/api/relatorios', relatoriosRoutes);

// Middleware global de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Rota para servir a página de login
app.get('/login.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login.html'));
});

// Rota padrão redireciona para login
app.get('/', (req, res) => {
    res.redirect('/login.html');
});

// Rota 404 para páginas não encontradas
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, 'views', 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`\n===========================================`);
    console.log(`Servidor rodando em http://localhost:${PORT}`);
    console.log(`API disponível em http://localhost:${PORT}/api`);
    console.log(`Página de login: http://localhost:${PORT}/login.html`);
    console.log(`===========================================\n`);
});
