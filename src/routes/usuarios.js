const express = require('express');
const router = express.Router();
const UsuarioController = require('../controllers/UsuarioController');

// Rotas para usuários
router.post('/', UsuarioController.criar.bind(UsuarioController));
router.post('/autenticar', UsuarioController.autenticar.bind(UsuarioController));
router.get('/', UsuarioController.listar.bind(UsuarioController));
router.get('/:id', UsuarioController.buscarPorId.bind(UsuarioController));
router.get('/nome-usuario/:nomeUsuario', UsuarioController.buscarPorNomeUsuario.bind(UsuarioController));
router.put('/:id', UsuarioController.atualizar.bind(UsuarioController));
router.put('/:id/senha', UsuarioController.alterarSenha.bind(UsuarioController));
router.delete('/:id', UsuarioController.excluir.bind(UsuarioController));

module.exports = router;
