interface AppConfig {
  pocketbaseUrl: string;
  n8nWebhookUrl: string;
  lastUpdated: string;
}

const CONFIG_KEY = 'jarvis_config';

const DEFAULT_CONFIG: AppConfig = {
  pocketbaseUrl: '',
  n8nWebhookUrl: '',
  lastUpdated: new Date().toISOString()
};

export const getConfig = (): AppConfig => {
  const savedConfig = localStorage.getItem(CONFIG_KEY);
  if (savedConfig) {
    try {
      return { ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) };
    } catch {
      return DEFAULT_CONFIG;
    }
  }
  return DEFAULT_CONFIG;
};

export const saveConfig = (config: Partial<AppConfig>): void => {
  const currentConfig = getConfig();
  const newConfig = {
    ...currentConfig,
    ...config,
    lastUpdated: new Date().toISOString()
  };
  localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
};

export const updateConfig = (config: Partial<AppConfig>): void => {
  saveConfig(config);
};

export const resetConfig = (): void => {
  localStorage.removeItem(CONFIG_KEY);
};

// Helper function to get the base API URL
export const getApiUrl = (endpoint: string = ''): string => {
  const config = getConfig();
  const baseUrl = config.pocketbaseUrl || '';
  
  if (!baseUrl) {
    // Fallback to relative URL if no PocketBase URL is configured
    return `/api${endpoint}`;
  }
  
  // Remove trailing slash from baseUrl and leading slash from endpoint
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanEndpoint = endpoint.replace(/^\//, '');
  
  return cleanEndpoint ? `${cleanBase}/api/${cleanEndpoint}` : `${cleanBase}/api`;
};

// Helper function to get n8n webhook URL
export const getN8nWebhookUrl = (path: string = ''): string => {
  const config = getConfig();
  const baseUrl = config.n8nWebhookUrl || '';
  
  if (!baseUrl) {
    return '';
  }
  
  // Remove trailing slash from baseUrl and leading slash from path
  const cleanBase = baseUrl.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  
  return cleanPath ? `${cleanBase}/${cleanPath}` : cleanBase;
};