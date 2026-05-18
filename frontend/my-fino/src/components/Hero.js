import React from 'react';
import { ArrowRight, PieChart, Sparkles, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl mx-auto -z-10 pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-400/20 rounded-full blur-3xl mix-blend-multiply" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-amber-400/20 rounded-full blur-3xl mix-blend-multiply" />
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-96 h-96 bg-red-400/20 rounded-full blur-3xl mix-blend-multiply" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 dark:bg-orange-950/50 border border-orange-100 dark:border-orange-900/50 text-orange-700 dark:text-orange-400 font-medium text-sm mb-8">
            <span className="flex h-2 w-2 rounded-full bg-orange-500 animate-pulse"></span>
            The #1 Finance App for Students
          </div>

          <h1 className="text-5xl lg:text-7xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-[1.1] mb-6">
            Spend wisely. <br className="hidden sm:block"/>
            Save consistently. <br className="hidden sm:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-amber-500">Grow financially.</span>
          </h1>

          <p className="text-lg sm:text-xl text-zinc-600 dark:text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Take control of your money with intuitive budgeting, visual insights, and seamless expense tracking designed specifically for university life.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={() => navigate('/auth')} className="w-full sm:w-auto px-8 py-4 bg-zinc-900 hover:bg-orange-600 text-white rounded-full font-semibold text-lg transition-all shadow-xl hover:shadow-orange-500/30 flex items-center justify-center gap-2 group">
              Start for free
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 rounded-full font-semibold text-lg transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-600 flex items-center justify-center gap-2"
            >
              View Demo
            </button>
          </div>
        </div>

        <div className="mt-20 relative max-w-5xl mx-auto">
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mb-3">Preview layout — your balances and activity fill in after you sign up</p>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-50/90 dark:to-zinc-950/90 z-10 pointer-events-none rounded-b-3xl" />
          <div className="rounded-3xl border border-zinc-200/60 dark:border-zinc-700/60 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm p-2 shadow-2xl overflow-hidden ring-1 ring-zinc-900/5 dark:ring-zinc-100/5">
            <div className="rounded-2xl overflow-hidden bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 p-8 grid md:grid-cols-3 gap-6">

              <div className="col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-zinc-500 font-medium mb-1">Total Balance</h3>
                    <p className="text-4xl font-bold text-zinc-400 tracking-tight">—</p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <TrendingUp size={24} />
                  </div>
                </div>

                <div className="h-64 bg-white dark:bg-zinc-800 rounded-xl border border-zinc-100 dark:border-zinc-700 flex items-center justify-center shadow-sm">
                  <div className="text-center px-4">
                    <PieChart size={48} className="mx-auto text-zinc-300 mb-3" />
                    <p className="text-zinc-500 font-medium">Your categories appear here</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Recent activity</h4>
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white dark:bg-zinc-800 p-4 rounded-xl border border-zinc-100 dark:border-zinc-700 shadow-sm flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                        <Sparkles size={18} className="text-zinc-400" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-400 text-sm">Logged transactions</p>
                        <p className="text-xs text-zinc-400">—</p>
                      </div>
                    </div>
                    <p className="font-semibold text-zinc-300">—</p>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
