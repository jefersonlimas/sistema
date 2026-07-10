// App.js - Script principal que carrega configurações e gerencia a aplicação

let configuracoesGlobais = {};

// Carregar configurações do servidor ao iniciar
async function carregarConfiguracoes() {
    try {
        const response = await fetch('/api/configuracoes');
        if (response.ok) {
            configuracoesGlobais = await response.json();
            aplicarConfiguracoes(configuracoesGlobais);
        }
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
}

// Aplicar configurações visuais
function aplicarConfiguracoes(config) {
    const root = document.documentElement;
    
    if (config.corPrimaria) {
        root.style.setProperty('--cor-primaria', config.corPrimaria);
    }
    if (config.corSecundaria) {
        root.style.setProperty('--cor-secundaria', config.corSecundaria);
    }
    if (config.corFundo) {
        root.style.setProperty('--cor-fundo', config.corFundo);
    }
    if (config.corTexto) {
        root.style.setProperty('--cor-texto', config.corTexto);
    }
    
    // Atualizar logotipo em todas as páginas
    if (config.logotipoUrl && config.logotipoUrl.trim() !== '') {
        const logoElements = document.querySelectorAll('.logo-img');
        logoElements.forEach(img => {
            img.src = config.logotipoUrl;
            img.style.display = 'block';
        });
        
        // Esconder texto se houver logo
        const logoTexts = document.querySelectorAll('.logo-text');
        logoTexts.forEach(text => {
            text.style.display = 'none';
        });
    }
}

// Utilitários para API
const api = {
    async get(endpoint) {
        const response = await fetch(`/api${endpoint}`);
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        return await response.json();
    },
    
    async post(endpoint, data) {
        const response = await fetch(`/api${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        return await response.json();
    },
    
    async put(endpoint, data) {
        const response = await fetch(`/api${endpoint}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        return await response.json();
    },
    
    async delete(endpoint) {
        const response = await fetch(`/api${endpoint}`, {
            method: 'DELETE'
        });
        if (!response.ok) throw new Error(`Erro ${response.status}`);
        return await response.json();
    }
};

// Utilitários de UI
const ui = {
    mostrarMensagem(mensagem, tipo = 'success') {
        const div = document.createElement('div');
        div.className = `alert alert-${tipo}`;
        div.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            background-color: var(--cor-${tipo === 'error' ? 'perigo' : tipo === 'warning' ? 'alerta' : 'sucesso'});
            color: white;
            border-radius: 8px;
            z-index: 3000;
            animation: slideIn 0.3s ease;
        `;
        div.textContent = mensagem;
        document.body.appendChild(div);
        
        setTimeout(() => {
            div.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => div.remove(), 300);
        }, 3000);
    },
    
    confirmarAcao(mensagem) {
        return confirm(mensagem);
    },
    
    limparFormulario(formId) {
        const form = document.getElementById(formId);
        if (form) form.reset();
    }
};

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    carregarConfiguracoes();
});

// Exportar para uso global
window.api = api;
window.ui = ui;
window.carregarConfiguracoes = carregarConfiguracoes;
