import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ income: '', primaryGoal: '', occupation: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleComplete = async () => {
    setLoading(true);
    const user = JSON.parse(localStorage.getItem('user'));
    const API_BASE = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '');
    
    try {
      const res = await fetch(`${API_BASE}/api/onboarding`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, ...formData })
      });
      
      const data = await res.json();
      if(res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        alert(data.error);
      }
    } catch(err) {
      alert('Error completing onboarding');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-4 transition-colors">
      <div className="max-w-xl w-full bg-white dark:bg-zinc-900 p-6 sm:p-8 rounded-3xl shadow-xl border border-zinc-100 dark:border-zinc-800">
        <div className="mb-8">
          <div className="flex gap-2 mb-4">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-2 flex-1 rounded-full ${step >= i ? 'bg-orange-500' : 'bg-zinc-100 dark:bg-zinc-800'}`} />
            ))}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-100 font-['Outfit']">Let's get to know you</h2>
          <p className="text-zinc-500 dark:text-zinc-400 mt-2">Help us personalize your Fino experience</p>
        </div>

        {step === 1 && (
          <div>
            <label className="block text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">What's your primary occupation?</label>
            <div className="space-y-3">
              {['University Student', 'High School Student', 'Employed Professional', 'Freelancer'].map(opt => (
                <button 
                  key={opt}
                  onClick={() => setFormData({...formData, occupation: opt})}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${formData.occupation === opt ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400' : 'border-zinc-200 dark:border-zinc-700 dark:text-zinc-300 hover:border-orange-300'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <button 
              disabled={!formData.occupation}
              onClick={() => setStep(2)}
              className="mt-8 w-full bg-zinc-900 text-white p-4 rounded-xl font-semibold disabled:opacity-50"
            >
              Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="block text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">What's your estimated monthly income/allowance (PKR)?</label>
            <input 
              type="number"
              value={formData.income}
              onChange={e => setFormData({...formData, income: e.target.value})}
              placeholder="e.g. 15000"
              className="w-full p-4 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 text-xl focus:outline-none focus:border-orange-500"
            />
            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(1)} className="p-4 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 rounded-xl font-semibold">Back</button>
              <button 
                disabled={!formData.income}
                onClick={() => setStep(3)}
                className="flex-1 bg-zinc-900 text-white p-4 rounded-xl font-semibold disabled:opacity-50"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <label className="block text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-4">What is your primary financial goal?</label>
            <div className="space-y-3">
              {['Track Daily Expenses', 'Build Savings', 'Stick to a Budget', 'Analyze Spending Habits'].map(opt => (
                <button 
                  key={opt}
                  onClick={() => setFormData({...formData, primaryGoal: opt})}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${formData.primaryGoal === opt ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400' : 'border-zinc-200 dark:border-zinc-700 dark:text-zinc-300 hover:border-orange-300'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
            <div className="flex gap-4 mt-8">
              <button onClick={() => setStep(2)} className="p-4 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-200 rounded-xl font-semibold">Back</button>
              <button 
                disabled={!formData.primaryGoal || loading}
                onClick={handleComplete}
                className="flex-1 bg-orange-500 text-white p-4 rounded-xl font-semibold disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Finish Setup'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Onboarding;
