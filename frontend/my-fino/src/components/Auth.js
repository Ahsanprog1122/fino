import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wallet } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const endpoint = isLogin ? '/api/login' : '/api/signup';
    
    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }
      
      localStorage.setItem('user', JSON.stringify(data.user));
      
      if (!isLogin || !data.user.onboardingCompleted) {
        navigate('/onboarding');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl mx-auto -z-10 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-orange-400/20 rounded-full blur-3xl mix-blend-multiply" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-amber-400/20 rounded-full blur-3xl mix-blend-multiply" />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center cursor-pointer" onClick={() => navigate('/')}>
          <div className="bg-gradient-to-tr from-orange-600 to-amber-500 p-3 rounded-2xl text-white shadow-lg">
            <Wallet size={32} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 font-['Outfit']">
          {isLogin ? 'Sign in to your account' : 'Create your free account'}
        </h2>
        <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
          {isLogin ? (
            <>
              New here?{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(false); setError(''); }}
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(true); setError(''); }}
                className="font-medium text-orange-600 hover:text-orange-500 transition-colors"
              >
                Log in
              </button>
            </>
          )}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-zinc-900 py-8 px-4 shadow-xl sm:rounded-3xl sm:px-10 border border-zinc-100 dark:border-zinc-800">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Full Name</label>
                <div className="mt-1">
                  <input
                    type="text" required
                    className="appearance-none block w-full px-3 py-3 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl shadow-sm placeholder-zinc-400 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                    value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Email address</label>
              <div className="mt-1">
                <input
                  type="email" required
                  className="appearance-none block w-full px-3 py-3 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl shadow-sm placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Password</label>
              <div className="mt-1">
                <input
                  type="password" required
                  className="appearance-none block w-full px-3 py-3 border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-xl shadow-sm placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 p-2 rounded-lg">{error}</p>}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-zinc-900 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-all"
              >
                {isLogin ? 'Sign in' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
