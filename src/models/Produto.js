const mongoose = require('mongoose');
const TipoUnidade = require('./TipoUnidade');

const ProdutoSchema = new mongoose.Schema({
    codigoBarras: {
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
    tipoUnidade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TipoUnidade',
        required: true
    },
    precoCompra: {
        type: Number,
        required: true,
        min: 0
    },
    precoVenda: {
        type: Number,
        required: true,
        min: 0
    },
    margemLucro: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

// Middleware para calcular automaticamente a margem de lucro antes de salvar
ProdutoSchema.pre('save', function(next) {
    if (this.precoCompra > 0 && this.precoVenda > 0) {
        // Margem de lucro = ((Preço Venda - Preço Compra) / Preço Compra) * 100
        this.margemLucro = ((this.precoVenda - this.precoCompra) / this.precoCompra) * 100;
    }
    next();
});

module.exports = mongoose.model('Produto', ProdutoSchema);
