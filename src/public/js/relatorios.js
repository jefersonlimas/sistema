// relatorios.js - Script para gerenciar a tela de relatórios
// Utiliza os módulos api.js e ui.js refatorados

let relatorioAtual = 'vendas-diarias';

// Carregar clientes e funcionários para os selects
let clientesLista = [];
let funcionariosLista = [];

async function carregarDadosAuxiliares() {
    try {
        const [clientesRes, usuariosRes] = await Promise.all([
            api.get('/clientes'),
            api.get('/usuarios')
        ]);
        
        clientesLista = clientesRes || [];
        funcionariosLista = usuariosRes || [];
    } catch (error) {
        console.error('Erro ao carregar dados auxiliares:', error);
        ui.mostrarMensagem('Erro ao carregar dados para relatórios', 'error');
    }
}

function selecionarRelatorio(tipo) {
    relatorioAtual = tipo;
    
    document.querySelectorAll('.relatorio-menu button').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.relatorio === tipo) {
            btn.classList.add('active');
        }
    });
    
    renderizarFiltros(tipo);
    document.getElementById('resultado-container').innerHTML = '';
}

function renderizarFiltros(tipo) {
    const container = document.getElementById('filtros-container');
    let html = '<form class="filtro-form" onsubmit="gerarRelatorio(event)">';
    
    switch(tipo) {
        case 'vendas-diarias':
            html += `<div class="form-group"><label>Data:</label><input type="date" name="data" value="${new Date().toISOString().split('T')[0]}" required></div>`;
            break;
        case 'vendas-funcionario':
            html += `<div class="form-group"><label>Data Início:</label><input type="date" name="inicio" value="${new Date(new Date().setDate(1)).toISOString().split('T')[0]}" required></div>`;
            html += `<div class="form-group"><label>Data Fim:</label><input type="date" name="fim" value="${new Date().toISOString().split('T')[0]}" required></div>`;
            html += `<div class="form-group"><label>Funcionário:</label><select name="funcionarioId"><option value="">Todos</option>${funcionariosLista.map(f => `<option value="${f._id}">${f.nome}</option>`).join('')}</select></div>`;
            break;
        case 'contas-receber':
            html += `<div class="form-group"><label>Cliente:</label><select name="clienteId" required><option value="">Selecione...</option>${clientesLista.map(c => `<option value="${c._id}">${c.nome}</option>`).join('')}</select></div>`;
            html += `<div class="form-group"><label>Data Início:</label><input type="date" name="inicio" value="${new Date(new Date().setDate(1)).toISOString().split('T')[0]}" required></div>`;
            html += `<div class="form-group"><label>Data Fim:</label><input type="date" name="fim" value="${new Date().toISOString().split('T')[0]}" required></div>`;
            break;
        case 'produtos-mais-vendidos':
            html += `<div class="form-group"><label>Data Início:</label><input type="date" name="inicio" value="${new Date(new Date().setDate(1)).toISOString().split('T')[0]}" required></div>`;
            html += `<div class="form-group"><label>Data Fim:</label><input type="date" name="fim" value="${new Date().toISOString().split('T')[0]}" required></div>`;
            html += `<div class="form-group"><label>Quantidade:</label><input type="number" name="limite" value="10" min="1" max="100"></div>`;
            break;
        case 'aniversariantes':
            const hoje = new Date();
            const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
            const diaAtual = String(hoje.getDate()).padStart(2, '0');
            html += `<div class="form-group"><label>Mês/Dia Início:</label><input type="text" name="inicio" placeholder="MM-DD" value="${mesAtual}-01" pattern="\\d{2}-\\d{2}" required></div>`;
            html += `<div class="form-group"><label>Mês/Dia Fim:</label><input type="text" name="fim" placeholder="MM-DD" value="${mesAtual}-${diaAtual}" pattern="\\d{2}-\\d{2}" required></div>`;
            break;
        case 'estoque-baixo':
            html += `<div class="form-group"><label>Limite de Estoque:</label><input type="number" name="limite" value="10" min="1"></div>`;
            break;
    }
    
    html += '<button type="submit" class="btn-gerar">Gerar Relatório</button></form>';
    container.innerHTML = html;
}

async function gerarRelatorio(event) {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const params = new URLSearchParams();
    
    for (const [key, value] of formData.entries()) {
        if (value) params.append(key, value);
    }
    
    const endpoint = `/relatorios/${relatorioAtual}?${params.toString()}`;
    const btnGerar = form.querySelector('button[type="submit"]');
    
    try {
        btnGerar.disabled = true;
        btnGerar.textContent = 'Gerando...';
        const data = await api.get(endpoint);
        renderizarResultado(data);
        ui.mostrarMensagem('Relatório gerado com sucesso!', 'success');
    } catch (error) {
        console.error('Erro:', error);
        ui.mostrarMensagem(error.message || 'Erro ao gerar relatório', 'error');
    } finally {
        btnGerar.disabled = false;
        btnGerar.textContent = 'Gerar Relatório';
    }
}

function renderizarResultado(data) {
    const container = document.getElementById('resultado-container');
    let html = '';
    
    switch(relatorioAtual) {
        case 'vendas-diarias':
            html += `<div class="resumo-cards">
                <div class="resumo-card"><h4>Total Vendas</h4><div class="valor">${ui.formatarMoeda(data.resumo.totalVendas)}</div></div>
                <div class="resumo-card"><h4>Quantidade Vendas</h4><div class="valor">${data.resumo.quantidadeVendas || 0}</div></div>
                <div class="resumo-card"><h4>Itens Vendidos</h4><div class="valor">${data.resumo.quantidadeItens || 0}</div></div>
            </div><h3>Detalhamento das Vendas</h3>
            <table><thead><tr><th>Cliente</th><th>Data/Hora</th><th>Forma Pagamento</th><th>Valor Total</th></tr></thead>
            <tbody>${data.vendas.map(v => `<tr><td>${v.cliente?.nome || 'N/A'}</td><td>${ui.formatarData(v.dataVenda, true)}</td><td>${v.formaPagamento}</td><td>${ui.formatarMoeda(v.valorTotal)}</td></tr>`).join('')}</tbody></table>`;
            break;
        case 'vendas-funcionario':
            html += `<h3>Vendas por Funcionário</h3>
            <table><thead><tr><th>Funcionário</th><th>Qtd Vendas</th><th>Itens Vendidos</th><th>Total Vendido</th></tr></thead>
            <tbody>${data.map(v => `<tr><td>${v.nomeFuncionario}</td><td>${v.quantidadeVendas}</td><td>${v.quantidadeItens}</td><td>${ui.formatarMoeda(v.totalVendas)}</td></tr>`).join('')}</tbody></table>`;
            break;
        case 'contas-receber':
            html += `<div class="resumo-cards">
                <div class="resumo-card"><h4>Total Pago</h4><div class="valor">${ui.formatarMoeda(data.resumo.totalPago)}</div></div>
                <div class="resumo-card"><h4>A Receber</h4><div class="valor">${ui.formatarMoeda(data.resumo.totalAPagar)}</div></div>
                <div class="resumo-card"><h4>Vencido</h4><div class="valor">${ui.formatarMoeda(data.resumo.totalVencido)}</div></div>
            </div><h3>Contas do Período</h3>
            <table><thead><tr><th>Venda</th><th>Vencimento</th><th>Valor Original</th><th>Status</th><th>Valor Pago</th></tr></thead>
            <tbody>${data.contas.map(c => `<tr><td>${c.venda?.numeroVenda || 'N/A'}</td><td>${ui.formatarData(c.dataVencimento)}</td><td>${ui.formatarMoeda(c.valorOriginal)}</td><td>${c.status}</td><td>${ui.formatarMoeda(c.valorPago || c.valorRestante || c.valorOriginal)}</td></tr>`).join('')}</tbody></table>`;
            break;
        case 'produtos-mais-vendidos':
            html += `<h3>Produtos Mais Vendidos</h3>
            <table><thead><tr><th>Código Barras</th><th>Descrição</th><th>Qtd Vendida</th><th>Nº Vendas</th><th>Total Vendido</th></tr></thead>
            <tbody>${data.map(p => `<tr><td>${p.codigoBarras}</td><td>${p.descricao}</td><td>${p.quantidadeVendida}</td><td>${p.numeroVendas}</td><td>${ui.formatarMoeda(p.valorTotalVendido)}</td></tr>`).join('')}</tbody></table>`;
            break;
        case 'aniversariantes':
            if (data.length === 0) {
                html += '<p class="no-data">Nenhum cliente aniversariante no período selecionado.</p>';
            } else {
                html += '<h3>Clientes Aniversariantes</h3>';
                data.forEach(c => {
                    html += `<div class="aniversariante-destaque"><strong>${c.nome}</strong> - Fará ${c.idadeQueFara} anos em ${ui.formatarData(c.proximoAniversario)}${c.telefone && c.telefone.length > 0 ? ` 📞 ${c.telefone[0].numero}` : ''}</div>`;
                });
            }
            break;
        case 'estoque-baixo':
            if (data.produtos.length === 0) {
                html += '<p class="no-data">Todos os produtos estão com estoque adequado.</p>';
            } else {
                html += `<div class="estoque-baixo-alert"><strong>Atenção!</strong> ${data.resumo.totalProdutos} produto(s) com estoque abaixo do limite. Valor em estoque: ${ui.formatarMoeda(data.resumo.valorEstoque)} | Potencial de venda: ${ui.formatarMoeda(data.resumo.valorPotencialVenda)}</div>
                <h3>Produtos com Estoque Baixo</h3>
                <table><thead><tr><th>Código Barras</th><th>Descrição</th><th>Unidade</th><th>Qtd Atual</th><th>Custo</th><th>Venda</th></tr></thead>
                <tbody>${data.produtos.map(p => `<tr><td>${p.codigoBarras}</td><td>${p.descricao}</td><td>${p.tipoUnidade?.descricao || 'N/A'}</td><td style="color: red; font-weight: bold;">${p.quantidade}</td><td>${ui.formatarMoeda(p.precoCompra)}</td><td>${ui.formatarMoeda(p.precoVenda)}</td></tr>`).join('')}</tbody></table>`;
            }
            break;
    }
    
    container.innerHTML = html;
}

document.addEventListener('DOMContentLoaded', async () => {
    await carregarDadosAuxiliares();
    renderizarFiltros('vendas-diarias');
});
