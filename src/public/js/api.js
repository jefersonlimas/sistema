/**
 * api.js - Cliente HTTP para comunicação com a API
 * Módulo reutilizável para todas as páginas da aplicação
 */

const api = {
    baseURL: '/api',

    /**
     * Realiza requisições HTTP genéricas
     * @param {string} endpoint - Endpoint da API
     * @param {object} options - Opções da requisição
     * @returns {Promise<any>}
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.erro || data.error || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            console.error(`Erro na requisição ${endpoint}:`, error);
            throw error;
        }
    },

    /**
     * Requisição GET
     * @param {string} endpoint - Endpoint da API
     * @returns {Promise<any>}
     */
    async get(endpoint) {
        return this.request(endpoint, { method: 'GET' });
    },

    /**
     * Requisição POST
     * @param {string} endpoint - Endpoint da API
     * @param {object} data - Dados para enviar
     * @returns {Promise<any>}
     */
    async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },

    /**
     * Requisição PUT
     * @param {string} endpoint - Endpoint da API
     * @param {object} data - Dados para enviar
     * @returns {Promise<any>}
     */
    async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },

    /**
     * Requisição DELETE
     * @param {string} endpoint - Endpoint da API
     * @returns {Promise<any>}
     */
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    /**
     * Upload de arquivo
     * @param {string} endpoint - Endpoint da API
     * @param {FormData} formData - Dados do formulário com arquivo
     * @returns {Promise<any>}
     */
    async upload(endpoint, formData) {
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.erro || data.error || 'Erro no upload');
            }
            
            return data;
        } catch (error) {
            console.error(`Erro no upload ${endpoint}:`, error);
            throw error;
        }
    }
};

/**
 * ui - Utilitários de Interface do Usuário
 */
const ui = {
    /**
     * Mostra mensagem toast/notificação
     * @param {string} mensagem - Texto da mensagem
     * @param {string} tipo - Tipo: 'success', 'error', 'info', 'warning'
     * @param {number} duracao - Duração em ms
     */
    mostrarMensagem(mensagem, tipo = 'info', duracao = 3000) {
        // Remover mensagens existentes
        const existingToast = document.querySelector('.toast-message');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.className = `toast-message toast-${tipo}`;
        toast.textContent = mensagem;
        
        document.body.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => toast.classList.add('show'), 10);
        
        // Remover após duração
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duracao);
    },

    /**
     * Mostra modal de confirmação
     * @param {string} titulo - Título do modal
     * @param {string} mensagem - Mensagem de confirmação
     * @returns {Promise<boolean>}
     */
    confirmar(titulo, mensagem) {
        return new Promise((resolve) => {
            const modal = document.createElement('div');
            modal.className = 'modal-overlay';
            modal.innerHTML = `
                <div class="modal-content">
                    <h3>${titulo}</h3>
                    <p>${mensagem}</p>
                    <div class="modal-actions">
                        <button class="btn btn-secondary" id="modalCancel">Cancelar</button>
                        <button class="btn btn-danger" id="modalConfirm">Confirmar</button>
                    </div>
                </div>
            `;
            
            document.body.appendChild(modal);
            
            setTimeout(() => modal.classList.add('show'), 10);
            
            document.getElementById('modalCancel').onclick = () => {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
                resolve(false);
            };
            
            document.getElementById('modalConfirm').onclick = () => {
                modal.classList.remove('show');
                setTimeout(() => modal.remove(), 300);
                resolve(true);
            };
        });
    },

    /**
     * Renderiza tabela de dados
     * @param {string} containerId - ID do container
     * @param {Array} dados - Array de dados
     * @param {Array} colunas - Definição das colunas [{key, label, format}]
     * @param {Function} acoes - Função que retorna ações para cada linha
     */
    renderizarTabela(containerId, dados, colunas, acoes = null) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (!dados || dados.length === 0) {
            container.innerHTML = '<p class="no-data">Nenhum registro encontrado</p>';
            return;
        }

        let html = `
            <table class="data-table">
                <thead>
                    <tr>
                        ${colunas.map(col => `<th>${col.label}</th>`).join('')}
                        ${acoes ? '<th>Ações</th>' : ''}
                    </tr>
                </thead>
                <tbody>
                    ${dados.map(item => `
                        <tr>
                            ${colunas.map(col => {
                                let valor = col.key.split('.').reduce((obj, key) => obj?.[key], item);
                                if (col.format) {
                                    valor = col.format(valor, item);
                                }
                                return `<td>${valor !== undefined && valor !== null ? valor : '-'}</td>`;
                            }).join('')}
                            ${acoes ? `<td class="actions-cell">${acoes(item)}</td>` : ''}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    },

    /**
     * Formata valor monetário
     * @param {number} valor - Valor a formatar
     * @returns {string}
     */
    formatarMoeda(valor) {
        if (valor === undefined || valor === null) return '-';
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    },

    /**
     * Formata data
     * @param {string|Date} data - Data a formatar
     * @param {boolean} incluirHora - Se deve incluir hora
     * @returns {string}
     */
    formatarData(data, incluirHora = false) {
        if (!data) return '-';
        const date = new Date(data);
        if (incluirHora) {
            return date.toLocaleString('pt-BR');
        }
        return date.toLocaleDateString('pt-BR');
    },

    /**
     * Limpa formulário
     * @param {string} formId - ID do formulário
     */
    limparFormulario(formId) {
        const form = document.getElementById(formId);
        if (form) {
            form.reset();
        }
    },

    /**
     * Preenche formulário com dados
     * @param {string} formId - ID do formulário
     * @param {object} dados - Dados para preencher
     */
    preencherFormulario(formId, dados) {
        const form = document.getElementById(formId);
        if (!form || !dados) return;

        Object.keys(dados).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = dados[key];
                } else {
                    input.value = dados[key] ?? '';
                }
            }
        });
    },

    /**
     * Valida formulário HTML5
     * @param {string} formId - ID do formulário
     * @returns {boolean}
     */
    validarFormulario(formId) {
        const form = document.getElementById(formId);
        if (!form) return false;
        return form.checkValidity();
    }
};

// Estilos para toast e modal
if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = `
        .toast-message {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 25px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .toast-message.show {
            opacity: 1;
            transform: translateX(0);
        }
        
        .toast-success { background: linear-gradient(135deg, #4CAF50, #45a049); }
        .toast-error { background: linear-gradient(135deg, #f44336, #d32f2f); }
        .toast-info { background: linear-gradient(135deg, #2196F3, #1976D2); }
        .toast-warning { background: linear-gradient(135deg, #ff9800, #f57c00); }
        
        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 10000;
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        
        .modal-overlay.show {
            opacity: 1;
        }
        
        .modal-content {
            background: white;
            padding: 30px;
            border-radius: 10px;
            min-width: 350px;
            max-width: 500px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        
        .modal-content h3 {
            margin: 0 0 15px 0;
            color: var(--cor-primaria);
        }
        
        .modal-content p {
            margin: 0 0 20px 0;
            color: #666;
        }
        
        .modal-actions {
            display: flex;
            gap: 10px;
            justify-content: flex-end;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        
        .data-table th,
        .data-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .data-table th {
            background: var(--cor-primaria);
            color: white;
            font-weight: 600;
        }
        
        .data-table tr:hover {
            background: rgba(0,0,0,0.02);
        }
        
        .actions-cell {
            display: flex;
            gap: 8px;
        }
        
        .no-data {
            text-align: center;
            padding: 40px;
            color: #999;
            font-style: italic;
        }
    `;
    document.head.appendChild(style);
}
