const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, 'frontend', 'public', 'locales');
const enFile = path.join(localesDir, 'en', 'translation.json');

const enData = JSON.parse(fs.readFileSync(enFile, 'utf8'));

const langs = ['hi', 'bn', 'te', 'mr', 'ta', 'ur', 'gu', 'kn', 'or', 'ml', 'pa', 'as'];

// Function to recursively add prefix to all string values
function addPrefix(obj, prefix) {
  const result = {};
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      result[key] = addPrefix(obj[key], prefix);
    } else if (typeof obj[key] === 'string') {
      result[key] = `[${prefix}] ${obj[key]}`;
    } else {
      result[key] = obj[key];
    }
  }
  return result;
}

for (const lang of langs) {
  const langDir = path.join(localesDir, lang);
  if (!fs.existsSync(langDir)) {
    fs.mkdirSync(langDir, { recursive: true });
  }
  
  const translatedData = addPrefix(enData, lang);
  fs.writeFileSync(
    path.join(langDir, 'translation.json'), 
    JSON.stringify(translatedData, null, 2)
  );
  console.log(`Created ${lang}/translation.json`);
}
