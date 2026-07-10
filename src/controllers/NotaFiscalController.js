const NotaFiscal = require('../models/NotaFiscal');
const Produto = require('../models/Produto');
const Fornecedor = require('../models/Fornecedor');

class NotaFiscalController {
    async index(req, res) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            const query = search ? { 
                $or: [
                    { numero: { $regex: search, $options: 'i' } },
                    { serie: { $regex: search, $options: 'i' } }
                ]
            } : {};
            
            const notasFiscais = await NotaFiscal.find(query)
                .populate('fornecedor', 'nome codigo')
                .populate('itens.produto', 'descricao codigoBarras')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ dataEntrada: -1 });
            
            const count = await NotaFiscal.countDocuments(query);
            
            res.json({
                notasFiscais,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count
            });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar notas fiscais', error: error.message });
        }
    }

    async show(req, res) {
        try {
            const notaFiscal = await NotaFiscal.findById(req.params.id)
                .populate('fornecedor', 'nome codigo endereco telefone contato')
                .populate('itens.produto', 'descricao codigoBarras quantidadeEstoque');
            
            if (!notaFiscal) {
                return res.status(404).json({ message: 'Nota fiscal não encontrada' });
            }
            res.json(notaFiscal);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar nota fiscal', error: error.message });
        }
    }

    async store(req, res) {
        const session = await NotaFiscal.startSession();
        
        try {
            await session.startTransaction();
            
            const { numero, serie, fornecedor, dataEmissao, dataEntrada, valorTotal, itens } = req.body;
            
            // Verificar se nota fiscal já existe (mesmo número e série)
            const existingNota = await NotaFiscal.findOne({ numero, serie }).session(session);
            if (existingNota) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Nota fiscal já cadastrada com este número e série' });
            }
            
            // Validar itens
            if (!itens || itens.length === 0) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Nota fiscal deve conter pelo menos um item' });
            }
            
            // Criar nota fiscal
            const notaFiscal = new NotaFiscal({
                numero,
                serie,
                fornecedor,
                dataEmissao: dataEmissao || Date.now(),
                dataEntrada: dataEntrada || Date.now(),
                valorTotal,
                itens
            });
            
            await notaFiscal.save({ session });
            
            // Atualizar estoque de cada produto
            for (const item of itens) {
                await Produto.findByIdAndUpdate(
                    item.produto,
                    { 
                        $inc: { quantidadeEstoque: item.quantidade },
                        // Atualiza preço de compra se o novo for diferente
                        $set: { 
                            precoCompra: item.precoUnitario 
                        }
                    },
                    { session, runValidators: true }
                );
            }
            
            await session.commitTransaction();
            
            // Buscar nota fiscal completa após salvar
            const notaCompleta = await NotaFiscal.findById(notaFiscal._id)
                .populate('fornecedor', 'nome codigo')
                .populate('itens.produto', 'descricao codigoBarras');
            
            res.status(201).json({
                message: 'Nota fiscal registrada e estoque atualizado com sucesso',
                notaFiscal: notaCompleta
            });
        } catch (error) {
            await session.abortTransaction();
            res.status(500).json({ 
                message: 'Erro ao registrar nota fiscal', 
                error: error.message 
            });
        } finally {
            session.endSession();
        }
    }

    async destroy(req, res) {
        const session = await NotaFiscal.startSession();
        
        try {
            await session.startTransaction();
            
            const notaFiscal = await NotaFiscal.findById(req.params.id).session(session);
            
            if (!notaFiscal) {
                await session.abortTransaction();
                return res.status(404).json({ message: 'Nota fiscal não encontrada' });
            }
            
            // Reverter estoque dos produtos
            for (const item of notaFiscal.itens) {
                await Produto.findByIdAndUpdate(
                    item.produto,
                    { $inc: { quantidadeEstoque: -item.quantidade } },
                    { session }
                );
            }
            
            await NotaFiscal.findByIdAndDelete(req.params.id).session(session);
            await session.commitTransaction();
            
            res.json({ message: 'Nota fiscal excluída e estoque revertido com sucesso' });
        } catch (error) {
            await session.abortTransaction();
            res.status(500).json({ 
                message: 'Erro ao excluir nota fiscal', 
                error: error.message 
            });
        } finally {
            session.endSession();
        }
    }

    async getRelatorio(req, res) {
        try {
            const { dataInicio, dataFim } = req.query;
            
            const query = {};
            if (dataInicio && dataFim) {
                query.dataEntrada = {
                    $gte: new Date(dataInicio),
                    $lte: new Date(dataFim)
                };
            }
            
            const notasFiscais = await NotaFiscal.find(query)
                .populate('fornecedor', 'nome')
                .populate('itens.produto', 'descricao');
            
            const relatorio = {
                totalNotas: notasFiscais.length,
                valorTotalEntradas: notasFiscais.reduce((acc, nf) => acc + nf.valorTotal, 0),
                produtosRecebidos: notasFiscais.reduce((acc, nf) => {
                    nf.itens.forEach(item => {
                        acc += item.quantidade;
                    });
                    return acc;
                }, 0),
                notas: notasFiscais
            };
            
            res.json(relatorio);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao gerar relatório', error: error.message });
        }
    }
}

module.exports = new NotaFiscalController();
