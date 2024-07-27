const config = {
  development: {
    apiUrl: 'https://localhost:3000/totalizator1'
  },
  production: {
    apiUrl: 'https://bet-filter.vercel.app/totalizator1'
  }
};

const environment = window.location.hostname === 'localhost' ? 'development' : 'production';
const apiUrl = config[environment].apiUrl;

fetch(apiUrl)
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error));

  export { apiUrl };