const mongoose = require('mongoose');

const FornecedorSchema = new mongoose.Schema({
    codigo: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    nome: {
        type: String,
        required: true,
        trim: true
    },
    endereco: {
        rua: {
            type: String,
            required: true,
            trim: true
        },
        numero: {
            type: String,
            required: true,
            trim: true
        },
        complemento: {
            type: String,
            trim: true
        },
        bairro: {
            type: String,
            required: true,
            trim: true
        },
        cidade: {
            type: String,
            required: true,
            trim: true
        },
        estado: {
            type: String,
            required: true,
            trim: true,
            maxlength: 2
        }
    },
    telefone: {
        type: String,
        required: true,
        trim: true
    },
    contato: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Fornecedor', FornecedorSchema);
