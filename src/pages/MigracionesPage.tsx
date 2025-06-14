import { Upload, FileText, CheckCircle2, AlertCircle, XCircle, Loader2, AlertTriangle } from 'lucide-react';
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
}

interface MigracionesPageProps {
  vdcName?: string;
  onClose?: () => void;
}

const MigracionesPage: React.FC<MigracionesPageProps> = ({ vdcName: initialVdcName, onClose }) => {
  const [files, setFiles] = useState<FileUpload[]>([
    {
      name: 'Reporte de Evaluación V2T',
      file: null,
      required: true,
      pattern: 'v2tAssessmentReport-Summary-'
    },
    {
      name: 'Reporte de Edge Gateways',
      file: null,
      required: true,
      pattern: 'edgeGatewaysDetailedReport'
    },
    {
      name: 'Reporte de VDC',
      file: null,
      required: true,
      pattern: 'Reporte-VDC'
    }
  ]);

  const [activeStep, setActiveStep] = useState(1);
  const [isDragging, setIsDragging] = useState<number | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    blockingIssues?: string[];
    warnings?: string[];
    recommendations?: string[];
    htmlReport?: string;
  } | null>(null);

  const { token } = useAuth();
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
      const result = await sendFilesToAnalysis(validFiles, webhookPath);
      if (result.success) {
        setAnalysisResult(result);
      } else {
        console.error('Error en el análisis:', result.message);
        setWebhookError(result.message);
      }
    } catch (error) {
      console.error('Error al enviar archivos:', error);
      setWebhookError('Error al enviar archivos para análisis');
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
    a.download = 'reporte-migracion.html';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const renderValidationDetails = (validation: FileUpload['validation']) => {
    if (!validation) return null;

    return (
      <div className="mt-2">
        <p className={`text-sm ${
          validation.isValid
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}>
          {validation.message}
        </p>
      </div>
    );
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1:
        return (
          <div className="space-y-6">
            {typeof initialVdcName !== 'string' && (
              <div className="mb-4">
                <label className="block mb-2 font-medium">Nombre del VDC</label>
                <input
                  type="text"
                  className="border rounded px-3 py-2 w-full max-w-md"
                  value={vdcName}
                  onChange={e => setVdcName(e.target.value)}
                  placeholder="Ej: 01-PROD-PRESIDENCIA-S01"
                />
              </div>
            )}
            {files.map((fileUpload, index) => (
              <div
                key={index}
                className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
                  isDragging === index
                    ? 'border-primary bg-primary/5'
                    : fileUpload.file
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                    : 'border-gray-300 hover:border-primary/50'
                }`}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      fileUpload.file
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                    }`}>
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {fileUpload.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {fileUpload.file
                          ? `Archivo cargado: ${fileUpload.file.name}`
                          : `Arrastra y suelta el archivo con el patrón: ${fileUpload.pattern}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {fileUpload.file ? (
                      <>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <AlertCircle className="w-5 h-5" />
                        </button>
                        <span className="text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-5 h-5" />
                        </span>
                      </>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileInput(e, index)}
                          accept=".csv,.xlsx,.xls"
                        />
                        <div className="inline-flex items-center px-4 py-2 text-sm font-medium text-primary hover:text-primary-dark">
                          <Upload className="w-4 h-4 mr-2" />
                          Seleccionar archivo
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {files.map((fileUpload, index) => (
              <div
                key={index}
                className={`p-6 rounded-lg border ${
                  fileUpload.validation?.isValid
                    ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10'
                    : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`p-3 rounded-full ${
                      fileUpload.validation?.isValid
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                      {fileUpload.validation?.isValid ? (
                        <CheckCircle2 className="w-6 h-6" />
                      ) : (
                        <XCircle className="w-6 h-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {fileUpload.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {fileUpload.file?.name}
                      </p>
                      {renderValidationDetails(fileUpload.validation)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case 3:
        const allValid = files.every(f => f.validation?.isValid);
        return (
          <div className="text-center space-y-6">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
              allValid
                ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400'
                : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {allValid ? (
                <CheckCircle2 className="w-8 h-8" />
              ) : (
                <XCircle className="w-8 h-8" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white">
                {allValid
                  ? '¡Archivos listos para análisis!'
                  : 'Hay errores que necesitan ser corregidos'}
              </h3>
              <p className="mt-2 text-gray-500 dark:text-gray-400">
                {allValid
                  ? 'Todos los archivos han sido validados correctamente y están listos para ser analizados.'
                  : 'Por favor, regresa al paso anterior y corrige los errores encontrados en los archivos.'}
              </p>
            </div>
            {allValid && (
              <div className="mt-8 space-y-4">
                <div className="mb-4">
                  <label className="block mb-2 font-medium">Selecciona el webhook de n8n:</label>
                  <select
                    className="border rounded px-3 py-2 w-full max-w-md"
                    value={selectedWebhook}
                    onChange={e => setSelectedWebhook(e.target.value)}
                  >
                    <option value="">-- Selecciona un webhook --</option>
                    {webhooks.map(w => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.path || w.url})
                      </option>
                    ))}
                  </select>
                  {webhookError && <p className="text-red-600 mt-2">{webhookError}</p>}
                </div>
                <button
                  onClick={handleAnalysis}
                  disabled={isAnalyzing || !selectedWebhook}
                  className="btn-primary text-lg px-8 py-3"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    'Iniciar Análisis'
                  )}
                </button>
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
        <div className="mt-8 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Reporte de Análisis
              </h3>
              <button
                onClick={handleDownloadReport}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                <FileText className="w-4 h-4 mr-2" />
                Descargar Reporte
              </button>
            </div>
            <div
              style={{ width: '100%' }}
              dangerouslySetInnerHTML={{ __html: extractHtml(analysisResult.htmlReport) }}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="mt-8 space-y-6">
        {analysisResult.blockingIssues && analysisResult.blockingIssues.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <h4 className="text-lg font-medium text-red-800 dark:text-red-200 flex items-center">
              <XCircle className="w-5 h-5 mr-2" />
              Problemas Bloqueantes
            </h4>
            <ul className="mt-2 space-y-2">
              {analysisResult.blockingIssues.map((issue, index) => (
                <li key={index} className="text-red-700 dark:text-red-300">
                  {issue}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysisResult.warnings && analysisResult.warnings.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <h4 className="text-lg font-medium text-yellow-800 dark:text-yellow-200 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Advertencias
            </h4>
            <ul className="mt-2 space-y-2">
              {analysisResult.warnings.map((warning, index) => (
                <li key={index} className="text-yellow-700 dark:text-yellow-300">
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        )}

        {analysisResult.recommendations && analysisResult.recommendations.length > 0 && (
          <div className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <h4 className="text-lg font-medium text-green-800 dark:text-green-200 flex items-center">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Recomendaciones
            </h4>
            <ul className="mt-2 space-y-2">
              {analysisResult.recommendations.map((recommendation, index) => (
                <li key={index} className="text-green-700 dark:text-green-300">
                  {recommendation}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full py-8 px-4 p-8">
      {/* Botón para cerrar si es modal */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl z-10"
        >
          &times;
        </button>
      )}
      {/* Stepper */}
      <div className="mb-12">
        <div className="flex items-center justify-between">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                step === activeStep 
                  ? 'bg-primary text-white' 
                  : step < activeStep 
                    ? 'bg-primary/20 text-primary' 
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {step < activeStep ? <CheckCircle2 className="w-6 h-6" /> : step}
              </div>
              <span className="mt-2 text-sm font-medium text-gray-600">
                {step === 1 ? 'Carga de Archivos' : step === 2 ? 'Validación' : 'Confirmación'}
              </span>
            </div>
          ))}
        </div>
        <div className="relative mt-4">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${((activeStep - 1) / 2) * 100}%` }} />
          </div>
        </div>
      </div>

      {/* Step Content */}
      {renderStepContent()}

      {/* Action Buttons */}
      {activeStep < 3 && (
        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={() => setActiveStep(activeStep - 1)}
            disabled={activeStep === 1}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Anterior
          </button>
          <button
            onClick={handleNextStep}
            disabled={activeStep === 1 && files.some(f => !f.file) || isValidating}
            className="px-6 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isValidating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Validando...
              </>
            ) : (
              'Siguiente'
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default MigracionesPage;