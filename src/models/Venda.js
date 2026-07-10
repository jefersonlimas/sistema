const mongoose = require('mongoose');

const ItemVendaSchema = new mongoose.Schema({
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
}, { _id: false });

const VendaSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: function() {
            return this.formaPagamento === 'prazo';
        }
    },
    dataVenda: {
        type: Date,
        required: true,
        default: Date.now
    },
    formaPagamento: {
        type: String,
        enum: ['dinheiro', 'pix', 'cartao', 'prazo'],
        required: true
    },
    valorTotal: {
        type: Number,
        required: true,
        min: 0
    },
    itens: {
        type: [ItemVendaSchema],
        required: true,
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'A venda deve conter pelo menos um item'
        }
    },
    status: {
        type: String,
        enum: ['concluida', 'pendente', 'cancelada'],
        default: 'concluida'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Venda', VendaSchema);
