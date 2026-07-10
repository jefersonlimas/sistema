const Funcao = require('../models/Funcao');

class FuncaoController {
  // Criar nova função
  async criar(req, res) {
    try {
      const { codigo, descricao, modulosAcesso } = req.body;

      // Validar campos obrigatórios
      if (!codigo || !descricao || !modulosAcesso || modulosAcesso.length === 0) {
        return res.status(400).json({ 
          erro: 'Código, descrição e pelo menos um módulo de acesso são obrigatórios' 
        });
      }

      // Verificar se código já existe
      const funcaoExistente = await Funcao.findOne({ codigo });
      if (funcaoExistente) {
        return res.status(409).json({ 
          erro: 'Já existe uma função com este código' 
        });
      }

      const funcao = new Funcao({
        codigo,
        descricao,
        modulosAcesso
      });

      await funcao.save();
      res.status(201).json(funcao);
    } catch (erro) {
      console.error('Erro ao criar função:', erro);
      res.status(500).json({ 
        erro: 'Erro ao criar função', 
        detalhes: erro.message 
      });
    }
  }

  // Listar todas as funções
  async listar(req, res) {
    try {
      const { ativo } = req.query;
      const filtro = {};

      if (ativo !== undefined) {
        filtro.ativo = ativo === 'true';
      }

      const funcoes = await Funcao.find(filtro)
        .sort({ descricao: 1 })
        .populate('modulosAcesso');

      res.json(funcoes);
    } catch (erro) {
      console.error('Erro ao listar funções:', erro);
      res.status(500).json({ 
        erro: 'Erro ao listar funções', 
        detalhes: erro.message 
      });
    }
  }

  // Buscar função por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      
      const funcao = await Funcao.findById(id);
      
      if (!funcao) {
        return res.status(404).json({ erro: 'Função não encontrada' });
      }

      res.json(funcao);
    } catch (erro) {
      console.error('Erro ao buscar função:', erro);
      res.status(500).json({ 
        erro: 'Erro ao buscar função', 
        detalhes: erro.message 
      });
    }
  }

  // Buscar função por código
  async buscarPorCodigo(req, res) {
    try {
      const { codigo } = req.params;
      
      const funcao = await Funcao.findOne({ codigo });
      
      if (!funcao) {
        return res.status(404).json({ erro: 'Função não encontrada' });
      }

      res.json(funcao);
    } catch (erro) {
      console.error('Erro ao buscar função:', erro);
      res.status(500).json({ 
        erro: 'Erro ao buscar função', 
        detalhes: erro.message 
      });
    }
  }

  // Atualizar função
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { codigo, descricao, modulosAcesso, ativo } = req.body;

      const funcaoExistente = await Funcao.findById(id);
      if (!funcaoExistente) {
        return res.status(404).json({ erro: 'Função não encontrada' });
      }

      // Verificar duplicidade de código se estiver alterando
      if (codigo && codigo !== funcaoExistente.codigo) {
        const outraFuncao = await Funcao.findOne({ codigo, _id: { $ne: id } });
        if (outraFuncao) {
          return res.status(409).json({ 
            erro: 'Já existe outra função com este código' 
          });
        }
      }

      const funcaoAtualizada = await Funcao.findByIdAndUpdate(
        id,
        { codigo, descricao, modulosAcesso, ativo },
        { new: true, runValidators: true }
      );

      res.json(funcaoAtualizada);
    } catch (erro) {
      console.error('Erro ao atualizar função:', erro);
      res.status(500).json({ 
        erro: 'Erro ao atualizar função', 
        detalhes: erro.message 
      });
    }
  }

  // Excluir função (soft delete)
  async excluir(req, res) {
    try {
      const { id } = req.params;

      const funcao = await Funcao.findById(id);
      if (!funcao) {
        return res.status(404).json({ erro: 'Função não encontrada' });
      }

      // Soft delete - apenas desativa
      funcao.ativo = false;
      await funcao.save();

      res.json({ mensagem: 'Função desativada com sucesso', funcao });
    } catch (erro) {
      console.error('Erro ao excluir função:', erro);
      res.status(500).json({ 
        erro: 'Erro ao excluir função', 
        detalhes: erro.message 
      });
    }
  }

  // Listar módulos disponíveis
  listarModulos(req, res) {
    const modulos = [
      { id: 'clientes', nome: 'Clientes' },
      { id: 'produtos', nome: 'Produtos' },
      { id: 'tipos-unidade', nome: 'Tipos de Unidade' },
      { id: 'fornecedores', nome: 'Fornecedores' },
      { id: 'notas-fiscais', nome: 'Notas Fiscais' },
      { id: 'vendas', nome: 'Vendas' },
      { id: 'contas-pagar', nome: 'Contas a Pagar' },
      { id: 'funcoes', nome: 'Funções' },
      { id: 'usuarios', nome: 'Usuários' },
      { id: 'configuracoes', nome: 'Configurações' }
    ];
    res.json(modulos);
  }
}

module.exports = new FuncaoController();
