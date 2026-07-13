const Configuracao = require('../models/Configuracao');
const AppError = require('../errors/AppError');
const path = require('path');
const fs = require('fs');

/**
 * Serviço para operações de Configurações do sistema
 */
class ConfiguracaoService {
  /**
   * Obter configurações do sistema
   * @returns {Promise<Object>}
   */
  async getConfiguracoes() {
    return await Configuracao.getConfiguracao();
  }

  /**
   * Atualizar configurações (cores e logotipo)
   * @param {Object} data - Dados para atualização
   * @returns {Promise<Object>}
   */
  async atualizarConfiguracoes({ corPrimaria, corSecundaria, corFundo, corTexto, logotipo }) {
    let config = await Configuracao.getConfiguracao();
    
    if (corPrimaria) config.corPrimaria = corPrimaria;
    if (corSecundaria) config.corSecundaria = corSecundaria;
    if (corFundo) config.corFundo = corFundo;
    if (corTexto) config.corTexto = corTexto;
    
    // Se houver upload de logotipo
    if (logotipo) {
      // Remover logotipo antigo se existir
      if (config.logotipoUrl) {
        const oldPath = path.join(__dirname, '..', config.logotipoUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      config.logotipoUrl = `/uploads/logos/${logotipo.filename}`;
    }
    
    await config.save();
    return config;
  }
}

module.exports = new ConfiguracaoService();
