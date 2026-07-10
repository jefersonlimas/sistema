const mongoose = require('mongoose');

const configuracaoSchema = new mongoose.Schema({
    logotipoUrl: {
        type: String,
        default: ''
    },
    corPrimaria: {
        type: String,
        default: '#2563eb'
    },
    corSecundaria: {
        type: String,
        default: '#1e40af'
    },
    corFundo: {
        type: String,
        default: '#f3f4f6'
    },
    corTexto: {
        type: String,
        default: '#1f2937'
    }
}, {
    timestamps: true
});

// Garantir que haja apenas um documento de configuração
configuracaoSchema.statics.getConfiguracao = async function() {
    let config = await this.findOne();
    if (!config) {
        config = await this.create({});
    }
    return config;
};

module.exports = mongoose.model('Configuracao', configuracaoSchema);
