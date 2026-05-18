import React, { useEffect, useState } from 'react';
import { Plus, Quote, X } from 'lucide-react';

const STORAGE_KEY = 'fino-testimonials-v2';
const defaultTestimonials = [
  {
    id: 'seed-1',
    name: 'Ayesha Khan',
    role: 'BBA, LUMS — Lahore',
    quote:
      'Between café runs on Main Boulevard and semester fees, I needed one place to see it all. Fino made my monthly spending actually make sense.',
  },
  {
    id: 'seed-2',
    name: 'Hassan Ahmed',
    role: 'Software Engineering, NUST — Islamabad',
    quote:
      'Hostel mess, Careem, and lab supplies used to drain my wallet. Budget alerts before mid-month saved me more than once.',
  },
  {
    id: 'seed-3',
    name: 'Fatima Rizvi',
    role: 'Medicine, Aga Khan University — Karachi',
    quote:
      'Long shifts leave no time for spreadsheets. I log expenses in seconds and still hit my savings goal for Ramadan gifts.',
  },
  {
    id: 'seed-4',
    name: 'Usman Malik',
    role: 'Economics, Quaid-i-Azam University — Islamabad',
    quote:
      'Exporting a monthly PDF for my family back home is brilliant. They finally believe I am budgeting, not just saying it.',
  },
];

const loadTestimonials = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {
    /* ignore corrupt storage */
  }
  return defaultTestimonials;
};

const Testimonials = () => {
  const [testimonials, setTestimonials] = useState(loadTestimonials);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [quote, setQuote] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(testimonials));
  }, [testimonials]);

  const resetForm = () => {
    setName('');
    setRole('');
    setQuote('');
    setShowForm(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmedQuote = quote.trim();
    const trimmedName = name.trim();
    if (!trimmedQuote || !trimmedName) return;

    setTestimonials((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        name: trimmedName,
        role: role.trim() || 'Fino user',
        quote: trimmedQuote,
      },
    ]);
    resetForm();
  };

  return (
    <section id="testimonials" className="py-24 bg-white dark:bg-zinc-900 relative scroll-mt-24 border-t border-zinc-100 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-orange-600 font-semibold tracking-wide uppercase text-sm mb-3">
            Testimonials
          </h2>
          <h3 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Stories from students across Pakistan</h3>
          <p className="text-xl text-zinc-600 dark:text-zinc-400">
            Hear from peers in Lahore, Karachi, Islamabad, and beyond—or click below to share your own experience.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <article
              key={item.id}
              className="p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 shadow-lg shadow-zinc-200/30 dark:shadow-none flex flex-col"
            >
              <Quote className="text-orange-500 mb-4 shrink-0" size={28} aria-hidden />
              <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed flex-1 mb-6">&ldquo;{item.quote}&rdquo;</p>
              <div>
                <p className="font-semibold text-zinc-900 dark:text-zinc-100">{item.name}</p>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{item.role}</p>
              </div>
            </article>
          ))}

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="p-8 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-orange-400 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 transition-all flex flex-col items-center justify-center gap-3 min-h-[220px] group text-left w-full"
          >
            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Plus className="text-orange-600" size={28} />
            </div>
            <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Add your testimonial</span>
            <span className="text-sm text-zinc-500 dark:text-zinc-400 text-center">Click to share how Fino helps you</span>
          </button>
        </div>
      </div>

      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm"
          onClick={resetForm}
          role="presentation"
        >
          <div
            className="bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl max-w-lg w-full p-8 relative"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="testimonial-form-title"
          >
            <button
              type="button"
              onClick={resetForm}
              className="absolute top-6 right-6 text-zinc-400 hover:text-zinc-700 transition-colors"
              aria-label="Close"
            >
              <X size={24} />
            </button>

            <h4 id="testimonial-form-title" className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
              Share your story
            </h4>
            <p className="text-zinc-600 dark:text-zinc-400 mb-6">Your testimonial appears on the landing page right away.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="testimonial-name" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Your name
                </label>
                <input
                  id="testimonial-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sam R."
                  required
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label htmlFor="testimonial-role" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Role or major <span className="text-zinc-400 font-normal">(optional)</span>
                </label>
                <input
                  id="testimonial-role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Engineering student"
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
              </div>
              <div>
                <label htmlFor="testimonial-quote" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Your experience
                </label>
                <textarea
                  id="testimonial-quote"
                  value={quote}
                  onChange={(e) => setQuote(e.target.value)}
                  placeholder="What has Fino helped you with?"
                  required
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-6 py-3 rounded-full border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 rounded-full bg-zinc-900 hover:bg-orange-600 text-white font-semibold transition-all shadow-lg hover:shadow-orange-500/25"
                >
                  Add testimonial
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default Testimonials;
