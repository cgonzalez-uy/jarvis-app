import { getConfig } from './configService';

interface AnalysisResult {
  success: boolean;
  message: string;
  analysis?: {
    blockingIssues?: string[];
    warnings?: string[];
    recommendations?: string[];
  };
  htmlReport?: string;
}

export const sendFilesToAnalysis = async (files: File[], n8nWebhookUrl: string): Promise<AnalysisResult> => {
  try {
    if (!n8nWebhookUrl) {
      throw new Error('La URL del webhook de n8n no está configurada');
    }

    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file${index + 1}`, file);
    });

    const response = await fetch(n8nWebhookUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error('Error al enviar archivos a n8n');
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('text/html')) {
      const htmlContent = await response.text();
      return {
        success: true,
        message: 'Análisis completado correctamente',
        htmlReport: htmlContent
      };
    } else {
      const data = await response.json();
      if (data && typeof data.html === 'string') {
        return {
          success: true,
          message: 'Análisis completado correctamente',
          htmlReport: data.html
        };
      }
      return {
        success: true,
        message: 'Análisis iniciado correctamente',
        analysis: data
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido al enviar archivos'
    };
  }
}; 