import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, TrendingUp, TrendingDown, Target, BellRing, Plus, LogOut, Download, Lightbulb, Settings as SettingsIcon, X, AlertTriangle, CheckCircle, Car, Coffee, Film, ShoppingBag, GraduationCap, DollarSign, Trash2, Menu, Edit2 } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { PieChart as RechartsPieChart, Pie, Cell, ResponsiveContainer, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');

async function parseApiResponse(res) {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    if (text.trimStart().startsWith('<')) {
      throw new Error(
        'Could not reach the Fino API (got a web page instead of JSON). Start the backend: cd backend && node server.js — it must run on port 5000.'
      );
    }
    throw new Error('Unexpected response from server');
  }
}

const DEFAULT_BUDGETS = {
  Food: 0,
  Transport: 0,
  Entertainment: 0,
  Education: 0,
  Shopping: 0,
  Other: 0
};

/** Hydrate from localStorage so the UI renders before the API responds; normalizes missing fields. */
function normalizeStoredUser(raw) {
  if (!raw || raw.id == null) return null;
  const id = typeof raw.id === 'number' ? raw.id : Number(raw.id);
  if (Number.isNaN(id)) return null;
  return {
    ...raw,
    id,
    transactions: Array.isArray(raw.transactions) ? raw.transactions : [],
    budgets: { ...DEFAULT_BUDGETS, ...(typeof raw.budgets === 'object' && raw.budgets ? raw.budgets : {}) },
    goals: Array.isArray(raw.goals) ? raw.goals : [],
    savingsTarget: raw.savingsTarget != null ? Number(raw.savingsTarget) || 0 : 0,
    savingsSaved: raw.savingsSaved != null ? Number(raw.savingsSaved) || 0 : 0
  };
}

function formatTxDate(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

const TransactionModal = ({ isOpen, onClose, onSave, initialData }) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('Food');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setType(initialData.type || 'expense');
        setAmount(initialData.amount || '');
        setDesc(initialData.desc || '');
        setCategory(initialData.category || 'Food');
      } else {
        setType('expense');
        setAmount('');
        setDesc('');
        setCategory('Food');
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...(initialData ? { id: initialData.id } : {}),
      type,
      amount: parseFloat(amount, 10),
      desc: desc.trim(),
      category: type === 'expense' ? category : 'Income'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{initialData ? 'Edit Transaction' : 'Add Transaction'}</h2>
          <button type="button" onClick={onClose} className="text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:text-zinc-400"><X size={24} /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex gap-4 mb-4">
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-3 rounded-xl font-semibold ${type === 'expense' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'}`}
            >
              Expense
            </button>
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-3 rounded-xl font-semibold ${type === 'income' ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400'}`}
            >
              Income
            </button>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Amount (PKR)</label>
            <input type="number" required min="0.01" step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 1500" className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-xl" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Description</label>
            <input type="text" required value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="e.g. Groceries" className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-xl" />
          </div>

          {type === 'expense' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl bg-white dark:bg-zinc-900">
                <option value="Food">Food & Dining</option>
                <option value="Transport">Transportation</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Education">Education</option>
                <option value="Shopping">Shopping</option>
                <option value="Other">Other</option>
              </select>
            </div>
          )}

          <div className="flex gap-4 mt-8 pt-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400">Cancel</button>
            <button type="submit" className="flex-1 py-3 rounded-xl font-semibold bg-black text-white">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TransactionsView = ({ transactions, onDeleteTransaction, onEditTransaction }) => (
  <div className="p-4 sm:p-8">
    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">All Transactions</h2>
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm p-4 sm:p-6 space-y-2">
      {transactions.length === 0 ? (
        <p className="text-gray-500 dark:text-zinc-400 text-center py-8">No transactions yet. Add income or expenses from the header.</p>
      ) : (
        transactions.map((tx) => (
          <div key={tx.id} className="group flex items-center justify-between p-4 hover:bg-gray-50 dark:bg-zinc-950 rounded-xl border border-transparent transition-all">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                {tx.type === 'income' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              </div>
              <div>
                <p className="font-semibold">{tx.desc}</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400">{tx.category} • {formatTxDate(tx.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <p className={`font-bold ${tx.type === 'income' ? 'text-emerald-600' : 'text-red-600 dark:text-red-500'}`}>
                {tx.type === 'income' ? '+' : '-'}{Number(tx.amount || 0).toLocaleString()} PKR
              </p>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2 transition-all">
                <button onClick={() => onEditTransaction(tx)} className="p-2 text-gray-400 dark:text-zinc-500 hover:text-blue-600 rounded-lg hover:bg-blue-50" title="Edit transaction">
                  <Edit2 size={18} />
                </button>
                <button onClick={() => onDeleteTransaction(tx.id)} className="p-2 text-gray-400 dark:text-zinc-500 hover:text-red-600 rounded-lg hover:bg-red-50" title="Delete transaction">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  </div>
);

const BUDGET_META = [
  { key: 'Food', label: 'Food & Dining' },
  { key: 'Transport', label: 'Transportation' },
  { key: 'Entertainment', label: 'Entertainment' },
  { key: 'Education', label: 'Education' },
  { key: 'Shopping', label: 'Shopping' },
  { key: 'Other', label: 'Other' }
];

const BudgetsView = ({ transactions, budgets, userId, onBudgetsSaved }) => {
  const [local, setLocal] = useState(budgets);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setLocal({
      Food: 0,
      Transport: 0,
      Entertainment: 0,
      Education: 0,
      Shopping: 0,
      Other: 0,
      ...budgets
    });
  }, [budgets]);

  let totals = { Food: 0, Transport: 0, Entertainment: 0, Education: 0, Shopping: 0, Other: 0 };
  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    if (tx.type === 'expense' && totals[tx.category] != null) {
      totals[tx.category] += Number(tx.amount) || 0;
    }
  }

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch(`${API_BASE}/api/user/${userId}/budgets`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgets: local })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save budgets');
      onBudgetsSaved(data);
      setMessage('Budgets saved.');
    } catch (e) {
      setMessage(e.message || 'Could not save');
    }
    setSaving(false);
  };

  return (
    <div className="p-4 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-2">Monthly Budgets</h2>
      <p className="text-gray-500 dark:text-zinc-400 mb-6">Limits are yours—spent amounts come from transactions you add.</p>
      {message && <p className="text-sm text-orange-600 mb-4">{message}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BUDGET_META.map(({ key, label }) => {
          const spent = totals[key] || 0;
          const limit = local[key] ?? 0;
          const percentage = limit > 0 ? (spent / limit) * 100 : spent > 0 ? 100 : 0;
          const displayPercentage = Math.min(100, percentage);
          const isOver = limit > 0 && percentage >= 80;

          return (
            <div key={key} className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">{label}</h3>
                <span className={`text-sm font-medium ${limit <= 0 ? 'text-gray-400 dark:text-zinc-500' : isOver ? 'text-red-600' : 'text-orange-600'}`}>
                  {limit > 0 ? `${Math.round(percentage)}% used` : 'Set a limit'}
                </span>
              </div>
              <div className="w-full h-3 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-3">
                <div
                  className={`h-full rounded-full ${limit <= 0 ? 'bg-gray-200' : isOver ? 'bg-red-500' : 'bg-orange-500'}`}
                  style={{ width: `${displayPercentage}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 dark:text-zinc-400 font-medium mb-3">
                PKR {spent.toLocaleString()} spent
                {limit > 0 ? ` of PKR ${limit.toLocaleString()}` : ''}
              </p>
              <label className="block text-xs font-semibold text-gray-600 dark:text-zinc-400 mb-1">Monthly limit (PKR)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-600 rounded-lg bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                  value={local[key] === 0 ? '' : local[key]}
                  onChange={(e) => {
                    const v = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                    setLocal((prev) => ({ ...prev, [key]: v }));
                  }}
                  placeholder="0"
                />
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-black text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 text-sm"
                >
                  Save
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="mt-8 bg-black text-white px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
      >
        {saving ? 'Saving…' : 'Save budget limits'}
      </button>
    </div>
  );
};

const AddGoalModal = ({ isOpen, onClose, onCreate, creating }) => {
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setTargetAmount('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const target = parseFloat(targetAmount, 10);
    onCreate({
      name: name.trim(),
      targetAmount: Number.isFinite(target) && target >= 0 ? target : 0
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">New savings goal</h2>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Goal name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. New laptop, Trip to Hunza"
              className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-xl"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Target amount (PKR)</label>
            <input
              type="number"
              min="0"
              step="1"
              required
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="e.g. 50000"
              className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-xl"
            />
          </div>
          <p className="text-sm text-gray-500 dark:text-zinc-400">You can add money toward this goal after you create it.</p>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300">
              Cancel
            </button>
            <button type="submit" disabled={creating} className="flex-1 py-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50">
              {creating ? 'Creating…' : 'Create goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GoalsView = ({ user, userId, onSaved }) => {
  const [goals, setGoals] = useState(user.goals || []);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [depositByGoal, setDepositByGoal] = useState({});
  const [contributingId, setContributingId] = useState(null);
  const [expandedGoalId, setExpandedGoalId] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setGoals(user.goals || []);
  }, [user.goals]);

  const handleGoalChange = (id, field, value) => {
    setGoals(goals.map(g => g.id === id ? { ...g, [field]: value } : g));
  };

  const normalizeGoalsPayload = (list) =>
    list.map((g) => ({
      id: g.id,
      name: String(g.name || 'Untitled Goal'),
      targetAmount: Number(g.targetAmount) || 0,
      savedAmount: Number(g.savedAmount) || 0
    }));

  const saveGoalsToServer = async (nextGoals) => {
    const res = await fetch(`${API_BASE}/api/user/${userId}/goals`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goals: normalizeGoalsPayload(nextGoals) })
    });
    const data = await parseApiResponse(res);
    if (!res.ok) throw new Error(data.error || 'Failed to save goals');
    return data;
  };

  const handleCreateGoal = async ({ name, targetAmount }) => {
    setCreating(true);
    setMsg('');
    const trimmedName = name.trim();
    const target = Number(targetAmount);
    const newGoal = {
      id: Date.now(),
      name: trimmedName,
      targetAmount: Number.isFinite(target) && target >= 0 ? target : 0,
      savedAmount: 0
    };
    const nextGoals = [...goals, newGoal];

    try {
      let data;
      const res = await fetch(`${API_BASE}/api/user/${userId}/goals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmedName, targetAmount: newGoal.targetAmount })
      });

      if (res.ok) {
        data = await parseApiResponse(res);
      } else {
        let errBody = {};
        try {
          errBody = await parseApiResponse(res);
        } catch (parseErr) {
          if (res.status === 400) throw parseErr;
        }
        if (res.status === 400) {
          throw new Error(errBody.error || 'Failed to create goal');
        }
        data = await saveGoalsToServer(nextGoals);
      }

      onSaved(data);
      setGoals(data.goals || nextGoals);
      setShowAddGoal(false);
      setMsg(`Goal "${trimmedName}" created. Add money whenever you save up.`);
    } catch (e) {
      setMsg(e.message || 'Error');
    }
    setCreating(false);
  };

  const handleContribute = async (goalId) => {
    const raw = depositByGoal[goalId];
    const amount = parseFloat(raw, 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      setMsg('Enter an amount greater than zero.');
      return;
    }
    setContributingId(goalId);
    setMsg('');
    const previousGoals = goals;
    const updatedGoals = goals.map((g) =>
      String(g.id) === String(goalId)
        ? { ...g, savedAmount: (Number(g.savedAmount) || 0) + amount }
        : g
    );
    setGoals(updatedGoals);

    try {
      let data;
      const contributeRes = await fetch(`${API_BASE}/api/user/${userId}/goals/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalId, amount })
      });
      if (contributeRes.ok) {
        data = await parseApiResponse(contributeRes);
      } else if (contributeRes.status === 400) {
        const errBody = await parseApiResponse(contributeRes);
        throw new Error(errBody.error || 'Failed to add money');
      } else {
        data = await saveGoalsToServer(updatedGoals);
      }

      onSaved(data);
      setGoals(data.goals || updatedGoals);
      setDepositByGoal((prev) => ({ ...prev, [goalId]: '' }));
      const goal = (data.goals || updatedGoals).find((g) => String(g.id) === String(goalId));
      setMsg(
        goal
          ? `Added PKR ${amount.toLocaleString()} to "${goal.name}".`
          : `Added PKR ${amount.toLocaleString()} to your goal.`
      );
    } catch (e) {
      setGoals(previousGoals);
      setMsg(e.message || 'Could not add money. Is the backend running on port 5000?');
    }
    setContributingId(null);
  };

  const removeGoal = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      const data = await saveGoalsToServer(goals);
      onSaved(data);
      setGoals(data.goals || goals);
      setMsg('Goal details saved.');
    } catch (e) {
      setMsg(e.message || 'Error');
    }
    setSaving(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <AddGoalModal isOpen={showAddGoal} onClose={() => setShowAddGoal(false)} onCreate={handleCreateGoal} creating={creating} />
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">Savings Goals</h2>
      <p className="text-gray-500 dark:text-zinc-400 mb-6">Create a goal with a target, then add money each time you set funds aside.</p>
      {msg && (
        <p className={`text-sm mb-4 p-3 rounded-xl font-medium ${msg.includes('Enter') || msg.includes('Error') || msg.includes('Failed') ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400' : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400'}`}>
          {msg}
        </p>
      )}
      
      <div className="space-y-6 mb-6">
        {goals.map((g) => {
          const tNum = parseFloat(g.targetAmount) || 0;
          const sNum = parseFloat(g.savedAmount) || 0;
          const pct = tNum > 0 ? Math.min(100, Math.round((sNum / tNum) * 100)) : 0;
          return (
            <div key={g.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm relative overflow-hidden transition-all duration-300">
              <div 
                className="p-6 sm:p-8 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-zinc-800/50"
                onClick={() => setExpandedGoalId(expandedGoalId === g.id ? null : g.id)}
              >
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-zinc-100">{g.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                    PKR {sNum.toLocaleString()} / PKR {tNum.toLocaleString()}
                  </p>
                </div>
                
                <div className="flex-1 max-w-xs w-full">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-semibold text-gray-500 dark:text-zinc-400">Progress</span>
                    <span className="text-sm font-bold text-emerald-600">{tNum > 0 ? `${pct}%` : '—'}</span>
                  </div>
                  <div className="w-full h-3 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${tNum > 0 ? pct : 0}%` }} />
                  </div>
                </div>
              </div>

              {expandedGoalId === g.id && (
                <div className="p-6 sm:p-8 border-t border-gray-100 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 relative">
                  <button onClick={() => removeGoal(g.id)} className="absolute top-6 right-6 text-gray-400 dark:text-zinc-500 hover:text-red-500" title="Delete Goal"><X size={20}/></button>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pr-8">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Goal Name</label>
                      <input type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-600 rounded-xl font-medium bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100" value={g.name} onChange={(e) => handleGoalChange(g.id, 'name', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Target amount (PKR)</label>
                      <input type="number" min="0" className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-xl" value={g.targetAmount === 0 ? '' : g.targetAmount} onChange={(e) => handleGoalChange(g.id, 'targetAmount', e.target.value)} />
                    </div>
                  </div>
                  
                  {tNum > 0 && sNum < tNum && (
                    <p className="text-sm text-gray-500 dark:text-zinc-400 mb-4">PKR {Math.max(0, tNum - sNum).toLocaleString()} left to reach your target</p>
                  )}
                  {tNum > 0 && sNum >= tNum && (
                    <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-4 font-medium">Target reached — great work!</p>
                  )}
                  
                  <div className="pt-4 border-t border-gray-200 dark:border-zinc-700">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-zinc-300 mb-2">Add money to this goal</label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input type="number" min="0.01" step="1" placeholder="Amount in PKR" value={depositByGoal[g.id] ?? ''} onChange={(e) => setDepositByGoal((prev) => ({ ...prev, [g.id]: e.target.value }))} className="flex-1 px-4 py-3 border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 rounded-xl" />
                      <button type="button" onClick={() => handleContribute(g.id)} disabled={contributingId === g.id} className="px-6 py-3 rounded-xl font-semibold bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 whitespace-nowrap">{contributingId === g.id ? 'Adding…' : 'Add money'}</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {goals.length === 0 && (
          <p className="text-gray-500 dark:text-zinc-400 italic p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm text-center">No goals yet. Create one and start adding money toward it.</p>
        )}
      </div>
      
      <div className="flex gap-4">
        <button type="button" onClick={() => setShowAddGoal(true)} className="bg-white dark:bg-zinc-900 border-2 border-dashed border-gray-300 dark:border-zinc-700 text-gray-600 dark:text-zinc-400 px-8 py-3 rounded-xl font-semibold hover:border-emerald-400 hover:text-emerald-600 flex items-center gap-2">
          <Plus size={20} /> Add new goal
        </button>
        {goals.length > 0 && (
          <button type="button" onClick={handleSave} disabled={saving} className="bg-black dark:bg-zinc-100 dark:text-zinc-900 text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50">
            {saving ? 'Saving…' : 'Save name & target changes'}
          </button>
        )}
      </div>
    </div>
  );
};

const ReportsView = ({ transactions, userName }) => {
  const downloadCsv = () => {
    const rows = [['Date', 'Type', 'Category', 'Description', 'Amount (PKR)']];
    for (let i = 0; i < transactions.length; i++) {
      const tx = transactions[i];
      rows.push([tx.createdAt || '', tx.type, tx.category, `"${(tx.desc || '').replace(/"/g, '""')}"`, String(tx.amount)]);
    }
    const blob = new Blob([rows.map((r) => r.join(',')).join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fino-transactions-${(userName || 'export').replace(/\s+/g, '-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Export Reports</h2>
      <div className="bg-white dark:bg-zinc-900 p-6 sm:p-10 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm max-w-lg">
        <h3 className="text-xl font-bold mb-3">Download your data</h3>
        <p className="text-gray-500 dark:text-zinc-400 mb-8">
          Export everything you have logged as a CSV file. Open it in Excel or Google Sheets.
        </p>
        <button
          type="button"
          onClick={downloadCsv}
          className="bg-black text-white px-8 py-3 rounded-full font-semibold w-full disabled:opacity-50"
          disabled={transactions.length === 0}
        >
          {transactions.length === 0 ? 'No transactions to export' : 'Download CSV'}
        </button>
      </div>
    </div>
  );
};

function computeInsights(transactions, budgets) {
  const tips = [];
  const expenseByCat = { Food: 0, Transport: 0, Entertainment: 0, Education: 0, Shopping: 0, Other: 0 };
  for (let i = 0; i < transactions.length; i++) {
    const tx = transactions[i];
    if (tx.type === 'expense' && expenseByCat[tx.category] != null) {
      expenseByCat[tx.category] += Number(tx.amount) || 0;
    }
  }
  const entries = Object.entries(expenseByCat).filter(([, v]) => v > 0);
  entries.sort((a, b) => b[1] - a[1]);
  if (entries.length > 0) {
    const [top, amt] = entries[0];
    tips.push({
      tone: 'neutral',
      title: 'Top spending category',
      body: `So far you have spent the most on ${top}: PKR ${amt.toLocaleString()}.`
    });
  } else {
    tips.push({
      tone: 'neutral',
      title: 'No expense data yet',
      body: 'Add a few expenses to see summaries based on your own activity.'
    });
  }

  for (let i = 0; i < BUDGET_META.length; i++) {
    const { key, label } = BUDGET_META[i];
    const limit = budgets[key] ?? 0;
    const spent = expenseByCat[key] || 0;
    if (limit > 0 && spent >= limit * 0.8) {
      tips.push({
        tone: spent >= limit ? 'alert' : 'warn',
        title: `${label} budget`,
        body:
          spent >= limit
            ? `You are at or over your limit (PKR ${spent.toLocaleString()} of PKR ${limit.toLocaleString()}).`
            : `You have used about ${Math.round((spent / limit) * 100)}% of your ${label} budget (PKR ${spent.toLocaleString()} of PKR ${limit.toLocaleString()}).`
      });
    }
  }

  return tips;
}

const InsightsView = ({ transactions, budgets }) => {
  const tips = computeInsights(transactions, budgets);

  return (
    <div className="p-4 sm:p-8">
      <h2 className="text-xl sm:text-2xl font-bold mb-2">Insights</h2>
      <p className="text-gray-500 dark:text-zinc-400 mb-6">Simple summaries from your transactions and budget limits—no generic advice.</p>
      <div className="space-y-4 max-w-3xl">
        {tips.map((tip, idx) => (
          <div
            key={idx}
            className={`p-6 rounded-2xl flex gap-4 ${
              tip.tone === 'alert' ? 'bg-red-50 border border-red-100' : tip.tone === 'warn' ? 'bg-orange-50 border border-orange-100' : 'bg-zinc-50 border border-zinc-100'
            }`}
          >
            <div>
              <h3 className={`font-bold mb-1 ${tip.tone === 'alert' ? 'text-red-900' : tip.tone === 'warn' ? 'text-orange-900' : 'text-zinc-900'}`}>{tip.title}</h3>
              <p className={tip.tone === 'alert' ? 'text-red-800' : tip.tone === 'warn' ? 'text-orange-800' : 'text-zinc-700'}>{tip.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsView = ({ user, userId, onSaved }) => {
  const [name, setName] = useState(user.name || '');
  const [income, setIncome] = useState(user.income || '');
  const [occupation, setOccupation] = useState(user.occupation || '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setName(user.name || '');
    setIncome(user.income || '');
    setOccupation(user.occupation || '');
  }, [user]);

  const handleSave = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch(`${API_BASE}/api/user/${userId}/profile`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, income, occupation })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      onSaved(data);
      setMsg('Settings saved successfully.');
    } catch (e) {
      setMsg(e.message || 'Error saving settings');
    }
    setSaving(false);
  };

  return (
    <div className="p-4 sm:p-8 max-w-4xl">
      <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Account Settings</h2>
      {msg && <p className={`text-sm mb-6 p-4 rounded-xl font-medium ${msg.includes('success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{msg}</p>}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
          <h3 className="text-xl font-bold mb-4 border-b pb-4">Personal Info</h3>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-zinc-300">Full Name</label>
            <input type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-zinc-300">Email Address</label>
            <input type="email" value={user.email} disabled className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950 text-gray-500 dark:text-zinc-400 rounded-xl cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-zinc-300">Occupation</label>
            <input type="text" className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none" value={occupation} onChange={(e) => setOccupation(e.target.value)} placeholder="e.g. Student, Engineer" />
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm space-y-6">
            <h3 className="text-xl font-bold mb-4 border-b pb-4">Financial Settings</h3>
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-zinc-300">Base Monthly Income (PKR)</label>
              <input type="number" min="0" className="w-full px-4 py-3 border border-gray-300 dark:border-zinc-700 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none" value={income} onChange={(e) => setIncome(e.target.value)} />
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-2">Update your expected monthly income.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-end">
        <button type="button" onClick={handleSave} disabled={saving || !name.trim()} className="bg-black text-white px-10 py-4 rounded-xl font-bold shadow-lg hover:bg-gray-800 disabled:opacity-50 transition-all">
          {saving ? 'Saving...' : 'Save All Changes'}
        </button>
      </div>
    </div>
  );
};

const DashboardBudgetWidget = ({ budgetData, userId, getCategoryIcon, onBudgetsSaved }) => {
  const [local, setLocal] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const initial = {};
    budgetData.forEach(b => { initial[b.key] = b.limit; });
    setLocal(initial);
  }, [budgetData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/user/${userId}/budgets`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ budgets: local })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      onBudgetsSaved(data);
    } catch (e) {
      alert(e.message || 'Could not save');
    }
    setSaving(false);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg sm:text-xl font-bold">Budget by Category</h3>
        <button onClick={handleSave} disabled={saving} className="text-sm font-semibold bg-orange-100 text-orange-600 px-4 py-2 rounded-lg hover:bg-orange-200 disabled:opacity-50">
          {saving ? 'Saving...' : 'Save Budgets'}
        </button>
      </div>
      <div className="space-y-6">
        {budgetData.map((b) => {
          const limit = local[b.key] ?? b.limit;
          const percentage = limit > 0 ? (b.spent / limit) * 100 : b.spent > 0 ? 100 : 0;
          const displayPercentage = Math.min(100, percentage);
          const isOver = limit > 0 && percentage >= 80;
          return (
            <div key={b.key}>
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-2">
                  {getCategoryIcon(b.key)}
                  {b.label}
                </span>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <span className="text-gray-500 dark:text-zinc-400">PKR {b.spent.toLocaleString()} /</span>
                  <input
                    type="number"
                    min="0"
                    className="w-24 px-2 py-1 border border-gray-200 dark:border-zinc-800 rounded-md text-right focus:outline-none focus:ring-2 focus:ring-orange-500"
                    value={local[b.key] === 0 ? '' : local[b.key]}
                    onChange={(e) => {
                      const v = e.target.value === '' ? 0 : Math.max(0, Number(e.target.value));
                      setLocal((prev) => ({ ...prev, [b.key]: v }));
                    }}
                    placeholder="Limit"
                  />
                  <button onClick={handleSave} disabled={saving} className="bg-orange-100 text-orange-600 px-2 py-1 rounded text-xs hover:bg-orange-200 font-semibold disabled:opacity-50">
                    Save
                  </button>
                </div>
              </div>
              <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${limit <= 0 ? 'bg-emerald-500' : isOver ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${displayPercentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      if (!stored) return null;
      return normalizeStoredUser(JSON.parse(stored));
    } catch {
      return null;
    }
  });
  const [loadError, setLoadError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setIsMobileMenuOpen(false);
  };

  const persistUser = useCallback((next) => {
    setUser(next);
    localStorage.setItem('user', JSON.stringify(next));
  }, []);

  const refreshUser = useCallback(async (userId) => {
    const res = await fetch(`${API_BASE}/api/user/${userId}`);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Could not load your data');
    }
    const data = await res.json();
    persistUser(data);
    return data;
  }, [persistUser]);

  useEffect(() => {
    if (!user?.id) {
      navigate('/auth', { replace: true });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        await refreshUser(user.id);
        if (!cancelled) setLoadError('');
      } catch (e) {
        if (cancelled) return;
        const msg = e.message || 'Failed to sync with server';
        if (msg === 'User not found') {
          localStorage.removeItem('user');
          setUser(null);
          navigate('/auth', { replace: true });
          return;
        }
        setLoadError(msg);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [navigate, refreshUser, user?.id]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleAddTransaction = async (payload) => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_BASE}/api/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...payload })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not save transaction');
      persistUser(data.user);
    } catch (e) {
      alert(e.message || 'Failed to add transaction');
    }
  };

  const handleEditTransaction = async (txData) => {
    if (!user?.id) return;
    try {
      const res = await fetch(`${API_BASE}/api/user/${user.id}/transactions/${txData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(txData)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not edit transaction');
      persistUser(data.user);
    } catch (e) {
      alert(e.message || 'Failed to edit transaction');
    }
  };

  const handleDeleteTransaction = async (txId) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/user/${user.id}/transactions/${txId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not delete transaction');
      persistUser(data.user);
    } catch (e) {
      alert(e.message || 'Failed to delete transaction');
    }
  };

  if (!user) return null;

  const transactionsList = user.transactions || [];
  const budgets = user.budgets || {};

  let baseIncome = user.income ? parseInt(user.income, 10) : 0;
  if (Number.isNaN(baseIncome)) baseIncome = 0;
  let totalIncome = baseIncome;
  let totalExpenses = 0;

  for (let i = 0; i < transactionsList.length; i++) {
    const tx = transactionsList[i];
    if (tx.type === 'income') totalIncome += Number(tx.amount) || 0;
    else if (tx.type === 'expense') totalExpenses += Number(tx.amount) || 0;
  }

  const totalBalance = totalIncome - totalExpenses;

  let foodTotal = 0;
  let transportTotal = 0;
  let entertainmentTotal = 0;
  let educationTotal = 0;
  let shoppingTotal = 0;
  let otherTotal = 0;

  for (let i = 0; i < transactionsList.length; i++) {
    const tx = transactionsList[i];
    if (tx.type === 'expense') {
      const amt = Number(tx.amount) || 0;
      if (tx.category === 'Food') foodTotal += amt;
      else if (tx.category === 'Transport') transportTotal += amt;
      else if (tx.category === 'Entertainment') entertainmentTotal += amt;
      else if (tx.category === 'Education') educationTotal += amt;
      else if (tx.category === 'Shopping') shoppingTotal += amt;
      else otherTotal += amt;
    }
  }

  const dynamicSpendingData = [];
  if (foodTotal > 0) dynamicSpendingData.push({ name: 'Food', value: foodTotal, color: '#f97316' });
  if (transportTotal > 0) dynamicSpendingData.push({ name: 'Transport', value: transportTotal, color: '#f59e0b' });
  if (entertainmentTotal > 0) dynamicSpendingData.push({ name: 'Entertainment', value: entertainmentTotal, color: '#eab308' });
  if (educationTotal > 0) dynamicSpendingData.push({ name: 'Education', value: educationTotal, color: '#3f3f46' });
  if (shoppingTotal > 0) dynamicSpendingData.push({ name: 'Shopping', value: shoppingTotal, color: '#ec4899' });
  if (otherTotal > 0) dynamicSpendingData.push({ name: 'Other', value: otherTotal, color: '#94a3b8' });

  const sortedTx = [...transactionsList].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const trendMap = {};
  sortedTx.forEach(tx => {
    const d = new Date(tx.createdAt);
    if (!isNaN(d)) {
      const dateStr = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!trendMap[dateStr]) {
        trendMap[dateStr] = { income: 0, spending: 0 };
      }
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'expense') {
        trendMap[dateStr].spending += amt;
      } else if (tx.type === 'income') {
        trendMap[dateStr].income += amt;
      }
    }
  });
  const trendData = Object.keys(trendMap).map(date => ({ date, ...trendMap[date] }));
  
  if (trendData.length === 1) {
    const singleDate = new Date(sortedTx[0]?.createdAt || new Date());
    singleDate.setDate(singleDate.getDate() - 1);
    const prevDateStr = singleDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    trendData.unshift({ date: prevDateStr, income: 0, spending: 0 });
  }
  
  const budgetData = BUDGET_META.map(meta => {
    let spent = 0;
    if (meta.key === 'Food') spent = foodTotal;
    else if (meta.key === 'Transport') spent = transportTotal;
    else if (meta.key === 'Entertainment') spent = entertainmentTotal;
    else if (meta.key === 'Education') spent = educationTotal;
    else if (meta.key === 'Shopping') spent = shoppingTotal;
    else spent = otherTotal;
    return { ...meta, spent, limit: budgets[meta.key] || 0 };
  });



  const insights = computeInsights(transactionsList, budgets);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case 'Food': return <Coffee size={16} className="text-gray-500 dark:text-zinc-400" />;
      case 'Transport': return <Car size={16} className="text-gray-500 dark:text-zinc-400" />;
      case 'Entertainment': return <Film size={16} className="text-gray-500 dark:text-zinc-400" />;
      case 'Shopping': return <ShoppingBag size={16} className="text-gray-500 dark:text-zinc-400" />;
      case 'Education': return <GraduationCap size={16} className="text-gray-500 dark:text-zinc-400" />;
      default: return <DollarSign size={16} className="text-gray-500 dark:text-zinc-400" />;
    }
  };

  const renderContent = () => {
    if (activeTab === 'dashboard') {
      return (
        <div className="p-4 sm:p-8">
          {loadError && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm">
              {loadError} — using last known data. Is the backend running on port 5000?
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <h3 className="text-gray-500 dark:text-zinc-400 font-medium mb-1">Total Balance</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-zinc-100">PKR {totalBalance.toLocaleString()}</p>
              <p className="text-xs text-gray-400 dark:text-zinc-500 mt-2">Net Available Funds</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <h3 className="text-gray-500 dark:text-zinc-400 font-medium mb-1">Total Income</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-zinc-100">PKR {totalIncome.toLocaleString()}</p>
            </div>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
              <h3 className="text-gray-500 dark:text-zinc-400 font-medium mb-1">Total Expenses</h3>
              <p className="text-3xl font-bold text-gray-900 dark:text-zinc-100">PKR {totalExpenses.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
            <div className="xl:col-span-2 space-y-8">
              {/* Spending Trends Chart */}
              <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <h3 className="text-lg sm:text-xl font-bold mb-6">Income vs Spending Trends</h3>
                {trendData.length > 0 ? (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorSpending" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} tickFormatter={val => `PKR ${val}`} dx={-10} />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value) => `PKR ${Number(value).toLocaleString()}`} 
                        />
                        <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                        <Area type="monotone" name="Income" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                        <Area type="monotone" name="Total Spending" dataKey="spending" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorSpending)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-400 dark:text-zinc-500 text-sm">No financial data to show trends.</div>
                )}
              </div>

              {/* Budget by Category (Editable directly on Dashboard) */}
              <DashboardBudgetWidget
                budgetData={budgetData}
                userId={user.id}
                getCategoryIcon={getCategoryIcon}
                onBudgetsSaved={persistUser}
              />
            </div>

            <div className="space-y-8">
              {/* Insights Section */}
              <div className="space-y-4">
                {insights.map((tip, idx) => {
                  let bgColor = 'bg-zinc-50 border-zinc-100';
                  let iconColor = 'text-zinc-600';
                  let titleColor = 'text-zinc-900';
                  let bodyColor = 'text-zinc-700';
                  let Icon = Lightbulb;
                  
                  if (tip.tone === 'alert') {
                    bgColor = 'bg-red-50 border-red-100';
                    iconColor = 'text-red-600';
                    titleColor = 'text-red-900';
                    bodyColor = 'text-red-800';
                    Icon = AlertTriangle;
                  } else if (tip.tone === 'warn') {
                    bgColor = 'bg-amber-50 border-amber-100';
                    iconColor = 'text-amber-600';
                    titleColor = 'text-amber-900';
                    bodyColor = 'text-amber-800';
                    Icon = AlertTriangle;
                  } else if (tip.tone === 'success') {
                    bgColor = 'bg-emerald-50 border-emerald-100';
                    iconColor = 'text-emerald-600';
                    titleColor = 'text-emerald-900';
                    bodyColor = 'text-emerald-800';
                    Icon = CheckCircle;
                  }
                  
                  return (
                    <div key={idx} className={`p-5 rounded-2xl flex gap-3 items-start border ${bgColor}`}>
                      <div className="mt-0.5">
                        <Icon size={18} className={iconColor} />
                      </div>
                      <div>
                        <h4 className={`font-bold mb-1 text-sm ${titleColor}`}>{tip.title}</h4>
                        <p className={`text-xs ${bodyColor}`}>{tip.body}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Goals Section */}
              <div className="bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-2xl border border-gray-100 dark:border-zinc-800 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg sm:text-xl font-bold">Goals</h3>
                  <button onClick={() => setActiveTab('goals')} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">Manage <Target size={14}/></button>
                </div>
                <div className="space-y-6">
                  {user.goals && user.goals.length > 0 ? (
                    user.goals.map((g) => {
                      const tNum = Number(g.targetAmount) || 0;
                      const sNum = Number(g.savedAmount) || 0;
                      const pct = tNum > 0 ? Math.min(100, Math.round((sNum / tNum) * 100)) : 0;
                      return (
                        <div key={g.id}>
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold text-gray-700 dark:text-zinc-300 flex items-center gap-2">
                              <Target size={16} className="text-gray-500 dark:text-zinc-400" />
                              {g.name}
                            </span>
                            <span className="text-sm font-medium text-gray-500 dark:text-zinc-400">{pct}% · PKR {sNum.toLocaleString()}{tNum > 0 ? ` / ${tNum.toLocaleString()}` : ''}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 dark:text-zinc-400">No goals set. Head to Savings Goals to create one.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
    if (activeTab === 'transactions') return <TransactionsView transactions={transactionsList} onDeleteTransaction={handleDeleteTransaction} onEditTransaction={setEditingTx} />;
    if (activeTab === 'goals') {
      return <GoalsView user={user} userId={user.id} onSaved={persistUser} />;
    }
    if (activeTab === 'budgets') {
      return (
        <BudgetsView
          transactions={transactionsList}
          budgets={budgets}
          userId={user.id}
          onBudgetsSaved={persistUser}
        />
      );
    }
    if (activeTab === 'reports') return <ReportsView transactions={transactionsList} userName={user.name} />;
    if (activeTab === 'insights') return <InsightsView transactions={transactionsList} budgets={budgets} />;
    if (activeTab === 'settings') return <SettingsView user={user} userId={user.id} onSaved={persistUser} />;
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex">
      <TransactionModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddTransaction} />
      <TransactionModal isOpen={!!editingTx} onClose={() => setEditingTx(null)} onSave={handleEditTransaction} initialData={editingTx} />

      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`w-64 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-zinc-800 flex flex-col h-screen fixed md:sticky top-0 z-40 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="h-20 flex justify-between items-center px-8 border-b border-gray-100 dark:border-zinc-800">
          <span className="font-bold text-xl text-gray-900 dark:text-zinc-100">Fino<span className="text-orange-600">.</span></span>
          <button className="md:hidden text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 py-8 px-4 space-y-1 overflow-y-auto">
          <button type="button" onClick={() => handleTabClick('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'dashboard' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}>
            <PieChart size={20} /> Dashboard
          </button>
          <button type="button" onClick={() => handleTabClick('transactions')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'transactions' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}>
            <TrendingUp size={20} /> Transactions
          </button>
          <button type="button" onClick={() => handleTabClick('goals')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'goals' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}>
            <Target size={20} /> Savings Goals
          </button>
          <button type="button" onClick={() => handleTabClick('budgets')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'budgets' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}>
            <BellRing size={20} /> Budgets
          </button>

          <div className="pt-6 pb-2 px-4">
            <p className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase">Tools & More</p>
          </div>

          <button type="button" onClick={() => handleTabClick('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'reports' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}>
            <Download size={20} /> Export Reports
          </button>
          <button type="button" onClick={() => handleTabClick('insights')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'insights' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}>
            <Lightbulb size={20} /> Insights
          </button>
          <button type="button" onClick={() => handleTabClick('settings')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium ${activeTab === 'settings' ? 'bg-orange-50 dark:bg-orange-950/40 text-orange-600' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}>
            <SettingsIcon size={20} /> Settings
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 dark:border-zinc-800 mt-auto">
          <button type="button" onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 w-full text-gray-600 dark:text-zinc-400 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 rounded-xl font-medium transition-colors">
            <LogOut size={20} /> Log Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-screen max-w-full overflow-hidden">
        <header className="h-20 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between px-4 sm:px-8 sticky top-0 z-10">
          <div className="flex items-center gap-3 overflow-hidden">
            <button className="md:hidden p-2 -ml-2 text-gray-600 dark:text-zinc-400" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu size={24} />
            </button>
            <h1 className="text-lg sm:text-2xl font-bold capitalize text-gray-900 dark:text-zinc-100 truncate max-w-[140px] sm:max-w-none">
              {activeTab === 'dashboard' ? `Welcome, ${user.name}!` : activeTab}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <ThemeToggle className="hidden sm:flex" />
            <button type="button" onClick={() => setIsModalOpen(true)} className="flex items-center gap-1 sm:gap-2 bg-black dark:bg-orange-600 text-white px-3 py-2 sm:px-5 sm:py-2.5 rounded-full font-semibold hover:bg-orange-600 dark:hover:bg-orange-500 transition-colors text-sm sm:text-base">
              <Plus size={18} /> <span className="hidden sm:inline">Add Transaction</span><span className="sm:hidden">Add</span>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
