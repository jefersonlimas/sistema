// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', async () => {
    await verificarAutenticacao();
    await carregarConfiguracoes();
    await carregarMenuModulos();
});

// Verificar se usuário está logado
async function verificarAutenticacao() {
    const usuarioSalvo = sessionStorage.getItem('usuarioLogado');
    
    if (!usuarioSalvo) {
        window.location.href = '/login.html';
        return;
    }
    
    try {
        usuarioLogado = JSON.parse(usuarioSalvo);
        
        // Atualizar informações do usuário na barra superior
        document.getElementById('userName').textContent = usuarioLogado.nome;
        document.getElementById('userRole').textContent = usuarioLogado.funcao?.descricao || 'Sem função';
        
    } catch (error) {
        console.error('Erro ao carregar usuário:', error);
        window.location.href = '/login.html';
    }
}

// Carregar configurações do servidor
async function carregarConfiguracoes() {
    try {
        const response = await fetch('/api/configuracoes');
        if (response.ok) {
            const config = await response.json();
            
            if (config.logotipo) {
                const logoImg = document.getElementById('sidebarLogo');
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
                if (config.cores.corTexto) {
                    root.style.setProperty('--cor-texto', config.cores.corTexto);
                }
                if (config.cores.corSecundaria) {
                    root.style.setProperty('--cor-secundaria', config.cores.corSecundaria);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
    }
}

// Carregar menu de módulos conforme permissões
async function carregarMenuModulos() {
    if (!usuarioLogado || !usuarioLogado.funcao) {
        console.error('Usuário ou função não encontrada');
        return;
    }
    
    const modulosPermitidos = usuarioLogado.funcao.modulosAcesso || [];
    const menuContainer = document.getElementById('menuModulos');
    
    // Definir todos os módulos disponíveis
    const todosModulos = [
        { id: 'clientes', nome: 'Clientes', icone: '👥', url: 'modulos/clientes.html' },
        { id: 'produtos', nome: 'Produtos', icone: '📦', url: 'modulos/produtos.html' },
        { id: 'tipos-unidade', nome: 'Tipos de Unidade', icone: '⚖️', url: 'modulos/tipos-unidade.html' },
        { id: 'fornecedores', nome: 'Fornecedores', icone: '🚚', url: 'modulos/fornecedores.html' },
        { id: 'notas-fiscais', nome: 'Notas Fiscais', icone: '📄', url: 'modulos/notas-fiscais.html' },
        { id: 'vendas', nome: 'Vendas', icone: '💰', url: 'modulos/vendas.html' },
        { id: 'contas-pagar', nome: 'Contas a Pagar', icone: '💳', url: 'modulos/contas-pagar.html' },
        { id: 'funcoes', nome: 'Funções', icone: '🔐', url: 'modulos/funcoes.html' },
        { id: 'usuarios', nome: 'Usuários', icone: '👤', url: 'modulos/usuarios.html' },
        { id: 'configuracoes', nome: 'Configurações', icone: '⚙️', url: 'configuracoes.html' }
    ];
    
    // Filtrar módulos permitidos e criar menu
    menuContainer.innerHTML = '';
    
    todosModulos.forEach(modulo => {
        if (modulosPermitidos.includes(modulo.id)) {
            const li = document.createElement('li');
            li.className = 'menu-item';
            li.innerHTML = `
                <a href="#" onclick="carregarModulo('${modulo.url}', '${modulo.id}')">
                    <span class="menu-icon">${modulo.icone}</span>
                    <span class="menu-text">${modulo.nome}</span>
                </a>
            `;
            menuContainer.appendChild(li);
        }
    });
    
    // Carregar primeiro módulo por padrão
    if (todosModulos.length > 0 && modulosPermitidos.length > 0) {
        const primeiroModulo = todosModulos.find(m => modulosPermitidos.includes(m.id));
        if (primeiroModulo) {
            carregarModulo(primeiroModulo.url, primeiroModulo.id);
        }
    }
}

// Carregar módulo dinamicamente
async function carregarModulo(url, moduloId) {
    try {
        const contentArea = document.getElementById('contentArea');
        
        // Se for configurações, redirecionar para página separada
        if (moduloId === 'configuracoes') {
            window.location.href = '/configuracoes.html';
            return;
        }
        
        // Para outros módulos, carregar via fetch (implementação futura)
        contentArea.innerHTML = `
            <div class="modulo-container">
                <h1>${moduloId.charAt(0).toUpperCase() + moduloId.slice(1)}</h1>
                <p>Módulo em desenvolvimento. Em breve estará disponível.</p>
            </div>
        `;
        
        // Atualizar classe ativa no menu
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        event?.target?.closest('.menu-item')?.classList.add('active');
        
    } catch (error) {
        console.error('Erro ao carregar módulo:', error);
    }
}

// Logout
function logout() {
    sessionStorage.removeItem('usuarioLogado');
    window.location.href = '/login.html';
}

// Funções auxiliares de cor
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
