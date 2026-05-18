import React, { useState } from 'react';
import { Wallet, Menu, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <nav className="fixed w-full z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-lg border-b border-zinc-200/50 dark:border-zinc-800/50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div 
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="bg-gradient-to-tr from-orange-600 to-amber-500 p-2 rounded-xl text-white">
              <Wallet size={24} />
            </div>
            <span className="font-['Outfit'] font-bold text-2xl text-zinc-900 dark:text-zinc-100 tracking-tight">Fino<span className="text-orange-600">.</span></span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 font-medium transition-colors">Features</a>
            <a href="#how-it-works" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 font-medium transition-colors">How it Works</a>
            <a href="#testimonials" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 font-medium transition-colors">Testimonials</a>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            <button onClick={() => navigate('/auth')} className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 font-semibold px-4 py-2 transition-colors">Log In</button>
            <button onClick={() => navigate('/auth')} className="bg-zinc-900 hover:bg-orange-600 text-white px-6 py-2.5 rounded-full font-medium transition-all shadow-lg hover:shadow-orange-500/25">
              Get Started
            </button>
          </div>

          <div className="md:hidden flex items-center gap-3">
            <ThemeToggle />
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-600 dark:text-zinc-400">
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
          <div className="px-4 pt-2 pb-6 space-y-4 shadow-xl">
            <a href="#features" className="block px-3 py-2 text-zinc-600 dark:text-zinc-400 font-medium">Features</a>
            <a href="#how-it-works" className="block px-3 py-2 text-zinc-600 dark:text-zinc-400 font-medium">How it Works</a>
            <a href="#testimonials" className="block px-3 py-2 text-zinc-600 dark:text-zinc-400 font-medium">Testimonials</a>
            <hr className="border-zinc-100 dark:border-zinc-800" />
            <button onClick={() => navigate('/auth')} className="w-full text-left px-3 py-2 text-zinc-600 dark:text-zinc-400 font-medium">Log In</button>
            <button onClick={() => navigate('/auth')} className="w-full bg-zinc-900 text-white px-3 py-3 rounded-xl font-medium mt-2">Get Started</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
