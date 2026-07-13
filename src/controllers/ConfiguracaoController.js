const ConfiguracaoService = require('../services/ConfiguracaoService');

class ConfiguracaoController {
    async getConfiguracoes(req, res, next) {
        try {
            const config = await ConfiguracaoService.getConfiguracoes();
            res.json(config);
        } catch (error) {
            next(error);
        }
    }

    async atualizarConfiguracoes(req, res, next) {
        try {
            const { corPrimaria, corSecundaria, corFundo, corTexto } = req.body;
            const file = req.file;
            
            const config = await ConfiguracaoService.atualizarConfiguracoes({
                corPrimaria,
                corSecundaria,
                corFundo,
                corTexto,
                logotipo: file
            });
            
            res.json({ message: 'Configurações atualizadas com sucesso', config });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ConfiguracaoController();
