const { AppError, UnauthorizedError, ForbiddenError } = require('../errors/AppError');

/**
 * Middleware para verificar se usuário está autenticado
 * Verifica o cabeçalho Authorization ou sessão
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Em produção, aqui verificaria token JWT ou sessão
    // Por enquanto, permite passagem mas anexa informações se disponíveis
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      // Para desenvolvimento: permitir requisições sem autenticação
      // Em produção: descomentar as linhas abaixo
      // throw new UnauthorizedError('Token de autenticação não fornecido');
      req.usuario = null;
      return next();
    }

    // TODO: Implementar verificação de token JWT
    // const token = authHeader.split(' ')[1];
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // req.usuario = await Usuario.findById(decoded.id);
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware para verificar permissões por módulo
 * @param {string[]} modulos - Módulos permitidos para acessar a rota
 */
const checkPermission = (modulos) => {
  return async (req, res, next) => {
    try {
      // Se não há usuário autenticado, verificar se é ambiente de dev
      if (!req.usuario) {
        // Em produção: throw new UnauthorizedError();
        return next();
      }

      // Carregar função do usuário com módulos de acesso
      const usuario = await req.usuario.populate('funcao', 'modulosAcesso');
      
      if (!usuario.funcao) {
        throw new ForbiddenError('Usuário não possui função associada');
      }

      const modulosUsuario = usuario.funcao.modulosAcesso || [];
      
      // Verificar se usuário tem acesso a pelo menos um dos módulos
      const temPermissao = modulos.some(modulo => 
        modulosUsuario.includes(modulo) || modulosUsuario.includes('admin')
      );

      if (!temPermissao) {
        throw new ForbiddenError(`Acesso negado. Módulos requeridos: ${modulos.join(', ')}`);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authMiddleware,
  checkPermission
};
