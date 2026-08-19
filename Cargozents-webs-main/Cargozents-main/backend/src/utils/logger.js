/* eslint-disable no-console */
const timestamp = () => new Date().toISOString();

module.exports = {
  info: (msg) => console.log(`[INFO] ${timestamp()} - ${msg}`),
  error: (msg) => console.error(`[ERROR] ${timestamp()} - ${msg}`),
  warn: (msg) => console.warn(`[WARN] ${timestamp()} - ${msg}`),
};
