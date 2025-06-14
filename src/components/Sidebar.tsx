import { NavLink } from 'react-router-dom';
import { ServerCog, Settings, Link2, Users, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  {
    name: 'Migraciones VCF',
    href: '/migraciones',
    icon: ServerCog
  },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: Settings
  },
  {
    name: 'Webhooks',
    href: '/webhooks',
    icon: Link2
  },
  {
    name: 'Usuarios',
    href: '/usuarios',
    icon: Users
  }
];

const Sidebar = () => {
  const { user, isSuperAdmin } = useAuth();
  const avatar = user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
      <div className="flex-1 flex flex-col">
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary/10 text-primary dark:bg-primary/20 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:shadow-sm'
                }`
              }
            >
              <item.icon className="h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110" />
              <span className="ml-4">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className={`flex items-center rounded-lg p-3 ${
          isSuperAdmin 
            ? 'bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20' 
            : 'bg-gray-50 dark:bg-gray-800/50'
        }`}>
          <div className="flex-shrink-0">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
              isSuperAdmin 
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 ring-2 ring-purple-200' 
                : 'bg-primary/10 ring-2 ring-primary/20'
            }`}>
              {isSuperAdmin ? (
                <Shield className="w-4 h-4 text-white" />
              ) : (
                <span className="text-sm font-medium text-primary">{avatar}</span>
              )}
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.username || user?.email}
            </p>
            <p className={`text-xs ${
              isSuperAdmin 
                ? 'text-purple-600 dark:text-purple-400 font-medium' 
                : 'text-gray-500 dark:text-gray-400'
            }`}>
              {isSuperAdmin ? 'Super Admin' : 'Usuario'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;