# Sistema de Cadastro de Clientes - MVC

Sistema de cadastro de clientes desenvolvido com arquitetura **Model-View-Controller (MVC)** utilizando **JavaScript (Node.js)** e banco de dados **MongoDB**.

## Campos do Cliente

- **Nome**: Nome completo do cliente
- **CPF**: Cadastro de Pessoa Física (chave única)
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

## Estrutura do Projeto

```
/workspace
├── src/
│   ├── config/
│   │   └── database.js      # Configuração do MongoDB
│   ├── models/
│   │   └── Cliente.js       # Model do Cliente (Schema Mongoose)
│   ├── views/
│   │   └── index.html       # Interface web (HTML/CSS/JS)
│   ├── controllers/
│   │   └── ClienteController.js  # Lógica de negócio
│   ├── routes/
│   │   └── clientes.js      # Rotas da API
│   └── server.js            # Ponto de entrada da aplicação
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

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/clientes` | Cria um novo cliente |
| GET | `/api/clientes` | Lista todos os clientes |
| GET | `/api/clientes/:cpf` | Busca cliente por CPF |
| PUT | `/api/clientes/:cpf` | Atualiza cliente |
| DELETE | `/api/clientes/:cpf` | Remove cliente |
| POST | `/api/clientes/:cpf/telefones` | Adiciona telefone ao cliente |
| DELETE | `/api/clientes/:cpf/telefones/:indice` | Remove telefone do cliente |

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

## Arquitetura MVC

- **Model**: Define a estrutura dos dados e regras de validação (Cliente.js)
- **View**: Interface web responsiva para interação com o usuário (index.html)
- **Controller**: Gerencia as requisições e respostas da API (ClienteController.js)

## Tecnologias Utilizadas

- **Backend**: Node.js, Express.js
- **Banco de Dados**: MongoDB com Mongoose ODM
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Middleware**: CORS, Body-parser

## Licença

ISC
