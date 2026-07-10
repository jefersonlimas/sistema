const Venda = require('../models/Venda');
const ContaPagar = require('../models/ContaPagar');
const Produto = require('../models/Produto');
const Cliente = require('../models/Cliente');

class VendaController {
    async index(req, res) {
        try {
            const { page = 1, limit = 10, search, formaPagamento, status } = req.query;
            const query = {};
            
            if (search) {
                // Busca por cliente ou produtos
                const vendas = await Venda.find({})
                    .populate('cliente', 'nome cpf')
                    .populate('itens.produto', 'descricao codigoBarras');
                
                const filteredVendas = vendas.filter(venda => {
                    const clienteMatch = venda.cliente && 
                        (venda.cliente.nome.toLowerCase().includes(search.toLowerCase()) ||
                         venda.cliente.cpf.includes(search));
                    
                    const produtoMatch = venda.itens.some(item => 
                        item.produto && 
                        (item.produto.descricao.toLowerCase().includes(search.toLowerCase()) ||
                         item.produto.codigoBarras.includes(search))
                    );
                    
                    return clienteMatch || produtoMatch;
                });
                
                return res.json({
                    vendas: filteredVendas,
                    total: filteredVendas.length
                });
            }
            
            if (formaPagamento) {
                query.formaPagamento = formaPagamento;
            }
            
            if (status) {
                query.status = status;
            }
            
            const vendas = await Venda.find(query)
                .populate('cliente', 'nome cpf')
                .populate('itens.produto', 'descricao codigoBarras')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ dataVenda: -1 });
            
            const count = await Venda.countDocuments(query);
            
            res.json({
                vendas,
                totalPages: Math.ceil(count / limit),
                currentPage: page,
                total: count
            });
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar vendas', error: error.message });
        }
    }

    async show(req, res) {
        try {
            const venda = await Venda.findById(req.params.id)
                .populate('cliente', 'nome cpf endereco telefones limiteCredito')
                .populate('itens.produto', 'descricao codigoBarras quantidadeEstoque');
            
            if (!venda) {
                return res.status(404).json({ message: 'Venda não encontrada' });
            }
            res.json(venda);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao buscar venda', error: error.message });
        }
    }

    async store(req, res) {
        const session = await Venda.startSession();
        
        try {
            await session.startTransaction();
            
            const { cliente, formaPagamento, itens, dataVencimento } = req.body;
            
            // Validar itens
            if (!itens || itens.length === 0) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'A venda deve conter pelo menos um item' });
            }
            
            // Verificar estoque e calcular total
            let valorTotal = 0;
            for (const item of itens) {
                const produto = await Produto.findById(item.produto).session(session);
                
                if (!produto) {
                    await session.abortTransaction();
                    return res.status(404).json({ 
                        message: `Produto não encontrado: ${item.produto}` 
                    });
                }
                
                if (produto.quantidadeEstoque < item.quantidade) {
                    await session.abortTransaction();
                    return res.status(400).json({ 
                        message: `Estoque insuficiente para o produto: ${produto.descricao}. Disponível: ${produto.quantidadeEstoque}, Solicitado: ${item.quantidade}` 
                    });
                }
                
                valorTotal += item.subtotal;
            }
            
            // Se for venda a prazo, validar cliente e limite de crédito
            if (formaPagamento === 'prazo') {
                if (!cliente) {
                    await session.abortTransaction();
                    return res.status(400).json({ 
                        message: 'Cliente é obrigatório para vendas a prazo' 
                    });
                }
                
                const clienteDoc = await Cliente.findById(cliente).session(session);
                
                if (!clienteDoc) {
                    await session.abortTransaction();
                    return res.status(404).json({ message: 'Cliente não encontrado' });
                }
                
                // Calcular total já comprometido em contas pendentes
                const contasPendentes = await ContaPagar.aggregate([
                    { $match: { 
                        cliente: new mongoose.Types.ObjectId(cliente),
                        status: { $in: ['pendente', 'parcial'] }
                    }},
                    { $group: { _id: null, total: { $sum: '$valorRestante' } } }
                ]).session(session);
                
                const totalComprometido = contasPendentes.length > 0 ? contasPendentes[0].total : 0;
                
                // Verificar se nova compra excede limite
                if ((totalComprometido + valorTotal) > clienteDoc.limiteCredito) {
                    await session.abortTransaction();
                    return res.status(400).json({ 
                        message: `Limite de crédito excedido. Limite: R$ ${clienteDoc.limiteCredito.toFixed(2)}, Comprometido: R$ ${totalComprometido.toFixed(2)}, Nova compra: R$ ${valorTotal.toFixed(2)}` 
                    });
                }
            }
            
            // Criar venda
            const venda = new Venda({
                cliente: formaPagamento === 'prazo' ? cliente : null,
                formaPagamento,
                valorTotal,
                itens,
                status: 'concluida'
            });
            
            await venda.save({ session });
            
            // Baixar estoque de cada produto
            for (const item of itens) {
                await Produto.findByIdAndUpdate(
                    item.produto,
                    { $inc: { quantidadeEstoque: -item.quantidade } },
                    { session, runValidators: true }
                );
            }
            
            // Se for venda a prazo, criar conta a pagar
            if (formaPagamento === 'prazo') {
                const contaPagar = new ContaPagar({
                    cliente,
                    venda: venda._id,
                    dataVencimento: dataVencimento || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias padrão
                    valorOriginal: valorTotal,
                    valorPago: 0,
                    valorRestante: valorTotal,
                    status: 'pendente'
                });
                
                await contaPagar.save({ session });
            }
            
            await session.commitTransaction();
            
            // Buscar venda completa após salvar
            const vendaCompleta = await Venda.findById(venda._id)
                .populate('cliente', 'nome cpf')
                .populate('itens.produto', 'descricao codigoBarras');
            
            res.status(201).json({
                message: 'Venda realizada com sucesso',
                venda: vendaCompleta
            });
        } catch (error) {
            await session.abortTransaction();
            res.status(500).json({ 
                message: 'Erro ao realizar venda', 
                error: error.message 
            });
        } finally {
            session.endSession();
        }
    }

    async cancel(req, res) {
        const session = await Venda.startSession();
        
        try {
            await session.startTransaction();
            
            const venda = await Venda.findById(req.params.id).session(session);
            
            if (!venda) {
                await session.abortTransaction();
                return res.status(404).json({ message: 'Venda não encontrada' });
            }
            
            if (venda.status === 'cancelada') {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Venda já está cancelada' });
            }
            
            // Estornar estoque
            for (const item of venda.itens) {
                await Produto.findByIdAndUpdate(
                    item.produto,
                    { $inc: { quantidadeEstoque: item.quantidade } },
                    { session }
                );
            }
            
            // Se foi venda a prazo, cancelar conta a pagar
            if (venda.formaPagamento === 'prazo') {
                await ContaPagar.findOneAndUpdate(
                    { venda: venda._id },
                    { status: 'cancelada' },
                    { session }
                );
            }
            
            venda.status = 'cancelada';
            await venda.save({ session });
            
            await session.commitTransaction();
            
            res.json({ message: 'Venda cancelada com sucesso' });
        } catch (error) {
            await session.abortTransaction();
            res.status(500).json({ 
                message: 'Erro ao cancelar venda', 
                error: error.message 
            });
        } finally {
            session.endSession();
        }
    }

    async getRelatorio(req, res) {
        try {
            const { dataInicio, dataFim, formaPagamento } = req.query;
            
            const query = {};
            if (dataInicio && dataFim) {
                query.dataVenda = {
                    $gte: new Date(dataInicio),
                    $lte: new Date(dataFim)
                };
            }
            
            if (formaPagamento) {
                query.formaPagamento = formaPagamento;
            }
            
            const vendas = await Venda.find(query)
                .populate('cliente', 'nome')
                .populate('itens.produto', 'descricao');
            
            const relatorio = {
                totalVendas: vendas.length,
                valorTotalVendido: vendas.reduce((acc, v) => acc + v.valorTotal, 0),
                vendasPorFormaPagamento: {},
                vendas: vendas
            };
            
            // Agrupar por forma de pagamento
            const formasPagamento = ['dinheiro', 'pix', 'cartao', 'prazo'];
            for (const forma of formasPagamento) {
                const vendasForma = vendas.filter(v => v.formaPagamento === forma);
                relatorio.vendasPorFormaPagamento[forma] = {
                    quantidade: vendasForma.length,
                    valor: vendasForma.reduce((acc, v) => acc + v.valorTotal, 0)
                };
            }
            
            res.json(relatorio);
        } catch (error) {
            res.status(500).json({ message: 'Erro ao gerar relatório', error: error.message });
        }
    }
}

module.exports = new VendaController();
