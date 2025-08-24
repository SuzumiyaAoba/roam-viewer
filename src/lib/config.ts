export interface ApiConfig {
  baseUrl: string
  timeout?: number
}

export const defaultConfig: ApiConfig = {
  baseUrl: process.env.MD_ROAM_API_URL || 'http://localhost:8080',
  timeout: 10000,
}

export function getApiConfig(): ApiConfig {
  return {
    ...defaultConfig,
    baseUrl: process.env.MD_ROAM_API_URL || defaultConfig.baseUrl,
  }
}