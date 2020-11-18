/**
 * Create table schemes in database
 */

const dynamoose = require('dynamoose')
const config = require('config')
const models = require('../models')
const logger = require('../common/logger')

logger.info('Requesting to delete tables')

const deleteTables = async () => {
  const ddb = dynamoose.aws.ddb()
  for (const modelName of Object.keys(models)) {
    await ddb.deleteTable({ TableName: `${config.AMAZON.TABLE_NAME_PREFIX}${modelName}` }).promise()
  }
}

if (!module.parent) {
  deleteTables().then(() => {
    logger.info('Done!')
    process.exit()
  }).catch((e) => {
    logger.logFullError(e)
    process.exit(1)
  })
}

module.exports = {
  deleteTables
}
