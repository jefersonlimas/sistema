const Venda = require('../models/Venda');
const Cliente = require('../models/Cliente');
const Produto = require('../models/Produto');
const ContaPagar = require('../models/ContaPagar');
const moment = require('moment');

class RelatorioController {

    // 1. Vendas Diárias
    async vendasDiarias(req, res) {
        try {
            const { data } = req.query;
            
            if (!data) {
                return res.status(400).json({ error: 'Data é obrigatória' });
            }

            const inicioDia = moment(data).startOf('day').toDate();
            const fimDia = moment(data).endOf('day').toDate();

            const vendas = await Venda.aggregate([
                {
                    $match: {
                        dataVenda: { $gte: inicioDia, $lte: fimDia },
                        status: 'concluida'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalVendas: { $sum: '$valorTotal' },
                        quantidadeVendas: { $sum: 1 },
                        quantidadeItens: { $sum: { $sum: '$itens.quantidade' } }
                    }
                }
            ]);

            const vendasDetalhadas = await Venda.find({
                dataVenda: { $gte: inicioDia, $lte: fimDia },
                status: 'concluida'
            }).populate('cliente', 'nome');

            res.json({
                resumo: vendas[0] || { totalVendas: 0, quantidadeVendas: 0, quantidadeItens: 0 },
                vendas: vendasDetalhadas
            });
        } catch (error) {
            console.error('Erro ao gerar relatório de vendas diárias:', error);
            res.status(500).json({ error: 'Erro ao gerar relatório' });
        }
    }

    // 2. Vendas por Funcionário
    async vendasPorFuncionario(req, res) {
        try {
            const { inicio, fim, funcionarioId } = req.query;

            if (!inicio || !fim) {
                return res.status(400).json({ error: 'Período de início e fim são obrigatórios' });
            }

            const dataInicio = moment(inicio).startOf('day').toDate();
            const dataFim = moment(fim).endOf('day').toDate();

            const matchStage = {
                dataVenda: { $gte: dataInicio, $lte: dataFim },
                status: 'concluida'
            };

            if (funcionarioId) {
                matchStage.funcionario = funcionarioId;
            }

            const vendas = await Venda.aggregate([
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'usuarios',
                        localField: 'funcionario',
                        foreignField: '_id',
                        as: 'funcionarioInfo'
                    }
                },
                { $unwind: { path: '$funcionarioInfo', preserveNullAndEmptyArrays: true } },
                {
                    $group: {
                        _id: '$funcionario',
                        nomeFuncionario: { $first: '$funcionarioInfo.nome' },
                        totalVendas: { $sum: '$valorTotal' },
                        quantidadeVendas: { $sum: 1 },
                        quantidadeItens: { $sum: { $sum: '$itens.quantidade' } }
                    }
                },
                {
                    $project: {
                        _id: 0,
                        funcionarioId: '$_id',
                        nomeFuncionario: { $ifNull: ['$nomeFuncionario', 'Não informado'] },
                        totalVendas: 1,
                        quantidadeVendas: 1,
                        quantidadeItens: 1
                    }
                }
            ]);

            res.json(vendas);
        } catch (error) {
            console.error('Erro ao gerar relatório de vendas por funcionário:', error);
            res.status(500).json({ error: 'Erro ao gerar relatório' });
        }
    }

    // 3. Contas a Receber por Cliente e Período
    async contasReceberPorCliente(req, res) {
        try {
            const { clienteId, inicio, fim } = req.query;

            if (!inicio || !fim) {
                return res.status(400).json({ error: 'Período de início e fim são obrigatórios' });
            }

            if (!clienteId) {
                return res.status(400).json({ error: 'Cliente é obrigatório' });
            }

            const dataInicio = moment(inicio).startOf('day').toDate();
            const dataFim = moment(fim).endOf('day').toDate();

            const contas = await ContaPagar.find({
                cliente: clienteId,
                dataVencimento: { $gte: dataInicio, $lte: dataFim }
            })
            .populate('cliente', 'nome')
            .populate('venda', 'numeroVenda dataVenda')
            .sort({ dataVencimento: 1 });

            const resumo = {
                totalVencido: 0,
                totalAPagar: 0,
                totalPago: 0,
                quantidadeContas: contas.length
            };

            contas.forEach(conta => {
                if (conta.status === 'pago') {
                    resumo.totalPago += conta.valorPago || conta.valorOriginal;
                } else {
                    resumo.totalAPagar += conta.valorRestante || conta.valorOriginal;
                    if (moment(conta.dataVencimento).isBefore(moment(), 'day')) {
                        resumo.totalVencido += conta.valorRestante || conta.valorOriginal;
                    }
                }
            });

            res.json({ resumo, contas });
        } catch (error) {
            console.error('Erro ao gerar relatório de contas a receber:', error);
            res.status(500).json({ error: 'Erro ao gerar relatório' });
        }
    }

    // 4. Produtos Mais Vendidos
    async produtosMaisVendidos(req, res) {
        try {
            const { inicio, fim, limite = 10 } = req.query;

            if (!inicio || !fim) {
                return res.status(400).json({ error: 'Período de início e fim são obrigatórios' });
            }

            const dataInicio = moment(inicio).startOf('day').toDate();
            const dataFim = moment(fim).endOf('day').toDate();

            const produtosMaisVendidos = await Venda.aggregate([
                {
                    $match: {
                        dataVenda: { $gte: dataInicio, $lte: dataFim },
                        status: 'concluida'
                    }
                },
                { $unwind: '$itens' },
                {
                    $group: {
                        _id: '$itens.produto',
                        quantidadeVendida: { $sum: '$itens.quantidade' },
                        valorTotalVendido: { $sum: { $multiply: ['$itens.quantidade', '$itens.precoUnitario'] } },
                        numeroVendas: { $sum: 1 }
                    }
                },
                {
                    $lookup: {
                        from: 'produtos',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'produtoInfo'
                    }
                },
                { $unwind: '$produtoInfo' },
                {
                    $project: {
                        _id: 0,
                        produtoId: '$_id',
                        codigoBarras: '$produtoInfo.codigoBarras',
                        descricao: '$produtoInfo.descricao',
                        quantidadeVendida: 1,
                        valorTotalVendido: 1,
                        numeroVendas: 1
                    }
                },
                { $sort: { quantidadeVendida: -1 } },
                { $limit: parseInt(limite) }
            ]);

            res.json(produtosMaisVendidos);
        } catch (error) {
            console.error('Erro ao gerar relatório de produtos mais vendidos:', error);
            res.status(500).json({ error: 'Erro ao gerar relatório' });
        }
    }

    // 5. Clientes Aniversariantes
    async clientesAniversariantes(req, res) {
        try {
            const { inicio, fim } = req.query;

            if (!inicio || !fim) {
                return res.status(400).json({ error: 'Período de início e fim são obrigatórios' });
            }

            // Extrair mês e dia das datas de início e fim
            const inicioMesDia = moment(inicio, 'MM-DD').format('MM-DD');
            const fimMesDia = moment(fim, 'MM-DD').format('MM-DD');

            const clientes = await Cliente.find({
                dataNascimento: { $exists: true }
            }).select('nome dataNascimento telefone endereco');

            const aniversariantes = clientes.filter(cliente => {
                if (!cliente.dataNascimento) return false;
                
                const dataNasc = moment(cliente.dataNascimento);
                const mesDia = dataNasc.format('MM-DD');
                
                // Verificar se está no período
                if (inicioMesDia <= fimMesDia) {
                    // Período normal (ex: 01-01 a 01-31)
                    return mesDia >= inicioMesDia && mesDia <= fimMesDia;
                } else {
                    // Período que cruza o ano (ex: 12-20 a 01-10)
                    return mesDia >= inicioMesDia || mesDia <= fimMesDia;
                }
            }).map(cliente => ({
                ...cliente.toObject(),
                proximoAniversario: moment().year(moment().month() >= moment(cliente.dataNascimento).month() && 
                    moment().date() > moment(cliente.dataNascimento).date() ? 
                    moment().year() + 1 : moment().year())
                    .month(moment(cliente.dataNascimento).month())
                    .date(moment(cliente.dataNascimento).date())
                    .format('YYYY-MM-DD'),
                idadeQueFara: moment().diff(moment(cliente.dataNascimento), 'years') + 1
            }));

            res.json(aniversariantes.sort((a, b) => new Date(a.proximoAniversario) - new Date(b.proximoAniversario)));
        } catch (error) {
            console.error('Erro ao gerar relatório de aniversariantes:', error);
            res.status(500).json({ error: 'Erro ao gerar relatório' });
        }
    }

    // 6. Produtos com Estoque Baixo
    async estoqueBaixo(req, res) {
        try {
            const { limite = 10 } = req.query;

            const produtosEstoqueBaixo = await Produto.find({
                quantidade: { $lte: parseInt(limite) },
                ativo: true
            })
            .populate('tipoUnidade', 'descricao')
            .select('codigoBarras descricao quantidade tipoUnidade precoCompra precoVenda')
            .sort({ quantidade: 1 });

            const resumo = {
                totalProdutos: produtosEstoqueBaixo.length,
                valorEstoque: produtosEstoqueBaixo.reduce((acc, prod) => acc + (prod.quantidade * prod.precoCompra), 0),
                valorPotencialVenda: produtosEstoqueBaixo.reduce((acc, prod) => acc + (prod.quantidade * prod.precoVenda), 0)
            };

            res.json({ resumo, produtos: produtosEstoqueBaixo });
        } catch (error) {
            console.error('Erro ao gerar relatório de estoque baixo:', error);
            res.status(500).json({ error: 'Erro ao gerar relatório' });
        }
    }
}

module.exports = new RelatorioController();
