import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, Search, Network } from 'lucide-react';
import { useState, useEffect } from 'react';
import GlobalSearch from './GlobalSearch';
import { getHealth } from '../api/client';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState({ online: false, checking: true });
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/events', label: 'Events' },
    { path: '/people', label: 'People' },
    { path: '/companies', label: 'Companies' },
    { path: '/topics', label: 'Topics' },
  ];

  // For demo purposes, use person_1 as current user
  const currentUserId = 'person_1';

  useEffect(() => {
    async function checkBackendHealth() {
      try {
        const res = await getHealth();
        if (res && res.status === 'ok') {
          setDbStatus({ online: true, checking: false });
        } else {
          setDbStatus({ online: false, checking: false });
        }
      } catch {
        setDbStatus({ online: false, checking: false });
      }

    }

    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-6">
              <Link to="/" className="flex items-center space-x-2.5 group">
                <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-md shadow-primary-500/20 group-hover:scale-105 transition-transform">
                  <Network className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-slate-900 tracking-tight">EventGraph</span>
                </div>
              </Link>

              {/* Health Indicator Pill */}
              <div
                title={dbStatus.online ? 'Neo4j Graph Database Connected' : 'Connecting to Neo4j...'}
                className={`hidden lg:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all duration-500 ${dbStatus.online
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                  }`}
              >
                <span className="relative flex h-2.5 w-2.5">
                  {dbStatus.online && (
                    <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2.5 w-2.5 ${dbStatus.online ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                      }`}
                  ></span>
                </span>
                <span>{dbStatus.online ? 'Graph DB' : 'Checking DB'}</span>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${location.pathname === item.path
                    ? 'bg-primary-50 text-primary-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Right actions: Global Search & Profile */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="flex items-center space-x-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-slate-500 text-sm transition-all border border-slate-200"
              >
                <Search className="w-4 h-4 text-slate-500" />
                <span>Global Search...</span>
              </button>
              <Link
                to={`/people/${currentUserId}`}
                className="flex items-center space-x-2 px-3.5 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-slate-700"
              >
                <User className="w-4 h-4 text-primary-600" />
                <span className="text-sm font-medium">My Profile</span>
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex items-center space-x-2 md:hidden">
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Global search"
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-600"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-600"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Toggle menu"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 py-4 space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-lg text-base font-medium transition-colors ${location.pathname === item.path
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
                  }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to={`/people/${currentUserId}`}
              className="block px-3 py-2 border-t border-slate-200 mt-3 pt-3 text-slate-700 hover:bg-slate-50 font-medium"
              onClick={() => setIsOpen(false)}
            >
              My Profile ({currentUserId})
            </Link>
          </div>
        )}
      </nav>

      <GlobalSearch isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}