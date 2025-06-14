import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Loader2, 
  AlertTriangle,
  ArrowLeft,
  Server,
  Globe,
  Link2,
  Zap, 
  Shield,
  Activity,
  Target,
  FileCheck,
  PlayCircle,
  TrendingUp,
  Sparkles,
  Maximize2,
  Save,
  Check
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { validateV2TReport, validateEdgeGatewayReport, validateVDCReport } from '../services/fileValidation';
import { sendFilesToAnalysis } from '../services/n8nService';
import { useAuth } from '../hooks/useAuth';
import { getApiUrl } from '../services/configService';

interface FileUpload {
  name: string;
  file: File | null;
  required: boolean;
  pattern: string;
  validation?: {
    isValid: boolean;
    message: string;
  };
  icon: React.ComponentType<any>;
  color: string;
}

interface MigracionesPageProps {
  vdcName?: string;
  existingMigrationId?: string | null;
  onClose?: () => void;
}

const MigracionesPage: React.FC<MigracionesPageProps> = ({ 
  vdcName: initialVdcName, 
  existingMigrationId, 
  onClose 
}) => {
  const [files, setFiles] = useState<FileUpload[]>([
    {
      name: 'Reporte de Evaluación V2T',
      file: null,
      required: true,
      pattern: 'v2tAssessmentReport-Summary-',
      icon: Target,
      color: 'from-purple-500 to-purple-700'
    },
    {
      name: 'Reporte de Edge Gateways',
      file: null,
      required: true,
      pattern: 'edgeGatewaysDetailedReport',
      icon: Globe,
      color: 'from-blue-500 to-blue-700'
    },
    {
      name: 'Reporte de VDC',
      file: null,
      required: true,
      pattern: 'Reporte-VDC',
      icon: Server,
      color: 'from-emerald-500 to-emerald-700'
    }
  ]);

  const [activeStep, setActiveStep] = useState(1);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    blockingIssues?: string[];
    warnings?: string[];
    recommendations?: string[];
    htmlReport?: string;
  } | null>(null);
  const [reportFullscreen, setReportFullscreen] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const { token, user } = useAuth();
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [selectedWebhook, setSelectedWebhook] = useState<string>("");
  const [webhookError, setWebhookError] = useState("");
  const [vdcName, setVdcName] = useState(initialVdcName || '');

  useEffect(() => {
    if (activeStep === 3 && token) {
      fetchWebhooks();
    }
    // eslint-disable-next-line
  }, [activeStep, token]);

  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  async function fetchWebhooks() {
    try {
      const apiUrl = getApiUrl('/collections/webhooks/records?perPage=50');
      const res = await fetch(apiUrl, {
        headers: { Authorization: token },
      });
      const data = await res.json();
      setWebhooks(data.items || []);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      setWebhooks([]);
    }
  }

  const saveMigrationToDatabase = async () => {
    if (!vdcName.trim() || !user) {
      showNotification('error', 'Datos incompletos para guardar la migración');
      return false;
    }

    setIsSaving(true);
    
    try {
      const migrationData = {
        vdc: vdcName.trim(),
        fecha_creacion: new Date().toISOString(),
        estado: 'Assessment', // Estado inicial después del análisis
        usuario: user.username || user.email || 'Usuario desconocido',
        // Campos adicionales que podrían ser útiles
        archivos_procesados: files.filter(f => f.file).map(f => f.file!.name),
        webhook_utilizado: webhooks.find(w => w.id === selectedWebhook)?.name || 'N/A',
        tiene_reporte: !!analysisResult?.htmlReport
      };

      console.log('Datos a guardar:', migrationData);
      console.log('Token usado:', token);
      console.log('Existing migration ID:', existingMigrationId);

      let apiUrl: string;
      let method: string;
      
      if (existingMigrationId) {
        // Actualizar migración existente
        apiUrl = getApiUrl(`/collections/migraciones/records/${existingMigrationId}`);
        method = 'PATCH';
        console.log('Updating existing migration:', existingMigrationId);
      } else {
        // Crear nueva migración
        apiUrl = getApiUrl('/collections/migraciones/records');
        method = 'POST';
        console.log('Creating new migration');
      }
      
      console.log('URL de guardado:', apiUrl);
      console.log('Method:', method);
      
      const response = await fetch(apiUrl, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify(migrationData)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', [...response.headers.entries()]);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error response:', errorData);
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const savedMigration = await response.json();
      console.log('Migración guardada exitosamente:', savedMigration);
      
      const actionText = existingMigrationId ? 'actualizada' : 'guardada';
      showNotification('success', `Migración "${vdcName}" ${actionText} exitosamente`);
      return true;
      
    } catch (error) {
      console.error('Error al guardar la migración:', error);
      const actionText = existingMigrationId ? 'actualizar' : 'guardar';
      showNotification('error', `Error al ${actionText} la migración: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleFinalizeMigration = async () => {
    const success = await saveMigrationToDatabase();
    if (success && onClose) {
      // Pequeño delay para que se vea la notificación antes de cerrar
      setTimeout(() => {
        onClose();
      }, 1500);
    }
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setIsDragging(index);
  };

  const handleDragLeave = () => {
    setIsDragging(null);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setIsDragging(null);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.includes(files[index].pattern)) {
      const newFiles = [...files];
      newFiles[index].file = droppedFile;
      newFiles[index].validation = undefined;
      setFiles(newFiles);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.includes(files[index].pattern)) {
      const newFiles = [...files];
      newFiles[index].file = selectedFile;
      newFiles[index].validation = undefined;
      setFiles(newFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles[index].file = null;
    newFiles[index].validation = undefined;
    setFiles(newFiles);
  };

  const validateFiles = async () => {
    setIsValidating(true);

    try {
      const validationResults = await Promise.all(
        files.map(async (file, index) => {
          if (!file.file) {
            return { isValid: false, message: 'Archivo no cargado' };
          }

          let validationResult;
          switch (index) {
            case 0:
              validationResult = await validateV2TReport(file.file);
              break;
            case 1:
              validationResult = await validateEdgeGatewayReport(file.file);
              break;
            case 2:
              validationResult = await validateVDCReport(file.file);
              break;
            default:
              validationResult = { isValid: false, message: 'Tipo de archivo no soportado' };
          }

          return validationResult;
        })
      );

      const newFiles = files.map((file, index) => ({
        ...file,
        validation: validationResults[index]
      }));

      setFiles(newFiles);
    } catch (error) {
      console.error('Error durante la validación:', error);
    } finally {
      setIsValidating(false);
    }
  };

  const handleNextStep = async () => {
    if (activeStep === 1) {
      await validateFiles();
    }
    setActiveStep(activeStep + 1);
  };

  const handleAnalysis = async () => {
    setWebhookError("");
    if (!selectedWebhook) {
      setWebhookError("Debes seleccionar un webhook antes de iniciar el análisis.");
      return;
    }
    setIsAnalyzing(true);
    const validFiles = files.filter(f => f.file && f.validation?.isValid).map(f => f.file!);
    const webhook = webhooks.find(w => w.id === selectedWebhook);
    const webhookPath = webhook?.url || webhook?.path || "";
    
    try {
      console.log('Sending files to selected webhook:', webhookPath);
      const result = await sendFilesToAnalysis(validFiles, webhookPath);
      if (result.success) {
        setAnalysisResult(result);
        showNotification('success', '¡Análisis completado exitosamente!');
      } else {
        console.error('Error en el análisis:', result.message);
        setWebhookError(result.message);
        showNotification('error', `Error en el análisis: ${result.message}`);
      }
    } catch (error) {
      console.error('Error al enviar archivos:', error);
      setWebhookError('Error al enviar archivos para análisis');
      showNotification('error', 'Error al enviar archivos para análisis');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDownloadReport = () => {
    if (!analysisResult?.htmlReport) return;
    const htmlContent = extractHtml(analysisResult.htmlReport);
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    // Usar nombre dinámico con el VDC
    const sanitizedVdcName = vdcName.replace(/[^a-zA-Z0-9-_]/g, '-');
    a.download = `reporte-assessment-${sanitizedVdcName}.html`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const renderValidationDetails = (validation: FileUpload['validation']) => {
    if (!validation) return null;

    return (
      <div className="mt-3">
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
          validation.isValid
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {validation.isValid ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {validation.message}
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-8">
            {/* VDC Name Input */}
            {typeof initialVdcName !== 'string' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl flex items-center justify-center">
                    <Server className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">Configuración Inicial</h3>
                    <p className="text-sm text-slate-600">Configura el nombre del VDC</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Nombre del VDC
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50/50 hover:bg-white"
                    value={vdcName}
                    onChange={e => setVdcName(e.target.value)}
                    placeholder="Ej: 01-PROD-PRESIDENCIA-S01"
                  />
                </div>
              </div>
            )}

            {/* File Upload Cards */}
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-slate-800 mb-2">
                  {existingMigrationId ? 'Actualizar Assessment' : 'Carga de Archivos'}
                </h2>
                <p className="text-slate-600">
                  {existingMigrationId 
                    ? 'Actualiza los archivos para el assessment existente'
                    : 'Arrastra y suelta los archivos requeridos o selecciónalos manualmente'
                  }
                </p>
                {existingMigrationId && (
                  <div className="mt-2 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                    <AlertCircle className="w-4 h-4 text-blue-600" />
                    <span className="text-sm text-blue-700 font-medium">
                      Modo actualización - Los datos existentes serán actualizados
                    </span>
                  </div>
                )}
              </div>

              {files.map((fileUpload, index) => {
                const IconComponent = fileUpload.icon;
                return (
                  <div
                    key={index}
                    className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                      isDragging === index
                        ? 'border-primary-400 bg-primary-50 scale-105 shadow-lg'
                        : fileUpload.file
                        ? 'border-emerald-400 bg-emerald-50 shadow-sm'
                        : 'border-slate-300 hover:border-primary-300 hover:bg-slate-50'
                    }`}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                          fileUpload.file
                            ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-glow-secondary'
                            : `bg-gradient-to-br ${fileUpload.color} shadow-lg`
                        }`}>
                          <IconComponent className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-slate-800 mb-1">
                            {fileUpload.name}
                          </h3>
                          <p className="text-sm text-slate-600 mb-2">
                            {fileUpload.file
                              ? `✓ Archivo cargado: ${fileUpload.file.name}`
                              : `Arrastra el archivo con patrón: ${fileUpload.pattern}`}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <FileCheck className="w-3 h-3" />
                            <span>Formato: CSV, XLSX, XLS</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        {fileUpload.file ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => removeFile(index)}
                              className="p-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                            >
                              <XCircle className="w-6 h-6" />
                            </button>
                            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                            </div>
                          </div>
                        ) : (
                          <label className="cursor-pointer">
                            <input
                              type="file"
                              className="hidden"
                              onChange={(e) => handleFileInput(e, index)}
                              accept=".csv,.xlsx,.xls"
                            />
                            <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white rounded-xl font-semibold hover:from-primary-600 hover:to-primary-800 transition-all duration-300 transform hover:scale-105 shadow-lg">
                              <Upload className="w-5 h-5 mr-2" />
                              Seleccionar archivo
                            </div>
                          </label>
                        )}
                      </div>
                    </div>
                    
                    {renderValidationDetails(fileUpload.validation)}
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Validación de Archivos</h2>
              <p className="text-slate-600">Verificando la integridad y formato de tus archivos</p>
            </div>

            <div className="space-y-6">
              {files.map((fileUpload, index) => {
                const IconComponent = fileUpload.icon;
                const isValid = fileUpload.validation?.isValid;
                
                return (
                  <div
                    key={index}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 ${
                      isValid === true
                        ? 'border-emerald-200 bg-emerald-50'
                        : isValid === false
                        ? 'border-red-200 bg-red-50'
                        : 'border-slate-200 bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center space-x-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                        isValid === true
                          ? 'bg-emerald-100 text-emerald-600'
                          : isValid === false
                          ? 'bg-red-100 text-red-600'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {isValid === true ? (
                          <CheckCircle2 className="w-7 h-7" />
                        ) : isValid === false ? (
                          <XCircle className="w-7 h-7" />
                        ) : (
                          <IconComponent className="w-7 h-7" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-800 mb-1">
                          {fileUpload.name}
                        </h3>
                        <p className="text-sm text-slate-600 mb-2">
                          {fileUpload.file?.name}
                        </p>
                        {renderValidationDetails(fileUpload.validation)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );

      case 3:
        const allValid = files.every(f => f.validation?.isValid);
        return (
          <div className="space-y-8">
            <div className="text-center">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
                allValid
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-glow-secondary'
                  : 'bg-gradient-to-br from-red-500 to-red-700'
              }`}>
                {allValid ? (
                  <Sparkles className="w-10 h-10 text-white animate-pulse" />
                ) : (
                  <XCircle className="w-10 h-10 text-white" />
                )}
              </div>
              
              <h2 className="text-3xl font-bold text-slate-800 mb-3">
                {allValid
                  ? existingMigrationId 
                    ? '¡Archivos Listos para Actualizar Análisis!'
                    : '¡Archivos Listos para Análisis!'
                  : 'Errores Detectados'}
              </h2>
              <p className="text-slate-600 text-lg">
                {allValid
                  ? existingMigrationId
                    ? 'Todos los archivos han sido validados correctamente y están listos para actualizar el análisis existente.'
                    : 'Todos los archivos han sido validados correctamente y están listos para ser procesados.'
                  : 'Se encontraron errores que deben ser corregidos antes de continuar.'}
              </p>
            </div>

            {allValid && (
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-accent-teal to-emerald-600 rounded-xl flex items-center justify-center">
                    <Link2 className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-800">
                      {existingMigrationId ? 'Actualizar Análisis de Migración' : 'Análisis de Migración'}
                    </h3>
                    <p className="text-slate-600">Procesamiento automático con Jarvis IA</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  {existingMigrationId && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-blue-800 mb-1">Modo Actualización</h4>
                          <p className="text-xs text-blue-700">
                            Estás actualizando el assessment para <strong>{vdcName}</strong>. 
                            Los nuevos resultados reemplazarán la información anterior.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Webhook Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                      Selecciona el webhook de n8n para el análisis:
                    </label>
                    <select
                      className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-50/50 hover:bg-white"
                      value={selectedWebhook}
                      onChange={e => setSelectedWebhook(e.target.value)}
                    >
                      <option value="">-- Selecciona un webhook --</option>
                      {webhooks.map(w => (
                        <option key={w.id} value={w.id}>
                          {w.name} ({w.url || w.path})
                        </option>
                      ))}
                    </select>
                    {webhookError && (
                      <p className="text-red-600 text-sm mt-2 bg-red-50 border border-red-200 rounded-lg p-3">
                        {webhookError}
                      </p>
                    )}
                    
                    <div className="mt-3 text-xs text-slate-500">
                      <p><strong>Tip:</strong> Asegúrate de que tu webhook n8n incluya la ruta completa.</p>
                      <p><strong>Ejemplo:</strong> <code>https://abc123.ngrok.io/webhook-test/asistente-migraciones</code></p>
                    </div>
                  </div>
                  
                  {/* Info adicional sobre webhooks */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Link2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-blue-800 mb-1">Configuración de Webhooks</h4>
                        <p className="text-xs text-blue-700">
                          Puedes crear y editar webhooks en la sección <strong>Webhooks</strong> del menú lateral. 
                          Asegúrate de incluir la URL completa con la ruta específica de n8n.
                        </p>
                        <p className="text-xs text-blue-600 mt-1">
                          <strong>Formato recomendado:</strong> https://[tu-ngrok-url]/webhook-test/[tu-endpoint]
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={handleAnalysis}
                      disabled={isAnalyzing || !selectedWebhook}
                      className="inline-flex items-center gap-3 bg-gradient-to-r from-primary-500 to-primary-700 text-white px-8 py-4 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-glow-primary text-lg"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin" />
                          Analizando archivos...
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-6 h-6" />
                          {existingMigrationId ? 'Actualizar Análisis' : 'Iniciar Análisis'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {renderAnalysisResults()}
          </div>
        );

      default:
        return null;
    }
  };

  const extractHtml = (htmlReport: string) => {
    // Si por error viene el objeto como string, lo parseamos
    try {
      if (typeof htmlReport === 'string' && htmlReport.trim().startsWith('{"html"')) {
        const parsed = JSON.parse(htmlReport);
        if (parsed && typeof parsed.html === 'string') {
          return parsed.html;
        }
      }
    } catch (e) {}
    return htmlReport;
  };

  const renderAnalysisResults = () => {
    if (!analysisResult) return null;

    if (analysisResult.htmlReport) {
      return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-slate-800">
                  {existingMigrationId ? 'Reporte Actualizado' : 'Reporte de Análisis'}
                </h3>
                <p className="text-slate-600">
                  {existingMigrationId 
                    ? 'Resultados actualizados del procesamiento de archivos'
                    : 'Resultados del procesamiento de archivos'
                  }
                </p>
              </div>
            </div>
            
            {/* BOTONES REUBICADOS AQUÍ - Junto al header del reporte */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setReportFullscreen(!reportFullscreen)}
                className="inline-flex items-center gap-2 bg-slate-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-700 transition-colors"
              >
                <Maximize2 className="w-4 h-4" />
                {reportFullscreen ? 'Minimizar' : 'Pantalla Completa'}
              </button>
              
              <button
                onClick={handleDownloadReport}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-secondary-500 to-secondary-700 text-white px-4 py-2 rounded-lg font-medium hover:from-secondary-600 hover:to-secondary-800 transition-all duration-300"
              >
                <FileText className="w-4 h-4" />
                Descargar
              </button>
              
              <button
                onClick={handleFinalizeMigration}
                disabled={isSaving}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white px-4 py-2 rounded-lg font-medium hover:from-emerald-600 hover:to-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {existingMigrationId ? 'Finalizar Actualización' : 'Finalizar y Guardar'}
                  </>
                )}
              </button>
            </div>
          </div>
          
          {/* Report Container */}
          <div className={`transition-all duration-300 ${
            reportFullscreen 
              ? 'fixed inset-0 z-50 bg-white' 
              : 'relative'
          }`}>
            {reportFullscreen && (
              <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
                <h3 className="text-lg font-semibold text-slate-800">Reporte de Análisis - Pantalla Completa</h3>
                <button
                  onClick={() => setReportFullscreen(false)}
                  className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>
            )}
            
            <div className={`overflow-auto bg-white ${
              reportFullscreen 
                ? 'h-full p-6' 
                : 'h-[600px] p-4'
            }`}>
              <div
                className="w-full min-h-full"
                dangerouslySetInnerHTML={{ __html: extractHtml(analysisResult.htmlReport) }}
              />
            </div>
          </div>

          {/* Info adicional al final */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <div className="text-center">
              <p className="text-sm text-slate-600">
                💡 <strong>Tip:</strong> Al finalizar, {existingMigrationId ? 'la migración se actualizará' : 'la migración se guardará'} en el sistema y podrás verla en el listado principal
              </p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {analysisResult.blockingIssues && analysisResult.blockingIssues.length > 0 && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
            <h4 className="text-xl font-semibold text-red-800 flex items-center gap-3 mb-4">
              <XCircle className="w-6 h-6" />
              Problemas Bloqueantes
            </h4>
            <ul className="space-y-2">
              {analysisResult.blockingIssues.map((issue, index) => (
                <li key={index} className="flex items-start gap-3 text-red-700">
                  <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysisResult.warnings && analysisResult.warnings.length > 0 && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6">
            <h4 className="text-xl font-semibold text-yellow-800 flex items-center gap-3 mb-4">
              <AlertTriangle className="w-6 h-6" />
              Advertencias
            </h4>
            <ul className="space-y-2">
              {analysisResult.warnings.map((warning, index) => (
                <li key={index} className="flex items-start gap-3 text-yellow-700">
                  <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
          <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6">
            <h4 className="text-xl font-semibold text-emerald-800 flex items-center gap-3 mb-4">
              <CheckCircle2 className="w-6 h-6" />
              Recomendaciones
            </h4>
            <ul className="space-y-2">
              {analysisResult.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-3 text-emerald-700">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Notification */}
      {notification && (
        <div className="fixed top-20 right-4 z-50 max-w-md">
          <div className={`p-4 rounded-xl shadow-lg border-l-4 ${
            notification.type === 'success' 
              ? 'bg-emerald-50 border-emerald-400 text-emerald-800'
              : notification.type === 'error'
              ? 'bg-red-50 border-red-400 text-red-800'
              : 'bg-blue-50 border-blue-400 text-blue-800'
          }`}>
            <div className="flex items-center gap-3">
              {notification.type === 'success' && <Check className="w-5 h-5 text-emerald-600" />}
              {notification.type === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
              {notification.type === 'info' && <AlertCircle className="w-5 h-5 text-blue-600" />}
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900/95 via-primary-950/95 to-slate-900/95 backdrop-blur-xl border-b border-white/10">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              {onClose && (
                <button
                  onClick={onClose}
                  className="p-3 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 transition-all duration-300 group"
                >
                  <ArrowLeft className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" />
                </button>
              )}
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-accent-purple rounded-xl shadow-glow-primary flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">
                    {existingMigrationId 
                      ? `Actualizar Assessment: ${vdcName || 'Sin nombre'}`
                      : `Nueva Migración: ${vdcName || 'Sin nombre'}`
                    }
                  </h1>
                  <p className="text-slate-300">
                    {existingMigrationId 
                      ? 'Actualiza tu assessment VMware Cloud Foundation'
                      : 'Configura tu migración VMware Cloud Foundation'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-8">
        {/* Stepper - Ahora usa todo el ancho disponible */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            {[
              { step: 1, title: existingMigrationId ? 'Actualizar Archivos' : 'Carga de Archivos', icon: Upload },
              { step: 2, title: 'Validación', icon: Shield },
              { step: 3, title: existingMigrationId ? 'Actualizar Análisis' : 'Análisis', icon: Activity }
            ].map(({ step, title, icon: Icon }) => (
              <div key={step} className="flex flex-col items-center flex-1">
                <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                  step === activeStep 
                    ? 'bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-glow-primary transform scale-110' 
                    : step < activeStep 
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg' 
                      : 'bg-slate-200 text-slate-500'
                }`}>
                  {step < activeStep ? <CheckCircle2 className="w-8 h-8" /> : <Icon className="w-8 h-8" />}
                  
                  {step === activeStep && (
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary-500/20 to-accent-purple/20 rounded-2xl opacity-100 transition-opacity blur-sm animate-pulse"></div>
                  )}
                </div>
                <span className={`mt-4 text-lg font-semibold transition-colors ${
                  step === activeStep 
                    ? 'text-primary-600' 
                    : step < activeStep 
                      ? 'text-emerald-600' 
                      : 'text-slate-500'
                }`}>
                  {title}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-8">
            <div className="absolute top-1/2 left-0 right-0 h-2 bg-slate-200 -translate-y-1/2 rounded-full">
              <div 
                className="h-full bg-gradient-to-r from-primary-500 to-accent-purple transition-all duration-500 rounded-full" 
                style={{ width: `${((activeStep - 1) / 2) * 100}%` }} 
              />
            </div>
          </div>
        </div>

        {/* Step Content - Sin limitación de ancho */}
        <div className="w-full">
          {renderStepContent()}
        </div>

        {/* Action Buttons */}
        {activeStep < 3 && (
          <div className="mt-12 flex justify-center gap-4">
            <button
              onClick={() => setActiveStep(activeStep - 1)}
              disabled={activeStep === 1}
              className="flex items-center gap-2 px-8 py-4 text-slate-700 bg-white border border-slate-300 rounded-xl font-semibold hover:bg-slate-50 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Anterior
            </button>
            <button
              onClick={handleNextStep}
              disabled={activeStep === 1 && files.some(f => !f.file) || isValidating}
              className="flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-700 text-white px-10 py-4 rounded-xl font-semibold hover:from-primary-600 hover:to-primary-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 hover:shadow-glow-primary"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Validando...
                </>
              ) : (
                <>
                  Siguiente
                  <ArrowLeft className="w-5 h-5 rotate-180" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MigracionesPage;