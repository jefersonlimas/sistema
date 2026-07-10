# Sistema de Gestão Empresarial - MVC com Node.js e MongoDB

Sistema completo de gestão empresarial desenvolvido com arquitetura **Model-View-Controller (MVC)** utilizando **Node.js**, **Express**, **MongoDB** e interface web moderna.

## 📋 Funcionalidades Implementadas

### 1. **Autenticação e Controle de Acesso**
- ✅ Tela de login segura com autenticação por usuário/senha
- ✅ Criação automática de usuário administrador na primeira execução
  - Usuário: `admin` | Senha: `admin123`
  - Possui acesso a todos os módulos
  - Não pode ser excluído do sistema
- ✅ Controle de acesso baseado em funções (RBAC)
- ✅ Exibição do nome e função do usuário logado na barra superior
- ✅ Menu dinâmico mostrando apenas módulos permitidos para cada função
- ✅ Senhas criptografadas com bcrypt

### 2. **Cadastro de Clientes**
- ✅ Campos: Nome, CPF (chave única), Data de Nascimento
- ✅ Endereço completo (Rua, Número, Complemento, Bairro, Cidade, Estado)
- ✅ Múltiplos telefones de contato (celular, residencial, comercial)
- ✅ Limite de crédito
- ✅ Validação de CPF único (11 dígitos)

### 3. **Cadastro de Produtos**
- ✅ Código de Barras (chave única)
- ✅ Descrição do produto
- ✅ Tipo de Unidade (relacionamento com tabela auxiliar)
- ✅ Preço de Compra
- ✅ Preço de Venda
- ✅ Margem de Lucro (calculada automaticamente)

### 4. **Tipos de Unidade**
- ✅ Tabela auxiliar com código e descrição
- ✅ Unidades como: UN, KG, LT, CX, etc.

### 5. **Cadastro de Fornecedores**
- ✅ Código, Nome, Endereço, Telefone, Contato

### 6. **Entrada de Mercadorias (Notas Fiscais)**
- ✅ Cadastro de notas fiscais dos fornecedores
- ✅ Soma automática da quantidade comprada ao estoque de produtos

### 7. **Vendas aos Clientes**
- ✅ Baixa automática de estoque ao realizar venda
- ✅ Múltiplas formas de pagamento: Dinheiro, PIX, Cartão, Prazo
- ✅ Cliente obrigatório para venda a prazo
- ✅ Validação de limite de crédito do cliente
- ✅ Cálculo do total comprometido em contas pendentes
- ✅ Estorno automático de estoque ao cancelar venda
- ✅ Geração automática de conta a pagar para vendas a prazo

### 8. **Contas a Pagar**
- ✅ Controle de contas por cliente
- ✅ Pagamentos parciais ou totais
- ✅ Cálculo automático do valor restante
- ✅ Status automático: pendente → parcial → pago
- ✅ Relatório de crédito por cliente
- ✅ Cancelamento automático ao estornar venda

### 9. **Cadastro de Funções**
- ✅ Código e descrição da função
- ✅ Módulos de acesso (permissões granulares por módulo)
- ✅ Soft delete (desativação ao invés de exclusão)
- ✅ Funções imutáveis (não podem ser excluídas)

### 10. **Cadastro de Usuários**
- ✅ Código, Nome, Vínculo com Função
- ✅ Nome de Usuário (login) e Senha criptografada
- ✅ Validação de unicidade de login
- ✅ Alteração de senha com validação da senha atual
- ✅ APIs nunca retornam hash da senha
- ✅ Usuário admin imutável (não pode ser excluído)

### 11. **Personalização do Sistema**
- ✅ Upload de logotipo da empresa (armazenado no servidor)
- ✅ Personalização de cores (primária, secundária, fundo, texto)
- ✅ Configurações salvas no MongoDB (persistência entre navegadores)
- ✅ Aplicação dinâmica via variáveis CSS
- ✅ Interface moderna e responsiva

### 12. **Módulo de Relatórios**
- ✅ **Vendas Diárias**: Resumo e detalhamento das vendas por data
- ✅ **Vendas por Funcionário**: Desempenho individual filtrado por período
- ✅ **Contas a Receber por Cliente**: Títulos vencidos, a vencer e recebidos
- ✅ **Produtos Mais Vendidos**: Ranking baseado na quantidade vendida
- ✅ **Clientes Aniversariantes**: Lista por período para campanhas
- ✅ **Estoque Baixo**: Alerta de produtos abaixo do limite mínimo
- ✅ Filtros dinâmicos conforme tipo de relatório
- ✅ Exportação para impressão com layout otimizado

## 🏗️ Estrutura do Projeto

```
/workspace
├── src/
│   ├── config/
│   │   └── database.js          # Configuração do MongoDB
│   ├── controllers/
│   │   ├── ClienteController.js
│   │   ├── ProdutoController.js
│   │   ├── TipoUnidadeController.js
│   │   ├── FornecedorController.js
│   │   ├── NotaFiscalController.js
│   │   ├── VendaController.js
│   │   ├── ContaPagarController.js
│   │   ├── FuncaoController.js
│   │   ├── UsuarioController.js
│   │   └── ConfiguracaoController.js
│   ├── models/
│   │   ├── Cliente.js
│   │   ├── Produto.js
│   │   ├── TipoUnidade.js
│   │   ├── Fornecedor.js
│   │   ├── NotaFiscal.js
│   │   ├── Venda.js
│   │   ├── ContaPagar.js
│   │   ├── Funcao.js
│   │   ├── Usuario.js
│   │   ├── Configuracao.js
│   │   └── Relatorio.js
│   ├── routes/
│   │   ├── clientes.js
│   │   ├── produtos.js
│   │   ├── tipos-unidade.js
│   │   ├── fornecedores.js
│   │   ├── notas-fiscais.js
│   │   ├── vendas.js
│   │   ├── contas-pagar.js
│   │   ├── funcoes.js
│   │   ├── usuarios.js
│   │   ├── configuracoes.js
│   │   └── relatorios.js
│   ├── views/
│   │   ├── login.html           # Tela de login
│   │   ├── index.html           # Dashboard principal
│   │   ├── configuracoes.html   # Tela de configurações
│   │   └── relatorios.html      # Módulo de relatórios
│   ├── public/
│   │   ├── css/
│   │   │   └── style.css        # Estilos globais
│   │   └── js/
│   │       ├── app.js           # Script principal
│   │       ├── login.js         # Script de login
│   │       ├── configuracoes.js # Script de configurações
│   │       └── relatorios.js    # Script de relatórios
│   ├── uploads/
│   │   └── logos/               # Logotipos uploadados
│   └── server.js                # Servidor Express
├── package.json
└── README.md
```

## 🔌 Endpoints da API

### Autenticação e Usuários
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/usuarios/autenticar` | Autenticar usuário |
| GET | `/api/usuarios` | Listar usuários |
| GET | `/api/usuarios/:id` | Buscar usuário por ID |
| POST | `/api/usuarios` | Criar usuário |
| PUT | `/api/usuarios/:id` | Atualizar usuário |
| PUT | `/api/usuarios/:id/senha` | Alterar senha |
| DELETE | `/api/usuarios/:id` | Desativar usuário |

### Funções
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/funcoes` | Listar funções |
| GET | `/api/funcoes/modulos` | Listar módulos disponíveis |
| POST | `/api/funcoes` | Criar função |
| PUT | `/api/funcoes/:id` | Atualizar função |
| DELETE | `/api/funcoes/:id` | Desativar função |

### Clientes
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/clientes` | Listar clientes |
| POST | `/api/clientes` | Criar cliente |
| PUT | `/api/clientes/:id` | Atualizar cliente |
| DELETE | `/api/clientes/:id` | Excluir cliente |

### Produtos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/produtos` | Listar produtos |
| POST | `/api/produtos` | Criar produto |
| PUT | `/api/produtos/:id` | Atualizar produto |
| DELETE | `/api/produtos/:id` | Excluir produto |

### Vendas
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/vendas` | Listar vendas |
| POST | `/api/vendas` | Realizar venda |
| PUT | `/api/vendas/:id/cancelar` | Cancelar venda |
| GET | `/api/vendas/relatorio` | Relatório de vendas |

### Contas a Pagar
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/contas-pagar` | Listar contas |
| PUT | `/api/contas-pagar/:id/pagar` | Registrar pagamento |
| GET | `/api/contas-pagar/cliente/:clienteId` | Contas por cliente |

### Configurações
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/configuracoes` | Obter configurações |
| PUT | `/api/configuracoes` | Atualizar configurações |
| POST | `/api/configuracoes/upload-logo` | Upload de logotipo |

### Relatórios
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/relatorios/vendas-diarias?data=YYYY-MM-DD` | Vendas do dia |
| GET | `/api/relatorios/vendas-funcionario?inicio=...&fim=...` | Vendas por funcionário |
| GET | `/api/relatorios/contas-receber?clienteId=...&inicio=...&fim=...` | Contas a receber |
| GET | `/api/relatorios/produtos-mais-vendidos?inicio=...&fim=...` | Ranking produtos |
| GET | `/api/relatorios/aniversariantes?inicio=MM-DD&fim=MM-DD` | Aniversariantes |
| GET | `/api/relatorios/estoque-baixo?limite=10` | Estoque baixo |

## 🚀 Como Executar

### Pré-requisitos
- Node.js (v14 ou superior)
- MongoDB rodando localmente ou em nuvem

### Instalação
```bash
cd /workspace
npm install
```

### Execução
```bash
npm start
```

Acesso: http://localhost:3000/login.html

**Primeiro Acesso:**
- O sistema criará automaticamente um usuário administrador
- **Usuário:** `admin`
- **Senha:** `admin123`

## 🔒 Segurança

- Senhas criptografadas com bcrypt
- Controle de acesso baseado em funções (RBAC)
- Validação de dados em todos os endpoints
- Proteção contra exclusão de usuários críticos
- Upload seguro de arquivos

## 🎨 Personalização

O sistema permite personalização completa através da tela de Configurações:
- Upload de logotipo da empresa
- Seleção de cores personalizadas
- As configurações são salvas no banco de dados e aplicadas em todos os navegadores

## 📱 Interface Moderna

- Layout responsivo com sidebar navegável
- Barra superior com informações do usuário logado
- Menu dinâmico baseado em permissões
- Design limpo e profissional
- Suporte a dispositivos móveis

## 📝 Licença

MIT License
