// Espera todo o HTML ser carregado antes de executar
document.addEventListener('DOMContentLoaded', function() {

    // ===============================================
    // --- LÓGICA DA PÁGINA DE PAGAMENTOS ---
    // ===============================================

    // Procura pelo formulário de pagamentos
    const pagamentosForm = document.getElementById('pagamentos-form');

    // Se encontrar o formulário, executa o código
    if (pagamentosForm) {
        
        // Pega todos os outros elementos da página de pagamentos
        const btnNovoPagamento = document.getElementById('btn-novo-pagamento');
        const btnFecharModalPagamento = document.getElementById('btn-fechar-modal-pagamento');
        const modalPagamento = document.getElementById('modal-novo-pagamento');
        const overlayPagamento = document.getElementById('pagamento-modal-overlay');
        const pagamentosTableBody = document.getElementById('pagamentos-table-body');

        // Funções de abrir/fechar o modal
        function abrirModalPagamento() {
            modalPagamento.classList.remove('hidden');
            overlayPagamento.classList.remove('hidden');
        }

        function fecharModalPagamento() {
            modalPagamento.classList.add('hidden');
            overlayPagamento.classList.add('hidden');
        }

        // Adiciona os eventos de clique
        btnNovoPagamento.addEventListener('click', abrirModalPagamento);
        btnFecharModalPagamento.addEventListener('click', fecharModalPagamento);
        overlayPagamento.addEventListener('click', fecharModalPagamento);

        // Adiciona o evento de "Salvar" (submit)
        pagamentosForm.addEventListener('submit', function(event) {
            event.preventDefault(); // Impede a página de recarregar

            // Pega os valores dos campos
            const cliente = document.getElementById('pag-cliente').value;
            const data = document.getElementById('pag-data').value;
            const valor = parseFloat(document.getElementById('pag-valor').value);
            const statusSelect = document.getElementById('pag-status');
            const statusValue = statusSelect.value; // ex: "pago"
            const statusText = statusSelect.options[statusSelect.selectedIndex].text; // ex: "Pago"

            // Formata o valor para R$
            const valorFormatado = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            
            // Calcula o novo código
            const novoCodigo = (pagamentosTableBody.rows.length + 1).toString().padStart(3, '0');

            // Mapeia o status (valor) para a classe CSS correta
            let statusClass = '';
            if (statusValue === 'pago') statusClass = 'aprovado';
            else if (statusValue === 'pendente') statusClass = 'aguardando';
            else if (statusValue === 'atrasado') statusClass = 'cancelado';

            // Cria a nova linha na tabela
            const newRow = pagamentosTableBody.insertRow();
            
            newRow.insertCell(0).textContent = novoCodigo;
            newRow.insertCell(1).textContent = cliente;
            newRow.insertCell(2).textContent = data;
            
            const valorCell = newRow.insertCell(3);
            valorCell.textContent = valorFormatado;
            valorCell.classList.add('text-right'); // Adiciona classe para alinhar à direita

            const statusCell = newRow.insertCell(4);
            statusCell.innerHTML = `<span class="status-badge status-${statusClass}">${statusText}</span>`;
            
            const acoesCell = newRow.insertCell(5);
            acoesCell.innerHTML = `<button class="btn-edit"><i class="fas fa-pencil-alt"></i></button>`;

            // Limpa o formulário e fecha o modal
            pagamentosForm.reset();
            fecharModalPagamento();
        });
    }

}); // Fim do DOMContentLoaded