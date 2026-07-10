const mongoose = require('mongoose');

const NotaFiscalSchema = new mongoose.Schema({
    numero: {
        type: String,
        required: true,
        trim: true
    },
    serie: {
        type: String,
        required: true,
        trim: true
    },
    fornecedor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fornecedor',
        required: true
    },
    dataEmissao: {
        type: Date,
        required: true,
        default: Date.now
    },
    dataEntrada: {
        type: Date,
        required: true,
        default: Date.now
    },
    valorTotal: {
        type: Number,
        required: true,
        min: 0
    },
    itens: [{
        produto: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Produto',
            required: true
        },
        quantidade: {
            type: Number,
            required: true,
            min: 1
        },
        precoUnitario: {
            type: Number,
            required: true,
            min: 0
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0
        }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('NotaFiscal', NotaFiscalSchema);
