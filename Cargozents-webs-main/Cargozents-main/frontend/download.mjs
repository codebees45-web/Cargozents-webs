import fs from 'fs';

const urls = [
  'https://raw.githubusercontent.com/geohacker/india/master/country/india.geojson',
  'https://raw.githubusercontent.com/Subhash9325/GeoJson-Data-of-Indian-States/master/Indian_States',
  'https://code.highcharts.com/mapdata/countries/in/in-all.geo.json'
];

async function run() {
  for (const url of urls) {
    try {
      console.log('Fetching', url);
      const res = await fetch(url);
      if (!res.ok) throw new Error(res.statusText);
      const data = await res.text();
      fs.writeFileSync('src/data/india.json', data);
      console.log('Success with', url);
      return;
    } catch (e) {
      console.log('Failed', e.message);
    }
  }
}

run();
