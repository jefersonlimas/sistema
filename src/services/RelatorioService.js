const Venda = require('../models/Venda');
const Cliente = require('../models/Cliente');
const Produto = require('../models/Produto');
const ContaPagar = require('../models/ContaPagar');
const AppError = require('../errors/AppError');
const moment = require('moment');

/**
 * Serviço para geração de relatórios do sistema
 */
class RelatorioService {
  /**
   * Relatório de vendas diárias
   * @param {string} data - Data para o relatório
   * @returns {Promise<Object>}
   */
  async vendasDiarias(data) {
    if (!data) {
      throw new AppError.BadRequestError('Data é obrigatória');
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

    return {
      resumo: vendas[0] || { totalVendas: 0, quantidadeVendas: 0, quantidadeItens: 0 },
      vendas: vendasDetalhadas
    };
  }

  /**
   * Relatório de vendas por funcionário
   * @param {Object} filters - Filtros do relatório
   * @returns {Promise<Array>}
   */
  async vendasPorFuncionario({ inicio, fim, funcionarioId } = {}) {
    if (!inicio || !fim) {
      throw new AppError.BadRequestError('Período de início e fim são obrigatórios');
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

    return await Venda.aggregate([
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
  }

  /**
   * Relatório de contas a receber por cliente
   * @param {Object} filters - Filtros do relatório
   * @returns {Promise<Object>}
   */
  async contasReceberPorCliente({ clienteId, inicio, fim } = {}) {
    if (!inicio || !fim) {
      throw new AppError.BadRequestError('Período de início e fim são obrigatórios');
    }

    if (!clienteId) {
      throw new AppError.BadRequestError('Cliente é obrigatório');
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

    return { resumo, contas };
  }

  /**
   * Relatório de produtos mais vendidos
   * @param {Object} filters - Filtros do relatório
   * @returns {Promise<Array>}
   */
  async produtosMaisVendidos({ inicio, fim, limite = 10 } = {}) {
    if (!inicio || !fim) {
      throw new AppError.BadRequestError('Período de início e fim são obrigatórios');
    }

    const dataInicio = moment(inicio).startOf('day').toDate();
    const dataFim = moment(fim).endOf('day').toDate();

    return await Venda.aggregate([
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
  }

  /**
   * Relatório de clientes aniversariantes
   * @param {Object} filters - Filtros do relatório
   * @returns {Promise<Array>}
   */
  async clientesAniversariantes({ inicio, fim } = {}) {
    if (!inicio || !fim) {
      throw new AppError.BadRequestError('Período de início e fim são obrigatórios');
    }

    const inicioMesDia = moment(inicio, 'MM-DD').format('MM-DD');
    const fimMesDia = moment(fim, 'MM-DD').format('MM-DD');

    const clientes = await Cliente.find({
      dataNascimento: { $exists: true }
    }).select('nome dataNascimento telefone endereco');

    const aniversariantes = clientes.filter(cliente => {
      if (!cliente.dataNascimento) return false;
      
      const dataNasc = moment(cliente.dataNascimento);
      const mesDia = dataNasc.format('MM-DD');
      
      if (inicioMesDia <= fimMesDia) {
        return mesDia >= inicioMesDia && mesDia <= fimMesDia;
      } else {
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

    return aniversariantes.sort((a, b) => new Date(a.proximoAniversario) - new Date(b.proximoAniversario));
  }

  /**
   * Relatório de produtos com estoque baixo
   * @param {number} limite - Limite de estoque para considerar baixo
   * @returns {Promise<Object>}
   */
  async estoqueBaixo(limite = 10) {
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

    return { resumo, produtos: produtosEstoqueBaixo };
  }
}

module.exports = new RelatorioService();
