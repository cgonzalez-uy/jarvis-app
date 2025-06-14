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
  Info,
  Settings,
  SkipForward,
  ArrowUp,
  ArrowDown,
  Pause,
  RotateCcw,
  Badge,
  Circle
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

// Estados corregidos según especificación
const ESTADOS = [
  'Assessment',
  'Prepare T0', 
  'Precheck',
  'Topology', 
  'Bridging',
  'Services', 
  'Move vApp', 
  'Cleanup',
  'Rollback', // Fallida o cancelada
  'Completada' // A demanda o después de Cleanup
];

const ESTADO_CONFIGS: Record<string, { 
  bg: string; 
  text: string; 
  icon: React.ComponentType<any>;
  progress: number;
  nextStates?: string[];
  color: string;
}> = {
  'Assessment': { 
    bg: 'bg-blue-50 border-blue-200', 
    text: 'text-blue-700', 
    icon: Activity, 
    progress: 10,
    nextStates: ['Prepare T0', 'Rollback'],
    color: 'blue'
  },
  'Prepare T0': { 
    bg: 'bg-purple-50 border-purple-200', 
    text: 'text-purple-700', 
    icon: Settings, 
    progress: 20,
    nextStates: ['Precheck', 'Rollback'],
    color: 'purple'
  },
  'Precheck': { 
    bg: 'bg-amber-50 border-amber-200', 
    text: 'text-amber-700', 
    icon: AlertCircle, 
    progress: 30,
    nextStates: ['Topology', 'Rollback'],
    color: 'amber'
  },
  'Topology': { 
    bg: 'bg-teal-50 border-teal-200', 
    text: 'text-teal-700', 
    icon: Server, 
    progress: 40,
    nextStates: ['Bridging', 'Rollback'],
    color: 'teal'
  },
  'Bridging': { 
    bg: 'bg-pink-50 border-pink-200', 
    text: 'text-pink-700', 
    icon: Activity, 
    progress: 50,
    nextStates: ['Services', 'Rollback'],
    color: 'pink'
  },
  'Services': { 
    bg: 'bg-orange-50 border-orange-200', 
    text: 'text-orange-700', 
    icon: Server, 
    progress: 70,
    nextStates: ['Move vApp', 'Rollback'],
    color: 'orange'
  },
  'Move vApp': { 
    bg: 'bg-indigo-50 border-indigo-200', 
    text: 'text-indigo-700', 
    icon: TrendingUp, 
    progress: 85,
    nextStates: ['Cleanup', 'Rollback'],
    color: 'indigo'
  },
  'Cleanup': { 
    bg: 'bg-slate-50 border-slate-200', 
    text: 'text-slate-700', 
    icon: RefreshCw, 
    progress: 95,
    nextStates: ['Completada'],
    color: 'slate'
  },
  'Rollback': { 
    bg: 'bg-red-50 border-red-200', 
    text: 'text-red-700', 
    icon: RotateCcw, 
    progress: 0,
    nextStates: [], // Estado final (fallida)
    color: 'red'
  },
  'Completada': { 
    bg: 'bg-emerald-50 border-emerald-200', 
    text: 'text-emerald-700', 
    icon: CheckCircle, 
    progress: 100,
    nextStates: [], // Estado final (exitosa)
    color: 'emerald'
  }
};

const PAGE_SIZE = 10;

const MigracionesDashboard = () => {
  const { token } = useAuth();
  const [migraciones, setMigraciones] = useState<Migracion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showAssessment, setShowAssessment] = useState(false);
  const [assessmentVdc, setAssessmentVdc] = useState('');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<{ field: string; dir: 'asc' | 'desc' }>({ field: 'fecha_creacion', dir: 'desc' });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [vdcName, setVdcName] = useState('');
  const [inputVdc, setInputVdc] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [changingState, setChangingState] = useState<string | null>(null);

  // Calcular estadísticas basadas en los estados
  const stats = React.useMemo(() => {
    const active = migraciones.filter(m => 
      !['Completada', 'Rollback'].includes(m.estado)
    ).length;
    const completed = migraciones.filter(m => m.estado === 'Completada').length;
    const failed = migraciones.filter(m => m.estado === 'Rollback').length;
    
    return {
      total: migraciones.length,
      active,
      completed,
      failed
    };
  }, [migraciones]);

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
      
      const res = await fetch(url, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });
      
      if (!res.ok) {
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
    fetchMigraciones();
  };

  const handleCloseAssessment = () => {
    setShowAssessment(false);
    setAssessmentVdc('');
    fetchMigraciones();
  };

  // Cambiar estado de migración
  const handleChangeState = async (migracionId: string, newState: string) => {
    setChangingState(migracionId);
    
    try {
      const apiUrl = getApiUrl(`/collections/migraciones/records/${migracionId}`);
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ 
          estado: newState,
          updated: new Date().toISOString()
        })
      });

      if (response.ok) {
        fetchMigraciones(); // Refrescar la lista
      } else {
        console.error('Error updating migration state');
      }
    } catch (error) {
      console.error('Error updating migration state:', error);
    } finally {
      setChangingState(null);
    }
  };

  // Manejar assessment (verificar si existe y actualizar o crear nuevo)
  const handleAssessment = async (vdcName: string) => {
    try {
      // Buscar si ya existe una migración para este VDC
      const searchUrl = getApiUrl(`/collections/migraciones/records?filter=(vdc='${vdcName}')`);
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'Authorization': token,
          'Content-Type': 'application/json'
        }
      });

      if (searchResponse.ok) {
        const searchData = await searchResponse.json();
        
        if (searchData.items && searchData.items.length > 0) {
          // Ya existe, dirigir a assessment para actualizar
          console.log('Migration exists for VDC:', vdcName, 'Redirecting to assessment...');
          setAssessmentVdc(vdcName);
          setShowAssessment(true);
          return;
        }
      }

      // No existe, crear nueva migración
      console.log('No existing migration found for VDC:', vdcName, 'Creating new...');
      setVdcName(vdcName);
      setShowNew(true);
      
    } catch (error) {
      console.error('Error checking existing migration:', error);
      // En caso de error, asumir que no existe y crear nueva
      setVdcName(vdcName);
      setShowNew(true);
    }
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
        fetchMigraciones();
      } else {
        console.error('Error deleting migration');
      }
    } catch (error) {
      console.error('Error deleting migration:', error);
    }
  };

  // Render progress circle
  const renderProgressCircle = (progress: number, color: string) => {
    const circumference = 2 * Math.PI * 16; // radio = 16
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (progress / 100) * circumference;

    return (
      <div className="relative w-12 h-12">
        <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 40 40">
          {/* Background circle */}
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-gray-200"
          />
          {/* Progress circle */}
          <circle
            cx="20"
            cy="20"
            r="16"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            className={`text-${color}-500 transition-all duration-300`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-xs font-bold text-${color}-600`}>
            {progress}%
          </span>
        </div>
      </div>
    );
  };

  // Show new migration modal
  if (showNew && !vdcName) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200">
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
  
  // Show migration page (new or assessment)
  if ((showNew && vdcName) || (showAssessment && assessmentVdc)) {
    return (
      <div className="h-full">
        <MigracionesPage 
          vdcName={vdcName || assessmentVdc} 
          onClose={showNew ? handleCloseNew : handleCloseAssessment} 
        />
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

      {/* Migrations Table */}
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    <button 
                      onClick={() => handleSort('vdc')}
                      className="flex items-center gap-2 hover:text-slate-900"
                    >
                      VDC
                      <ArrowDownUp className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Progreso</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">Estado</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    <button 
                      onClick={() => handleSort('usuario')}
                      className="flex items-center gap-2 hover:text-slate-900"
                    >
                      Usuario
                      <ArrowDownUp className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-slate-700">
                    <button 
                      onClick={() => handleSort('fecha_creacion')}
                      className="flex items-center gap-2 hover:text-slate-900"
                    >
                      Fecha
                      <ArrowDownUp className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="text-center px-6 py-4 text-sm font-semibold text-slate-700">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {migraciones.map((migracion: Migracion) => {
                  const estadoConfig = ESTADO_CONFIGS[migracion.estado] || ESTADO_CONFIGS['Assessment'];
                  const IconComponent = estadoConfig.icon;
                  
                  return (
                    <tr key={migracion.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 bg-gradient-to-br from-${estadoConfig.color}-500 to-${estadoConfig.color}-700 rounded-lg flex items-center justify-center`}>
                            <Building2 className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{migracion.vdc}</div>
                            <div className="text-sm text-slate-500">ID: {migracion.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {renderProgressCircle(estadoConfig.progress, estadoConfig.color)}
                          <div>
                            <div className="text-sm font-medium text-slate-700">
                              {estadoConfig.progress}% completado
                            </div>
                            <div className="text-xs text-slate-500">
                              Etapa {ESTADOS.indexOf(migracion.estado) + 1} de {ESTADOS.length - 2}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-2">
                          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border text-sm font-medium ${estadoConfig.bg} ${estadoConfig.text}`}>
                            <IconComponent className="w-4 h-4" />
                            {migracion.estado}
                          </div>
                          
                          {/* Quick state change buttons */}
                          {estadoConfig.nextStates && estadoConfig.nextStates.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {estadoConfig.nextStates.map(nextState => (
                                <button
                                  key={nextState}
                                  onClick={() => handleChangeState(migracion.id, nextState)}
                                  disabled={changingState === migracion.id}
                                  className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded transition-colors ${
                                    nextState === 'Rollback' 
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                      : nextState === 'Completada'
                                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                                  }`}
                                >
                                  {changingState === migracion.id ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : nextState === 'Rollback' ? (
                                    <RotateCcw className="w-3 h-3" />
                                  ) : nextState === 'Completada' ? (
                                    <CheckCircle className="w-3 h-3" />
                                  ) : (
                                    <SkipForward className="w-3 h-3" />
                                  )}
                                  {nextState}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Users className="w-4 h-4" />
                          <span>{migracion.usuario}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Calendar className="w-4 h-4" />
                          <span>
                            {new Date(migracion.fecha_creacion).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleView(migracion.id)}
                            className="p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleAssessment(migracion.vdc)}
                            className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Ejecutar/Actualizar assessment"
                          >
                            <Play className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDownload(migracion.id)}
                            className="p-2 text-primary-600 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                            title="Descargar reporte"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDelete(migracion.id)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar migración"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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