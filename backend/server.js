require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./model/User');

const app = express();
app.use(cors());
app.use(express.json());

// Root health check route
app.get('/', (req, res) => {
  res.json({ status: 'healthy', message: 'Fino Backend API is running' });
});

mongoose.connect(process.env.MONGO_URI || 'mongodb://ahsanprog:Ahsan.malik%401176@ac-hl77z6z-shard-00-00.6o78cnp.mongodb.net:27017,ac-hl77z6z-shard-00-01.6o78cnp.mongodb.net:27017,ac-hl77z6z-shard-00-02.6o78cnp.mongodb.net:27017/fino?ssl=true&replicaSet=atlas-tefby5-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Fino')
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('MongoDB connection error:', err));

const EMPTY_BUDGETS = () => ({
  Food: 0,
  Transport: 0,
  Entertainment: 0,
  Education: 0,
  Shopping: 0,
  Other: 0
});

function sanitizeUser(user) {
  const obj = user.toObject ? user.toObject() : user;
  delete obj.password;
  delete obj._id;
  delete obj.__v;
  if (obj.transactions) {
    obj.transactions.forEach(t => { delete t._id; });
  }
  if (obj.goals) {
    obj.goals.forEach(g => { delete g._id; });
  }
  return obj;
}

async function ensureFinanceState(user) {
  let changed = false;
  if (!user.budgets) {
    user.budgets = EMPTY_BUDGETS();
    changed = true;
  } else {
    const empty = EMPTY_BUDGETS();
    for (const key of Object.keys(empty)) {
      if (user.budgets[key] == null) {
        user.budgets[key] = 0;
        changed = true;
      }
    }
  }

  if (user.savingsTarget == null) { user.savingsTarget = 0; changed = true; }
  if (user.savingsSaved == null) { user.savingsSaved = 0; changed = true; }

  if (changed) {
    user.markModified('budgets');
    user.markModified('goals');
    await user.save();
  }
  return user;
}

function budgetsFromIncome(incomeStr) {
  const inc = parseInt(incomeStr, 10) || 0;
  if (inc <= 0) return EMPTY_BUDGETS();
  return {
    Food: Math.round(inc * 0.35),
    Transport: Math.round(inc * 0.12),
    Entertainment: Math.round(inc * 0.13),
    Education: Math.round(inc * 0.25),
    Shopping: Math.round(inc * 0.1),
    Other: Math.max(0, inc - Math.round(inc * 0.35) - Math.round(inc * 0.12) - Math.round(inc * 0.13) - Math.round(inc * 0.25) - Math.round(inc * 0.1))
  };
}

app.post('/api/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      id: Date.now(),
      name,
      email,
      password: hashedPassword,
      onboardingCompleted: false,
      transactions: [],
      budgets: EMPTY_BUDGETS(),
      savingsTarget: 0,
      savingsSaved: 0
    });

    await user.save();
    res.status(201).json({ message: 'User created successfully', user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      if (user.password === password) {
        user.password = await bcrypt.hash(password, 10);
        await user.save();
      } else {
        return res.status(401).json({ error: 'Invalid email or password' });
      }
    }

    await ensureFinanceState(user);
    res.status(200).json({ message: 'Login successful', user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/user/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: Number(req.params.id) });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await ensureFinanceState(user);
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/onboarding', async (req, res) => {
  try {
    const { userId, income, primaryGoal, occupation } = req.body;
    const user = await User.findOne({ id: Number(userId) });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await ensureFinanceState(user);
    user.income = income;
    user.primaryGoal = primaryGoal;
    user.occupation = occupation;
    user.onboardingCompleted = true;
    user.budgets = budgetsFromIncome(income);

    user.markModified('budgets');
    await user.save();
    res.status(200).json({ message: 'Onboarding completed successfully', user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { userId, type, amount, desc, category } = req.body;
    if (!userId || !type || amount == null || !desc) {
      return res.status(400).json({ error: 'userId, type, amount, and description are required' });
    }

    const user = await User.findOne({ id: Number(userId) });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await ensureFinanceState(user);

    const num = Number(amount);
    if (Number.isNaN(num) || num <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    const tx = {
      id: Date.now(),
      type,
      amount: num,
      desc: String(desc).trim(),
      category: type === 'income' ? 'Income' : category || 'Other',
      createdAt: new Date().toISOString()
    };

    user.transactions.unshift(tx);
    user.markModified('transactions');
    await user.save();

    res.status(201).json({ transaction: tx, user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/user/:userId/transactions/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: Number(req.params.userId) });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await ensureFinanceState(user);

    const txId = Number(req.params.id);
    const initialLength = user.transactions.length;
    user.transactions = user.transactions.filter(t => t.id !== txId);

    if (user.transactions.length === initialLength) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    user.markModified('transactions');
    await user.save();
    res.json({ message: 'Deleted', user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/user/:userId/transactions/:id', async (req, res) => {
  try {
    const user = await User.findOne({ id: Number(req.params.userId) });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await ensureFinanceState(user);

    const txId = Number(req.params.id);
    const txIndex = user.transactions.findIndex(t => t.id === txId);
    if (txIndex === -1) return res.status(404).json({ error: 'Transaction not found' });

    const { type, amount, desc, category } = req.body;
    const num = Number(amount);
    if (Number.isNaN(num) || num <= 0) return res.status(400).json({ error: 'Amount must be positive' });

    user.transactions[txIndex].type = type || user.transactions[txIndex].type;
    user.transactions[txIndex].amount = num;
    user.transactions[txIndex].desc = desc ? String(desc).trim() : user.transactions[txIndex].desc;
    user.transactions[txIndex].category = type === 'income' ? 'Income' : (category || user.transactions[txIndex].category);

    user.markModified('transactions');
    await user.save();
    res.json({ transaction: user.transactions[txIndex], user: sanitizeUser(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/user/:id/profile', async (req, res) => {
  try {
    const { name, income, occupation } = req.body;
    const user = await User.findOne({ id: Number(req.params.id) });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (name != null && String(name).trim()) user.name = String(name).trim();
    if (income != null) user.income = income;
    if (occupation != null) user.occupation = String(occupation).trim();

    await user.save();
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/user/:id/budgets', async (req, res) => {
  try {
    const { budgets } = req.body;
    const user = await User.findOne({ id: Number(req.params.id) });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await ensureFinanceState(user);
    if (!budgets || typeof budgets !== 'object') {
      return res.status(400).json({ error: 'budgets object is required' });
    }

    const next = EMPTY_BUDGETS();
    for (const key of Object.keys(next)) {
      const v = Number(budgets[key]);
      next[key] = Number.isFinite(v) && v >= 0 ? v : 0;
    }
    user.budgets = next;
    user.markModified('budgets');
    await user.save();
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/user/:id/savings-goal', async (req, res) => {
  try {
    const { savingsTarget, savingsSaved } = req.body;
    const user = await User.findOne({ id: Number(req.params.id) });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await ensureFinanceState(user);
    if (savingsTarget != null) {
      const t = Number(savingsTarget);
      user.savingsTarget = Number.isFinite(t) && t >= 0 ? t : 0;
    }
    if (savingsSaved != null) {
      const s = Number(savingsSaved);
      user.savingsSaved = Number.isFinite(s) && s >= 0 ? s : 0;
    }

    await user.save();
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/:id/goals', async (req, res) => {
  try {
    const { name, targetAmount } = req.body;
    const user = await User.findOne({ id: Number(req.params.id) });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await ensureFinanceState(user);
    const trimmedName = String(name || '').trim();
    if (!trimmedName) return res.status(400).json({ error: 'Goal name is required' });

    const target = Number(targetAmount);
    const goal = {
      id: Date.now(),
      name: trimmedName,
      targetAmount: Number.isFinite(target) && target >= 0 ? target : 0,
      savedAmount: 0
    };
    user.goals.push(goal);
    user.markModified('goals');
    await user.save();
    res.status(201).json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

async function contributeToGoal(user, goalId, amount) {
  const goal = user.goals.find((g) => String(g.id) === String(goalId));
  if (!goal) return { error: 'Goal not found', status: 404 };

  const add = Number(amount);
  if (!Number.isFinite(add) || add <= 0) {
    return { error: 'Amount must be greater than zero', status: 400 };
  }
  goal.savedAmount = (Number(goal.savedAmount) || 0) + add;
  user.markModified('goals');
  await user.save();
  return { user: sanitizeUser(user) };
}

app.post('/api/user/:id/goals/contribute', async (req, res) => {
  try {
    const { goalId, amount } = req.body;
    const user = await User.findOne({ id: Number(req.params.id) });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await ensureFinanceState(user);
    const result = await contributeToGoal(user, goalId, amount);
    if (result.error) return res.status(result.status).json({ error: result.error });

    res.json(result.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/:id/goals/:goalId/contribute', async (req, res) => {
  try {
    const user = await User.findOne({ id: Number(req.params.id) });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await ensureFinanceState(user);
    const result = await contributeToGoal(user, req.params.goalId, req.body.amount);
    if (result.error) return res.status(result.status).json({ error: result.error });

    res.json(result.user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/user/:id/goals', async (req, res) => {
  try {
    const { goals } = req.body;
    const user = await User.findOne({ id: Number(req.params.id) });
    if (!user) return res.status(404).json({ error: 'User not found' });

    await ensureFinanceState(user);
    if (!Array.isArray(goals)) return res.status(400).json({ error: 'goals must be an array' });

    user.goals = goals.map(g => ({
      id: g.id || Date.now() + Math.random(),
      name: String(g.name || 'Untitled Goal'),
      targetAmount: Number(g.targetAmount) || 0,
      savedAmount: Number(g.savedAmount) || 0
    }));

    user.markModified('goals');
    await user.save();
    res.json(sanitizeUser(user));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.use('/api', (req, res) => {
  res.status(404).json({ error: `Cannot ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
