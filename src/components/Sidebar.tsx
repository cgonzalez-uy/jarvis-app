import { NavLink } from 'react-router-dom';
import { ServerCog, Settings, Link2, Users, Shield, ChevronRight, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  {
    name: 'Migraciones VCF',
    href: '/migraciones',
    icon: ServerCog,
    description: 'Gestiona migraciones',
  },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: Settings,
    description: 'Ajustes del sistema',
  },
  {
    name: 'Webhooks',
    href: '/webhooks',
    icon: Link2,
    description: 'Integraciones activas',
  },
  {
    name: 'Usuarios',
    href: '/usuarios',
    icon: Users,
    description: 'Administrar usuarios',
  }
];

const Sidebar = () => {
  const { user, isSuperAdmin } = useAuth();
  const avatar = user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  
  return (
    <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
      <div className="flex-1 flex flex-col">
        {/* Navigation Header */}
        <div className="px-6 py-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-6 bg-primary-500 rounded-full"></div>
            <h2 className="text-lg font-semibold text-slate-800">Navegación</h2>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-6 py-6 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group relative flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'bg-primary-50 text-primary-700 border border-primary-100'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Icon container */}
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center mr-3 transition-all duration-200 ${
                    isActive 
                      ? 'bg-primary-100 text-primary-600' 
                      : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-600'
                  }`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="truncate font-medium">{item.name}</span>
                      <ChevronRight className={`w-4 h-4 transition-all duration-200 ${
                        isActive 
                          ? 'text-primary-500 translate-x-1' 
                          : 'text-slate-400 group-hover:text-slate-500 group-hover:translate-x-0.5'
                      }`} />
                    </div>
                    <p className={`text-xs mt-0.5 transition-colors duration-200 ${
                      isActive 
                        ? 'text-primary-600/80' 
                        : 'text-slate-500 group-hover:text-slate-600'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-primary-500 rounded-r-sm"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User Profile Section */}
        <div className="p-6 border-t border-slate-100">
          <div className={`rounded-xl p-4 transition-all duration-200 ${
            isSuperAdmin 
              ? 'bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100' 
              : 'bg-slate-50 border border-slate-200'
          }`}>
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-semibold text-sm transition-all duration-200 ${
                  isSuperAdmin 
                    ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                    : 'bg-primary-100 text-primary-700 border border-primary-200'
                }`}>
                  {isSuperAdmin ? (
                    <Shield className="w-5 h-5" />
                  ) : (
                    <span>{avatar}</span>
                  )}
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {user?.username || user?.email}
                </p>
                <div className="flex items-center space-x-1">
                  {isSuperAdmin ? (
                    <span className="text-xs font-medium text-indigo-600">
                      Super Administrador
                    </span>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                      <span className="text-xs text-slate-500">
                        En línea
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;