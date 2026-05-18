import React from 'react';
import { UserPlus, ClipboardCheck, LineChart } from 'lucide-react';

const steps = [
  {
    step: '01',
    icon: <UserPlus size={24} className="text-orange-600" />,
    title: 'Create your account',
    description:
      'Sign up in seconds with your email. No credit card—start tracking your money right away.',
    cardBg: 'bg-orange-50',
    cardBorder: 'border-orange-100'
  },
  {
    step: '02',
    icon: <ClipboardCheck size={24} className="text-zinc-800" />,
    title: 'Tell us about your finances',
    description:
      'Share income, goals, and spending habits in a quick onboarding flow tailored for student life.',
    cardBg: 'bg-zinc-100',
    cardBorder: 'border-zinc-200'
  },
  {
    step: '03',
    icon: <LineChart size={24} className="text-amber-600" />,
    title: 'See clarity, build habits',
    description:
      'Log expenses, set budgets, and watch charts and alerts keep you on track toward what matters.',
    cardBg: 'bg-amber-50',
    cardBorder: 'border-amber-100'
  }
];

const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-zinc-50 dark:bg-zinc-950 relative scroll-mt-24 transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-orange-600 font-semibold tracking-wide uppercase text-sm mb-3">
            How it works
          </h2>
          <h3 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">
            Three steps to smarter money habits
          </h3>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            From signup to insights, Fino fits into your routine so you spend less time worrying and
            more time learning what works.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item) => (
            <div
              key={item.step}
              className="relative p-8 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/20 dark:shadow-none hover:shadow-2xl hover:shadow-zinc-200/40 dark:hover:shadow-zinc-900/50 transition-all"
            >
              <span className="absolute top-8 right-8 text-sm font-bold text-zinc-300 tabular-nums">
                {item.step}
              </span>
              <div
                className={`w-14 h-14 rounded-2xl ${item.cardBg} ${item.cardBorder} border flex items-center justify-center mb-6`}
              >
                {item.icon}
              </div>
              <h4 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3 pr-12">{item.title}</h4>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
