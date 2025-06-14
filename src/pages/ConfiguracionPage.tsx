import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Globe, 
  Server, 
  Link, 
  Eye,
  EyeOff,
  Copy,
  ExternalLink,
  Trash2,
  Terminal,
  FileText,
  Settings,
  FolderOpen,
  Search
} from 'lucide-react';
import { getConfig, saveConfig, resetConfig } from '../services/configService';

interface ConfigForm {
  pocketbaseUrl: string;
  n8nWebhookUrl: string;
}

const ConfiguracionPage = () => {
  const [config, setConfig] = useState<ConfigForm>({ pocketbaseUrl: '', n8nWebhookUrl: '' });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState({ pocketbase: false, n8n: false });
  const [testResults, setTestResults] = useState({ pocketbase: null as boolean | null, n8n: null as boolean | null });
  const [showUrls, setShowUrls] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = () => {
    const savedConfig = getConfig();
    setConfig({
      pocketbaseUrl: savedConfig.pocketbaseUrl,
      n8nWebhookUrl: savedConfig.n8nWebhookUrl
    });
  };

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Validate URLs
      if (config.pocketbaseUrl && !isValidUrl(config.pocketbaseUrl)) {
        showNotification('error', 'La URL de PocketBase no es válida');
        return;
      }
      
      if (config.n8nWebhookUrl && !isValidUrl(config.n8nWebhookUrl)) {
        showNotification('error', 'La URL de n8n no es válida');
        return;
      }

      saveConfig(config);
      showNotification('success', 'Configuración guardada correctamente');
    } catch (error) {
      showNotification('error', 'Error al guardar la configuración');
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async (service: 'pocketbase' | 'n8n') => {
    setTesting(prev => ({ ...prev, [service]: true }));
    setTestResults(prev => ({ ...prev, [service]: null }));

    try {
      let url = '';
      if (service === 'pocketbase') {
        url = config.pocketbaseUrl ? `${config.pocketbaseUrl}/api/health` : '';
      } else {
        url = config.n8nWebhookUrl || '';
      }

      if (!url) {
        setTestResults(prev => ({ ...prev, [service]: false }));
        showNotification('error', `URL de ${service} no configurada`);
        return;
      }

      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',
      });

      const success = response.ok;
      setTestResults(prev => ({ ...prev, [service]: success }));
      
      if (success) {
        showNotification('success', `Conexión con ${service} exitosa`);
      } else {
        showNotification('error', `Error al conectar con ${service}`);
      }
    } catch (error) {
      setTestResults(prev => ({ ...prev, [service]: false }));
      showNotification('error', `Error al conectar con ${service}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setTesting(prev => ({ ...prev, [service]: false }));
    }
  };

  const isValidUrl = (string: string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotification('info', 'Copiado al portapapeles');
  };

  const handleReset = () => {
    if (confirm('¿Estás seguro de que quieres resetear toda la configuración?')) {
      resetConfig();
      loadConfig();
      setTestResults({ pocketbase: null, n8n: null });
      showNotification('info', 'Configuración restablecida');
    }
  };

  // Contenido corregido del archivo ngrok.yml con indentación exacta
  const ngrokConfigContent = `version: "2"
authtoken: 5DngrR1C4jNXKpLTeE7aj_5aboDHUBfiher5r6N3qKk
tunnels:
  pocketbase:
    addr: 8090
    proto: http
  n8n:
    addr: 5678
    proto: http`;

  const ngrokConfigWithToken = `version: "2"
authtoken: TU_AUTH_TOKEN_AQUI
tunnels:
  pocketbase:
    addr: 8090
    proto: http
  n8n:
    addr: 5678
    proto: http`;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Configuración del Sistema</h1>
          <p className="text-slate-600 mt-2">
            Configura las conexiones con PocketBase y n8n usando ngrok
          </p>
        </div>
        
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-xl hover:bg-red-50 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Resetear
        </button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-xl border ${
          notification.type === 'success' 
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : notification.type === 'error'
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <AlertCircle className="w-5 h-5" />}
            {notification.type === 'info' && <Globe className="w-5 h-5" />}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* PASO 1: DIAGNÓSTICO - Encontrar ubicación correcta */}
      <div className="bg-purple-50 border-2 border-purple-300 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-purple-800 mb-4 flex items-center gap-2">
          <Search className="w-8 h-8" />
          🔍 PASO 1: DIAGNÓSTICO - Encontrar ubicación correcta de ngrok
        </h2>
        
        <div className="space-y-6">
          <div className="bg-purple-100 border border-purple-300 rounded-lg p-4">
            <h3 className="font-bold text-purple-800 mb-2">🎯 Tienes razón - La carpeta puede estar en ubicaciones diferentes:</h3>
            <ul className="text-purple-700 text-sm list-disc list-inside space-y-1">
              <li><strong>Ejecutable descargado:</strong> <code>C:\Users\[usuario]\.ngrok2\</code></li>
              <li><strong>Instalación con Chocolatey/Scoop:</strong> Ubicación del sistema</li>
              <li><strong>Ubicación alternativa:</strong> <code>%APPDATA%\ngrok\</code></li>
            </ul>
          </div>

          <div className="bg-white border border-purple-300 rounded-lg p-4">
            <h4 className="font-bold text-purple-800 mb-4">🚀 EJECUTA ESTOS COMANDOS PARA ENCONTRAR LA UBICACIÓN CORRECTA:</h4>
            
            <div className="space-y-4">
              {/* Verificar instalación de ngrok */}
              <div>
                <h5 className="font-semibold text-purple-700 mb-2">1. Verificar instalación y ubicación de ngrok:</h5>
                <div className="bg-black text-green-400 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                  <span>where ngrok</span>
                  <button 
                    onClick={() => copyToClipboard('where ngrok')}
                    className="p-1 hover:bg-gray-800 rounded text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Ver configuración actual */}
              <div>
                <h5 className="font-semibold text-purple-700 mb-2">2. Ver dónde busca ngrok su configuración:</h5>
                <div className="bg-black text-green-400 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                  <span>ngrok config check</span>
                  <button 
                    onClick={() => copyToClipboard('ngrok config check')}
                    className="p-1 hover:bg-gray-800 rounded text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Buscar archivos de configuración existentes */}
              <div>
                <h5 className="font-semibold text-purple-700 mb-2">3. Buscar archivos de configuración existentes:</h5>
                <div className="space-y-2">
                  <div className="bg-black text-green-400 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                    <span>dir "%USERPROFILE%\.ngrok2" /A</span>
                    <button 
                      onClick={() => copyToClipboard('dir "%USERPROFILE%\\.ngrok2" /A')}
                      className="p-1 hover:bg-gray-800 rounded text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-black text-green-400 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                    <span>dir "%APPDATA%\ngrok" /A</span>
                    <button 
                      onClick={() => copyToClipboard('dir "%APPDATA%\\ngrok" /A')}
                      className="p-1 hover:bg-gray-800 rounded text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Buscar todos los archivos ngrok.yml */}
              <div>
                <h5 className="font-semibold text-purple-700 mb-2">4. Buscar TODOS los archivos ngrok.yml en tu sistema:</h5>
                <div className="bg-black text-green-400 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                  <span>dir C:\ /S /B ngrok.yml 2&gt;nul</span>
                  <button 
                    onClick={() => copyToClipboard('dir C:\\ /S /B ngrok.yml 2>nul')}
                    className="p-1 hover:bg-gray-800 rounded text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-4">
            <h4 className="font-bold text-yellow-800 mb-2">📋 ¿Qué significan los resultados?</h4>
            <ul className="text-yellow-700 text-sm space-y-2">
              <li><strong>where ngrok</strong> → Te mostrará dónde está instalado el ejecutable</li>
              <li><strong>ngrok config check</strong> → Te dirá exactamente dónde busca el archivo de configuración</li>
              <li><strong>dir commands</strong> → Buscarán carpetas y archivos existentes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* PASO 2: UBICACIONES ALTERNATIVAS */}
      <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-blue-800 mb-4 flex items-center gap-2">
          <FolderOpen className="w-8 h-8" />
          📁 PASO 2: UBICACIONES ALTERNATIVAS PARA CREAR LA CONFIGURACIÓN
        </h2>
        
        <div className="space-y-4">
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
            <h4 className="font-bold text-blue-800 mb-3">🎯 Prueba estas ubicaciones (en orden de prioridad):</h4>
            
            <div className="space-y-4">
              {/* Opción 1: APPDATA */}
              <div className="bg-white border border-blue-300 rounded-lg p-4">
                <h5 className="font-semibold text-blue-700 mb-2">OPCIÓN 1: Carpeta APPDATA (Recomendada)</h5>
                <div className="space-y-2">
                  <div className="bg-black text-blue-400 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                    <span>mkdir "%APPDATA%\ngrok"</span>
                    <button 
                      onClick={() => copyToClipboard('mkdir "%APPDATA%\\ngrok"')}
                      className="p-1 hover:bg-gray-800 rounded text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-black text-blue-400 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                    <span>notepad "%APPDATA%\ngrok\ngrok.yml"</span>
                    <button 
                      onClick={() => copyToClipboard('notepad "%APPDATA%\\ngrok\\ngrok.yml"')}
                      className="p-1 hover:bg-gray-800 rounded text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Opción 2: Home directory */}
              <div className="bg-white border border-blue-300 rounded-lg p-4">
                <h5 className="font-semibold text-blue-700 mb-2">OPCIÓN 2: Directorio Home (La que ya intentaste)</h5>
                <div className="space-y-2">
                  <div className="bg-black text-blue-400 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                    <span>mkdir "%USERPROFILE%\.ngrok2"</span>
                    <button 
                      onClick={() => copyToClipboard('mkdir "%USERPROFILE%\\.ngrok2"')}
                      className="p-1 hover:bg-gray-800 rounded text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="bg-black text-blue-400 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                    <span>notepad "%USERPROFILE%\.ngrok2\ngrok.yml"</span>
                    <button 
                      onClick={() => copyToClipboard('notepad "%USERPROFILE%\\.ngrok2\\ngrok.yml"')}
                      className="p-1 hover:bg-gray-800 rounded text-white"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Opción 3: Especificar ubicación manualmente */}
              <div className="bg-white border border-blue-300 rounded-lg p-4">
                <h5 className="font-semibold text-blue-700 mb-2">OPCIÓN 3: Especificar ubicación manualmente</h5>
                <p className="text-blue-600 text-sm mb-2">Si ngrok no encuentra el archivo, puedes especificar la ruta manualmente:</p>
                <div className="bg-black text-blue-400 rounded-lg p-3 font-mono text-sm flex items-center justify-between">
                  <span>ngrok start --config="C:\ruta\completa\a\ngrok.yml" --all</span>
                  <button 
                    onClick={() => copyToClipboard('ngrok start --config="C:\\ruta\\completa\\a\\ngrok.yml" --all')}
                    className="p-1 hover:bg-gray-800 rounded text-white"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PASO 3: CONTENIDO DEL ARCHIVO */}
      <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6">
        <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-2">
          <FileText className="w-8 h-8" />
          📝 PASO 3: CONTENIDO DEL ARCHIVO (Una vez que determines la ubicación)
        </h2>
        
        <div className="bg-white border border-green-300 rounded-lg p-4">
          <h4 className="font-bold text-green-800 mb-2">Pega EXACTAMENTE este contenido:</h4>
          <div className="bg-gray-900 text-green-400 rounded-lg p-4 font-mono text-sm relative">
            <pre className="whitespace-pre-wrap">{ngrokConfigContent}</pre>
            <button 
              onClick={() => copyToClipboard(ngrokConfigContent)}
              className="absolute top-2 right-2 p-2 hover:bg-gray-700 rounded text-white bg-gray-800"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
            <p className="text-green-700 text-sm">
              <strong>⚠️ CRÍTICO:</strong>
            </p>
            <ul className="text-green-700 text-xs mt-1 list-disc list-inside">
              <li>Usa EXACTAMENTE 2 espacios para la indentación (no tabs)</li>
              <li>No agregues espacios extra al final de las líneas</li>
              <li>Mantén las comillas dobles como están</li>
              <li>Guarda el archivo como <code>ngrok.yml</code> (no .txt)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Configuration Form */}
      <div className="grid gap-8">
        {/* PocketBase Configuration */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center">
              <Server className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">PocketBase</h2>
              <p className="text-slate-600">Configuración de la base de datos</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                URL del servidor PocketBase
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={config.pocketbaseUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, pocketbaseUrl: e.target.value }))}
                  placeholder="https://abc123.ngrok.io"
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
                {config.pocketbaseUrl && (
                  <button
                    onClick={() => window.open(config.pocketbaseUrl, '_blank')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ejemplo: https://abc123.ngrok.io (sin /api al final)
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => testConnection('pocketbase')}
                disabled={!config.pocketbaseUrl || testing.pocketbase}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {testing.pocketbase ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
                Probar Conexión
              </button>
              
              {testResults.pocketbase !== null && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  testResults.pocketbase 
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {testResults.pocketbase ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {testResults.pocketbase ? 'Conectado' : 'Error de conexión'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* n8n Configuration */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-accent-teal/10 rounded-xl flex items-center justify-center">
              <Link className="w-6 h-6 text-accent-teal" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-800">n8n</h2>
              <p className="text-slate-600">Configuración de webhooks y automatización</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                URL base de n8n
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={config.n8nWebhookUrl}
                  onChange={(e) => setConfig(prev => ({ ...prev, n8nWebhookUrl: e.target.value }))}
                  placeholder="https://xyz789.ngrok.io"
                  className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                />
                {config.n8nWebhookUrl && (
                  <button
                    onClick={() => window.open(config.n8nWebhookUrl, '_blank')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Ejemplo: https://xyz789.ngrok.io (URL base de n8n)
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => testConnection('n8n')}
                disabled={!config.n8nWebhookUrl || testing.n8n}
                className="flex items-center gap-2 px-4 py-2 bg-accent-teal text-white rounded-lg hover:bg-accent-teal/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {testing.n8n ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Link className="w-4 h-4" />
                )}
                Probar Conexión
              </button>
              
              {testResults.n8n !== null && (
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                  testResults.n8n 
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {testResults.n8n ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <AlertCircle className="w-4 h-4" />
                  )}
                  <span className="text-sm font-medium">
                    {testResults.n8n ? 'Conectado' : 'Error de conexión'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Current Configuration Display */}
      <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-800">Configuración Actual</h3>
          <button
            onClick={() => setShowUrls(!showUrls)}
            className="flex items-center gap-2 px-3 py-2 text-slate-600 hover:text-slate-800 transition-colors"
          >
            {showUrls ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showUrls ? 'Ocultar' : 'Mostrar'}
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Server className="w-4 h-4 text-primary-600" />
              <span className="font-medium text-slate-700">PocketBase</span>
            </div>
            <p className="text-sm text-slate-600 font-mono">
              {showUrls 
                ? (config.pocketbaseUrl || 'No configurado')
                : (config.pocketbaseUrl ? '••••••••••••••••' : 'No configurado')
              }
            </p>
          </div>
          
          <div className="bg-white rounded-lg p-4 border border-slate-200">
            <div className="flex items-center gap-2 mb-2">
              <Link className="w-4 h-4 text-accent-teal" />
              <span className="font-medium text-slate-700">n8n</span>
            </div>
            <p className="text-sm text-slate-600 font-mono">
              {showUrls 
                ? (config.n8nWebhookUrl || 'No configurado')
                : (config.n8nWebhookUrl ? '••••••••••••••••' : 'No configurado')
              }
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={loading}
          className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-700 text-white px-8 py-3 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-800 disabled:opacity-50 transition-all duration-200 shadow-lg"
        >
          {loading ? (
            <RefreshCw className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          {loading ? 'Guardando...' : 'Guardar Configuración'}
        </button>
      </div>
    </div>
  );
};

export default ConfiguracionPage;