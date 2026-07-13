/**
 * Classe base para erros personalizados da aplicação
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Erro para recursos não encontrados (404)
 */
class NotFoundError extends AppError {
  constructor(resource = 'Recurso') {
    super(`${resource} não encontrado`, 404);
  }
}

/**
 * Erro para validação de dados (400)
 */
class ValidationError extends AppError {
  constructor(message = 'Dados inválidos', errors = []) {
    super(message, 400);
    this.errors = errors;
  }
}

/**
 * Erro para conflitos de unicidade (409)
 */
class ConflictError extends AppError {
  constructor(message = 'Conflito de dados') {
    super(message, 409);
  }
}

/**
 * Erro para autenticação falha (401)
 */
class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado') {
    super(message, 401);
  }
}

/**
 * Erro para permissões insuficientes (403)
 */
class ForbiddenError extends AppError {
  constructor(message = 'Acesso proibido') {
    super(message, 403);
  }
}

module.exports = {
  AppError,
  NotFoundError,
  ValidationError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError
};
