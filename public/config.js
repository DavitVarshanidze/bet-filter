// config.js
const config = {
    development: {
      apiUrl: 'http://localhost:3000/totalizator1'
    },
    production: {
      apiUrl: 'https://your-production-api.com/totalizator1'
    }
  };
  
  const environment = window.location.hostname === 'localhost' ? 'development' : 'production';
  const apiUrl = config[environment].apiUrl;
  
  export { apiUrl };
  