import { Bell, Search, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const avatar = user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-light dark:bg-surface-dark border-b border-slate-200 dark:border-slate-700 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary dark:text-primary-dark tracking-tight">
            Jarvis
          </h1>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 w-64 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary font-medium"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 relative transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-slate-50 dark:bg-slate-800">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isSuperAdmin 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                : 'bg-primary/10'
            }`}>
              {isSuperAdmin ? (
                <Shield className="w-4 h-4 text-white" />
              ) : (
                <span className="text-primary dark:text-primary-dark font-semibold text-sm">
                  {avatar}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                {user?.username || user?.email}
              </span>
              {isSuperAdmin && (
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  Super Administrador
                </span>
              )}
            </div>
          </div>
          {user && (
            <button
              onClick={logout}
              className="bg-white text-primary px-4 py-2 rounded-lg hover:bg-slate-50 font-semibold border border-slate-200 transition-colors shadow-sm"
            >
              Cerrar Sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;