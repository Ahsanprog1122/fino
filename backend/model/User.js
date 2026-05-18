const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  type: { type: String, required: true },
  amount: { type: Number, required: true },
  desc: { type: String, required: true },
  category: { type: String, required: true },
  createdAt: { type: String, required: true }
});

const goalSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  targetAmount: { type: Number, default: 0 },
  savedAmount: { type: Number, default: 0 }
});

const userSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  onboardingCompleted: { type: Boolean, default: false },
  income: { type: String },
  occupation: { type: String },
  primaryGoal: { type: String },
  transactions: { type: [transactionSchema], default: [] },
  budgets: {
    Food: { type: Number, default: 0 },
    Transport: { type: Number, default: 0 },
    Entertainment: { type: Number, default: 0 },
    Education: { type: Number, default: 0 },
    Shopping: { type: Number, default: 0 },
    Other: { type: Number, default: 0 }
  },
  savingsTarget: { type: Number, default: 0 },
  savingsSaved: { type: Number, default: 0 },
  goals: { type: [goalSchema], default: [] }
});

module.exports = mongoose.model('User', userSchema);
