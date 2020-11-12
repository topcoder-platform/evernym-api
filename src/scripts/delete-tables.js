/**
 * Create table schemes in database
 */

const models = require('../models')
const logger = require('../common/logger')
const dynamoose = require('dynamoose')

logger.info('Requesting to delete tables')

const createTables = async () => {
  const ddb = dynamoose.aws.ddb()
  for (const modelName of Object.keys(models)) {
    await ddb.deleteTable({ TableName: modelName }).promise()
  }
}

if (!module.parent) {
  createTables().then(() => {
    logger.info('Done!')
    process.exit()
  }).catch((e) => {
    logger.logFullError(e)
    process.exit(1)
  })
}

module.exports = {
  createTables
}
