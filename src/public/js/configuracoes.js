// configuracoes.js - Script para gerenciar a tela de configurações
// Utiliza os módulos api.js e ui.js refatorados

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('formConfiguracoes');
    const uploadArea = document.getElementById('uploadArea');
    const inputLogotipo = document.getElementById('logotipo');
    const previewLogo = document.getElementById('previewLogo');
    
    // Carregar configurações atuais
    await carregarConfiguracoesAtuais();
    
    // Event Listeners para color pickers
    document.querySelectorAll('input[type="color"]').forEach(input => {
        input.addEventListener('input', (e) => {
            const span = document.getElementById(`valor${capitalize(e.target.id)}`);
            if (span) span.textContent = e.target.value;
        });
    });
    
    // Upload de logotipo
    uploadArea.addEventListener('click', () => inputLogotipo.click());
    
    inputLogotipo.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewLogo.src = e.target.result;
                previewLogo.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Submit do formulário
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        
        // Adicionar cores
        formData.append('corPrimaria', document.getElementById('corPrimaria').value);
        formData.append('corSecundaria', document.getElementById('corSecundaria').value);
        formData.append('corFundo', document.getElementById('corFundo').value);
        formData.append('corTexto', document.getElementById('corTexto').value);
        
        // Adicionar logotipo se houver
        if (inputLogotipo.files[0]) {
            formData.append('logotipo', inputLogotipo.files[0]);
        }
        
        try {
            const response = await fetch('/api/configuracoes', {
                method: 'PUT',
                body: formData
            });
            
            const data = await response.json();
            
            if (response.ok) {
                ui.mostrarMensagem('Configurações salvas com sucesso!', 'success');
                await carregarConfiguracoes();
            } else {
                ui.mostrarMensagem(data.error || 'Erro ao salvar configurações', 'error');
            }
        } catch (error) {
            console.error('Erro:', error);
            ui.mostrarMensagem('Erro ao salvar configurações', 'error');
        }
    });
});

async function carregarConfiguracoesAtuais() {
    try {
        const config = await api.get('/configuracoes');
        
        if (config.corPrimaria) {
            document.getElementById('corPrimaria').value = config.corPrimaria;
            document.getElementById('valorCorPrimaria').textContent = config.corPrimaria;
        }
        
        if (config.corSecundaria) {
            document.getElementById('corSecundaria').value = config.corSecundaria;
            document.getElementById('valorCorSecundaria').textContent = config.corSecundaria;
        }
        
        if (config.corFundo) {
            document.getElementById('corFundo').value = config.corFundo;
            document.getElementById('valorCorFundo').textContent = config.corFundo;
        }
        
        if (config.corTexto) {
            document.getElementById('corTexto').value = config.corTexto;
            document.getElementById('valorCorTexto').textContent = config.corTexto;
        }
        
        if (config.logotipoUrl && config.logotipoUrl.trim() !== '') {
            const previewLogo = document.getElementById('previewLogo');
            previewLogo.src = config.logotipoUrl;
            previewLogo.style.display = 'block';
        }
    } catch (error) {
        console.error('Erro ao carregar configurações:', error);
        ui.mostrarMensagem('Erro ao carregar configurações', 'error');
    }
}

function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
