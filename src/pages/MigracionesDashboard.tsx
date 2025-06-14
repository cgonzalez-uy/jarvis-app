import React, { useEffect, useState } from 'react';
import { FileText, Eye, Trash2, Play, Plus, Search, ChevronLeft, ChevronRight, Loader2, ArrowDownUp } from 'lucide-react';
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
const ESTADO_COLORS: Record<string, string> = {
  Scheduled: 'bg-blue-200 text-blue-800',
  Assessment: 'bg-purple-200 text-purple-800',
  Precheck: 'bg-yellow-200 text-yellow-800',
  Topology: 'bg-teal-200 text-teal-800',
  Bridging: 'bg-pink-200 text-pink-800',
  Services: 'bg-orange-200 text-orange-800',
  'Move vApp': 'bg-green-200 text-green-800',
  Cleanup: 'bg-gray-200 text-gray-800',
  Rollback: 'bg-red-200 text-red-800',
};

const PAGE_SIZE = 10;

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

  useEffect(() => {
    fetchMigraciones();
    // eslint-disable-next-line
  }, [search, sort, page]);

  async function fetchMigraciones() {
    setLoading(true);
    let url = `http://localhost:8090/api/collections/migraciones/records?perPage=${PAGE_SIZE}&page=${page}`;
    if (search) url += `&filter=(vdc~'${search}'||usuario~'${search}')`;
    if (sort.field) url += `&sort=${sort.dir === 'desc' ? '-' : ''}${sort.field}`;
    const res = await fetch(url);
    const data = await res.json();
    setMigraciones(data.items || []);
    setTotal(data.totalItems || 0);
    setLoading(false);
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
    fetchMigraciones();
  };

  const handleCreateMigration = (name: string) => {
    setVdcName(name);
    setShowNew(true);
  };

  // Acciones rápidas (placeholders)
  const handleDownload = (id: string) => {};
  const handleView = (id: string) => {};
  const handleDelete = (id: string) => {};
  const handleAssessment = (id: string) => {};

  // Mostrar MigracionesPage a pantalla completa si showNew es true
  if (showNew) {
    // Si no hay vdcName, mostrar input para ingresarlo y el mensaje destacado
    if (!vdcName) {
      const handleContinue = () => {
        if (inputVdc.trim()) setVdcName(inputVdc.trim());
      };
      const handleCancel = () => {
        setShowNew(false);
        setVdcName('');
        setInputVdc('');
      };
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center p-8">
          <div className="w-full bg-white rounded-2xl shadow-xl p-8 mt-12">
            <div className="mb-8 w-fit min-w-[350px]">
              <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-lg flex items-center gap-4 shadow">
                <div className="flex-shrink-0">
                  <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" /></svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-blue-700 mb-1">¡Próximamente!</h3>
                  <p className="text-blue-700 text-sm">En futuras versiones podrás seleccionar el VDC directamente desde la plataforma y el assessment se ejecutará automáticamente.</p>
                </div>
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Nueva Migración</h2>
            <div className="flex flex-col gap-4 w-fit min-w-[350px]">
              <label className="font-medium text-gray-700">Nombre del VDC</label>
              <input
                type="text"
                className="border rounded-lg px-4 py-2 text-lg focus:ring-2 focus:ring-primary"
                style={{ width: 350 }}
                value={inputVdc}
                onChange={e => setInputVdc(e.target.value)}
                placeholder="Ej: 01-PROD-PRESIDENCIA-S01"
              />
              <button
                className="mt-2 bg-primary text-white px-8 py-2 rounded-lg font-semibold text-lg hover:bg-primary-dark"
                disabled={!inputVdc.trim()}
                onClick={handleContinue}
                style={{ width: 200 }}
              >
                Continuar
              </button>
              <button
                className="mt-2 text-gray-500 hover:text-gray-700 underline"
                onClick={handleCancel}
                style={{ width: 200 }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      );
    }
    // Si ya hay vdcName, mostrar MigracionesPage
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center p-8">
        <div className="w-full bg-white rounded-none shadow-xl p-8 mt-0">
          <MigracionesPage vdcName={vdcName} onClose={() => { setShowNew(false); setVdcName(''); setInputVdc(''); fetchMigraciones(); }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-200 flex flex-col items-center p-8">
      <div className="w-full bg-white rounded-none shadow-xl p-8 mb-8 mt-0">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Migraciones VCF</h1>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-lg shadow hover:bg-primary-dark transition font-semibold text-lg"
          >
            <Plus className="w-5 h-5" />
            Nueva
          </button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">
          <div className="relative w-full md:w-72">
            <input
              type="text"
              placeholder="Buscar VDC o usuario..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:outline-none bg-gray-50"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
            <Search className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
          <table className="min-w-full text-sm text-gray-700">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 cursor-pointer select-none" onClick={() => handleSort('vdc')}>
                  VDC <ArrowDownUp className="inline w-4 h-4 ml-1 text-gray-400" />
                </th>
                <th className="p-3 cursor-pointer select-none" onClick={() => handleSort('fecha_creacion')}>
                  Fecha <ArrowDownUp className="inline w-4 h-4 ml-1 text-gray-400" />
                </th>
                <th className="p-3 cursor-pointer select-none" onClick={() => handleSort('estado')}>
                  Estado <ArrowDownUp className="inline w-4 h-4 ml-1 text-gray-400" />
                </th>
                <th className="p-3 cursor-pointer select-none" onClick={() => handleSort('usuario')}>
                  Usuario <ArrowDownUp className="inline w-4 h-4 ml-1 text-gray-400" />
                </th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></td></tr>
              ) : migraciones.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-400">Sin migraciones registradas</td></tr>
              ) : (
                migraciones.map((m: Migracion) => (
                  <tr key={m.id} className="border-b last:border-b-0 hover:bg-gray-50 transition">
                    <td className="p-3 font-semibold">{m.vdc}</td>
                    <td className="p-3">{new Date(m.fecha_creacion).toLocaleDateString()}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full font-bold text-xs shadow ${ESTADO_COLORS[m.estado] || 'bg-gray-300 text-gray-700'}`}>{m.estado}</span>
                    </td>
                    <td className="p-3">{m.usuario}</td>
                    <td className="p-3 flex gap-2 items-center">
                      <button title="Descargar" onClick={() => handleDownload(m.id)} className="p-2 rounded hover:bg-gray-100"><FileText className="w-4 h-4 text-primary" /></button>
                      <button title="Ver estado" onClick={() => handleView(m.id)} className="p-2 rounded hover:bg-gray-100"><Eye className="w-4 h-4 text-blue-500" /></button>
                      <button title="Assessment" onClick={() => handleAssessment(m.id)} className="p-2 rounded hover:bg-gray-100"><Play className="w-4 h-4 text-green-500" /></button>
                      <button title="Eliminar" onClick={() => handleDelete(m.id)} className="p-2 rounded hover:bg-gray-100"><Trash2 className="w-4 h-4 text-red-500" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-6">
          <div className="text-gray-500 text-sm">
            Página {page} de {Math.ceil(total / PAGE_SIZE)}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setPage(p => Math.min(Math.ceil(total / PAGE_SIZE), p + 1))}
              disabled={page === Math.ceil(total / PAGE_SIZE)}
              className="p-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MigracionesDashboard; 