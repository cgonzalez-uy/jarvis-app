import { NavLink } from 'react-router-dom';
import { ServerCog, Settings, Link2, Users } from 'lucide-react';
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
  const { user } = useAuth();
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
        <div className="flex items-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3">
          <div className="flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center ring-2 ring-primary/20">
              <span className="text-sm font-medium text-primary">{avatar}</span>
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {user?.username || user?.email}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Usuario
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar; 