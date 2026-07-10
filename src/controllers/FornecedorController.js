const Fornecedor = require('../models/Fornecedor');

class FornecedorController {
    async index(req, res) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const query = search ? { 
                $or: [
                    { nome: { $regex: search, $options: 'i' } },
                    { codigo: { $regex: search, $options: 'i' } }
                ]
            } : {};
            
            const fornecedores = await Fornecedor.find(query)
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ nome: 1 });
            
            const count = await Fornecedor.countDocuments(query);
            
            res.json({
                fornecedores,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count
            });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar fornecedores', error: error.message });
        }
    }

    async show(req, res) {
        try {
            const fornecedor = await Fornecedor.findById(req.params.id);
            if (!fornecedor) {
                return res.status(404).json({ message: 'Fornecedor não encontrado' });
            }
            res.json(fornecedor);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar fornecedor', error: error.message });
        }
    }

    async store(req, res) {
        try {
            const { codigo, nome, endereco, telefone, contato } = req.body;
            
            // Verificar se código já existe
            const existingFornecedor = await Fornecedor.findOne({ codigo });
            if (existingFornecedor) {
                return res.status(400).json({ message: 'Código de fornecedor já cadastrado' });
            }
            
            const fornecedor = new Fornecedor({
                codigo,
                nome,
                endereco,
                telefone,
                contato
            });
            
            await fornecedor.save();
            res.status(201).json(fornecedor);
        } catch (error) {
            if (error.code === 11000) {
                return res.status(400).json({ message: 'Código de fornecedor já cadastrado' });
            }
            res.status(500).json({ message: 'Erro ao cadastrar fornecedor', error: error.message });
        }
    }

    async update(req, res) {
        try {
            const { codigo, nome, endereco, telefone, contato } = req.body;
            
            // Verificar se outro fornecedor já tem este código
            const existingFornecedor = await Fornecedor.findOne({ 
                codigo, 
                _id: { $ne: req.params.id } 
            });
            
            if (existingFornecedor) {
                return res.status(400).json({ message: 'Código de fornecedor já cadastrado' });
            }
            
            const fornecedor = await Fornecedor.findByIdAndUpdate(
                req.params.id,
                { codigo, nome, endereco, telefone, contato },
                { new: true, runValidators: true }
            );
            
            if (!fornecedor) {
                return res.status(404).json({ message: 'Fornecedor não encontrado' });
            }
            
            res.json(fornecedor);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao atualizar fornecedor', error: error.message });
        }
    }

    async destroy(req, res) {
        try {
            const fornecedor = await Fornecedor.findByIdAndDelete(req.params.id);
            if (!fornecedor) {
                return res.status(404).json({ message: 'Fornecedor não encontrado' });
            }
            res.json({ message: 'Fornecedor excluído com sucesso' });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao excluir fornecedor', error: error.message });
        }
    }
}

module.exports = new FornecedorController();
