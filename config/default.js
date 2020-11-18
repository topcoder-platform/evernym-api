/*
 * Default configuration.
 */

module.exports = {
  LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
  PORT: process.env.PORT || '3001',

  AMAZON: {
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || 'FAKE_ACCESS_KEY',
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || 'FAKE_SECRET_ACCESS_KEY',
    AWS_REGION: process.env.AWS_REGION || 'us-east-1',
    IS_LOCAL_DB: process.env.IS_LOCAL_DB ? process.env.IS_LOCAL_DB === 'true' : true,
    DYNAMODB_URL: process.env.DYNAMODB_URL || 'http://localhost:8000', // it is required if IS_LOCAL_DB is true
    DYNAMODB_READ_CAPACITY_UNITS: process.env.DYNAMODB_READ_CAPACITY_UNITS || 10,
    DYNAMODB_WRITE_CAPACITY_UNITS: process.env.DYNAMODB_WRITE_CAPACITY_UNITS || 5,
    TABLE_NAME_PREFIX: process.env.TABLE_NAME_PREFIX || 'Evernym',
    S3_BUCKET_WALLET: process.env.S3_BUCKET_WALLET || 'evernym-wallet',
    IS_LOCAL_S3: process.env.IS_LOCAL_S3 ? process.env.IS_LOCAL_S3 === 'true' : true,
    S3_ENDPOINT: process.env.S3_ENDPOINT || 'localhost:9000'
  },

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
