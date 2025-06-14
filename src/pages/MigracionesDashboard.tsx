import React, { useEffect, useState } from 'react';
import { 
  FileText, 
  Eye, 
  Trash2, 
  Play, 
  Plus, 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  ArrowDownUp,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Server,
  Users,
  Calendar,
  Filter,
  MoreHorizontal,
  Download,
  RefreshCw,
  X,
  Building2,
  Sparkles,
  Zap,
  ArrowRight,
  Info
} from 'lucide-react';
import MigracionesPage from './MigracionesPage';
import { useAuth } from '../hooks/useAuth';
import { getApiUrl } from '../services/configService';

interface Migracion {
  id: string;
  vdc: string;
  fecha_creacion: string;
  estado: string;
  usuario: string;
  created: string;
  updated: string;
}

const ESTADOS = [
  'Scheduled', 'Assessment', 'Precheck', 'Topology', 'Bridging', 'Services', 'Move vApp', 'Cleanup', 'Rollback'
];

const ESTADO_COLORS: Record<string, { bg: string; text: string; icon: React.ComponentType<any> }> = {
  'Scheduled': { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: Clock },
  'Assessment': { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', icon: Activity },
  'Precheck': { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', icon: AlertCircle },
  'Topology': { bg: 'bg-teal-50 border-teal-200', text: 'text-teal-700', icon: Server },
  'Bridging': { bg: 'bg-pink-50 border-pink-200', text: 'text-pink-700', icon: Activity },
  'Services': { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', icon: Server },
  'Move vApp': { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', icon: TrendingUp },
  'Cleanup': { bg: 'bg-slate-50 border-slate-200', text: 'text-slate-700', icon: RefreshCw },
  'Rollback': { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: AlertCircle },
};

const PAGE_SIZE = 12;

const MigracionesDashboard = () => {
  const { token } = useAuth();
  const [migraciones, setMigraciones] = useState<Migracion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ field: string; dir: 'asc' | 'desc' }>({ field: 'fecha_creacion', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [vdcName, setVdcName] = useState('');
  const [inputVdc, setInputVdc] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Mock stats for demo
  const stats = {
    total: total,
    active: Math.floor(total * 0.3),
    completed: Math.floor(total * 0.6),
    failed: Math.floor(total * 0.1)
  };

  useEffect(() => {
    if (token) {
      fetchMigraciones();
    }
    // eslint-disable-next-line
  }, [search, sort, page, filterStatus, token]);

  async function fetchMigraciones() {
    if (!token) {
      console.log('No token available, skipping fetch');
      return;
    }

    setLoading(true);
    try {
      let url = getApiUrl(`/collections/migraciones/records?perPage=${PAGE_SIZE}&page=${page}`);
      if (search) url += `&filter=(vdc~'${search}'||usuario~'${search}')`;
      if (filterStatus) url += `${search ? '&&' : '&filter='}(estado='${filterStatus}')`;
      if (sort.field) url += `&sort=${sort.dir === 'desc' ? '-' : ''}${sort.field}`;
      
      console.log('Fetching migrations from:', url);
      console.log('Using token:', token);
      
      const res = await fetch(url, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', res.status);
      console.log('Response headers:', [...res.headers.entries()]);
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Error response:', errorText);
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      const data = await res.json();
      console.log('Fetched migrations data:', data);
      
      setMigraciones(data.items || []);
      setTotal(data.totalItems || 0);
    } catch (error) {
      console.error('Error fetching migrations:', error);
      setMigraciones([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }

  const handleSort = (field: string) => {
    setSort(s => ({
      field,
      dir: s.field === field ? (s.dir === 'asc' ? 'desc' : 'asc') : 'asc'
    }));
  };

  const handleNewMigration = () => {
    setShowNew(true);
  };

  const handleCloseNew = () => {
    setShowNew(false);
    setVdcName('');
    setInputVdc('');
    // Refrescar la lista cuando se cierre la nueva migración
    fetchMigraciones();
  };

  const handleCreateMigration = (name: string) => {
    setVdcName(name);
    setShowNew(true);
  };

  // Actions
  const handleDownload = (id: string) => {
    console.log('Download:', id);
  };
  
  const handleView = (id: string) => {
    console.log('View:', id);
  };
  
  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta migración?')) {
      return;
    }

    try {
      const apiUrl = getApiUrl(`/collections/migraciones/records/${id}`);
      const response = await fetch(apiUrl, {
        method: 'DELETE',
        headers: {
          'Authorization': token
        }
      });

      if (response.ok) {
        // Refresh the list after deletion
        fetchMigraciones();
      } else {
        console.error('Error deleting migration');
      }
    } catch (error) {
      console.error('Error deleting migration:', error);
    }
  };
  
  const handleAssessment = (id: string) => {
    console.log('Assessment:', id);
  };

  // Show new migration modal
  if (showNew && !vdcName) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200">
          {/* Modal Header */}
          <div className="relative bg-slate-50 border-b border-slate-200 p-6 rounded-t-2xl">
            <button
              onClick={handleCloseNew}
              className="absolute top-4 right-4 p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-800">Nueva Migración</h2>
                <p className="text-sm text-slate-600 mt-1">Configura una nueva migración VCF</p>
              </div>
            </div>
          </div>
          
          {/* Future Automation Banner */}
          <div className="mx-6 mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-indigo-800">Próximamente: Migración Inteligente</h3>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                    Futuro
                  </span>
                </div>
                <p className="text-xs text-indigo-700 leading-relaxed">
                  En versiones futuras, <strong>Jarvis</strong> automatizará completamente este proceso. 
                  Solo necesitarás proporcionar las credenciales de vCenter y la migración se ejecutará 
                  automáticamente sin cargar archivos manualmente.
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-indigo-600">
                  <Zap className="w-3 h-3" />
                  <span className="font-medium">IA + Automatización = Migración sin esfuerzo</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modal Content */}
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Nombre del VDC
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                value={inputVdc}
                onChange={e => setInputVdc(e.target.value)}
                placeholder="Ej: 01-PROD-PRESIDENCIA-S01"
              />
              <p className="text-xs text-slate-500 mt-2">
                Este nombre se usará para identificar tu migración
              </p>
            </div>
            
            {/* Current Process Info */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-amber-800 mb-1">Proceso Actual</h4>
                  <p className="text-xs text-amber-700">
                    Por ahora, necesitarás cargar manualmente los archivos de evaluación V2T, 
                    Edge Gateways y VDC para proceder con la migración.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => inputVdc.trim() && setVdcName(inputVdc.trim())}
                disabled={!inputVdc.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-primary-600 text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Continuar
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={handleCloseNew}
                className="px-4 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Show migration page
  if (showNew && vdcName) {
    return (
      <div className="h-full">
        <MigracionesPage vdcName={vdcName} onClose={handleCloseNew} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Migraciones VCF
          </h1>
          <p className="text-slate-600 mt-1">
            Gestiona y monitorea tus migraciones de VMware Cloud Foundation
          </p>
        </div>
        
        <button
          onClick={handleNewMigration}
          className="flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors shadow-sm"
        >
          <Plus className="w-5 h-5" />
          Nueva Migración
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total</p>
              <p className="text-2xl font-bold text-slate-800 mt-1">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <Server className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Activas</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completadas</p>
              <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Fallidas</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.failed}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por VDC o usuario..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
            
            <button
              onClick={fetchMigraciones}
              className="px-4 py-3 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Debug Info - Solo en desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-gray-100 rounded-lg p-4 text-sm font-mono">
          <div><strong>Debug Info:</strong></div>
          <div>Token: {token ? '✓ Present' : '✗ Missing'}</div>
          <div>Total migrations: {total}</div>
          <div>Current search: "{search}"</div>
          <div>API URL: {getApiUrl('/collections/migraciones/records')}</div>
        </div>
      )}

      {/* Migrations Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : migraciones.length === 0 ? (
          <div className="text-center py-16">
            <Server className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-600 mb-2">
              No hay migraciones
            </h3>
            <p className="text-slate-500 mb-6">
              {token ? 'Comienza creando tu primera migración' : 'Inicia sesión para ver las migraciones'}
            </p>
            {token && (
              <button
                onClick={handleNewMigration}
                className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
              >
                Nueva Migración
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {migraciones.map((migracion: Migracion) => {
              const estadoConfig = ESTADO_COLORS[migracion.estado] || { 
                bg: 'bg-slate-50 border-slate-200', 
                text: 'text-slate-700', 
                icon: AlertCircle 
              };
              const IconComponent = estadoConfig.icon;
              
              return (
                <div key={migracion.id} className="group bg-white rounded-xl p-6 border border-slate-200 hover:shadow-md transition-all duration-200 hover:border-slate-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-slate-800 truncate text-lg mb-1">
                        {migracion.vdc}
                      </h3>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(migracion.fecha_creacion).toLocaleDateString('es-ES', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    
                    <div className="relative">
                      <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                        <MoreHorizontal className="w-4 h-4 text-slate-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${estadoConfig.bg} ${estadoConfig.text}`}>
                      <IconComponent className="w-4 h-4" />
                      <span className="text-sm font-medium">{migracion.estado}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Users className="w-4 h-4" />
                      <span>{migracion.usuario}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                      <button
                        onClick={() => handleView(migracion.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-lg transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </button>
                      
                      <button
                        onClick={() => handleAssessment(migracion.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Ejecutar assessment"
                      >
                        <Play className="w-4 h-4" />
                        Assessment
                      </button>
                      
                      <button
                        onClick={() => handleDownload(migracion.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                        title="Descargar"
                      >
                        <Download className="w-4 h-4" />
                        Descargar
                      </button>
                      
                      <button
                        onClick={() => handleDelete(migracion.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors ml-auto"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Pagination */}
        {!loading && migraciones.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
            <div className="text-sm text-slate-600">
              Mostrando {((page - 1) * PAGE_SIZE) + 1} a {Math.min(page * PAGE_SIZE, total)} de {total} migraciones
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>
              
              <span className="px-4 py-2 text-sm font-medium text-slate-700">
                Página {page} de {Math.ceil(total / PAGE_SIZE)}
              </span>
              
              <button
                onClick={() => setPage(p => Math.min(Math.ceil(total / PAGE_SIZE), p + 1))}
                disabled={page === Math.ceil(total / PAGE_SIZE)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Siguiente
              <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigracionesDashboard;