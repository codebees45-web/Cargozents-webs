const { Client, LocalAuth } = require('whatsapp-web.js');

const client = new Client({
  authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }),
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox', 
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-features=site-per-process'
    ],
  },
});

client.on('qr', (qr) => {
  console.log('QR code generated. Session needs authentication.');
  process.exit(1);
});

client.on('ready', () => {
  console.log('WhatsApp Client is ready!');
  process.exit(0);
});

client.on('auth_failure', (msg) => {
  console.error('Auth failed:', msg);
  process.exit(1);
});

console.log('Initializing WhatsApp client...');
client.initialize().catch(err => {
  console.error("Initialization error:", err);
  process.exit(1);
});
