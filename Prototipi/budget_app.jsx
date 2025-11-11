import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { PlusCircle, TrendingUp, TrendingDown, Wallet, DollarSign, CreditCard, Calendar, Filter, Download, Upload, X } from 'lucide-react';

const BudgetApp = () => {
  // Stati principali
  const [transactions, setTransactions] = useState([]);
  const [accounts, setAccounts] = useState([
    { id: 1, name: 'Conto Corrente', balance: 0 },
    { id: 2, name: 'Conto Risparmio', balance: 0 },
    { id: 3, name: 'Contanti', balance: 0 }
  ]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeView, setActiveView] = useState('dashboard');
  const [showAddTransaction, setShowAddTransaction] = useState(false);

  // Categorie
  const incomeCategories = ['Reddito Principale', 'Reddito Secondario', 'Affitto', 'Vendita', 'Altro'];
  const necessityCategories = [
    'Mutuo/Affitto', 'Elettricità', 'Gas', 'Acqua', 'Manutenzione Casa',
    'Tasse', 'Telefono/Internet', 'Assicurazione Casa', 'Spesa/Cibo',
    'Rate Auto', 'Assicurazione Auto', 'Benzina', 'Trasporti', 'Salute'
  ];
  const extraCategories = [
    'Ristorazione', 'Bar', 'Cinema/Uscite/Eventi', 'Abbonamenti Digitali',
    'Cura Personale', 'Donazioni e Regali', 'Divertimento', 'Arredamento',
    'Abbigliamento', 'Tecnologia', 'Sport', 'Viaggi', 'Altro'
  ];

  // Form per nuova transazione
  const [newTransaction, setNewTransaction] = useState({
    date: new Date().toISOString().split('T')[0],
    type: 'expense-necessity',
    amount: '',
    category: '',
    account: 1,
    description: ''
  });

  // Carica dati da localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('budgetTransactions');
    const savedAccounts = localStorage.getItem('budgetAccounts');
    if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
  }, []);

  // Salva dati in localStorage
  useEffect(() => {
    localStorage.setItem('budgetTransactions', JSON.stringify(transactions));
    localStorage.setItem('budgetAccounts', JSON.stringify(accounts));
  }, [transactions, accounts]);

  // Filtra transazioni per mese/anno
  const filteredTransactions = transactions.filter(t => {
    const date = new Date(t.date);
    return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
  });

  // Calcola statistiche
  const calculateStats = () => {
    let income = 0;
    let expenseNecessity = 0;
    let expenseExtra = 0;
    let investments = 0;

    filteredTransactions.forEach(t => {
      if (t.type === 'income') income += parseFloat(t.amount);
      else if (t.type === 'expense-necessity') expenseNecessity += parseFloat(t.amount);
      else if (t.type === 'expense-extra') expenseExtra += parseFloat(t.amount);
      else if (t.type === 'investment') investments += parseFloat(t.amount);
    });

    return {
      income,
      expenseNecessity,
      expenseExtra,
      totalExpenses: expenseNecessity + expenseExtra,
      investments,
      net: income - expenseNecessity - expenseExtra - investments
    };
  };

  const stats = calculateStats();

  // Aggiungi transazione
  const addTransaction = () => {
    if (!newTransaction.amount || !newTransaction.category) {
      alert('Compila tutti i campi obbligatori');
      return;
    }

    const transaction = {
      id: Date.now(),
      ...newTransaction,
      amount: parseFloat(newTransaction.amount)
    };

    setTransactions([...transactions, transaction]);
    setNewTransaction({
      date: new Date().toISOString().split('T')[0],
      type: 'expense-necessity',
      amount: '',
      category: '',
      account: 1,
      description: ''
    });
    setShowAddTransaction(false);
  };

  // Elimina transazione
  const deleteTransaction = (id) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  // Dati per grafico spese per categoria
  const expensesByCategory = () => {
    const categoryTotals = {};
    filteredTransactions
      .filter(t => t.type.includes('expense'))
      .forEach(t => {
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
      });
    return Object.entries(categoryTotals).map(([name, value]) => ({ name, value }));
  };

  // Dati per grafico andamento mensile
  const monthlyTrend = () => {
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date(selectedYear, selectedMonth - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === month && tDate.getFullYear() === year;
      });

      let income = 0, expenses = 0;
      monthTransactions.forEach(t => {
        if (t.type === 'income') income += t.amount;
        else if (t.type.includes('expense')) expenses += t.amount;
      });

      months.push({
        name: date.toLocaleDateString('it-IT', { month: 'short' }),
        Entrate: income,
        Uscite: expenses,
        Netto: income - expenses
      });
    }
    return months;
  };

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

  // Mesi in italiano
  const monthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
                      'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8 text-emerald-600" />
              <h1 className="text-3xl font-bold text-slate-800">Gestione Bilancio</h1>
            </div>
            <button
              onClick={() => setShowAddTransaction(true)}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
            >
              <PlusCircle className="w-5 h-5" />
              Nuova Transazione
            </button>
          </div>

          {/* Navigazione */}
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveView('dashboard')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'dashboard' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveView('transactions')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'transactions' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Transazioni
            </button>
            <button
              onClick={() => setActiveView('analysis')}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                activeView === 'analysis' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              }`}
            >
              Analisi
            </button>
          </div>

          {/* Selettore mese/anno */}
          <div className="flex gap-4 mt-4 items-center">
            <Calendar className="w-5 h-5 text-slate-600" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {monthNames.map((month, idx) => (
                <option key={idx} value={idx}>{month}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              {[2023, 2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Modal Nuova Transazione */}
      {showAddTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Nuova Transazione</h2>
                <button onClick={() => setShowAddTransaction(false)} className="text-slate-500 hover:text-slate-700">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Data</label>
                  <input
                    type="date"
                    value={newTransaction.date}
                    onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tipo</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) => setNewTransaction({...newTransaction, type: e.target.value, category: ''})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="income">Entrata</option>
                    <option value="expense-necessity">Spesa di Necessità</option>
                    <option value="expense-extra">Spesa Extra</option>
                    <option value="investment">Investimento/Risparmio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Categoria</label>
                  <select
                    value={newTransaction.category}
                    onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="">Seleziona categoria</option>
                    {newTransaction.type === 'income' && incomeCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {newTransaction.type === 'expense-necessity' && necessityCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {newTransaction.type === 'expense-extra' && extraCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                    {newTransaction.type === 'investment' && (
                      <>
                        <option value="Investimenti">Investimenti</option>
                        <option value="Risparmio">Risparmio</option>
                      </>
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Importo (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={newTransaction.amount}
                    onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Conto</label>
                  <select
                    value={newTransaction.account}
                    onChange={(e) => setNewTransaction({...newTransaction, account: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Descrizione (opzionale)</label>
                  <input
                    type="text"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="Note aggiuntive..."
                  />
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={addTransaction}
                    className="flex-1 bg-emerald-600 text-white px-6 py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                  >
                    Aggiungi Transazione
                  </button>
                  <button
                    onClick={() => setShowAddTransaction(false)}
                    className="px-6 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors font-medium"
                  >
                    Annulla
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Contenuto principale */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Entrate</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">€{stats.income.toFixed(2)}</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-emerald-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Uscite Totali</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">€{stats.totalExpenses.toFixed(2)}</p>
                  </div>
                  <TrendingDown className="w-12 h-12 text-red-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Netto</p>
                    <p className={`text-3xl font-bold mt-2 ${stats.net >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      €{stats.net.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="w-12 h-12 text-blue-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-medium">Investimenti</p>
                    <p className="text-3xl font-bold text-slate-800 mt-2">€{stats.investments.toFixed(2)}</p>
                  </div>
                  <CreditCard className="w-12 h-12 text-purple-500" />
                </div>
              </div>
            </div>

            {/* Breakdown Spese */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Dettaglio Spese</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                    <span className="font-medium text-slate-700">Spese di Necessità</span>
                    <span className="font-bold text-orange-600">€{stats.expenseNecessity.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-slate-700">Spese Extra</span>
                    <span className="font-bold text-blue-600">€{stats.expenseExtra.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-slate-100 rounded-lg border-t-2 border-slate-300">
                    <span className="font-bold text-slate-800">Totale</span>
                    <span className="font-bold text-slate-800">€{stats.totalExpenses.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-xl font-bold text-slate-800 mb-4">Distribuzione Spese</h3>
                {expensesByCategory().length > 0 ? (
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={expensesByCategory().slice(0, 8)}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expensesByCategory().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-slate-500 py-12">Nessuna spesa registrata</p>
                )}
              </div>
            </div>

            {/* Andamento Ultimi 6 Mesi */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Andamento Ultimi 6 Mesi</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="Entrate" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="Uscite" stroke="#ef4444" strokeWidth={2} />
                  <Line type="monotone" dataKey="Netto" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Transactions View */}
        {activeView === 'transactions' && (
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">
              Transazioni - {monthNames[selectedMonth]} {selectedYear}
            </h2>
            
            {filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-500 text-lg">Nessuna transazione per questo mese</p>
                <button
                  onClick={() => setShowAddTransaction(true)}
                  className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Aggiungi la prima transazione
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Data</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Categoria</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">Descrizione</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-slate-700">Importo</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-slate-700">Azioni</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {filteredTransactions.sort((a, b) => new Date(b.date) - new Date(a.date)).map(t => (
                      <tr key={t.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {new Date(t.date).toLocaleDateString('it-IT')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            t.type === 'income' ? 'bg-emerald-100 text-emerald-800' :
                            t.type === 'expense-necessity' ? 'bg-orange-100 text-orange-800' :
                            t.type === 'expense-extra' ? 'bg-blue-100 text-blue-800' :
                            'bg-purple-100 text-purple-800'
                          }`}>
                            {t.type === 'income' ? 'Entrata' :
                             t.type === 'expense-necessity' ? 'Necessità' :
                             t.type === 'expense-extra' ? 'Extra' : 'Investimento'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">{t.category}</td>
                        <td className="px-4 py-3 text-sm text-slate-600">{t.description || '-'}</td>
                        <td className={`px-4 py-3 text-sm font-semibold text-right ${
                          t.type === 'income' ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {t.type === 'income' ? '+' : '-'}€{t.amount.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => deleteTransaction(t.id)}
                            className="text-red-600 hover:text-red-800 font-medium text-sm"
                          >
                            Elimina
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Analysis View */}
        {activeView === 'analysis' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Analisi per Categoria</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={expensesByCategory()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-2xl font-bold text-slate-800 mb-6">Riepilogo Mensile</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-slate-600 font-medium">Media Entrate/Mese</p>
                  <p className="text-2xl font-bold text-emerald-600 mt-2">
                    €{(monthlyTrend().reduce((sum, m) => sum + m.Entrate, 0) / 6).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <p className="text-sm text-slate-600 font-medium">Media Uscite/Mese</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">
                    €{(monthlyTrend().reduce((sum, m) => sum + m.Uscite, 0) / 6).toFixed(2)}
                  </p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-slate-600 font-medium">Media Netto/Mese</p>
                  <p className="text-2xl font-bold text-blue-600 mt-2">
                    €{(monthlyTrend().reduce((sum, m) => sum + m.Netto, 0) / 6).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetApp;