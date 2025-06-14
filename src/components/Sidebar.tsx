import { NavLink } from 'react-router-dom';
import { ServerCog, Settings, Link2, Users, Shield, ChevronRight, Zap, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  {
    name: 'Migraciones VCF',
    href: '/migraciones',
    icon: ServerCog,
    description: 'Gestiona migraciones',
    color: 'from-primary-500 to-primary-700'
  },
  {
    name: 'Configuración',
    href: '/configuracion',
    icon: Settings,
    description: 'Ajustes del sistema',
    color: 'from-slate-500 to-slate-700'
  },
  {
    name: 'Webhooks',
    href: '/webhooks',
    icon: Link2,
    description: 'Integraciones activas',
    color: 'from-accent-teal to-emerald-600'
  },
  {
    name: 'Usuarios',
    href: '/usuarios',
    icon: Users,
    description: 'Administrar usuarios',
    color: 'from-accent-purple to-accent-pink'
  }
];

const Sidebar = () => {
  const { user, isSuperAdmin } = useAuth();
  const avatar = user?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';
  
  return (
    <aside className="w-80 bg-gradient-to-b from-slate-900 via-slate-900/95 to-primary-950/95 backdrop-blur-xl border-r border-white/10 flex flex-col shadow-2xl">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-900/20 via-transparent to-accent-purple/10 opacity-50"></div>
      
      <div className="relative flex-1 flex flex-col">
        {/* Navigation Header */}
        <div className="px-6 py-8">
          <div className="flex items-center space-x-3 mb-8">
            <div className="w-2 h-8 bg-gradient-to-b from-primary-400 to-accent-purple rounded-full"></div>
            <h2 className="text-lg font-bold text-white">Navegación</h2>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-6 space-y-3">
          {navigation.map((item, index) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group relative flex items-center px-4 py-4 text-sm font-semibold rounded-2xl transition-all duration-300 overflow-hidden ${
                  isActive
                    ? 'bg-white/20 text-white shadow-glow-primary'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Background gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 group-hover:opacity-20 ${isActive ? 'opacity-30' : ''} transition-opacity duration-300`}></div>
                  
                  {/* Icon container */}
                  <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center mr-4 transition-all duration-300 ${
                    isActive 
                      ? `bg-gradient-to-r ${item.color} shadow-lg` 
                      : 'bg-white/10 group-hover:bg-white/20'
                  }`}>
                    <item.icon className={`w-5 h-5 transition-all duration-300 ${
                      isActive ? 'text-white scale-110' : 'text-slate-400 group-hover:text-white group-hover:scale-110'
                    }`} />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="truncate">{item.name}</span>
                      <ChevronRight className={`w-4 h-4 transition-all duration-300 ${
                        isActive 
                          ? 'text-white translate-x-1' 
                          : 'text-slate-500 group-hover:text-slate-300 group-hover:translate-x-1'
                      }`} />
                    </div>
                    <p className={`text-xs mt-1 transition-colors duration-300 ${
                      isActive 
                        ? 'text-slate-200' 
                        : 'text-slate-500 group-hover:text-slate-400'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary-400 to-accent-purple rounded-r-full"></div>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="px-6 py-4">
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center">
              <Activity className="w-4 h-4 mr-2 text-primary-400" />
              Estado del Sistema
            </h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Migraciones Activas</span>
                <span className="text-xs font-semibold text-emerald-400">12</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Webhooks</span>
                <span className="text-xs font-semibold text-primary-400">5</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Usuarios</span>
                <span className="text-xs font-semibold text-secondary-400">28</span>
              </div>
            </div>
          </div>
        </div>

        {/* User Profile Section */}
        <div className="p-6 border-t border-white/10">
          <div className={`relative overflow-hidden rounded-2xl p-4 transition-all duration-300 ${
            isSuperAdmin 
              ? 'bg-gradient-to-r from-accent-purple/20 to-accent-pink/20 border border-accent-purple/30' 
              : 'bg-white/5 border border-white/10'
          } backdrop-blur-md`}>
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
            
            <div className="relative flex items-center space-x-4">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isSuperAdmin 
                    ? 'bg-gradient-to-br from-accent-purple to-accent-pink shadow-glow-secondary' 
                    : 'bg-gradient-to-br from-primary-500 to-primary-700 shadow-glow-primary'
                }`}>
                  {isSuperAdmin ? (
                    <Shield className="w-5 h-5 text-white" />
                  ) : (
                    <span className="text-sm font-bold text-white">{avatar}</span>
                  )}
                  
                  {/* Online status */}
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-slate-900 flex items-center justify-center">
                    <div className="w-2 h-2 bg-emerald-300 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              {/* User Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.username || user?.email}
                </p>
                <div className="flex items-center space-x-2">
                  {isSuperAdmin ? (
                    <>
                      <Zap className="w-3 h-3 text-accent-purple" />
                      <span className="text-xs bg-gradient-to-r from-accent-purple to-accent-pink bg-clip-text text-transparent font-bold">
                        Super Administrador
                      </span>
                    </>
                  ) : (
                    <>
                      <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-slate-400 font-medium">
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