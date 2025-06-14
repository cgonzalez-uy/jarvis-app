import React from 'react';
import { ArrowLeft, Sparkles, Clock, Wrench, Zap, CheckCircle } from 'lucide-react';

interface ComingSoonPageProps {
  featureName: string;
  onClose: () => void;
}

const ComingSoonPage: React.FC<ComingSoonPageProps> = ({ featureName, onClose }) => {
  const features = [
    {
      name: 'Automatización Completa',
      description: 'Proceso completamente automatizado sin intervención manual',
      icon: Zap,
      status: 'En desarrollo'
    },
    {
      name: 'Monitoreo en Tiempo Real',
      description: 'Seguimiento detallado del progreso de cada etapa',
      icon: Clock,
      status: 'Planificado'
    },
    {
      name: 'Rollback Inteligente',
      description: 'Capacidad de revertir cambios automáticamente en caso de errores',
      icon: Wrench,
      status: 'En desarrollo'
    },
    {
      name: 'Validaciones Avanzadas',
      description: 'Verificaciones exhaustivas antes de cada etapa crítica',
      icon: CheckCircle,
      status: 'Planificado'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900/95 via-primary-950/95 to-slate-900/95 backdrop-blur-xl border-b border-white/10">
        <div className="px-8 py-6">
          <div className="flex items-center gap-6">
            <button
              onClick={onClose}
              className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 group"
            >
              <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-purple rounded-xl shadow-glow-primary flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {featureName}
                </h1>
                <p className="text-slate-300">Funcionalidad en desarrollo</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <div className="w-32 h-32 bg-gradient-to-br from-primary-500 to-accent-purple rounded-3xl shadow-glow-primary flex items-center justify-center mx-auto mb-8">
              <Sparkles className="w-16 h-16 text-white animate-pulse" />
            </div>
            
            <h2 className="text-4xl font-bold text-slate-800 mb-4">
              🚀 {featureName}
            </h2>
            <p className="text-xl text-slate-600 mb-8 max-w-2xl mx-auto">
              Estamos trabajando arduamente para traerte esta increíble funcionalidad. 
              Pronto podrás disfrutar de una experiencia completamente automatizada y profesional.
            </p>
            
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-100 to-accent-purple/10 border border-primary-200 rounded-2xl px-6 py-3">
              <Clock className="w-5 h-5 text-primary-600" />
              <span className="text-primary-700 font-semibold">Estará disponible muy pronto</span>
            </div>
          </div>

          {/* Features Preview */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-slate-800 mb-8">
              Lo que puedes esperar de {featureName}
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-all duration-300">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div className="text-left">
                        <h4 className="text-lg font-semibold text-slate-800 mb-2">
                          {feature.name}
                        </h4>
                        <p className="text-slate-600 text-sm mb-3">
                          {feature.description}
                        </p>
                        <span className="inline-flex items-center gap-1 bg-primary-100 text-primary-700 px-3 py-1 rounded-lg text-xs font-medium">
                          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                          {feature.status}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
            <h3 className="text-2xl font-bold text-slate-800 mb-6">
              🗓️ Hoja de Ruta
            </h3>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-emerald-800">Fase 1: Assessment Automatizado</div>
                  <div className="text-sm text-emerald-600">✅ Completado - Disponible ahora</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Wrench className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-blue-800">Fase 2: {featureName}</div>
                  <div className="text-sm text-blue-600">🔄 En desarrollo activo</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center">
                  <Clock className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-slate-700">Fase 3: Automatización Completa</div>
                  <div className="text-sm text-slate-500">⏳ Próximamente</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-12">
            <button
              onClick={onClose}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-800 transition-all duration-300 transform hover:scale-105 hover:shadow-glow-primary"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;