// Variável global para usuário logado
let usuarioLogado = null;

// Carregar configurações e verificar primeiro acesso
document.addEventListener('DOMContentLoaded', async () => {
    await carregarConfiguracoes();
    await verificarPrimeiroAcesso();
});

// Carregar configurações do servidor
async function carregarConfiguracoes() {
    try {
        const response = await fetch('/api/configuracoes');
        if (response.ok) {
            const config = await response.json();
            
            if (config.logotipo) {
                const logoImg = document.getElementById('loginLogo');
                logoImg.src = config.logotipo;
                logoImg.style.display = 'block';
            }
            
            // Aplicar cores personalizadas
            if (config.cores) {
                const root = document.documentElement;
                if (config.cores.corPrimaria) {
                    root.style.setProperty('--cor-primaria', config.cores.corPrimaria);
                    root.style.setProperty('--cor-primaria-light', lightenColor(config.cores.corPrimaria, 20));
                    root.style.setProperty('--cor-primaria-dark', darkenColor(config.cores.corPrimaria, 20));
                }
                if (config.cores.corFundo) {
                    root.style.setProperty('--cor-fundo', config.cores.corFundo);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
}

// Verificar se é o primeiro acesso (sem usuários)
async function verificarPrimeiroAcesso() {
    try {
        const response = await fetch('/api/usuarios');
        if (response.ok) {
            const usuarios = await response.json();
            if (usuarios.length === 0) {
                document.getElementById('setupInfo').style.display = 'block';
            }
        }
    } catch (error) {
        console.error('Erro ao verificar primeiro acesso:', error);
    }
}

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nomeUsuario = document.getElementById('nomeUsuario').value;
    const senha = document.getElementById('senha').value;
    const errorMessage = document.getElementById('errorMessage');
    
    try {
        const response = await fetch('/api/usuarios/autenticar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nomeUsuario, senha })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Salvar usuário logado no sessionStorage
            sessionStorage.setItem('usuarioLogado', JSON.stringify(data.usuario));
            usuarioLogado = data.usuario;
            
            // Redirecionar para a página principal
            window.location.href = '/index.html';
        } else {
            errorMessage.textContent = data.erro || 'Erro ao fazer login';
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        errorMessage.textContent = 'Erro de conexão. Tente novamente.';
        errorMessage.style.display = 'block';
        console.error('Erro ao autenticar:', error);
    }
});

// Função auxiliar para clarear cor
function lightenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
        0x1000000 +
        (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
        (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
        (B < 255 ? (B < 1 ? 0 : B) : 255)
    ).toString(16).slice(1);
}

// Função auxiliar para escurecer cor
function darkenColor(color, percent) {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (
        0x1000000 +
        (R > 0 ? R : 0) * 0x10000 +
        (G > 0 ? G : 0) * 0x100 +
        (B > 0 ? B : 0)
    ).toString(16).slice(1);
}
