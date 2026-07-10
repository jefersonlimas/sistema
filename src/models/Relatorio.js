const mongoose = require('mongoose');

const relatorioSchema = new mongoose.Schema({
    // Schema apenas para referência, a lógica dos relatórios está no controller
    tipo: { type: String },
    dataGeracao: { type: Date, default: Date.now },
    parametros: { type: Object }
});

module.exports = mongoose.model('Relatorio', relatorioSchema);
