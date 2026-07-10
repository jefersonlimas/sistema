const mongoose = require('mongoose');

const funcaoSchema = new mongoose.Schema({
  codigo: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  descricao: {
    type: String,
    required: true,
    trim: true
  },
  modulosAcesso: [{
    type: String,
    enum: [
      'clientes',
      'produtos',
      'tipos-unidade',
      'fornecedores',
      'notas-fiscais',
      'vendas',
      'contas-pagar',
      'funcoes',
      'usuarios',
      'configuracoes'
    ],
    required: true
  }],
  ativo: {
    type: Boolean,
    default: true
  },
  dataCadastro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Funcao', funcaoSchema);
