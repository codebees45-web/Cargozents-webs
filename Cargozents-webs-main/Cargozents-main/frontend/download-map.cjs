const fs = require('fs');
const https = require('https');

const urls = [
  'https://raw.githubusercontent.com/geohacker/india/master/country/india.geojson',
  'https://raw.githubusercontent.com/deldersveld/topojson/master/countries/india/india-states.json',
  'https://raw.githubusercontent.com/datameet/maps/master/States/Admin2.geojson'
];

async function download() {
  if (!fs.existsSync('src/assets')) {
    fs.mkdirSync('src/assets', { recursive: true });
  }

  for (let url of urls) {
    console.log('Trying', url);
    try {
      const data = await new Promise((resolve, reject) => {
        https.get(url, (res) => {
          if (res.statusCode !== 200) {
            reject(new Error(`Status: ${res.statusCode}`));
            return;
          }
          let body = '';
          res.on('data', chunk => body += chunk);
          res.on('end', () => resolve(body));
        }).on('error', reject);
      });
      fs.writeFileSync('src/assets/india.json', data);
      console.log('Success with', url);
      return;
    } catch (err) {
      console.log('Failed', err.message);
    }
  }
}

download();
