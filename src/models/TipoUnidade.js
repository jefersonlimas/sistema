const mongoose = require('mongoose');

const TipoUnidadeSchema = new mongoose.Schema({
    codigo: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },
    descricao: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TipoUnidade', TipoUnidadeSchema);
