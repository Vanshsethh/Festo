import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, Sparkles, User, LogOut, Ticket, Building2, Shield, QrCode, ChevronDown } from 'lucide-react';
import { Button } from '../ui/button.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

export const Header = () => {
  const { user, isAuthenticated, isUser, isOrganizer, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
    navigate('/');
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ORGANIZER':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">Organizer</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">User</span>;
    }
  };

  return (
    <header className="border-b border-border/60 backdrop-blur-md bg-background/80 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20 group-hover:scale-105 transition-transform">
              <Calendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
                Festo
              </span>
            </div>
          </Link>

          {/* Navigation Links - Customer-facing only */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <Link
              to="/explore"
              className="px-3.5 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Explore Events
            </Link>
            <Link
              to="/colleges"
              className="px-3.5 py-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              Colleges
            </Link>
            {isAuthenticated && isUser && (
              <Link
                to="/host"
                className="px-3.5 py-2 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Host an Event
              </Link>
            )}
          </nav>
        </div>

        {/* Right Side CTA / Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl bg-card border border-border/80 hover:border-purple-500/40 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600/30 to-indigo-600/30 border border-purple-500/30 flex items-center justify-center text-purple-300 font-bold text-sm">
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </div>
                <div className="hidden sm:block">
                  <div className="text-xs font-semibold text-foreground truncate max-w-[120px]">
                    {user.name}
                  </div>
                  {getRoleBadge(user.role)}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-muted-foreground ml-1" />
              </button>

              {/* User Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card/95 backdrop-blur-md border border-border/80 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-border/60">
                    <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>

                  <div className="py-1">
                    {/* User Links */}
                    {isUser && <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <User className="w-4 h-4 text-purple-400" />
                      My dashboard
                    </Link>}
                    {isUser && <Link
                      to="/registrations"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <Ticket className="w-4 h-4 text-purple-400" />
                      My registrations
                    </Link>}
                    {isUser && <Link
                      to="/tickets"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <QrCode className="w-4 h-4 text-purple-400" />
                      My tickets
                    </Link>}

                    {/* Organizer Links */}
                    {isOrganizer && <Link
                      to="/organizer/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <Building2 className="w-4 h-4 text-amber-400" />
                      Organizer dashboard
                    </Link>}
                    {isOrganizer && <Link
                      to="/organizer/events"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-foreground hover:bg-muted/60 transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-amber-400" />
                      My events
                    </Link>}
                  </div>

                  <div className="border-t border-border/60 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Sign In</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-600/20"
              >
                <Link to="/register">Get Started</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
