const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Configuracao = require('../models/Configuracao');

// Configuração do multer para upload de logotipo
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads', 'logos');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'logo-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
        cb(null, true);
    } else {
        cb(new Error('Apenas imagens são permitidas (JPEG, PNG, GIF, SVG)'));
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite de 5MB
});

// Obter configurações
exports.getConfiguracoes = async (req, res) => {
    try {
        const config = await Configuracao.getConfiguracao();
        res.json(config);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar configurações', details: error.message });
    }
};

// Atualizar configurações (cores e logotipo)
exports.atualizarConfiguracoes = async (req, res) => {
    try {
        let config = await Configuracao.getConfiguracao();
        
        const { corPrimaria, corSecundaria, corFundo, corTexto } = req.body;
        
        if (corPrimaria) config.corPrimaria = corPrimaria;
        if (corSecundaria) config.corSecundaria = corSecundaria;
        if (corFundo) config.corFundo = corFundo;
        if (corTexto) config.corTexto = corTexto;
        
        // Se houver upload de logotipo
        if (req.file) {
            // Remover logotipo antigo se existir
            if (config.logotipoUrl) {
                const oldPath = path.join(__dirname, '..', config.logotipoUrl);
                if (fs.existsSync(oldPath)) {
                    fs.unlinkSync(oldPath);
                }
            }
            config.logotipoUrl = `/uploads/logos/${req.file.filename}`;
        }
        
        await config.save();
        res.json({ message: 'Configurações atualizadas com sucesso', config });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar configurações', details: error.message });
    }
};

// Middleware de upload para usar nas rotas
exports.uploadLogo = upload.single('logotipo');
