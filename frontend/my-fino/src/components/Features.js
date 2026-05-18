import React from 'react';
import { Target, BellRing, PieChart, Download } from 'lucide-react';

const features = [
  {
    icon: <PieChart size={24} className="text-orange-600" />,
    title: 'Visual Spending Insights',
    description: 'Understand your habits instantly with dynamic pie charts and spending trend graphs.',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-100'
  },
  {
    icon: <BellRing size={24} className="text-zinc-800" />,
    title: 'Smart Budget Alerts',
    description: 'Set monthly limits per category and get notified when you reach 80% of your budget.',
    bgColor: 'bg-zinc-100',
    borderColor: 'border-zinc-200'
  },
  {
    icon: <Target size={24} className="text-amber-600" />,
    title: 'Savings Goals',
    description: 'Create targets for that new laptop or trip. Track your progress visually as you save.',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-100'
  },
  {
    icon: <Download size={24} className="text-orange-800" />,
    title: 'Export Reports',
    description: 'Generate and download beautiful monthly PDF summaries of your financial health.',
    bgColor: 'bg-orange-100',
    borderColor: 'border-orange-200'
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-white dark:bg-zinc-900 relative transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-orange-600 font-semibold tracking-wide uppercase text-sm mb-3">Powerful Features</h2>
          <h3 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Everything you need to manage your money</h3>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Fino goes beyond a simple expense tracker. It's your personal financial companion designed for student life.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 rounded-3xl bg-white dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-xl shadow-zinc-200/20 dark:shadow-none hover:shadow-2xl hover:shadow-zinc-200/40 dark:hover:shadow-zinc-900/50 transition-all group"
            >
              <div className={`w-14 h-14 rounded-2xl ${feature.bgColor} ${feature.borderColor} border flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                {feature.icon}
              </div>
              <h4 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-3">{feature.title}</h4>
              <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
