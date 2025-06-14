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
  Sparkles,
  Zap
} from 'lucide-react';
import MigracionesPage from './MigracionesPage';

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
  'Scheduled': { bg: 'bg-blue-100 border-blue-200', text: 'text-blue-800', icon: Clock },
  'Assessment': { bg: 'bg-purple-100 border-purple-200', text: 'text-purple-800', icon: Activity },
  'Precheck': { bg: 'bg-amber-100 border-amber-200', text: 'text-amber-800', icon: AlertCircle },
  'Topology': { bg: 'bg-teal-100 border-teal-200', text: 'text-teal-800', icon: Server },
  'Bridging': { bg: 'bg-pink-100 border-pink-200', text: 'text-pink-800', icon: Activity },
  'Services': { bg: 'bg-orange-100 border-orange-200', text: 'text-orange-800', icon: Server },
  'Move vApp': { bg: 'bg-emerald-100 border-emerald-200', text: 'text-emerald-800', icon: TrendingUp },
  'Cleanup': { bg: 'bg-slate-100 border-slate-200', text: 'text-slate-800', icon: RefreshCw },
  'Rollback': { bg: 'bg-red-100 border-red-200', text: 'text-red-800', icon: AlertCircle },
};

const PAGE_SIZE = 12;

const MigracionesDashboard = () => {
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
    fetchMigraciones();
    // eslint-disable-next-line
  }, [search, sort, page, filterStatus]);

  async function fetchMigraciones() {
    setLoading(true);
    try {
      let url = `/api/collections/migraciones/records?perPage=${PAGE_SIZE}&page=${page}`;
      if (search) url += `&filter=(vdc~'${search}'||usuario~'${search}')`;
      if (filterStatus) url += `${search ? '&&' : '&filter='}(estado='${filterStatus}')`;
      if (sort.field) url += `&sort=${sort.dir === 'desc' ? '-' : ''}${sort.field}`;
      
      const res = await fetch(url);
      const data = await res.json();
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
  
  const handleDelete = (id: string) => {
    console.log('Delete:', id);
  };
  
  const handleAssessment = (id: string) => {
    console.log('Assessment:', id);
  };

  // Show new migration modal
  if (showNew && !vdcName) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">
          {/* Modal Header */}
          <div className="relative bg-gradient-to-r from-primary-500 via-primary-600 to-accent-purple p-8 text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-primary-600/20 via-accent-purple/10 to-primary-700/20 animate-pulse-slow"></div>
            
            <button
              onClick={handleCloseNew}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 transition-all duration-300 group"
            >
              <X className="w-5 h-5 transform group-hover:rotate-90 transition-transform" />
            </button>
            
            <div className="relative flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex items-center justify-center shadow-glow-primary">
                <Sparkles className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight">Nueva Migración</h2>
                <p className="text-white/80 font-medium mt-1">Configura tu migración VCF</p>
              </div>
            </div>
          </div>
          
          {/* Modal Content */}
          <div className="p-8 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Server className="w-6 h-6 text-primary-600" />
              </div>
              <p className="text-slate-600 font-medium">
                Ingresa el nombre del VDC que deseas migrar
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Nombre del VDC
                </label>
                <div className="relative">
                  <input
                    type="text"
                    className="w-full px-4 py-4 pl-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 bg-slate-50/50 hover:bg-white text-slate-700 font-medium placeholder-slate-400"
                    value={inputVdc}
                    onChange={e => setInputVdc(e.target.value)}
                    placeholder="Ej: 01-PROD-PRESIDENCIA-S01"
                  />
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  Este nombre se usará para identificar tu migración
                </p>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => inputVdc.trim() && setVdcName(inputVdc.trim())}
                  disabled={!inputVdc.trim()}
                  className="flex-1 bg-gradient-to-r from-primary-500 to-primary-700 text-white px-6 py-4 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-glow-primary flex items-center justify-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Continuar
                </button>
                <button
                  onClick={handleCloseNew}
                  className="px-6 py-4 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 transition-all duration-300"
                >
                  Cancelar
                </button>
              </div>
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
          <h1 className="text-4xl font-bold text-slate-800 tracking-tight">
            Migraciones VCF
          </h1>
          <p className="text-slate-600 mt-2">
            Gestiona y monitorea tus migraciones de VMware Cloud Foundation
          </p>
        </div>
        
        <button
          onClick={handleNewMigration}
          className="flex items-center gap-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white px-6 py-3 rounded-xl shadow-lg hover:from-primary-600 hover:to-primary-800 transition-all duration-200 font-semibold transform hover:scale-105 hover:shadow-glow-primary"
        >
          <Plus className="w-5 h-5" />
          Nueva Migración
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total</p>
              <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Server className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Activas</p>
              <p className="text-3xl font-bold text-blue-600">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Completadas</p>
              <p className="text-3xl font-bold text-emerald-600">{stats.completed}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Fallidas</p>
              <p className="text-3xl font-bold text-red-600">{stats.failed}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por VDC o usuario..."
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={e => { setFilterStatus(e.target.value); setPage(1); }}
              className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map(estado => (
                <option key={estado} value={estado}>{estado}</option>
              ))}
            </select>
            
            <button
              onClick={fetchMigraciones}
              className="px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Migrations Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
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
              Comienza creando tu primera migración
            </p>
            <button
              onClick={handleNewMigration}
              className="bg-gradient-to-r from-primary-500 to-primary-700 text-white px-6 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-800 transition-all duration-200"
            >
              Nueva Migración
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {migraciones.map((migracion: Migracion) => {
              const estadoConfig = ESTADO_COLORS[migracion.estado] || { 
                bg: 'bg-slate-100 border-slate-200', 
                text: 'text-slate-800', 
                icon: AlertCircle 
              };
              const IconComponent = estadoConfig.icon;
              
              return (
                <div key={migracion.id} className="group bg-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all duration-200 hover:border-slate-300">
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
                      <button className="p-2 hover:bg-white rounded-lg transition-colors">
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
                    
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                      <button
                        onClick={() => handleView(migracion.id)}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-white rounded-lg transition-colors"
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