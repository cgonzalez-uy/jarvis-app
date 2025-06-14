interface AppConfig {
  n8nWebhookUrl: string;
}

const CONFIG_KEY = 'jarvis_config';

export const getConfig = (): AppConfig => {
  const savedConfig = localStorage.getItem(CONFIG_KEY);
  if (savedConfig) {
    return JSON.parse(savedConfig);
  }
  
  // Configuración por defecto
  return {
    n8nWebhookUrl: ''
  };
};

export const saveConfig = (config: AppConfig): void => {
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
};

export const updateConfig = (config: AppConfig): void => {
  saveConfig(config);
}; 