const mongoose = require('mongoose');

const EnderecoSchema = new mongoose.Schema({
    rua: {
        type: String,
        required: true
    },
    numero: {
        type: String,
        required: true
    },
    complemento: {
        type: String,
        default: ''
    },
    bairro: {
        type: String,
        required: true
    },
    cidade: {
        type: String,
        required: true
    },
    estado: {
        type: String,
        required: true,
        maxlength: 2
    }
}, { _id: false });

const TelefoneSchema = new mongoose.Schema({
    tipo: {
        type: String,
        enum: ['celular', 'residencial', 'comercial'],
        default: 'celular'
    },
    numero: {
        type: String,
        required: true
    }
}, { _id: false });

const ClienteSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true
    },
    cpf: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                return /^\d{11}$/.test(v);
            },
            message: props => `${props.value} não é um CPF válido! Deve conter 11 dígitos.`
        }
    },
    dataNascimento: {
        type: Date,
        required: true
    },
    endereco: {
        type: EnderecoSchema,
        required: true
    },
    telefones: {
        type: [TelefoneSchema],
        default: []
    },
    limiteCredito: {
        type: Number,
        required: true,
        min: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Cliente', ClienteSchema);
