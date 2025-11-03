// Espera o DOM carregar (seu arquivo já deve ter isso)
document.addEventListener('DOMContentLoaded', function() {

    // ... (Mantenha o código de Ordens e Pagamentos que já existe) ...


    // ===============================================
    // --- LÓGICA DA PÁGINA DE CAIXA ---
    // ===============================================

    const caixaForm = document.getElementById('caixa-form');

    // Só executa se encontrar o formulário do caixa
    if (caixaForm) {

        // 1. Pega todos os elementos
        const btnNovoLancamento = document.getElementById('btn-novo-lancamento');
        const btnFecharModalCaixa = document.getElementById('btn-fechar-modal-caixa');
        const modalCaixa = document.getElementById('modal-novo-lancamento');
        const overlayCaixa = document.getElementById('caixa-modal-overlay');
        const caixaTableBody = document.getElementById('caixa-table-body');
        const saldoElement = document.getElementById('saldo-valor');

        // 2. Funções de Abrir/Fechar Modal
        function abrirModalCaixa() {
            modalCaixa.classList.remove('hidden');
            overlayCaixa.classList.remove('hidden');
        }

        function fecharModalCaixa() {
            modalCaixa.classList.add('hidden');
            overlayCaixa.classList.add('hidden');
        }

        // 3. Eventos de Clique
        btnNovoLancamento.addEventListener('click', abrirModalCaixa);
        btnFecharModalCaixa.addEventListener('click', fecharModalCaixa);
        overlayCaixa.addEventListener('click', fecharModalCaixa);

        // 4. Evento de Salvar (Submit)
        caixaForm.addEventListener('submit', function(event) {
            event.preventDefault();

            // 5. Pega os valores do formulário
            const tipoSelect = document.getElementById('caixa-tipo');
            const tipoValor = tipoSelect.value; // 'entrada' ou 'saida'
            const tipoTexto = tipoSelect.options[tipoSelect.selectedIndex].text; // 'Entrada' ou 'Saída'
            const data = document.getElementById('caixa-data').value;
            const valor = parseFloat(document.getElementById('caixa-valor').value);

            // 6. Atualiza o Saldo
            // Converte o saldo atual (ex: "R$ 1.200,00") para um número (1200.00)
            let saldoAtual = parseFloat(saldoElement.textContent.replace('R$ ', '').replace('.', '').replace(',', '.'));
            
            if (tipoValor === 'entrada') {
                saldoAtual += valor;
            } else {
                saldoAtual -= valor;
            }

            // Formata o novo saldo de volta para R$
            saldoElement.textContent = saldoAtual.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

            // 7. Adiciona a linha na tabela de histórico
            const newRow = caixaTableBody.insertRow(0); // Insere no topo
            const valorFormatado = valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
            
            newRow.insertCell(0).textContent = tipoTexto;
            newRow.insertCell(1).textContent = data;
            
            const valorCell = newRow.insertCell(2);
            valorCell.textContent = valorFormatado;
            valorCell.classList.add('text-right');
            
            // Colore a célula do valor (opcional, mas legal)
            if (tipoValor === 'entrada') {
                valorCell.style.color = '#065f46'; // Verde
            } else {
                valorCell.style.color = '#991b1b'; // Vermelho
            }

            // 8. Limpa o formulário e fecha o modal
            caixaForm.reset();
            fecharModalCaixa();
        });
    }

}); // Fim do DOMContentLoaded