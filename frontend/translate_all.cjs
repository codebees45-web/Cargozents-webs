const fs = require('fs');
const path = require('path');
const { translate } = require('@vitalets/google-translate-api');

const localesDir = path.join(__dirname, 'public', 'locales');
const enFile = path.join(localesDir, 'en', 'translation.json');
const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));

const langs = ['hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'or', 'ml', 'pa', 'as'];

async function translateObject(obj, targetLang) {
  const translatedObj = {};
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      translatedObj[key] = await translateObject(obj[key], targetLang);
    } else if (typeof obj[key] === 'string') {
      try {
        const res = await translate(obj[key], { to: targetLang });
        translatedObj[key] = res.text;
        console.log(`[${targetLang}] ${key}: ${res.text}`);
      } catch (e) {
        console.error(`Error translating ${key} to ${targetLang}:`, e.message);
        translatedObj[key] = obj[key]; // fallback to english
      }
    } else {
      translatedObj[key] = obj[key];
    }
  }
  return translatedObj;
}

async function run() {
  for (const lang of langs) {
    console.log(`Starting translation for ${lang}...`);
    const langDir = path.join(localesDir, lang);
    if (!fs.existsSync(langDir)) {
      fs.mkdirSync(langDir, { recursive: true });
    }
    
    const translatedData = await translateObject(enData, lang);
    fs.writeFileSync(
      path.join(langDir, 'translation.json'),
      JSON.stringify(translatedData, null, 2)
    );
    console.log(`Finished ${lang}/translation.json`);
  }
}

run();
