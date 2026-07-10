const TipoUnidade = require('../models/TipoUnidade');

class TipoUnidadeController {
    // Create - Criar novo tipo de unidade
    static async criarTipoUnidade(req, res) {
        try {
            const { codigo, descricao } = req.body;

            const tipoExistente = await TipoUnidade.findOne({ codigo: codigo.toUpperCase() });
            if (tipoExistente) {
                return res.status(400).json({ 
                    error: 'Já existe um tipo de unidade cadastrado com este código' 
                });
            }

            const tipoUnidade = new TipoUnidade({
                codigo: codigo.toUpperCase(),
                descricao
            });

            await tipoUnidade.save();
            res.status(201).json(tipoUnidade);
        } catch (error) {
            if (error.name === 'ValidationError') {
                const mensagens = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ erros: mensagens });
            }
            res.status(500).json({ error: 'Erro ao criar tipo de unidade', detalhes: error.message });
        }
    }

    // Read - Listar todos os tipos de unidade
    static async listarTiposUnidade(req, res) {
        try {
            const tipos = await TipoUnidade.find().sort({ descricao: 1 });
            res.json(tipos);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao listar tipos de unidade', detalhes: error.message });
        }
    }

    // Read - Buscar tipo de unidade por código
    static async buscarTipoUnidadePorCodigo(req, res) {
        try {
            const { codigo } = req.params;
            const tipoUnidade = await TipoUnidade.findOne({ codigo: codigo.toUpperCase() });

            if (!tipoUnidade) {
                return res.status(404).json({ error: 'Tipo de unidade não encontrado' });
            }

            res.json(tipoUnidade);
        } catch (error) {
            res.status(500).json({ error: 'Erro ao buscar tipo de unidade', detalhes: error.message });
        }
    }

    // Update - Atualizar tipo de unidade
    static async atualizarTipoUnidade(req, res) {
        try {
            const { codigo } = req.params;
            const dadosAtualizados = req.body;

            if (dadosAtualizados.codigo && dadosAtualizados.codigo !== codigo) {
                dadosAtualizados.codigo = dadosAtualizados.codigo.toUpperCase();
                const tipoExistente = await TipoUnidade.findOne({ codigo: dadosAtualizados.codigo });
                if (tipoExistente) {
                    return res.status(400).json({ 
                        error: 'Já existe um tipo de unidade cadastrado com este código' 
                    });
                }
            }

            const tipoUnidade = await TipoUnidade.findOneAndUpdate(
                { codigo: codigo.toUpperCase() },
                dadosAtualizados,
                { new: true, runValidators: true }
            );

            if (!tipoUnidade) {
                return res.status(404).json({ error: 'Tipo de unidade não encontrado' });
            }

            res.json(tipoUnidade);
        } catch (error) {
            if (error.name === 'ValidationError') {
                const mensagens = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({ erros: mensagens });
            }
            res.status(500).json({ error: 'Erro ao atualizar tipo de unidade', detalhes: error.message });
        }
    }

    // Delete - Remover tipo de unidade
    static async removerTipoUnidade(req, res) {
        try {
            const { codigo } = req.params;
            const tipoUnidade = await TipoUnidade.findOneAndDelete({ codigo: codigo.toUpperCase() });

            if (!tipoUnidade) {
                return res.status(404).json({ error: 'Tipo de unidade não encontrado' });
            }

            res.json({ message: 'Tipo de unidade removido com sucesso' });
        } catch (error) {
            res.status(500).json({ error: 'Erro ao remover tipo de unidade', detalhes: error.message });
        }
    }
}

module.exports = TipoUnidadeController;
