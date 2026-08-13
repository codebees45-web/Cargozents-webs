const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const logger = require('./logger');

let client = null;
let isReady = false;
let initPromise = null;
let messageQueue = [];

const initWhatsApp = () => {
  if (client) return client;

  // Return cached initialization promise
  if (initPromise) return initPromise;

  initPromise = new Promise((resolve) => {
    client = new Client({
      authStrategy: new LocalAuth({ dataPath: '.wwebjs_auth' }), // persists login, avoids re-scanning QR every restart
      puppeteer: {
        headless: true,
        args: [

          '--no-sandbox', 
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',           // 👈 Prevents Chromium memory crashes
          '--disable-features=site-per-process', // 👈 Crucial: Fixes the 'detached Frame' issue

          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',            // 👈 Prevents Chromium memory crashes
          '--disable-features=site-per-process', // 👈 Crucial: Fixes the 'detached Frame' issue

        ],
      },
    });

    client.on('qr', (qr) => {
      logger.info('[WHATSAPP] Scan this QR code with WhatsApp (Linked Devices) to log in:');
      qrcode.generate(qr, { small: true });
    });

    client.on('ready', () => {
      isReady = true;
      logger.info('[WHATSAPP] Client is ready');
      resolve(client);
      processMessageQueue();
    });

    client.on('auth_failure', (msg) => {
      logger.error(`[WHATSAPP] Auth failed: ${msg}`);
      isReady = false;
    });

    client.on('disconnected', async (reason) => {
      isReady = false;

      logger.error(`[WHATSAPP] Client disconnected: ${reason}. Attempting recovery re-initialization...`);
      

      logger.warn(`[WHATSAPP] Client disconnected: ${reason}. Attempting recovery re-initialization...`);

      // 👈 Gracefully wipe out the broken browser session and restart a clean client
      try {
        await client.destroy();
        client = null; // Clear out current reference
        initPromise = null;
        initWhatsApp(); // Spin up a fresh client instance automatically
      } catch (err) {
        logger.error(`[WHATSAPP] Critical failure during automatic recovery: ${err.message}`);
      }
    });

    // `initialize()` launches Puppeteer asynchronously. If Chromium is not
    // available or an existing WhatsApp session cannot be restored, do not let
    // that rejected promise terminate the API process (and make nodemon loop).
    client.initialize().catch((err) => {
      isReady = false;
      logger.error(
        `[WHATSAPP] Initialization failed: ${err?.message || err}. ` +
          'WhatsApp notifications are disabled, but the API will keep running.'
      );
      resolve(null); // Resolve so API doesn't crash
    });
  });

  return initPromise;
};

/**
 * Process queued messages
 */
const processMessageQueue = async () => {
  while (messageQueue.length > 0) {
    const { phone, message, callback } = messageQueue.shift();
    try {
      const chatId = `${phone}@c.us`;
      await client.sendMessage(chatId, message);
      logger.info(`[WHATSAPP] Queued message sent to ${phone}`);
      callback?.(true);
    } catch (err) {
      logger.error(`[WHATSAPP] Failed to send queued message to ${phone}: ${err.message}`);
      callback?.(false);
    }
  }
};

/**
 * Sends a WhatsApp message.
 * @param {string} phone - Number in international format WITHOUT + or leading zeros, e.g. "919876543210"
 * @param {string} message
 */
const sendWhatsApp = async (phone, message) => {
  try {
    if (!client || !isReady) {
      logger.warn(`[WHATSAPP] Client not ready. Queueing message for ${phone} for later.`);
      return new Promise((resolve) => {
        messageQueue.push({ phone, message, callback: resolve });
      });
    }

    // Sanitize phone number (WhatsApp needs digits only)
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const chatId = `${cleanPhone}@c.us`;
    
    await client.sendMessage(chatId, message);
    logger.info(`[WHATSAPP] Sent to ${cleanPhone}`);
    return true;
  } catch (err) {
    logger.error(`[WHATSAPP] Failed to send to ${phone}: ${err.message}`);
    return false;
  }
};

const destroyWhatsApp = async () => {
  if (client) {
    try {
      await client.destroy();
      client = null;
      isReady = false;
      logger.info('[WHATSAPP] Client destroyed successfully');
    } catch (err) {
      logger.error(`[WHATSAPP] Cleanup error: ${err.message}`);
    }
  }
};

module.exports = { initWhatsApp, sendWhatsApp, destroyWhatsApp };