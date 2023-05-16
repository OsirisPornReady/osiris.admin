import { Environment } from '@delon/theme';

export const environment = {
  production: true,
  useHash: true,
  api: {
    // baseUrl: 'http://localhost:8090/api/',
    baseUrl: './',
    refreshTokenEnabled: true,
    refreshTokenType: 'auth-refresh'
  },
  imageSocketUrl: 'ws://localhost:9003/crawl/imageDownloadSocket'
} as Environment;
