import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Binary, Menu, X, Play } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: id } });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleStartVisualizing = () => {
    setMobileMenuOpen(false);
    navigate('/visualizer/arrays/traversal');
  };

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? 'bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-3 shadow-sm' 
          : 'bg-transparent py-5 border-b border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center gap-2.5 group focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded-lg p-1"
            aria-label="DSA Visualizer Home"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
              <Binary className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-slate-900 flex items-center gap-1.5">
                DSA <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Visualizer</span>
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <button
              onClick={() => scrollToSection('hero')}
              className="hover:text-slate-900 transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded px-1.5 py-1"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('explore-topics')}
              className="hover:text-slate-900 transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded px-1.5 py-1"
            >
              Explore Topics
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="hover:text-slate-900 transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded px-1.5 py-1"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="hover:text-slate-900 transition-colors cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 rounded px-1.5 py-1"
            >
              About
            </button>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={handleStartVisualizing}
              className="relative group inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 rounded-xl shadow-md shadow-indigo-600/20 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
            >
              <span>Start Visualizing</span>
              <Play className="w-3.5 h-3.5 fill-current text-white/90 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-700 hover:text-slate-900 hover:bg-slate-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-b border-slate-200 px-4 pt-4 pb-6 mt-3 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-3 font-medium text-slate-700">
            <button
              onClick={() => scrollToSection('hero')}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition-colors text-left"
            >
              Home
            </button>
            <button
              onClick={() => scrollToSection('explore-topics')}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition-colors text-left"
            >
              Explore Topics
            </button>
            <button
              onClick={() => scrollToSection('how-it-works')}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition-colors text-left"
            >
              How It Works
            </button>
            <button
              onClick={() => scrollToSection('features')}
              className="px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition-colors text-left"
            >
              About
            </button>
          </nav>
          
          <div className="pt-2 border-t border-slate-200">
            <button
              onClick={handleStartVisualizing}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl shadow-md shadow-indigo-600/20"
            >
              <span>Start Visualizing</span>
              <Play className="w-4 h-4 fill-current" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
