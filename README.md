# Sistema de Cadastro - MVC (Clientes e Produtos)

Sistema de cadastro desenvolvido com arquitetura **Model-View-Controller (MVC)** utilizando **JavaScript (Node.js)** e banco de dados **MongoDB**. O sistema gerencia **Clientes** e **Produtos** com tabela auxiliar de **Tipos de Unidade**.

## Módulos do Sistema

### 1. Cadastro de Clientes

#### Campos do Cliente:
- **Nome**: Nome completo do cliente
- **CPF**: Cadastro de Pessoa Física (chave única, 11 dígitos)
- **Data de Nascimento**: Data de nascimento do cliente
- **Endereço**: 
  - Rua
  - Número
  - Complemento
  - Bairro
  - Cidade
  - Estado (UF)
- **Telefones de Contato**: Múltiplos telefones (celular, residencial, comercial)
- **Limite de Crédito**: Valor numérico

### 2. Cadastro de Produtos

#### Campos do Produto:
- **Código de Barras**: Identificador único do produto (chave primária)
- **Descrição**: Nome/descrição do produto
- **Tipo de Unidade**: Relacionamento com tabela auxiliar (UN, KG, LT, CX, etc.)
- **Preço de Compra**: Valor pago pelo produto
- **Preço de Venda**: Valor cobrado pelo produto
- **Margem de Lucro**: Calculada automaticamente: `((Preço Venda - Preço Compra) / Preço Compra) * 100`

#### Tabela Auxiliar - Tipos de Unidade:
- **Código**: Identificador único (ex: UN, KG, LT, CX, M, PCT)
- **Descrição**: Descrição completa (ex: Unidade, Quilograma, Litro, Caixa, Metro, Pacote)

## Estrutura do Projeto

```
/workspace
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do MongoDB
│   ├── models/
│   │   ├── Cliente.js           # Model do Cliente (Schema Mongoose)
│   │   ├── TipoUnidade.js       # Model de Tipos de Unidade
│   │   └── Produto.js           # Model do Produto (com cálculo de margem)
│   ├── views/
│   │   └── index.html           # Interface web com abas (Clientes, Produtos, Tipos de Unidade)
│   ├── controllers/
│   │   ├── ClienteController.js      # Lógica de negócio de Clientes
│   │   ├── TipoUnidadeController.js  # Lógica de negócio de Tipos de Unidade
│   │   └── ProdutoController.js      # Lógica de negócio de Produtos
│   ├── routes/
│   │   ├── clientes.js          # Rotas da API de Clientes
│   │   ├── tipos-unidade.js     # Rotas da API de Tipos de Unidade
│   │   └── produtos.js          # Rotas da API de Produtos
│   └── server.js                # Ponto de entrada da aplicação
├── package.json
└── README.md
```

## Pré-requisitos

- Node.js (versão 14 ou superior)
- MongoDB instalado e rodando localmente ou URI de conexão MongoDB Atlas

## Instalação

1. Instale as dependências:
```bash
npm install
```

2. Certifique-se de que o MongoDB está rodando na porta padrão (27017) ou configure a variável de ambiente `MONGODB_URI`.

## Executando a Aplicação

### Modo produção:
```bash
npm start
```

### Modo desenvolvimento (com nodemon):
```bash
npm run dev
```

A aplicação estará disponível em:
- **Frontend**: http://localhost:3000
- **API**: http://localhost:3000/api

## Endpoints da API

### Clientes

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/clientes` | Cria um novo cliente |
| GET | `/api/clientes` | Lista todos os clientes |
| GET | `/api/clientes/:cpf` | Busca cliente por CPF |
| PUT | `/api/clientes/:cpf` | Atualiza cliente |
| DELETE | `/api/clientes/:cpf` | Remove cliente |
| POST | `/api/clientes/:cpf/telefones` | Adiciona telefone ao cliente |
| DELETE | `/api/clientes/:cpf/telefones/:indice` | Remove telefone do cliente |

### Tipos de Unidade

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/tipos-unidade` | Cria um novo tipo de unidade |
| GET | `/api/tipos-unidade` | Lista todos os tipos de unidade |
| GET | `/api/tipos-unidade/:codigo` | Busca tipo de unidade por código |
| PUT | `/api/tipos-unidade/:codigo` | Atualiza tipo de unidade |
| DELETE | `/api/tipos-unidade/:codigo` | Remove tipo de unidade |

### Produtos

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/produtos` | Cria um novo produto (margem calculada automaticamente) |
| GET | `/api/produtos` | Lista todos os produtos |
| GET | `/api/produtos/:codigoBarras` | Busca produto por código de barras |
| PUT | `/api/produtos/:codigoBarras` | Atualiza produto |
| DELETE | `/api/produtos/:codigoBarras` | Remove produto |

## Exemplo de Requisição (POST /api/clientes)

```json
{
  "nome": "João da Silva",
  "cpf": "12345678901",
  "dataNascimento": "1990-01-15",
  "endereco": {
    "rua": "Rua das Flores",
    "numero": "123",
    "complemento": "Apto 45",
    "bairro": "Centro",
    "cidade": "São Paulo",
    "estado": "SP"
  },
  "telefones": [
    { "tipo": "celular", "numero": "11999999999" },
    { "tipo": "residencial", "numero": "1133333333" }
  ],
  "limiteCredito": 5000.00
}
```

## Exemplo de Requisição (POST /api/tipos-unidade)

```json
{
  "codigo": "UN",
  "descricao": "Unidade"
}
```

## Exemplo de Requisição (POST /api/produtos)

```json
{
  "codigoBarras": "7891234567890",
  "descricao": "Arroz Branco 5kg",
  "tipoUnidade": "UN",
  "precoCompra": 15.00,
  "precoVenda": 22.50
}
```

*Obs: A margem de lucro é calculada automaticamente pelo sistema.*

## Arquitetura MVC

- **Model**: Define a estrutura dos dados e regras de validação (Cliente.js, TipoUnidade.js, Produto.js)
- **View**: Interface web responsiva com abas para Clientes, Produtos e Tipos de Unidade (index.html)
- **Controller**: Gerencia as requisições e respostas da API (ClienteController.js, TipoUnidadeController.js, ProdutoController.js)

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: MongoDB com Mongoose ODM
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Middleware**: CORS, Body-parser

## Funcionalidades Especiais

- **CPF Único**: Validação de CPF como chave única no cadastro de clientes
- **Múltiplos Telefones**: Cliente pode ter vários telefones (celular, residencial, comercial)
- **Margem de Lucro Automática**: Cálculo automático da margem de lucro nos produtos
- **Tabela de Unidades**: Gestão de tipos de unidade reutilizável em todos os produtos
- **Interface Unificada**: Single Page Application com navegação por abas

## Licença

ISC
