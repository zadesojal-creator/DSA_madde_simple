import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Binary } from 'lucide-react';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    if (window.location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200 text-slate-600 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          
          {/* Brand & Description */}
          <div className="space-y-3 text-center md:text-left max-w-md">
            <Link to="/" className="inline-flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-xs">
                <Binary className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-slate-900">
                DSA <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Visualizer</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              An interactive visual learning platform helping students master data structures and algorithms step by step through execution tracing.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center items-center gap-6 text-xs font-medium text-slate-600">
            <button
              onClick={() => scrollToSection('hero')}
              className="hover:text-indigo-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded px-1"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('explore-topics')}
              className="hover:text-indigo-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded px-1"
            >
              Explore Topics
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-indigo-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded px-1"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-indigo-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded px-1"
            >
              About
            </button>
          </div>

        </div>

        {/* Bottom Copyright */}
        <div className="mt-10 pt-6 border-t border-slate-100 text-center text-xs text-slate-500">
          <p>© {CURRENT_YEAR} DSA Visualizer. Designed for interactive student learning.</p>
        </div>

      </div>
    </footer>
  );
};
