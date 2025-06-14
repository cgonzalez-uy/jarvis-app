import { Bell, Search, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Header = () => {
  const { user, logout, isSuperAdmin } = useAuth();
  const avatar = user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-surface-light dark:bg-surface-dark border-b border-gray-200 dark:border-gray-700 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-2xl font-bold text-primary dark:text-primary-dark">
            Jarvis
          </h1>
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="pl-10 pr-4 py-2 w-64 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
          </button>
          <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isSuperAdmin 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                : 'bg-primary/10'
            }`}>
              {isSuperAdmin ? (
                <Shield className="w-4 h-4 text-white" />
              ) : (
                <span className="text-primary dark:text-primary-dark font-medium text-sm">
                  {avatar}
                </span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.username || user?.email}
              </span>
              {isSuperAdmin && (
                <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                  Super Admin
                </span>
              )}
            </div>
          </div>
          {user && (
            <button
              onClick={logout}
              className="bg-white text-primary px-4 py-2 rounded-lg hover:bg-gray-100 font-semibold border border-gray-200 transition-colors"
            >
              Cerrar sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;