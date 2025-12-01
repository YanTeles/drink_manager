// gerenciamento de vendas — atualizado para suportar itens múltiplos por venda
(function () {
    function getSales() {
        try { return JSON.parse(localStorage.getItem('vendas') || '[]'); }
        catch { return []; }
    }
    function saveSales(list) {
        localStorage.setItem('vendas', JSON.stringify(list || []));
    }

    function formatMoney(v) {
        return 'R$ ' + Number(v || 0).toFixed(2).replace('.', ',');
    }

    function parseMoney(str) {
        if (str == null) return 0;
        return Number(String(str).replace(/[^\d,\.\-]/g, '').replace(',', '.')) || 0;
    }

    // render da lista (vendas.html) - mantém compatibilidade
    function renderSales(filter = '') {
        const tbody = document.querySelector('tbody');
        if (!tbody) return;
        const sales = getSales();
        const q = (filter || '').toLowerCase().trim();

        const filtered = sales.filter(s =>
            !q ||
            String(s.id).includes(q) ||
            (s.items || []).some(it => (it.product || '').toLowerCase().includes(q)) ||
            String(s.total).toLowerCase().includes(q)
        );

        if (!filtered.length) {
            tbody.innerHTML = '<tr><td colspan="5">Nenhuma venda registrada.</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(s => `
            <tr>
                <td>${String(s.id).slice(-6)}</td>
                <td>${escapeHtml( (s.items && s.items[0] && s.items[0].product) || '—' )}${s.items && s.items.length > 1 ? ' <small style="color:#6b7280">(+ ' + (s.items.length-1) + ' itens)</small>' : ''}</td>
                <td>${escapeHtml(s.items ? s.items.reduce((a,c)=>a+Number(c.quantity||0),0) : s.quantity || 0)}</td>
                <td>${escapeHtml(s.total)}</td>
                <td style="text-align:right;"><button class="btn-link btn-delete" data-id="${s.id}">Excluir</button></td>
            </tr>
        `).join('');

        tbody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function () {
                const id = Number(this.dataset.id);
                if (!confirm('Deseja excluir esta venda?')) return;
                const list = getSales().filter(s => s.id !== id);
                saveSales(list);
                renderSales(document.getElementById('sales-search')?.value || '');
            });
        });
    }

    function escapeHtml(str) {
        return String(str == null ? '' : str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // UI helpers para nova-venda.html
    function createItemRow(data = {}) {
        const tr = document.createElement('tr');

        const productTd = document.createElement('td');
        const productInput = document.createElement('input');
        productInput.type = 'text';
        productInput.className = 'item-product';
        productInput.placeholder = 'Nome do produto';
        productInput.value = data.product || '';
        productTd.appendChild(productInput);

        const priceTd = document.createElement('td');
        const priceInput = document.createElement('input');
        priceInput.type = 'text';
        priceInput.className = 'item-price';
        priceInput.placeholder = '0,00';
        priceInput.value = data.price || '';
        priceTd.appendChild(priceInput);

        const qtyTd = document.createElement('td');
        const qtyInput = document.createElement('input');
        qtyInput.type = 'number';
        qtyInput.className = 'item-qty';
        qtyInput.min = '1';
        qtyInput.value = data.quantity || 1;
        qtyTd.appendChild(qtyInput);

        const totalTd = document.createElement('td');
        totalTd.className = 'item-total';
        totalTd.style.textAlign = 'left';
        totalTd.style.fontWeight = '700';
        totalTd.textContent = formatMoney( parseMoney(data.total) );

        const actionsTd = document.createElement('td');
        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'btn-link remove-item';
        removeBtn.textContent = 'Remover';
        actionsTd.appendChild(removeBtn);

        tr.appendChild(productTd);
        tr.appendChild(priceTd);
        tr.appendChild(qtyTd);
        tr.appendChild(totalTd);
        tr.appendChild(actionsTd);

        // events
        function recalc() {
            const price = parseMoney(priceInput.value);
            const qty = Number(qtyInput.value) || 0;
            const rowTotal = price * qty;
            totalTd.textContent = formatMoney(rowTotal);
            recalcTotals();
        }
        priceInput.addEventListener('input', function () {
            // permite apenas números, vírgula e ponto
            this.value = this.value.replace(/[^\d\.,]/g, '').replace(/,+/g, ',');
            recalc();
        });
        qtyInput.addEventListener('input', recalc);

        removeBtn.addEventListener('click', function () {
            const tbody = document.querySelector('#items-table tbody');
            if (!tbody) return;
            // se for a última linha deixa uma vazia em vez de remover tudo
            if (tbody.querySelectorAll('tr').length <= 1) {
                // limpa valores
                productInput.value = '';
                priceInput.value = '';
                qtyInput.value = 1;
                recalc();
                return;
            }
            tr.remove();
            recalcTotals();
        });

        return tr;
    }

    function recalcTotals() {
        const rows = document.querySelectorAll('#items-table tbody tr');
        let subtotal = 0;
        rows.forEach(r => {
            const totalCell = r.querySelector('.item-total');
            subtotal += parseMoney(totalCell ? totalCell.textContent : '0');
        });
        document.getElementById('subtotal').textContent = formatMoney(subtotal);
        document.getElementById('grand-total').textContent = formatMoney(subtotal);
    }

    // expõe utilidades
    window.appGetSales = getSales;
    window.appSaveSales = saveSales;
    window.appRenderSales = renderSales;

    document.addEventListener('DOMContentLoaded', function () {
        // ações página de listagem
        const tbody = document.querySelector('tbody');
        if (tbody) {
            const search = document.getElementById('sales-search');
            renderSales();
            if (search) search.addEventListener('input', function () { renderSales(this.value); });
        }

        // comportamento do formulário (nova-venda.html)
        const form = document.getElementById('sale-form');
        if (!form) return;

        const tbodyItems = document.querySelector('#items-table tbody');
        const addBtn = document.getElementById('add-item-btn');

        // inicializa com uma linha vazia
        if (tbodyItems && tbodyItems.children.length === 0) {
            tbodyItems.appendChild(createItemRow());
            recalcTotals();
        }

        addBtn?.addEventListener('click', function () {
            tbodyItems.appendChild(createItemRow());
            // rolar para a nova linha (UX)
            setTimeout(() => tbodyItems.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 120);
        });

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            // coleta itens
            const rows = Array.from(document.querySelectorAll('#items-table tbody tr'));
            const items = rows.map(r => {
                const product = r.querySelector('.item-product').value.trim();
                const price = parseMoney(r.querySelector('.item-price').value);
                const quantity = Number(r.querySelector('.item-qty').value) || 0;
                return { product, price, quantity, total: price * quantity };
            }).filter(it => it.product && it.quantity > 0 && it.price >= 0);

            if (!items.length) {
                alert('Adicione ao menos um item com produto, preço e quantidade válidos.');
                return;
            }

            const totalValue = items.reduce((acc, it) => acc + Number(it.total || 0), 0);
            const sale = {
                id: Date.now(),
                items: items,
                quantity: items.reduce((a,c)=>a+Number(c.quantity||0),0),
                total: formatMoney(totalValue)
            };

            const sales = getSales();
            sales.push(sale);
            saveSales(sales);

            alert('Venda registrada.');
            location.href = 'vendas.html';
        });
    });
})();