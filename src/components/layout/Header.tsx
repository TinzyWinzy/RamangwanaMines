import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Button } from '../ui/Button';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/services', label: 'Services' },
  { to: '/training', label: 'Training' },
  { to: '/lead-form', label: 'Get Quote' },
];

export function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { profile, isAuthenticated, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-sm bg-white/90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.jpg" alt="Ramangwana Mining" className="h-10 w-10 rounded-lg object-cover" />
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-primary-500">Ramangwana</span>
              <span className="text-sm text-gray-500 block -mt-1">Mining Enterprise</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                {profile?.role === 'admin' && (
                  <Link to="/admin/dashboard">
                    <Button variant="outline" size="sm">Admin</Button>
                  </Link>
                )}
                <Link to="/client-portal">
                  <Button variant="primary" size="sm">My Portal</Button>
                </Link>
              </>
            ) : (
              <Link to="/client-portal">
                <Button variant="primary" size="sm">Login / Register</Button>
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-medium ${
                  isActive(link.to) ? 'bg-primary-50 text-primary-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 px-2">
              {isAuthenticated ? (
                <Link to="/client-portal" onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="primary" className="w-full">My Portal</Button>
                </Link>
              ) : (
                <Link to="/client-portal" onClick={() => setIsOpen(false)} className="w-full">
                  <Button variant="primary" className="w-full">Login / Register</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
