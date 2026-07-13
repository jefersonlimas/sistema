# Guia de Refatoração - Sistema de Gestão Empresarial

## Visão Geral

Este documento descreve as melhorias de arquitetura e refatoração aplicadas ao código do sistema.

## Mudanças Implementadas

### 1. Nova Estrutura de Diretórios

```
src/
├── config/           # Configurações (database, etc.)
├── controllers/      # Controladores HTTP (lógica de requisição/resposta)
├── errors/           # Classes de erro personalizadas
├── middlewares/      # Middlewares (auth, errorHandler, etc.)
├── models/           # Modelos do Mongoose (schema + regras de negócio do modelo)
├── routes/           # Definição de rotas da API
├── services/         # Camada de serviço (regras de negócio)
├── utils/            # Funções utilitárias
├── public/           # Arquivos estáticos (CSS, JS, imagens)
├── views/            # Templates HTML
└── server.js         # Ponto de entrada da aplicação
```

### 2. Separação de Responsabilidades

#### Controllers
- **Antes**: Controllers continham lógica de negócio e tratamento de erros repetitivo
- **Depois**: Controllers são "magros", apenas orquestram requisições e delegam para Services

**Exemplo - ClienteController:**
```javascript
// ANTES (158 linhas com lógica de negócio)
static async criarCliente(req, res) {
    try {
        const { nome, cpf, dataNascimento, endereco, telefones, limiteCredito } = req.body;
        
        const clienteExistente = await Cliente.findOne({ cpf });
        if (clienteExistente) {
            return res.status(400).json({ 
                error: 'Já existe um cliente cadastrado com este CPF' 
            });
        }
        
        const cliente = new Cliente({ ... });
        await cliente.save();
        res.status(201).json(cliente);
    } catch (error) {
        // Tratamento de erro repetitivo em cada método
        if (error.name === 'ValidationError') {
            const mensagens = Object.values(error.errors).map(err => err.message);
            return res.status(400).json({ erros: mensagens });
        }
        res.status(500).json({ error: 'Erro ao criar cliente', detalhes: error.message });
    }
}

// DEPOIS (apenas 3 linhas)
static async criarCliente(req, res, next) {
    try {
        const cliente = await clienteService.create(req.body);
        res.status(201).json(cliente);
    } catch (error) {
        next(error);
    }
}
```

#### Services
- **Nova camada** que contém toda a regra de negócio
- Promove reutilização de código
- Facilita testes unitários
- Permite troca de implementação sem afetar controllers

**Exemplo - ClienteService:**
```javascript
class ClienteService extends BaseService {
  constructor() {
    super(Cliente);
  }

  async create(data) {
    const { cpf } = data;
    
    if (cpf) {
      const existingCliente = await this.findOne({ cpf }, false);
      if (existingCliente) {
        throw new ConflictError('Já existe um cliente cadastrado com este CPF');
      }
    }
    
    return super.create(data);
  }
  
  async findByCpf(cpf, throwNotFound = false) {
    return super.findOne({ cpf }, throwNotFound);
  }
  
  // ... outros métodos específicos
}
```

#### Base Service
- Classe base com operações CRUD genéricas
- Elimina código duplicado entre services
- Fornece métodos padronizados: `findAll`, `findById`, `create`, `update`, `delete`

### 3. Tratamento de Erros Centralizado

#### Classes de Erro Personalizadas (`src/errors/AppError.js`)
```javascript
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

class NotFoundError extends AppError { /* 404 */ }
class ValidationError extends AppError { /* 400 */ }
class ConflictError extends AppError { /* 409 */ }
class UnauthorizedError extends AppError { /* 401 */ }
class ForbiddenError extends AppError { /* 403 */ }
```

#### Middleware Global de Erros (`src/middlewares/errorHandler.js`)
```javascript
const errorHandler = (err, req, res, next) => {
  // Erro operacional conhecido
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      errors: err.errors || []
    });
  }
  
  // Erros de validação do Mongoose
  if (err.name === 'ValidationError') { /* ... */ }
  
  // Erro de duplicidade do MongoDB
  if (err.code === 11000) { /* ... */ }
  
  // Erro inesperado
  console.error('Erro não tratado:', err);
  return res.status(500).json({ /* ... */ });
};
```

**Benefícios:**
- ✅ Código de tratamento de erro removido de todos os controllers
- ✅ Respostas de erro consistentes em toda a API
- ✅ Fácil adição de novos tipos de erro
- ✅ Logs centralizados de erros não tratados

### 4. Middleware de Autenticação

Nova camada de autenticação pronta para expansão:
```javascript
// src/middlewares/auth.js
const authMiddleware = async (req, res, next) => {
  // Verifica token JWT ou sessão
  // Anexa usuário autenticado ao request
};

const checkPermission = (modulos) => {
  // Verifica se usuário tem permissão para módulos específicos
};
```

### 5. Server.js Refatorado

**Melhorias:**
- Comentários claros separando seções
- Middlewares organizados por categoria
- Middleware de autenticação aplicado globalmente na API
- Handler de erros como último middleware
- Handler 404 para páginas não encontradas
- Logs de inicialização mais informativos

## Benefícios da Refatoração

### 1. Manutenibilidade
- Código mais limpo e organizado
- Responsabilidades bem definidas
- Fácil localização de problemas

### 2. Testabilidade
- Services podem ser testados isoladamente
- Controllers são fáceis de mockar
- Erros podem ser testados de forma padronizada

### 3. Escalabilidade
- Nova funcionalidade = novo Service + Controller
- Reutilização de código através do BaseService
- Middlewares reutilizáveis

### 4. Consistência
- Padrão único para todas as entidades
- Tratamento de erros uniforme
- Nomenclatura consistente

## Próximos Passos Sugeridos

### 1. Refatorar Outros Controllers
Aplicar o mesmo padrão aos demais controllers:
- [ ] ProdutoController → ProdutoService
- [ ] VendaController → VendaService
- [ ] UsuarioController → UsuarioService
- [ ] etc.

### 2. Implementar Validação com express-validator
```javascript
// Exemplo para criação de cliente
const validarCriacaoCliente = [
  body('nome').trim().notEmpty().withMessage('Nome é obrigatório'),
  body('cpf').matches(/^\d{11}$/).withMessage('CPF deve ter 11 dígitos'),
  body('email').isEmail().withMessage('Email inválido'),
  validateRequest
];
```

### 3. Adicionar JWT para Autenticação
```javascript
// No auth middleware
const token = authHeader.split(' ')[1];
const decoded = jwt.verify(token, process.env.JWT_SECRET);
req.usuario = await Usuario.findById(decoded.id);
```

### 4. Adicionar Logs Estruturados
```javascript
// Usar Winston ou similar
const logger = require('./utils/logger');
logger.info('Cliente criado', { clienteId, cpf });
logger.error('Erro ao criar cliente', { error, dados });
```

### 5. Documentação da API
- Adicionar Swagger/OpenAPI
- Documentar endpoints
- Exemplos de requisição/resposta

## Como Migrar Gradualmente

1. **Comece pelo ClienteController** (já feito como exemplo)
2. **Teste thoroughly** antes de prosseguir
3. **Aplique o padrão** aos outros controllers um por um
4. **Mantenha compatibilidade** durante a migração
5. **Atualize testes** conforme refatora

## Padrões de Código Adotados

### Nomenclatura
- Controllers: `XxxController.js` (PascalCase)
- Services: `XxxService.js` (PascalCase)
- Models: `Xxx.js` (PascalCase)
- Middlewares: `xxx.js` (camelCase)
- Errors: `XxxError.js` (PascalCase)

### Estrutura de Métodos
```javascript
// Service
async create(data) { /* ... */ }
async findById(id, throwNotFound = true) { /* ... */ }
async findAll(options = {}) { /* ... */ }
async update(id, data, options = {}) { /* ... */ }
async delete(id, softDelete = false) { /* ... */ }

// Controller
static async criar(req, res, next) { /* ... */ }
static async listar(req, res, next) { /* ... */ }
static async buscar(req, res, next) { /* ... */ }
static async atualizar(req, res, next) { /* ... */ }
static async remover(req, res, next) { /* ... */ }
```

### Tratamento de Erros
```javascript
// Sempre use try-catch com next(error)
try {
  const resultado = await service.metodo(dados);
  res.json(resultado);
} catch (error) {
  next(error); // Delega para o errorHandler
}
```

## Referências

- [Padrão MVC](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [Node.js Design Patterns](https://www.nodejsdesignpatterns.com/)
