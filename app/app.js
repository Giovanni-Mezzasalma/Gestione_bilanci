// ===== BUDGET APP - MAIN APPLICATION =====

const BudgetApp = {
    // ===== DATA PROPERTIES =====
    accounts: [],
    transactions: [],
    categories: {},
    savedCharts: [],
    
    // ===== CHART INSTANCES =====
    trendChart: null,
    pieChart: null,
    categoryChart: null,
    customCharts: {},

    // ===== DEFAULT DATA =====
    defaultCategories: {
        income: ['Reddito Principale', 'Reddito Secondario', 'Affitto', 'Vendita', 'Altro'],
        'expense-necessity': {
            'Casa': ['Mutuo/Affitto', 'Elettricità', 'Gas', 'Acqua', 'Manutenzione Casa', 'Tasse', 'Telefono/Internet', 'Assicurazione Casa', 'Spesa/Cibo'],
            'Trasporti': ['Rate auto', 'Assicurazione Auto', 'Benzina', 'Manutenzione', 'Bollo', 'Pedaggi', 'Parcheggi', 'Mezzi pubblici', 'Multa'],
            'Salute': ['Medicinali', 'Polizze', 'Visite mediche/esami', 'Sport', 'Occhiali/Lenti'],
            'Figli': ['Scuola', 'Abbigliamento', 'Attività extra', 'Babysitting'],
            'Istruzione': ['Retta scolastica', 'Libri scolastici', 'Formazione'],
            'Altro': ['Abbigliamento/Calzature', 'Rate prestito', 'Rate carta di credito', 'Una tantum']
        },
        'expense-extra': {
            'Svago': ['Ristorazione', 'Bar', 'Cinema/Uscite/Eventi', 'Abbonamenti digitali', 'Cura personale', 'Donazioni e Regali', 'Divertimento', 'Fumo', 'Arredamento', 'Cultura', 'Viaggi', 'Shopping'],
            'Animali': ['Cibo', 'Veterinario']
        },
        'withdrawal': ['Prelievo']
    },

    defaultAccounts: [
        { id: 1, name: 'N26', type: 'current', initialBalance: 0 },
        { id: 2, name: 'Intesa SanPaolo', type: 'current', initialBalance: 0 },
        { id: 3, name: 'Revolut', type: 'current', initialBalance: 0 },
        { id: 4, name: 'PayPal', type: 'current', initialBalance: 0 }
    ],

    // ===== INITIALIZATION =====
    init() {
        this.loadData();
        this.initializeDates();
        this.updateView();
    },

    loadData() {
        this.accounts = this.getFromStorage('accounts', this.defaultAccounts);
        this.transactions = this.getFromStorage('transactions', []);
        this.categories = this.getFromStorage('categories', JSON.parse(JSON.stringify(this.defaultCategories)));
        this.savedCharts = this.getFromStorage('customCharts', []);
    },

    getFromStorage(key, defaultValue) {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : defaultValue;
    },

    saveToStorage(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    },

    initializeDates() {
        const today = new Date();
        document.getElementById('monthSelect').value = today.getMonth();
        document.getElementById('yearSelect').value = today.getFullYear();
        document.getElementById('txDate').value = today.toISOString().split('T')[0];
        document.getElementById('trDate').value = today.toISOString().split('T')[0];
    },

    // ===== MODAL MANAGEMENT =====
    openTransactionModal() {
        document.getElementById('transactionModal').classList.add('active');
        this.updateTransactionCategories();
        this.populateAccountsSelect('txAccount');
    },

    openTransferModal() {
        document.getElementById('transferModal').classList.add('active');
        this.populateAccountsSelect('trFrom');
        this.populateAccountsSelect('trTo');
    },

    openAccountModal() {
        document.getElementById('accountModal').classList.add('active');
        this.updateAccountManagement();
    },

    openCategoryModal() {
        document.getElementById('categoryModal').classList.add('active');
        this.renderCategoryManager();
    },

    closeModal(id) {
        document.getElementById(id).classList.remove('active');
    },

    // ===== ACCOUNT MANAGEMENT =====
    populateAccountsSelect(selectId) {
        const select = document.getElementById(selectId);
        select.innerHTML = '<option value="">Seleziona</option>';
        this.accounts.forEach(acc => {
            const option = document.createElement('option');
            option.value = acc.id;
            option.textContent = `${acc.name} (${this.getAccountTypeLabel(acc.type)})`;
            select.appendChild(option);
        });
    },

    getAccountTypeLabel(type) {
        const labels = { 'current': 'Corrente', 'savings': 'Risparmio', 'investment': 'Investimento' };
        return labels[type] || type;
    },

    calculateAccountBalance(accountId) {
        const account = this.accounts.find(a => a.id === accountId);
        let balance = account ? account.initialBalance : 0;

        this.transactions.forEach(t => {
            if (t.type === 'transfer') {
                if (t.fromAccount === accountId) balance -= t.amount;
                if (t.toAccount === accountId) balance += t.amount;
            } else if (t.account === accountId) {
                if (t.type === 'income') balance += t.amount;
                else balance -= t.amount;
            }
        });

        return balance;
    },

    addAccount(event) {
        event.preventDefault();
        
        const account = {
            id: Date.now(),
            name: document.getElementById('accName').value,
            type: document.getElementById('accType').value,
            initialBalance: parseFloat(document.getElementById('accBalance').value)
        };

        this.accounts.push(account);
        this.saveToStorage('accounts', this.accounts);

        document.getElementById('accName').value = '';
        document.getElementById('accBalance').value = '0';
        this.updateAccountManagement();
        this.updateView();
    },

    deleteAccount(id) {
        if (confirm('Sei sicuro? Questo eliminerà anche tutte le transazioni associate.')) {
            this.accounts = this.accounts.filter(a => a.id !== id);
            this.transactions = this.transactions.filter(t => {
                if (t.type === 'transfer') {
                    return t.fromAccount !== id && t.toAccount !== id;
                }
                return t.account !== id;
            });
            this.saveToStorage('accounts', this.accounts);
            this.saveToStorage('transactions', this.transactions);
            this.updateAccountManagement();
            this.updateView();
        }
    },

    updateAccountManagement() {
        const container = document.getElementById('accountManagement');
        container.innerHTML = `
            <div style="display: grid; gap: 15px;">
                ${this.accounts.map(acc => `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f9fafb; border-radius: 10px;">
                        <div>
                            <strong>${acc.name}</strong>
                            <span style="color: #6b7280; font-size: 14px; margin-left: 10px;">(${this.getAccountTypeLabel(acc.type)})</span>
                            <div style="color: #667eea; font-weight: bold; margin-top: 5px;">€${this.calculateAccountBalance(acc.id).toFixed(2)}</div>
                        </div>
                        <button class="btn-danger" onclick="app.deleteAccount(${acc.id})">Elimina</button>
                    </div>
                `).join('')}
            </div>
        `;
    },

    updateAccountsView() {
        const grid = document.getElementById('accountsGrid');
        grid.innerHTML = `
            <div class="accounts-grid">
                ${this.accounts.map(acc => {
                    const balance = this.calculateAccountBalance(acc.id);
                    return `
                        <div class="account-card">
                            <div class="account-type">${this.getAccountTypeLabel(acc.type)}</div>
                            <div class="account-name">${acc.name}</div>
                            <div class="account-balance">€${balance.toFixed(2)}</div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    },

    // ===== TRANSACTION MANAGEMENT =====
    updateTransactionCategories() {
        const type = document.getElementById('txType').value;
        const select = document.getElementById('txCategory');
        select.innerHTML = '<option value="">Seleziona</option>';
        
        const cats = this.categories[type];
        if (Array.isArray(cats)) {
            cats.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                select.appendChild(option);
            });
        } else {
            Object.keys(cats).forEach(group => {
                const optgroup = document.createElement('optgroup');
                optgroup.label = group;
                cats[group].forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat;
                    option.textContent = cat;
                    optgroup.appendChild(option);
                });
                select.appendChild(optgroup);
            });
        }
    },

    addTransaction(event) {
        event.preventDefault();
        
        const transaction = {
            id: Date.now(),
            date: document.getElementById('txDate').value,
            type: document.getElementById('txType').value,
            category: document.getElementById('txCategory').value,
            account: parseInt(document.getElementById('txAccount').value),
            amount: parseFloat(document.getElementById('txAmount').value),
            description: document.getElementById('txDescription').value
        };

        this.transactions.push(transaction);
        this.saveToStorage('transactions', this.transactions);

        this.closeModal('transactionModal');
        document.getElementById('txAmount').value = '';
        document.getElementById('txDescription').value = '';
        this.updateView();
    },

    addTransfer(event) {
        event.preventDefault();
        
        const transfer = {
            id: Date.now(),
            date: document.getElementById('trDate').value,
            type: 'transfer',
            operationType: document.getElementById('trType').value,
            fromAccount: parseInt(document.getElementById('trFrom').value),
            toAccount: parseInt(document.getElementById('trTo').value),
            amount: parseFloat(document.getElementById('trAmount').value),
            description: document.getElementById('trDescription').value
        };

        this.transactions.push(transfer);
        this.saveToStorage('transactions', this.transactions);

        this.closeModal('transferModal');
        document.getElementById('trAmount').value = '';
        document.getElementById('trDescription').value = '';
        this.updateView();
    },

    deleteTransaction(id) {
        if (confirm('Sei sicuro di voler eliminare questa transazione?')) {
            this.transactions = this.transactions.filter(t => t.id !== id);
            this.saveToStorage('transactions', this.transactions);
            this.updateView();
        }
    },

    getFilteredTransactions() {
        const month = parseInt(document.getElementById('monthSelect').value);
        const year = parseInt(document.getElementById('yearSelect').value);

        return this.transactions.filter(t => {
            const date = new Date(t.date);
            return date.getMonth() === month && date.getFullYear() === year;
        });
    },

    updateTransactionsList(trans) {
        const list = document.getElementById('transactionsList');
        
        if (trans.length === 0) {
            list.innerHTML = `<div class="empty-state"><h3>Nessuna transazione</h3></div>`;
            return;
        }

        const sorted = [...trans].sort((a, b) => new Date(b.date) - new Date(a.date));

        list.innerHTML = `<table><thead><tr><th>Data</th><th>Tipo</th><th>Dettaglio</th><th>Conto</th><th class="text-right">Importo</th><th class="text-center">Azioni</th></tr></thead><tbody>
            ${sorted.map(t => {
                let badgeClass, typeLabel, detail, accountInfo;
                
                if (t.type === 'transfer') {
                    badgeClass = 'badge-transfer';
                    typeLabel = t.operationType;
                    const fromAcc = this.accounts.find(a => a.id === t.fromAccount);
                    const toAcc = this.accounts.find(a => a.id === t.toAccount);
                    detail = t.description || '-';
                    accountInfo = `${fromAcc?.name} → ${toAcc?.name}`;
                } else {
                    badgeClass = t.type === 'income' ? 'badge-income' :
                                t.type === 'expense-necessity' ? 'badge-necessity' :
                                t.type === 'expense-extra' ? 'badge-extra' : 'badge-withdrawal';
                    typeLabel = t.type === 'income' ? 'Entrata' :
                               t.type === 'expense-necessity' ? 'Necessità' :
                               t.type === 'expense-extra' ? 'Extra' : 'Prelievo';
                    detail = `${t.category}${t.description ? ' - ' + t.description : ''}`;
                    const acc = this.accounts.find(a => a.id === t.account);
                    accountInfo = acc?.name || '-';
                }
                
                return `
                    <tr>
                        <td>${new Date(t.date).toLocaleDateString('it-IT')}</td>
                        <td><span class="badge ${badgeClass}">${typeLabel}</span></td>
                        <td>${detail}</td>
                        <td>${accountInfo}</td>
                        <td class="text-right" style="font-weight: bold; color: ${t.type === 'income' ? '#10b981' : '#ef4444'}">
                            ${t.type === 'income' ? '+' : '-'}€${t.amount.toFixed(2)}
                        </td>
                        <td class="text-center">
                            <button class="btn-danger" onclick="app.deleteTransaction(${t.id})">Elimina</button>
                        </td>
                    </tr>
                `;
            }).join('')}
        </tbody></table>`;
    },

    // ===== CATEGORY MANAGEMENT =====
    renderCategoryManager() {
        const container = document.getElementById('categoryManager');
        
        const typeLabels = {
            'income': 'Entrate',
            'expense-necessity': 'Spese di Necessità',
            'expense-extra': 'Spese Extra',
            'withdrawal': 'Prelievi'
        };

        let html = '';

        Object.keys(this.categories).forEach(type => {
            html += `<div class="category-section">
                <h4>${typeLabels[type]}</h4>`;

            const cats = this.categories[type];
            
            if (Array.isArray(cats)) {
                html += `<div class="subcategory-list">`;
                cats.forEach((cat, index) => {
                    html += `
                        <div class="subcategory-item">
                            <span>${cat}</span>
                            <button type="button" onclick="app.removeSimpleCategory('${type}', ${index})">×</button>
                        </div>
                    `;
                });
                html += `</div>
                    <div class="add-subcategory">
                        <input type="text" id="new-${type}" placeholder="Nuova categoria">
                        <button type="button" class="btn btn-primary btn-small" onclick="app.addSimpleCategory('${type}')">Aggiungi</button>
                    </div>`;
            } else {
                Object.keys(cats).forEach(group => {
                    html += `
                        <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 10px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                <strong>${group}</strong>
                                <button type="button" class="btn-danger btn-small" onclick="app.removeGroup('${type}', '${group}')">Elimina Gruppo</button>
                            </div>
                            <div class="subcategory-list">`;
                    
                    cats[group].forEach((subcat, index) => {
                        html += `
                            <div class="subcategory-item">
                                <span>${subcat}</span>
                                <button type="button" onclick="app.removeGroupCategory('${type}', '${group}', ${index})">×</button>
                            </div>
                        `;
                    });
                    
                    html += `</div>
                            <div class="add-subcategory">
                                <input type="text" id="new-${type}-${group}" placeholder="Nuova sottocategoria">
                                <button type="button" class="btn btn-primary btn-small" onclick="app.addGroupCategory('${type}', '${group}')">Aggiungi</button>
                            </div>
                        </div>
                    `;
                });

                html += `
                    <div style="margin-top: 15px;">
                        <div class="add-subcategory">
                            <input type="text" id="new-group-${type}" placeholder="Nome nuovo gruppo">
                            <button type="button" class="btn btn-success btn-small" onclick="app.addNewGroup('${type}')">Aggiungi Gruppo</button>
                        </div>
                    </div>
                `;
            }

            html += `</div>`;
        });

        container.innerHTML = html;
    },

    addSimpleCategory(type) {
        const input = document.getElementById(`new-${type}`);
        const value = input.value.trim();
        
        if (value) {
            this.categories[type].push(value);
            this.saveToStorage('categories', this.categories);
            input.value = '';
            this.renderCategoryManager();
        }
    },

    removeSimpleCategory(type, index) {
        if (confirm('Sei sicuro di voler eliminare questa categoria?')) {
            this.categories[type].splice(index, 1);
            this.saveToStorage('categories', this.categories);
            this.renderCategoryManager();
        }
    },

    addGroupCategory(type, group) {
        const input = document.getElementById(`new-${type}-${group}`);
        const value = input.value.trim();
        
        if (value) {
            this.categories[type][group].push(value);
            this.saveToStorage('categories', this.categories);
            input.value = '';
            this.renderCategoryManager();
        }
    },

    removeGroupCategory(type, group, index) {
        if (confirm('Sei sicuro di voler eliminare questa sottocategoria?')) {
            this.categories[type][group].splice(index, 1);
            this.saveToStorage('categories', this.categories);
            this.renderCategoryManager();
        }
    },

    addNewGroup(type) {
        const input = document.getElementById(`new-group-${type}`);
        const value = input.value.trim();
        
        if (value) {
            this.categories[type][value] = [];
            this.saveToStorage('categories', this.categories);
            input.value = '';
            this.renderCategoryManager();
        }
    },

    removeGroup(type, group) {
        if (confirm(`Sei sicuro di voler eliminare il gruppo "${group}" e tutte le sue sottocategorie?`)) {
            delete this.categories[type][group];
            this.saveToStorage('categories', this.categories);
            this.renderCategoryManager();
        }
    },

    resetCategoriesToDefault() {
        if (confirm('Sei sicuro di voler ripristinare tutte le categorie ai valori di default? Questa azione non può essere annullata.')) {
            this.categories = JSON.parse(JSON.stringify(this.defaultCategories));
            this.saveToStorage('categories', this.categories);
            this.renderCategoryManager();
            alert('Categorie ripristinate!');
        }
    },

    updateCategoriesList(trans) {
        const categoryTotals = {};
        
        trans.filter(t => t.type !== 'income' && t.type !== 'transfer').forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const list = document.getElementById('categoriesList');
        
        if (Object.keys(categoryTotals).length === 0) {
            list.innerHTML = `<div class="empty-state"><h3>Nessuna spesa</h3></div>`;
            return;
        }

        const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

        list.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px;">
                ${sorted.map(([cat, amount]) => `
                    <div style="background: #f9fafb; padding: 20px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center;">
                        <span style="font-weight: 600;">${cat}</span>
                        <span style="font-weight: bold; color: #ef4444; font-size: 18px;">€${amount.toFixed(2)}</span>
                    </div>
                `).join('')}
            </div>
        `;
    },

    // ===== STATISTICS =====
    calculateStats(trans) {
        let income = 0, expenseNecessity = 0, expenseExtra = 0, withdrawals = 0;

        trans.forEach(t => {
            if (t.type === 'income') income += t.amount;
            else if (t.type === 'expense-necessity') expenseNecessity += t.amount;
            else if (t.type === 'expense-extra') expenseExtra += t.amount;
            else if (t.type === 'withdrawal') withdrawals += t.amount;
        });

        return {
            income,
            expenseNecessity,
            expenseExtra,
            withdrawals,
            totalExpenses: expenseNecessity + expenseExtra + withdrawals,
            net: income - expenseNecessity - expenseExtra - withdrawals
        };
    },

    // ===== CUSTOM CHARTS =====
    createNewChart() {
        document.getElementById('chartModalTitle').textContent = 'Nuovo Grafico Personalizzato';
        document.getElementById('editChartId').value = '';
        document.getElementById('chartTitle').value = '';
        document.getElementById('chartType').value = 'line';
        document.getElementById('chartPeriod').value = 'last6';
        document.getElementById('chartDataType').value = 'overview';
        this.updatePeriodInputs();
        this.updateDataOptions();
        this.updateAccountCheckboxes();
        document.getElementById('chartConfigModal').classList.add('active');
    },

    updatePeriodInputs() {
        const period = document.getElementById('chartPeriod').value;
        document.getElementById('customPeriodInputs').style.display = 
            period === 'custom' ? 'block' : 'none';
    },

    updateDataOptions() {
        const dataType = document.getElementById('chartDataType').value;
        document.getElementById('overviewOptions').style.display = 
            dataType === 'overview' ? 'block' : 'none';
        document.getElementById('accountOptions').style.display = 
            dataType === 'accounts' ? 'block' : 'none';
        document.getElementById('specificCategoryInput').style.display = 
            dataType === 'categoryDetail' ? 'block' : 'none';

        if (dataType === 'categoryDetail') {
            this.updateCategoryOptions();
        }
    },

    updateCategoryOptions() {
        const select = document.getElementById('specificCategory');
        select.innerHTML = '<option value="">Seleziona categoria</option>';
        
        Object.values(this.categories).forEach(catGroup => {
            if (Array.isArray(catGroup)) {
                catGroup.forEach(cat => {
                    const option = document.createElement('option');
                    option.value = cat;
                    option.textContent = cat;
                    select.appendChild(option);
                });
            } else {
                Object.values(catGroup).forEach(subcats => {
                    subcats.forEach(cat => {
                        const option = document.createElement('option');
                        option.value = cat;
                        option.textContent = cat;
                        select.appendChild(option);
                    });
                });
            }
        });
    },

    updateAccountCheckboxes() {
        const container = document.getElementById('accountCheckboxes');
        container.innerHTML = this.accounts.map(acc => `
            <div class="checkbox-item">
                <input type="checkbox" id="acc-${acc.id}" value="${acc.id}" checked>
                <label for="acc-${acc.id}">${acc.name}</label>
            </div>
        `).join('');
    },

    saveCustomChart(event) {
        event.preventDefault();

        const chartId = document.getElementById('editChartId').value || Date.now();
        const config = {
            id: parseInt(chartId),
            title: document.getElementById('chartTitle').value,
            type: document.getElementById('chartType').value,
            period: document.getElementById('chartPeriod').value,
            dataType: document.getElementById('chartDataType').value,
            options: {}
        };

        if (config.period === 'custom') {
            config.options.startDate = document.getElementById('customStartDate').value;
            config.options.endDate = document.getElementById('customEndDate').value;
        }

        if (config.dataType === 'overview') {
            config.options.showIncome = document.getElementById('showIncome').checked;
            config.options.showExpenses = document.getElementById('showExpenses').checked;
            config.options.showNet = document.getElementById('showNet').checked;
            config.options.showNecessity = document.getElementById('showNecessity').checked;
            config.options.showExtra = document.getElementById('showExtra').checked;
        } else if (config.dataType === 'accounts') {
            config.options.selectedAccounts = Array.from(
                document.querySelectorAll('#accountCheckboxes input:checked')
            ).map(cb => parseInt(cb.value));
        } else if (config.dataType === 'categoryDetail') {
            config.options.category = document.getElementById('specificCategory').value;
        }

        const existingIndex = this.savedCharts.findIndex(c => c.id === config.id);
        if (existingIndex >= 0) {
            this.savedCharts[existingIndex] = config;
        } else {
            this.savedCharts.push(config);
        }

        this.saveToStorage('customCharts', this.savedCharts);
        this.closeModal('chartConfigModal');
        this.renderCustomCharts();
    },

    renderCustomCharts() {
        const container = document.getElementById('customChartsContainer');
        
        if (this.savedCharts.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Nessun grafico personalizzato</h3>
                    <p>Clicca su "+ Nuovo Grafico" per iniziare</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.savedCharts.map(chart => `
            <div class="custom-chart-card" id="chart-${chart.id}">
                <div class="chart-header">
                    <div class="chart-title">${chart.title}</div>
                    <div>
                        <button class="btn btn-info btn-small" onclick="app.editCustomChart(${chart.id})">✏️ Modifica</button>
                        <button class="btn-danger btn-small" onclick="app.deleteCustomChart(${chart.id})">🗑️ Elimina</button>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="custom-chart-${chart.id}"></canvas>
                </div>
            </div>
        `).join('');

        this.savedCharts.forEach(chart => {
            this.renderSingleCustomChart(chart);
        });
    },

    deleteCustomChart(id) {
        if (confirm('Sei sicuro di voler eliminare questo grafico?')) {
            this.savedCharts = this.savedCharts.filter(c => c.id !== id);
            this.saveToStorage('customCharts', this.savedCharts);
            this.renderCustomCharts();
        }
    },

    editCustomChart(id) {
        const chart = this.savedCharts.find(c => c.id === id);
        if (!chart) return;

        document.getElementById('chartModalTitle').textContent = 'Modifica Grafico';
        document.getElementById('editChartId').value = chart.id;
        document.getElementById('chartTitle').value = chart.title;
        document.getElementById('chartType').value = chart.type;
        document.getElementById('chartPeriod').value = chart.period;
        document.getElementById('chartDataType').value = chart.dataType;

        this.updatePeriodInputs();
        this.updateDataOptions();
        this.updateAccountCheckboxes();

        if (chart.period === 'custom') {
            document.getElementById('customStartDate').value = chart.options.startDate || '';
            document.getElementById('customEndDate').value = chart.options.endDate || '';
        }

        if (chart.dataType === 'overview') {
            document.getElementById('showIncome').checked = chart.options.showIncome !== false;
            document.getElementById('showExpenses').checked = chart.options.showExpenses !== false;
            document.getElementById('showNet').checked = chart.options.showNet !== false;
            document.getElementById('showNecessity').checked = chart.options.showNecessity || false;
            document.getElementById('showExtra').checked = chart.options.showExtra || false;
        } else if (chart.dataType === 'accounts' && chart.options.selectedAccounts) {
            document.querySelectorAll('#accountCheckboxes input').forEach(cb => {
                cb.checked = chart.options.selectedAccounts.includes(parseInt(cb.value));
            });
        } else if (chart.dataType === 'categoryDetail') {
            document.getElementById('specificCategory').value = chart.options.category || '';
        }

        document.getElementById('chartConfigModal').classList.add('active');
    },

    renderSingleCustomChart(config) {
        const data = this.getChartData(config);
        const ctx = document.getElementById(`custom-chart-${config.id}`);
        
        if (this.customCharts[config.id]) {
            this.customCharts[config.id].destroy();
        }

        this.customCharts[config.id] = new Chart(ctx, {
            type: config.type,
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: config.type === 'pie' || config.type === 'doughnut' ? 'right' : 'top'
                    }
                },
                scales: config.type === 'pie' || config.type === 'doughnut' ? {} : {
                    y: { beginAtZero: true }
                }
            }
        });
    },

    getChartData(config) {
        const periodData = this.getPeriodData(config.period, config.options);
        
        if (config.dataType === 'overview') {
            return this.getOverviewData(periodData, config);
        } else if (config.dataType === 'categories') {
            return this.getCategoriesData(periodData, config);
        } else if (config.dataType === 'accounts') {
            return this.getAccountsData(periodData, config);
        } else if (config.dataType === 'categoryDetail') {
            return this.getCategoryDetailData(periodData, config);
        }
    },

    getPeriodData(period, options = {}) {
        const data = [];
        let startDate, endDate, months;

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        switch (period) {
            case 'last3':
                months = 3;
                break;
            case 'last6':
                months = 6;
                break;
            case 'last12':
                months = 12;
                break;
            case 'currentYear':
                startDate = new Date(currentYear, 0, 1);
                endDate = new Date(currentYear, 11, 31);
                months = 12;
                break;
            case 'custom':
                if (options.startDate && options.endDate) {
                    const start = new Date(options.startDate + '-01');
                    const end = new Date(options.endDate + '-01');
                    months = (end.getFullYear() - start.getFullYear()) * 12 + 
                            (end.getMonth() - start.getMonth()) + 1;
                    startDate = start;
                } else {
                    months = 6;
                }
                break;
            default:
                months = 6;
        }

        for (let i = months - 1; i >= 0; i--) {
            const date = startDate ? 
                new Date(startDate.getFullYear(), startDate.getMonth() + (months - 1 - i), 1) :
                new Date(currentYear, currentMonth - i, 1);
            
            const month = date.getMonth();
            const year = date.getFullYear();
            
            const monthTrans = this.transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === month && tDate.getFullYear() === year;
            });

            data.push({
                label: date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }),
                date: date,
                transactions: monthTrans
            });
        }

        return data;
    },

    getOverviewData(periodData, config) {
        const datasets = [];
        
        if (config.options.showIncome) {
            datasets.push({
                label: 'Entrate',
                data: periodData.map(p => {
                    return p.transactions
                        .filter(t => t.type === 'income')
                        .reduce((sum, t) => sum + t.amount, 0);
                }),
                borderColor: '#10b981',
                backgroundColor: config.type === 'bar' ? '#10b981' : 'rgba(16, 185, 129, 0.2)',
                tension: 0.4
            });
        }

        if (config.options.showExpenses) {
            datasets.push({
                label: 'Uscite',
                data: periodData.map(p => {
                    return p.transactions
                        .filter(t => t.type !== 'income' && t.type !== 'transfer')
                        .reduce((sum, t) => sum + t.amount, 0);
                }),
                borderColor: '#ef4444',
                backgroundColor: config.type === 'bar' ? '#ef4444' : 'rgba(239, 68, 68, 0.2)',
                tension: 0.4
            });
        }

        if (config.options.showNecessity) {
            datasets.push({
                label: 'Spese Necessità',
                data: periodData.map(p => {
                    return p.transactions
                        .filter(t => t.type === 'expense-necessity')
                        .reduce((sum, t) => sum + t.amount, 0);
                }),
                borderColor: '#f59e0b',
                backgroundColor: config.type === 'bar' ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)',
                tension: 0.4
            });
        }

        if (config.options.showExtra) {
            datasets.push({
                label: 'Spese Extra',
                data: periodData.map(p => {
                    return p.transactions
                        .filter(t => t.type === 'expense-extra')
                        .reduce((sum, t) => sum + t.amount, 0);
                }),
                borderColor: '#8b5cf6',
                backgroundColor: config.type === 'bar' ? '#8b5cf6' : 'rgba(139, 92, 246, 0.2)',
                tension: 0.4
            });
        }

        if (config.options.showNet) {
            datasets.push({
                label: 'Netto',
                data: periodData.map(p => {
                    const income = p.transactions.filter(t => t.type === 'income')
                        .reduce((sum, t) => sum + t.amount, 0);
                    const expenses = p.transactions.filter(t => t.type !== 'income' && t.type !== 'transfer')
                        .reduce((sum, t) => sum + t.amount, 0);
                    return income - expenses;
                }),
                borderColor: '#3b82f6',
                backgroundColor: config.type === 'bar' ? '#3b82f6' : 'rgba(59, 130, 246, 0.2)',
                tension: 0.4
            });
        }

        return {
            labels: periodData.map(p => p.label),
            datasets: datasets
        };
    },

    getCategoriesData(periodData, config) {
        const categoryTotals = {};
        
        periodData.forEach(p => {
            p.transactions.filter(t => t.type !== 'income' && t.type !== 'transfer').forEach(t => {
                categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
            });
        });

        const sorted = Object.entries(categoryTotals)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);

        return {
            labels: sorted.map(([cat]) => cat),
            datasets: [{
                label: 'Spesa Totale',
                data: sorted.map(([_, amount]) => amount),
                backgroundColor: [
                    '#667eea', '#764ba2', '#f093fb', '#4facfe',
                    '#43e97b', '#fa709a', '#fee140', '#30cfd0',
                    '#a8edea', '#fed6e3'
                ]
            }]
        };
    },

    getAccountsData(periodData, config) {
        const selectedAccounts = config.options.selectedAccounts || this.accounts.map(a => a.id);
        const datasets = [];

        selectedAccounts.forEach((accId, index) => {
            const account = this.accounts.find(a => a.id === accId);
            if (!account) return;

            const colors = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
            
            datasets.push({
                label: account.name,
                data: periodData.map(p => {
                    let balance = 0;
                    p.transactions.forEach(t => {
                        if (t.type === 'transfer') {
                            if (t.fromAccount === accId) balance -= t.amount;
                            if (t.toAccount === accId) balance += t.amount;
                        } else if (t.account === accId) {
                            if (t.type === 'income') balance += t.amount;
                            else balance -= t.amount;
                        }
                    });
                    return balance;
                }),
                borderColor: colors[index % colors.length],
                backgroundColor: config.type === 'bar' ? colors[index % colors.length] : 
                    `${colors[index % colors.length]}33`,
                tension: 0.4
            });
        });

        return {
            labels: periodData.map(p => p.label),
            datasets: datasets
        };
    },

    getCategoryDetailData(periodData, config) {
        const category = config.options.category;
        
        return {
            labels: periodData.map(p => p.label),
            datasets: [{
                label: category,
                data: periodData.map(p => {
                    return p.transactions
                        .filter(t => t.category === category)
                        .reduce((sum, t) => sum + t.amount, 0);
                }),
                borderColor: '#667eea',
                backgroundColor: config.type === 'bar' ? '#667eea' : 'rgba(102, 126, 234, 0.2)',
                tension: 0.4
            }]
        };
    },

    // ===== ANALYSIS CHARTS =====
    getLast6MonthsData() {
        const currentMonth = parseInt(document.getElementById('monthSelect').value);
        const currentYear = parseInt(document.getElementById('yearSelect').value);
        const months = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentYear, currentMonth - i, 1);
            const month = date.getMonth();
            const year = date.getFullYear();
            
            const monthTrans = this.transactions.filter(t => {
                const tDate = new Date(t.date);
                return tDate.getMonth() === month && tDate.getFullYear() === year;
            });

            const stats = this.calculateStats(monthTrans);
            
            months.push({
                label: date.toLocaleDateString('it-IT', { month: 'short', year: '2-digit' }),
                income: stats.income,
                expenses: stats.totalExpenses,
                net: stats.net
            });
        }

        return months;
    },

    updateTrendChart() {
        const data = this.getLast6MonthsData();
        
        const ctx = document.getElementById('trendChart');
        if (this.trendChart) this.trendChart.destroy();
        
        this.trendChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map(d => d.label),
                datasets: [
                    {
                        label: 'Entrate',
                        data: data.map(d => d.income),
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Uscite',
                        data: data.map(d => d.expenses),
                        borderColor: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        tension: 0.4
                    },
                    {
                        label: 'Netto',
                        data: data.map(d => d.net),
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        tension: 0.4
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    },

    updatePieChart() {
        const filtered = this.getFilteredTransactions();
        const categoryTotals = {};
        
        filtered.filter(t => t.type !== 'income' && t.type !== 'transfer').forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 8);
        
        const ctx = document.getElementById('pieChart');
        if (this.pieChart) this.pieChart.destroy();
        
        if (sorted.length === 0) {
            return;
        }
        
        this.pieChart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: sorted.map(([cat]) => cat),
                datasets: [{
                    data: sorted.map(([_, amount]) => amount),
                    backgroundColor: [
                        '#667eea', '#764ba2', '#f093fb', '#4facfe',
                        '#43e97b', '#fa709a', '#fee140', '#30cfd0'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                    }
                }
            }
        });
    },

    updateCategoryChart() {
        const filtered = this.getFilteredTransactions();
        const categoryTotals = {};
        
        filtered.filter(t => t.type !== 'income' && t.type !== 'transfer').forEach(t => {
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        });

        const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]).slice(0, 10);
        
        const ctx = document.getElementById('categoryChart');
        if (this.categoryChart) this.categoryChart.destroy();
        
        if (sorted.length === 0) {
            return;
        }
        
        this.categoryChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: sorted.map(([cat]) => cat),
                datasets: [{
                    label: 'Spesa (€)',
                    data: sorted.map(([_, amount]) => amount),
                    backgroundColor: '#667eea'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    },

    updateStatsGrid() {
        const data = this.getLast6MonthsData();
        const avgIncome = data.reduce((sum, m) => sum + m.income, 0) / data.length;
        const avgExpenses = data.reduce((sum, m) => sum + m.expenses, 0) / data.length;
        const avgNet = data.reduce((sum, m) => sum + m.net, 0) / data.length;
        
        const currentStats = this.calculateStats(this.getFilteredTransactions());
        const savingsRate = currentStats.income > 0 ? ((currentStats.net / currentStats.income) * 100) : 0;

        document.getElementById('statsGrid').innerHTML = `
            <div class="stat-box">
                <div class="label">Media Entrate (6 mesi)</div>
                <div class="value">€${avgIncome.toFixed(2)}</div>
            </div>
            <div class="stat-box">
                <div class="label">Media Uscite (6 mesi)</div>
                <div class="value">€${avgExpenses.toFixed(2)}</div>
            </div>
            <div class="stat-box">
                <div class="label">Media Netto (6 mesi)</div>
                <div class="value">€${avgNet.toFixed(2)}</div>
            </div>
            <div class="stat-box">
                <div class="label">Tasso Risparmio</div>
                <div class="value">${savingsRate.toFixed(1)}%</div>
            </div>
        `;
    },

    updateComparisonTable() {
        const data = this.getLast6MonthsData();
        
        document.getElementById('comparisonTable').innerHTML = `
            <table style="margin-top: 20px;">
                <thead style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
                    <tr>
                        <th>Mese</th>
                        <th class="text-right">Entrate</th>
                        <th class="text-right">Uscite</th>
                        <th class="text-right">Netto</th>
                        <th class="text-center">Var. vs Precedente</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map((m, i) => {
                        let variation = '';
                        if (i > 0) {
                            const diff = m.net - data[i - 1].net;
                            const percent = data[i - 1].net !== 0 ? ((diff / Math.abs(data[i - 1].net)) * 100) : 0;
                            variation = `<span class="${diff >= 0 ? 'trend-up' : 'trend-down'}">
                                ${diff >= 0 ? '▲' : '▼'} €${Math.abs(diff).toFixed(2)} (${percent.toFixed(1)}%)
                            </span>`;
                        }
                        
                        return `
                            <tr>
                                <td><strong>${m.label}</strong></td>
                                <td class="text-right">€${m.income.toFixed(2)}</td>
                                <td class="text-right">€${m.expenses.toFixed(2)}</td>
                                <td class="text-right" style="color: ${m.net >= 0 ? '#10b981' : '#ef4444'}; font-weight: bold;">
                                    €${m.net.toFixed(2)}
                                </td>
                                <td class="text-center">${variation || '-'}</td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;
    },

    // ===== VIEW MANAGEMENT =====
    switchTab(tab) {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        event.target.classList.add('active');

        document.getElementById('dashboardView').style.display = tab === 'dashboard' ? 'block' : 'none';
        document.getElementById('accountsView').style.display = tab === 'accounts' ? 'block' : 'none';
        document.getElementById('transactionsView').style.display = tab === 'transactions' ? 'block' : 'none';
        document.getElementById('categoriesView').style.display = tab === 'categories' ? 'block' : 'none';
        document.getElementById('customChartsView').style.display = tab === 'customCharts' ? 'block' : 'none';
        document.getElementById('analysisView').style.display = tab === 'analysis' ? 'block' : 'none';
        
        if (tab === 'customCharts') {
            this.renderCustomCharts();
        } else if (tab === 'analysis') {
            this.updateTrendChart();
            this.updatePieChart();
            this.updateCategoryChart();
            this.updateStatsGrid();
            this.updateComparisonTable();
        }
    },

    updateView() {
        const filtered = this.getFilteredTransactions();
        const stats = this.calculateStats(filtered);

        const totalBalance = this.accounts.reduce((sum, acc) => sum + this.calculateAccountBalance(acc.id), 0);
        
        document.getElementById('kpiGrid').innerHTML = `
            <div class="kpi-card income">
                <div class="kpi-label">Patrimonio Totale</div>
                <div class="kpi-value">€${totalBalance.toFixed(2)}</div>
            </div>
            <div class="kpi-card income">
                <div class="kpi-label">Entrate</div>
                <div class="kpi-value">€${stats.income.toFixed(2)}</div>
            </div>
            <div class="kpi-card expense">
                <div class="kpi-label">Uscite Totali</div>
                <div class="kpi-value">€${stats.totalExpenses.toFixed(2)}</div>
            </div>
            <div class="kpi-card net">
                <div class="kpi-label">Netto Mensile</div>
                <div class="kpi-value" style="color: ${stats.net >= 0 ? '#10b981' : '#ef4444'}">€${stats.net.toFixed(2)}</div>
            </div>
        `;

        this.updateAccountsView();
        this.updateTransactionsList(filtered);
        this.updateCategoriesList(filtered);
    }
};

// ===== GLOBAL INITIALIZATION =====
const app = BudgetApp;
window.addEventListener('DOMContentLoaded', () => {
    app.init();
});