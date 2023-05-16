/**
 * For more configuration, please refer to https://angular.io/guide/build#proxying-to-a-backend-server
 *
 * 更多配置描述请参考 https://angular.cn/guide/build#proxying-to-a-backend-server
 *
 * Note: The proxy is only valid for real requests, Mock does not actually generate requests, so the priority of Mock will be higher than the proxy
 */
module.exports = {
  /**
   * The following means that all requests are directed to the backend `https://localhost:9000/`
   */
  // '/': {
  //   target: 'https://localhost:9000/',
  //   secure: false, // Ignore invalid SSL certificates
  //   changeOrigin: true
  // }

  '/api': { //后端服务器地址
    target: 'http://localhost:8002/',
    secure: false, // Ignore invalid SSL certificates
    changeOrigin: true
  },

  '/crawl': { //爬虫服务器地址
    target: 'http://localhost:8003/',
    secure: false, // Ignore invalid SSL certificates
    changeOrigin: true
  },

  // '/image': { //图床服务器地址
  //   target: 'http://localhost:8101/',
  //   secure: false, // Ignore invalid SSL certificates
  //   changeOrigin: true
  // }
};
