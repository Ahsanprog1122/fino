import React from 'react';
import { Wallet } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-zinc-50 dark:bg-zinc-950 pt-20 pb-10 border-t border-zinc-200 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <div className="bg-gradient-to-tr from-orange-600 to-amber-500 p-2 rounded-xl text-white inline-flex">
                <Wallet size={24} />
              </div>
              <span className="font-['Outfit'] font-bold text-2xl text-zinc-900 dark:text-zinc-100 tracking-tight">Fino<span className="text-orange-600">.</span></span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6 max-w-md">
              The ultimate personal finance application designed to help university students manage expenses, track budgets, and reach their saving goals.
            </p>
            <div className="flex gap-4 text-zinc-400">
              <a href="#" className="hover:text-orange-600 transition-colors font-medium text-sm">Twitter</a>
              <span className="text-zinc-300">•</span>
              <a href="#" className="hover:text-orange-600 transition-colors font-medium text-sm">GitHub</a>
              <span className="text-zinc-300">•</span>
              <a href="#" className="hover:text-orange-600 transition-colors font-medium text-sm">LinkedIn</a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Product</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors">Features</a></li>
              <li><a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors">Pricing</a></li>
              <li><a href="#testimonials" className="text-zinc-600 hover:text-orange-600 transition-colors">Testimonials</a></li>
              <li><a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors">Release Notes</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Legal</h4>
            <ul className="space-y-3">
              <li><a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-zinc-600 dark:text-zinc-400 hover:text-orange-600 transition-colors">Cookie Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            © {new Date().getFullYear()} Fino. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-zinc-500">
            <span>Made with ❤️ for students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
