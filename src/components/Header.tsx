import { Bell, Search, Shield, Sparkles, Menu, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useState } from 'react';

const Header = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const avatar = user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  
  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-r from-slate-900/95 via-primary-950/95 to-slate-900/95 backdrop-blur-xl border-b border-white/10 z-50 shadow-2xl">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-accent-purple/10 to-primary-700/20 animate-pulse-slow"></div>
      
      <div className="relative h-full px-8 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-8">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-purple rounded-xl shadow-glow-primary flex items-center justify-center transform hover:scale-110 transition-all duration-300">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-secondary-400 to-accent-pink rounded-full animate-bounce-subtle"></div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-slate-100 to-primary-200 bg-clip-text text-transparent tracking-tight">
                Jarvis
              </h1>
              <p className="text-xs text-slate-400 font-medium">Migration Platform</p>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative group hidden lg:block">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-accent-purple/20 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300"></div>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 group-hover:text-primary-300 transition-colors" />
              <input
                type="text"
                placeholder="Buscar en la plataforma..."
                className="pl-12 pr-6 py-3 w-80 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50 focus:border-primary-400/50 font-medium transition-all duration-300 hover:bg-white/15"
              />
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6">
          {/* Notifications */}
          <button className="relative p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-slate-300 hover:text-white hover:bg-white/20 transition-all duration-300 group">
            <Bell className="w-5 h-5 transform group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-secondary-400 to-accent-pink rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">3</span>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-accent-purple/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm"></div>
          </button>

          {/* User Profile */}
          <div className="flex items-center space-x-4 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all duration-300 group">
            <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform ${
              isSuperAdmin 
                ? 'bg-gradient-to-br from-accent-purple to-accent-pink shadow-glow-secondary' 
                : 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-glow-primary'
            }`}>
              {isSuperAdmin ? (
                <Shield className="w-5 h-5 text-white" />
              ) : (
                <span className="text-white font-bold text-sm">
                  {avatar}
                </span>
              )}
              {/* Status indicator */}
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-white animate-pulse"></div>
            </div>
            
            <div className="hidden md:block">
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-white truncate max-w-32">
                  {user?.username || user?.email}
                </span>
                {isSuperAdmin ? (
                  <span className="text-xs bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent font-bold">
                    Super Admin
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 font-medium">
                    Usuario Activo
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="relative px-6 py-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold hover:bg-white/20 transition-all duration-300 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-red-600/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <span className="relative">Salir</span>
          </button>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Search Bar */}
      {isMenuOpen && (
        <div className="md:hidden px-8 py-4 bg-slate-900/95 backdrop-blur-xl border-t border-white/10">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-12 pr-6 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-400/50"
            />
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;