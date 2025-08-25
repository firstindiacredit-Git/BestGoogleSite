import React, { useState, useEffect } from 'react';
import { 
  Sun, Moon, Menu, X, Link as LinkIcon, 
  ArrowRight, Palette, BarChart, Link, 
  Smartphone, Zap, Shield, ChevronDown, 
  ChevronUp, Check, Heart 
} from 'lucide-react';


// Link Component
const LinkComponent = ({ 
  href, 
  children, 
  className = '', 
  onClick 
}) => {
  return (
    <a 
      href={href}
      className={`text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors ${className}`}
      onClick={onClick}
    >
      {children}
    </a>
  );
};

// Navbar Component
const Navbar = ({ darkMode, setDarkMode, onLoginClick, onRegisterClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 dark:bg-gray-900/90 shadow-md backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="container py-4 mx-auto">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-purple-600">LinkNest</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <LinkComponent href="#features">Features</LinkComponent>
            <LinkComponent href="#demo">Demo</LinkComponent>
            <LinkComponent href="#pricing">Pricing</LinkComponent>
            <LinkComponent href="#faq">FAQ</LinkComponent>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            <div className="hidden md:flex items-center gap-3">
              <button
                onClick={onLoginClick}
                className="btn-secondary"
              >
                Sign In
              </button>
              <button
                onClick={onRegisterClick}
                className="btn-primary"
              >
                Sign Up
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 md:hidden rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative z-50"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white dark:bg-gray-900 shadow-lg border-t border-gray-200 dark:border-gray-700">
            <div className="px-4 py-6 space-y-4">
              <LinkComponent href="#features" onClick={() => setIsMenuOpen(false)}>
            Features
          </LinkComponent>
              <LinkComponent href="#demo" onClick={() => setIsMenuOpen(false)}>
            Demo
          </LinkComponent>
              <LinkComponent href="#pricing" onClick={() => setIsMenuOpen(false)}>
            Pricing
          </LinkComponent>
              <LinkComponent href="#faq" onClick={() => setIsMenuOpen(false)}>
            FAQ
          </LinkComponent>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-3">
            <button
                  onClick={() => {
                    onLoginClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full btn-secondary"
            >
              Sign In
            </button>
            <button
                  onClick={() => {
                    onRegisterClick();
                    setIsMenuOpen(false);
                  }}
                  className="w-full btn-primary"
            >
              Sign Up
            </button>
          </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

const Landing = ({ onLoginClick, onRegisterClick }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(savedDarkMode);
  }, []);

  useEffect(() => {
    // Save dark mode preference
    localStorage.setItem('darkMode', darkMode);
    
    // Apply dark mode to document
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <Navbar 
        darkMode={darkMode} 
        setDarkMode={setDarkMode}
        onLoginClick={onLoginClick}
        onRegisterClick={onRegisterClick}
      />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
            Create Your
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">
              {' '}Beautiful Link Page
            </span>
            </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Share all your important links in one beautiful, customizable page. 
            Perfect for creators, influencers, and businesses.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onRegisterClick}
              className="btn-primary text-lg px-8 py-4"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </button>
            <button
              onClick={() => document.getElementById('demo').scrollIntoView({ behavior: 'smooth' })}
              className="btn-secondary text-lg px-8 py-4"
            >
              See Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Powerful features to make your link page stand out
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Beautiful Themes
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Choose from multiple themes and customize colors to match your brand
              </p>
            </div>
            
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track clicks and engagement with detailed analytics
              </p>
          </div>
          
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Mobile Optimized
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Perfect on all devices with responsive design
              </p>
          </div>
        </div>
      </div>
    </section>

      {/* Demo Section */}
      <section id="demo" className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            See It In Action
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
            Check out these beautiful examples of LinkNest profiles.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Demo profiles would go here */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-blue-500 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Creator Profile</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Perfect for influencers and content creators</p>
              <button className="btn-primary w-full">View Demo</button>
        </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Business Profile</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Professional look for businesses</p>
              <button className="btn-primary w-full">View Demo</button>
                    </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-red-500 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Personal Profile</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">Simple and clean for personal use</p>
              <button className="btn-primary w-full">View Demo</button>
            </div>
          </div>
      </div>
    </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of creators who are using LinkNest to grow their audience.
          </p>
    <button
            onClick={onRegisterClick}
            className="bg-white text-purple-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Create Your Free Page
    </button>
      </div>
    </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-purple-600">LinkNest</span>
          </div>
            <p className="text-gray-400">
              &copy; {new Date().getFullYear()} LinkNest. All rights reserved.
            </p>
          </div>
          <div className="text-center mt-4">
            <p className="text-gray-400">
            Made with <Heart className="h-4 w-4 mx-1 text-accent-500" /> by the Linknest Team
          </p>
        </div>
      </div>
    </footer>
    </div>
  );
};

export default Landing; 