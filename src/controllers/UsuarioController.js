const Usuario = require('../models/Usuario');
const Funcao = require('../models/Funcao');

class UsuarioController {
  // Criar novo usuário
  async criar(req, res) {
    try {
      const { codigo, nome, funcaoId, nomeUsuario, senha } = req.body;

      // Validar campos obrigatórios
      if (!codigo || !nome || !funcaoId || !nomeUsuario || !senha) {
        return res.status(400).json({ 
          erro: 'Código, nome, função, nome de usuário e senha são obrigatórios' 
        });
      }

      // Validar tamanho da senha
      if (senha.length < 6) {
        return res.status(400).json({ 
          erro: 'A senha deve ter pelo menos 6 caracteres' 
        });
      }

      // Verificar se código já existe
      const usuarioCodigoExistente = await Usuario.findOne({ codigo });
      if (usuarioCodigoExistente) {
        return res.status(409).json({ 
          erro: 'Já existe um usuário com este código' 
        });
      }

      // Verificar se nome de usuário já existe
      const usuarioNomeExistente = await Usuario.findOne({ nomeUsuario: nomeUsuario.toLowerCase() });
      if (usuarioNomeExistente) {
        return res.status(409).json({ 
          erro: 'Já existe um usuário com este nome de usuário' 
        });
      }

      // Verificar se função existe
      const funcao = await Funcao.findById(funcaoId);
      if (!funcao) {
        return res.status(404).json({ 
          erro: 'Função não encontrada' 
        });
      }

      const usuario = new Usuario({
        codigo,
        nome,
        funcao: funcaoId,
        nomeUsuario,
        senha
      });

      await usuario.save();
      
      // Retornar usuário sem a senha
      const usuarioRetorno = usuario.toObject();
      delete usuarioRetorno.senha;
      
      res.status(201).json(usuarioRetorno);
    } catch (erro) {
      console.error('Erro ao criar usuário:', erro);
      res.status(500).json({ 
        erro: 'Erro ao criar usuário', 
        detalhes: erro.message 
      });
    }
  }

  // Listar todos os usuários
  async listar(req, res) {
    try {
      const { ativo, funcaoId } = req.query;
      const filtro = {};

      if (ativo !== undefined) {
        filtro.ativo = ativo === 'true';
      }

      if (funcaoId) {
        filtro.funcao = funcaoId;
      }

      const usuarios = await Usuario.find(filtro)
        .populate('funcao', 'codigo descricao')
        .sort({ nome: 1 });

      // Remover senha dos resultados
      const usuariosSemSenha = usuarios.map(usuario => {
        const usuarioObj = usuario.toObject();
        delete usuarioObj.senha;
        return usuarioObj;
      });

      res.json(usuariosSemSenha);
    } catch (erro) {
      console.error('Erro ao listar usuários:', erro);
      res.status(500).json({ 
        erro: 'Erro ao listar usuários', 
        detalhes: erro.message 
      });
    }
  }

  // Buscar usuário por ID
  async buscarPorId(req, res) {
    try {
      const { id } = req.params;
      
      const usuario = await Usuario.findById(id)
        .populate('funcao', 'codigo descricao modulosAcesso');
      
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      const usuarioRetorno = usuario.toObject();
      delete usuarioRetorno.senha;

      res.json(usuarioRetorno);
    } catch (erro) {
      console.error('Erro ao buscar usuário:', erro);
      res.status(500).json({ 
        erro: 'Erro ao buscar usuário', 
        detalhes: erro.message 
      });
    }
  }

  // Buscar usuário por nome de usuário
  async buscarPorNomeUsuario(req, res) {
    try {
      const { nomeUsuario } = req.params;
      
      const usuario = await Usuario.findOne({ nomeUsuario: nomeUsuario.toLowerCase() })
        .populate('funcao', 'codigo descricao modulosAcesso');
      
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      const usuarioRetorno = usuario.toObject();
      delete usuarioRetorno.senha;

      res.json(usuarioRetorno);
    } catch (erro) {
      console.error('Erro ao buscar usuário:', erro);
      res.status(500).json({ 
        erro: 'Erro ao buscar usuário', 
        detalhes: erro.message 
      });
    }
  }

  // Atualizar usuário
  async atualizar(req, res) {
    try {
      const { id } = req.params;
      const { codigo, nome, funcaoId, nomeUsuario, senha, ativo } = req.body;

      const usuarioExistente = await Usuario.findById(id);
      if (!usuarioExistente) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      // Verificar duplicidade de código se estiver alterando
      if (codigo && codigo !== usuarioExistente.codigo) {
        const outroUsuario = await Usuario.findOne({ codigo, _id: { $ne: id } });
        if (outroUsuario) {
          return res.status(409).json({ 
            erro: 'Já existe outro usuário com este código' 
          });
        }
      }

      // Verificar duplicidade de nome de usuário se estiver alterando
      if (nomeUsuario && nomeUsuario.toLowerCase() !== usuarioExistente.nomeUsuario) {
        const outroUsuario = await Usuario.findOne({ 
          nomeUsuario: nomeUsuario.toLowerCase(), 
          _id: { $ne: id } 
        });
        if (outroUsuario) {
          return res.status(409).json({ 
            erro: 'Já existe outro usuário com este nome de usuário' 
          });
        }
      }

      // Verificar se função existe se estiver alterando
      if (funcaoId && funcaoId !== usuarioExistente.funcao.toString()) {
        const funcao = await Funcao.findById(funcaoId);
        if (!funcao) {
          return res.status(404).json({ erro: 'Função não encontrada' });
        }
      }

      const dadosAtualizacao = { codigo, nome, funcao: funcaoId, ativo };
      
      // Só atualiza senha se foi fornecida
      if (senha) {
        if (senha.length < 6) {
          return res.status(400).json({ 
            erro: 'A senha deve ter pelo menos 6 caracteres' 
          });
        }
        dadosAtualizacao.senha = senha;
      }

      const usuarioAtualizado = await Usuario.findByIdAndUpdate(
        id,
        dadosAtualizacao,
        { new: true, runValidators: true }
      );

      const usuarioRetorno = usuarioAtualizado.toObject();
      delete usuarioRetorno.senha;

      res.json(usuarioRetorno);
    } catch (erro) {
      console.error('Erro ao atualizar usuário:', erro);
      res.status(500).json({ 
        erro: 'Erro ao atualizar usuário', 
        detalhes: erro.message 
      });
    }
  }

  // Excluir usuário (soft delete)
  async excluir(req, res) {
    try {
      const { id } = req.params;

      const usuario = await Usuario.findById(id);
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      // Soft delete - apenas desativa
      usuario.ativo = false;
      await usuario.save();

      const usuarioRetorno = usuario.toObject();
      delete usuarioRetorno.senha;

      res.json({ mensagem: 'Usuário desativado com sucesso', usuario: usuarioRetorno });
    } catch (erro) {
      console.error('Erro ao excluir usuário:', erro);
      res.status(500).json({ 
        erro: 'Erro ao excluir usuário', 
        detalhes: erro.message 
      });
    }
  }

  // Alterar senha
  async alterarSenha(req, res) {
    try {
      const { id } = req.params;
      const { senhaAtual, novaSenha } = req.body;

      if (!senhaAtual || !novaSenha) {
        return res.status(400).json({ 
          erro: 'Senha atual e nova senha são obrigatórias' 
        });
      }

      if (novaSenha.length < 6) {
        return res.status(400).json({ 
          erro: 'A nova senha deve ter pelo menos 6 caracteres' 
        });
      }

      const usuario = await Usuario.findById(id);
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      // Verificar senha atual
      const senhaValida = await usuario.compararSenha(senhaAtual);
      if (!senhaValida) {
        return res.status(401).json({ erro: 'Senha atual inválida' });
      }

      // Atualizar senha (o middleware do schema fará o hash)
      usuario.senha = novaSenha;
      await usuario.save();

      res.json({ mensagem: 'Senha alterada com sucesso' });
    } catch (erro) {
      console.error('Erro ao alterar senha:', erro);
      res.status(500).json({ 
        erro: 'Erro ao alterar senha', 
        detalhes: erro.message 
      });
    }
  }

  // Autenticar usuário
  async autenticar(req, res) {
    try {
      const { nomeUsuario, senha } = req.body;

      if (!nomeUsuario || !senha) {
        return res.status(400).json({ 
          erro: 'Nome de usuário e senha são obrigatórios' 
        });
      }

      const usuario = await Usuario.findOne({ nomeUsuario: nomeUsuario.toLowerCase() })
        .populate('funcao', 'codigo descricao modulosAcesso');
      
      if (!usuario) {
        return res.status(404).json({ erro: 'Usuário não encontrado' });
      }

      if (!usuario.ativo) {
        return res.status(403).json({ erro: 'Usuário desativado' });
      }

      const senhaValida = await usuario.compararSenha(senha);
      if (!senhaValida) {
        return res.status(401).json({ erro: 'Senha inválida' });
      }

      const usuarioRetorno = usuario.toObject();
      delete usuarioRetorno.senha;

      res.json({ 
        mensagem: 'Autenticação bem-sucedida', 
        usuario: usuarioRetorno 
      });
    } catch (erro) {
      console.error('Erro ao autenticar:', erro);
      res.status(500).json({ 
        erro: 'Erro ao autenticar', 
        detalhes: erro.message 
      });
    }
  }
}

module.exports = new UsuarioController();
