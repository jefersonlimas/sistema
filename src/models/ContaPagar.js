const mongoose = require('mongoose');

const ContaPagarSchema = new mongoose.Schema({
    cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Cliente',
        required: true
    },
    venda: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Venda',
        required: true
    },
    dataVencimento: {
        type: Date,
        required: true
    },
    valorOriginal: {
        type: Number,
        required: true,
        min: 0
    },
    valorPago: {
        type: Number,
        default: 0,
        min: 0
    },
    valorRestante: {
        type: Number,
        required: true,
        min: 0
    },
    dataPagamento: {
        type: Date
    },
    status: {
        type: String,
        enum: ['pendente', 'pago', 'vencido', 'parcial'],
        default: 'pendente'
    },
    observacoes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Middleware para atualizar o valor restante antes de salvar
ContaPagarSchema.pre('save', function(next) {
    if (this.valorOriginal !== undefined && this.valorPago !== undefined) {
        this.valorRestante = this.valorOriginal - this.valorPago;
        
        // Atualizar status baseado no pagamento
        if (this.valorPago <= 0) {
            this.status = 'pendente';
        } else if (this.valorPago >= this.valorOriginal) {
            this.status = 'pago';
            if (!this.dataPagamento) {
                this.dataPagamento = new Date();
            }
        } else {
            this.status = 'parcial';
        }
    }
    next();
});

module.exports = mongoose.model('ContaPagar', ContaPagarSchema);
