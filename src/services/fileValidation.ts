import * as XLSX from 'xlsx';

interface ValidationResult {
  isValid: boolean;
  message: string;
}

export const validateV2TReport = async (file: File): Promise<ValidationResult> => {
  if (!file.name.includes('v2tAssessmentReport-Summary-')) {
    return {
      isValid: false,
      message: 'El archivo debe tener el sufijo "v2tAssessmentReport-Summary-"'
    };
  }

  return {
    isValid: true,
    message: 'Archivo válido'
  };
};

export const validateEdgeGatewayReport = async (file: File): Promise<ValidationResult> => {
  if (!file.name.includes('edgeGatewaysDetailedReport')) {
    return {
      isValid: false,
      message: 'El archivo debe tener el sufijo "edgeGatewaysDetailedReport"'
    };
  }

  return {
    isValid: true,
    message: 'Archivo válido'
  };
};

export const validateVDCReport = async (file: File): Promise<ValidationResult> => {
  if (!file.name.includes('Reporte-VDC')) {
    return {
      isValid: false,
      message: 'El archivo debe tener el sufijo "Reporte-VDC"'
    };
  }

  return {
    isValid: true,
    message: 'Archivo válido'
  };
};

interface ExcelData {
  headers: string[];
  rows: any[];
}

export const readExcelFile = async (file: File): Promise<ExcelData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1);
        
        resolve({ headers, rows });
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = (error) => reject(error);
    reader.readAsBinaryString(file);
  });
}; 