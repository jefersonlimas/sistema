const { AppError, ValidationError, NotFoundError, ConflictError } = require('../errors/AppError');

/**
 * Middleware para tratamento de erros global
 * Centraliza o tratamento de erros da aplicação
 */
const errorHandler = (err, req, res, next) => {
  // Erro operacional conhecido
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      error: err.message,
      errors: err.errors || []
    });
  }

  // Erros de validação do Mongoose
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      error: 'Erro de validação',
      errors: messages
    });
  }

  // Erro de documento não encontrado do Mongoose
  if (err.name === 'CastError') {
    return res.status(400).json({
      error: 'ID inválido'
    });
  }

  // Erro de duplicidade do MongoDB
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(409).json({
      error: `Já existe um registro com este ${field}`
    });
  }

  // Erro inesperado - logar e retornar erro genérico
  console.error('Erro não tratado:', err);
  
  return res.status(500).json({
    error: 'Erro interno no servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};

/**
 * Middleware para validar dados de requisição
 * @param {Function[]} validators - Array de funções validator do express-validator
 */
const validateRequest = (validators) => {
  return async (req, res, next) => {
    // Executar todos os validators
    await Promise.all(validators.map(v => v.run(req)));
    
    const errors = req.validationErrors();
    
    if (errors && errors.length > 0) {
      const messages = errors.map(e => e.msg);
      return res.status(400).json({
        error: 'Dados inválidos',
        errors: messages
      });
    }
    
    next();
  };
};

/**
 * Middleware para verificar se recurso existe
 * @param {Model} model - Model do Mongoose
 * @param {string} fieldName - Nome do campo para busca (padrão: _id)
 * @param {string} paramName - Nome do parâmetro na URL (padrão: id)
 */
const resourceExists = (model, fieldName = '_id', paramName = 'id') => {
  return async (req, res, next) => {
    try {
      const value = req.params[paramName] || req.body[fieldName];
      
      if (!value) {
        throw new NotFoundError(model.modelName);
      }
      
      const resource = await model.findOne({ [fieldName]: value });
      
      if (!resource) {
        throw new NotFoundError(model.modelName);
      }
      
      // Anexar recurso ao request para uso posterior
      req.resource = resource;
      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  errorHandler,
  validateRequest,
  resourceExists
};
