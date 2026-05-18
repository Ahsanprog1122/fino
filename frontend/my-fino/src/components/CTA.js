import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CTA = () => {
  const navigate = useNavigate();
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-zinc-900 z-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-600/30 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-600/30 rounded-full blur-[100px]" />
      </div>
      
      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to master your finances?
          </h2>
          <p className="text-xl text-zinc-300 mb-10 max-w-2xl mx-auto">
            Join thousands of university students in Pakistan who are already using Fino to track, budget, and save effectively.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => navigate('/auth')} className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full font-semibold text-lg transition-all shadow-lg hover:shadow-orange-500/50 flex items-center justify-center gap-2 group">
              Create Free Account
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button className="px-8 py-4 bg-white/10 hover:bg-white/20 text-white rounded-full font-semibold text-lg transition-all backdrop-blur-sm border border-white/10">
              Download the App
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTA;
