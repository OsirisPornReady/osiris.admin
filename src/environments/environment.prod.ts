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
  socketUrlTable: {
    crawlMessageSocketUrl: 'ws://localhost:9003/crawl/crawl_message_socket',
    imageDownloadSocketUrl: 'ws://localhost:9003/crawl/image_download_socket'
  },
  comicUploadUrl: 'http://localhost:9002/api/comic/upload_local_comic'
} as Environment;
