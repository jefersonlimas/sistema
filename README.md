# Sistema de Gestão - MVC (Clientes, Produtos, Fornecedores e Notas Fiscais)

Sistema de gestão desenvolvido com arquitetura **Model-View-Controller (MVC)** utilizando **JavaScript (Node.js)** e banco de dados **MongoDB**. O sistema gerencia **Clientes**, **Produtos**, **Fornecedores**, **Notas Fiscais** e **Tipos de Unidade** com controle automático de estoque.

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
- **Quantidade em Estoque**: Controle automático via entrada de notas fiscais

#### Tabela Auxiliar - Tipos de Unidade:
- **Código**: Identificador único (ex: UN, KG, LT, CX, M, PCT)
- **Descrição**: Descrição completa (ex: Unidade, Quilograma, Litro, Caixa, Metro, Pacote)

### 3. Cadastro de Fornecedores

#### Campos do Fornecedor:
- **Código**: Identificador único do fornecedor (chave primária)
- **Nome**: Razão social ou nome fantasia
- **Endereço**: 
  - Rua
  - Número
  - Complemento
  - Bairro
  - Cidade
  - Estado (UF)
- **Telefone**: Telefone para contato
- **Contato**: Nome da pessoa de contato

### 4. Entrada de Mercadorias (Notas Fiscais)

#### Campos da Nota Fiscal:
- **Número**: Número da nota fiscal
- **Série**: Série da nota fiscal
- **Fornecedor**: Relacionamento com cadastro de fornecedores
- **Data de Emissão**: Data de emissão da NF
- **Data de Entrada**: Data de recebimento das mercadorias
- **Valor Total**: Soma dos itens da nota
- **Itens**: Lista de produtos com quantidade e preço unitário

#### Funcionalidades Especiais:
- **Atualização Automática de Estoque**: Ao registrar uma nota fiscal, a quantidade de cada produto é somada ao estoque existente
- **Reversão de Estoque**: Ao excluir uma nota fiscal, o estoque dos produtos é revertido automaticamente
- **Transações Atômicas**: Uso de transações MongoDB para garantir integridade dos dados
- **Validação de Duplicidade**: Impede registro de NF com mesmo número e série

## Estrutura do Projeto

```
/workspace
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do MongoDB
│   ├── models/
│   │   ├── Cliente.js           # Model do Cliente (Schema Mongoose)
│   │   ├── TipoUnidade.js       # Model de Tipos de Unidade
│   │   ├── Produto.js           # Model do Produto (com cálculo de margem e estoque)
│   │   ├── Fornecedor.js        # Model do Fornecedor
│   │   └── NotaFiscal.js        # Model de Nota Fiscal (entrada de mercadorias)
│   ├── views/
│   │   └── index.html           # Interface web com abas (5 módulos)
│   ├── controllers/
│   │   ├── ClienteController.js      # Lógica de negócio de Clientes
│   │   ├── TipoUnidadeController.js  # Lógica de negócio de Tipos de Unidade
│   │   ├── ProdutoController.js      # Lógica de negócio de Produtos
│   │   ├── FornecedorController.js   # Lógica de negócio de Fornecedores
│   │   └── NotaFiscalController.js   # Lógica de negócio de Notas Fiscais
│   ├── routes/
│   │   ├── clientes.js          # Rotas da API de Clientes
│   │   ├── tipos-unidade.js     # Rotas da API de Tipos de Unidade
│   │   ├── produtos.js          # Rotas da API de Produtos
│   │   ├── fornecedores.js      # Rotas da API de Fornecedores
│   │   └── notas-fiscais.js     # Rotas da API de Notas Fiscais
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
| GET | `/api/produtos` | Lista todos os produtos (com estoque) |
| GET | `/api/produtos/:codigoBarras` | Busca produto por código de barras |
| PUT | `/api/produtos/:codigoBarras` | Atualiza produto |
| DELETE | `/api/produtos/:codigoBarras` | Remove produto |

### Fornecedores

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/fornecedores` | Cria um novo fornecedor |
| GET | `/api/fornecedores` | Lista todos os fornecedores (com paginação e busca) |
| GET | `/api/fornecedores/:id` | Busca fornecedor por ID |
| PUT | `/api/fornecedores/:id` | Atualiza fornecedor |
| DELETE | `/api/fornecedores/:id` | Remove fornecedor |

### Notas Fiscais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/notas-fiscais` | Registra nova nota fiscal (atualiza estoque) |
| GET | `/api/notas-fiscais` | Lista todas as notas fiscais |
| GET | `/api/notas-fiscais/:id` | Busca nota fiscal por ID |
| DELETE | `/api/notas-fiscais/:id` | Remove nota fiscal (reverte estoque) |
| GET | `/api/notas-fiscais/relatorio` | Relatório de entradas por período |

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

## Exemplo de Requisição (POST /api/notas-fiscais)

```json
{
  "numero": "12345",
  "serie": "001",
  "fornecedor": "60a8f5c7d4e5f6001f123456",
  "dataEmissao": "2024-01-15",
  "dataEntrada": "2024-01-16",
  "valorTotal": 1500.00,
  "itens": [
    {
      "produto": "60a8f5c7d4e5f6001f789012",
      "quantidade": 50,
      "precoUnitario": 15.00,
      "subtotal": 750.00
    },
    {
      "produto": "60a8f5c7d4e5f6001f789013",
      "quantidade": 25,
      "precoUnitario": 30.00,
      "subtotal": 750.00
    }
  ]
}
```

*Obs: O registro da nota fiscal atualiza automaticamente o estoque dos produtos.*

## Arquitetura MVC

- **Model**: Define a estrutura dos dados e regras de validação (Cliente.js, TipoUnidade.js, Produto.js, Fornecedor.js, NotaFiscal.js)
- **View**: Interface web responsiva com abas para todos os 5 módulos (index.html)
- **Controller**: Gerencia as requisições e respostas da API (5 controllers especializados)

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: MongoDB com Mongoose ODM (suporte a transações)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Middleware**: CORS, Body-parser

## Funcionalidades Especiais

- **CPF Único**: Validação de CPF como chave única no cadastro de clientes
- **Múltiplos Telefones**: Cliente pode ter vários telefones (celular, residencial, comercial)
- **Margem de Lucro Automática**: Cálculo automático da margem de lucro nos produtos
- **Tabela de Unidades**: Gestão de tipos de unidade reutilizável em todos os produtos
- **Controle de Estoque**: Atualização automática via entrada de notas fiscais
- **Transações MongoDB**: Garantia de integridade nas operações de entrada/saída
- **Reversão de Estoque**: Exclusão de NF reverte quantidades automaticamente
- **Interface Unificada**: Single Page Application com navegação por 5 abas
- **Indicadores Visuais**: Badges coloridos para controle de estoque baixo/crítico

## Licença

ISC
