const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

// Rotas para usuários
router.post('/', UsuarioController.criar);
router.post('/autenticar', UsuarioController.autenticar);
router.get('/', UsuarioController.listar);
router.get('/:id', UsuarioController.buscarPorId);
router.get('/nome-usuario/:nomeUsuario', UsuarioController.buscarPorNomeUsuario);
router.put('/:id', UsuarioController.atualizar);
router.put('/:id/senha', UsuarioController.alterarSenha);
router.delete('/:id', UsuarioController.excluir);

module.exports = router;
