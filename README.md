# Sistema de Gestão - MVC (Clientes, Produtos, Fornecedores, Notas Fiscais, Vendas, Contas a Pagar e Configurações)

Sistema de gestão desenvolvido com arquitetura **Model-View-Controller (MVC)** utilizando **JavaScript (Node.js)** e banco de dados **MongoDB**. O sistema gerencia **Clientes**, **Produtos**, **Fornecedores**, **Notas Fiscais**, **Tipos de Unidade**, **Vendas**, **Contas a Pagar** e **Configurações Personalizadas** com controle automático de estoque, limite de crédito e interface moderna personalizável.

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

### 5. Módulo de Vendas

#### Campos da Venda:
- **Cliente**: Relacionamento com cadastro de clientes (obrigatório para venda a prazo)
- **Data da Venda**: Data de realização da venda
- **Forma de Pagamento**: Dinheiro, PIX, Cartão ou Prazo
- **Valor Total**: Soma dos itens da venda
- **Itens**: Lista de produtos com quantidade, preço unitário e subtotal
- **Status**: Concluída, Pendente ou Cancelada

#### Funcionalidades Especiais:
- **Baixa Automática de Estoque**: Ao realizar uma venda, a quantidade de cada produto é subtraída do estoque
- **Múltiplas Formas de Pagamento**: Suporte para dinheiro, PIX, cartão de crédito/débito e venda a prazo
- **Validação de Cliente para Venda a Prazo**: Cliente é obrigatório quando forma de pagamento é "prazo"
- **Controle de Limite de Crédito**: Sistema verifica se o total das compras não excede o limite de crédito do cliente
- **Estorno Automático**: Ao cancelar uma venda, o estoque dos produtos é restituído
- **Criação Automática de Conta a Pagar**: Vendas a prazo geram automaticamente um registro em contas a pagar

### 6. Contas a Pagar (Controle de Crédito)

#### Campos da Conta a Pagar:
- **Cliente**: Relacionamento com cadastro de clientes
- **Venda**: Relacionamento com a venda que originou a conta
- **Data de Vencimento**: Data limite para pagamento
- **Valor Original**: Valor total da venda
- **Valor Pago**: Valor já quitado pelo cliente
- **Valor Restante**: Saldo pendente (calculado automaticamente)
- **Data de Pagamento**: Data efetiva do pagamento
- **Status**: Pendente, Parcial, Pago, Vencido ou Cancelado
- **Observações**: Campo para anotações sobre o pagamento

#### Funcionalidades Especiais:
- **Cálculo Automático do Restante**: Valor restante é calculado automaticamente (Valor Original - Valor Pago)
- **Atualização Automática de Status**: Status muda conforme pagamentos são registrados (pendente → parcial → pago)
- **Pagamentos Parciais**: Permite quitar a conta em múltiplos pagamentos
- **Controle por Cliente**: Visualização de todas as contas pendentes de um cliente
- **Relatório de Crédito**: Total comprometido vs. limite disponível por cliente
- **Cancelamento Automático**: Ao cancelar uma venda a prazo, a conta a pagar correspondente é cancelada

### 7. Configurações do Sistema (Personalização Visual)

#### Campos de Configuração:
- **Logotipo da Empresa**: Upload de imagem (JPG, PNG, GIF, SVG - Máx. 5MB)
- **Cor Primária**: Cor principal do sistema (botões, cabeçalhos, destaques)
- **Cor Secundária**: Cor secundária (gradientes, hover, detalhes)
- **Cor de Fundo**: Cor de fundo da interface
- **Cor do Texto**: Cor padrão do texto

#### Funcionalidades Especiais:
- **Upload no Servidor**: Logotipo é armazenado no servidor (não no localStorage)
- **Persistência no Banco**: Todas as configurações são salvas no MongoDB
- **Sincronização entre Navegadores**: Alterações refletem em todos os dispositivos/navegadores
- **Aplicação Dinâmica**: Cores aplicadas via variáveis CSS em tempo real
- **Preview em Tempo Real**: Visualização imediata das cores selecionadas
- **Interface Moderna**: Design responsivo com sidebar, cards e componentes elegantes
- **Múltiplas Telas**: Interface dividida em arquivos separados para fácil manutenção

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
│   │   ├── NotaFiscal.js        # Model de Nota Fiscal (entrada de mercadorias)
│   │   ├── Venda.js             # Model de Venda (controle de estoque e pagamento)
│   │   ├── ContaPagar.js        # Model de Contas a Pagar (controle de crédito)
│   │   └── Configuracao.js      # Model de Configurações (logotipo e cores)
│   ├── views/
│   │   ├── index.html           # Página inicial
│   │   ├── configuracoes.html   # Tela de configurações
│   │   └── ...                  # Outras telas do sistema
│   ├── controllers/
│   │   ├── ClienteController.js      # Lógica de negócio de Clientes
│   │   ├── TipoUnidadeController.js  # Lógica de negócio de Tipos de Unidade
│   │   ├── ProdutoController.js      # Lógica de negócio de Produtos
│   │   ├── FornecedorController.js   # Lógica de negócio de Fornecedores
│   │   ├── NotaFiscalController.js   # Lógica de negócio de Notas Fiscais
│   │   ├── VendaController.js        # Lógica de negócio de Vendas
│   │   ├── ContaPagarController.js   # Lógica de negócio de Contas a Pagar
│   │   └── ConfiguracaoController.js # Lógica de negócio de Configurações
│   ├── routes/
│   │   ├── clientes.js          # Rotas da API de Clientes
│   │   ├── tipos-unidade.js     # Rotas da API de Tipos de Unidade
│   │   ├── produtos.js          # Rotas da API de Produtos
│   │   ├── fornecedores.js      # Rotas da API de Fornecedores
│   │   ├── notas-fiscais.js     # Rotas da API de Notas Fiscais
│   │   ├── vendas.js            # Rotas da API de Vendas
│   │   ├── contas-pagar.js      # Rotas da API de Contas a Pagar
│   │   └── configuracoes.js     # Rotas da API de Configurações
│   ├── public/
│   │   ├── css/
│   │   │   └── style.css        # Estilos globais com variáveis CSS
│   │   ├── js/
│   │   │   ├── app.js           # Script principal (carrega configurações)
│   │   │   └── configuracoes.js # Script da tela de configurações
│   │   └── uploads/
│   │       └── logos/           # Armazenamento de logotipos
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

### Vendas

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/vendas` | Realiza nova venda (baixa estoque automaticamente) |
| GET | `/api/vendas` | Lista todas as vendas |
| GET | `/api/vendas/:id` | Busca venda por ID |
| PUT | `/api/vendas/:id/cancelar` | Cancela venda (estorna estoque) |
| GET | `/api/vendas/relatorio` | Relatório de vendas por período e forma de pagamento |

### Contas a Pagar

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/contas-pagar` | Lista todas as contas a pagar |
| GET | `/api/contas-pagar/:id` | Busca conta a pagar por ID |
| PUT | `/api/contas-pagar/:id/pagar` | Registra pagamento (parcial ou total) |
| GET | `/api/contas-pagar/relatorio` | Relatório de contas a pagar por status |
| GET | `/api/contas-pagar/cliente/:clienteId` | Contas a pagar de um cliente específico |

### Configurações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/configuracoes` | Obtém configurações atuais do sistema |
| PUT | `/api/configuracoes` | Atualiza configurações (cores e logotipo) |

*Obs: O upload de logotipo é feito via multipart/form-data. As configurações são salvas no MongoDB e aplicadas em todos os navegadores.*

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

## Exemplo de Requisição (POST /api/vendas)

```json
{
  "cliente": "60a8f5c7d4e5f6001f111111",
  "formaPagamento": "prazo",
  "dataVencimento": "2024-03-15",
  "itens": [
    {
      "produto": "60a8f5c7d4e5f6001f789012",
      "quantidade": 2,
      "precoUnitario": 25.00,
      "subtotal": 50.00
    },
    {
      "produto": "60a8f5c7d4e5f6001f789013",
      "quantidade": 1,
      "precoUnitario": 45.00,
      "subtotal": 45.00
    }
  ]
}
```

*Obs: A venda a prazo cria automaticamente uma conta a pagar e verifica o limite de crédito do cliente.*

## Exemplo de Requisição (PUT /api/contas-pagar/:id/pagar)

```json
{
  "valorPago": 50.00,
  "observacoes": "Pagamento parcial via PIX"
}
```

*Obs: Permite pagamentos parciais. O status é atualizado automaticamente para "parcial" ou "pago".*

## Arquitetura MVC

- **Model**: Define a estrutura dos dados e regras de validação (Cliente.js, TipoUnidade.js, Produto.js, Fornecedor.js, NotaFiscal.js, Venda.js, ContaPagar.js, Configuracao.js)
- **View**: Interface web responsiva e moderna com múltiplas telas e sidebar de navegação
- **Controller**: Gerencia as requisições e respostas da API (8 controllers especializados)

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: MongoDB com Mongoose ODM (suporte a transações)
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Middleware**: CORS, Body-parser, Multer (upload de arquivos)
- **Ícones**: Font Awesome 6

## Funcionalidades Especiais

- **CPF Único**: Validação de CPF como chave única no cadastro de clientes
- **Múltiplos Telefones**: Cliente pode ter vários telefones (celular, residencial, comercial)
- **Margem de Lucro Automática**: Cálculo automático da margem de lucro nos produtos
- **Tabela de Unidades**: Gestão de tipos de unidade reutilizável em todos os produtos
- **Controle de Estoque**: Atualização automática via entrada de notas fiscais e baixa por vendas
- **Transações MongoDB**: Garantia de integridade nas operações de entrada/saída
- **Reversão de Estoque**: Exclusão de NF reverte quantidades automaticamente
- **Baixa Automática de Estoque**: Vendas decrementam estoque automaticamente
- **Múltiplas Formas de Pagamento**: Dinheiro, PIX, Cartão e Prazo
- **Controle de Limite de Crédito**: Validação automática para vendas a prazo
- **Contas a Pagar**: Gestão completa de crédito concedido aos clientes
- **Pagamentos Parciais**: Permite quitar contas em múltiplos pagamentos
- **Estorno Automático**: Cancelamento de venda estorna estoque e cancela conta a pagar
- **Interface Moderna**: Design responsivo com sidebar, cards e componentes elegantes
- **Personalização Visual**: Logotipo e cores customizáveis salvas no servidor
- **Sincronização Multi-dispositivo**: Configurações aplicadas em todos os navegadores
- **Upload de Arquivos**: Logotipo armazenado no servidor com multer
- **Variáveis CSS**: Cores dinâmicas aplicadas via variáveis CSS em tempo real
- **Múltiplas Telas**: Interface modular dividida em arquivos separados
- **Indicadores Visuais**: Badges coloridos para controle de estoque baixo/crítico

## Licença

ISC
