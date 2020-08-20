/*
 * Default configuration.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || '3001',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/test',
  VERITY_PROVISION_TOKEN: process.env.VERITY_PROVISION_TOKEN,
  VERITY_SERVER_URL: process.env.VERITY_SERVER_URL || 'https://vas.pps.evernym.com',
  VERITY_WEBHOOK_ENDPOINT_URL: process.env.VERITY_WEBHOOK_ENDPOINT_URL,
  VERITY_INSTITUTION_NAME: process.env.VERITY_INSTITUTION_NAME || 'Topcoder LLC',
  VERITY_INSTITUTION_LOGO_URL: process.env.VERITY_INSTITUTION_LOGO_URL,
  VERITY_SELF_REGISTRATION_URL: process.env.VERITY_SELF_REGISTRATION_URL || 'https://selfserve.sovrin.org/nym',
  VERITY_CONTEXT_PATH: process.env.VERITY_CONTEXT_PATH || './verity-context.json',
  VERITY_WALLET_NAME: process.env.VERITY_WALLET_NAME || 'mywallet',
  VERITY_WALLET_KEY: process.env.VERITY_WALLET_KEY || 'xxx123'
}
