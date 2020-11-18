/**
 * Create table schemes in database
 */

const models = require('../models')
const logger = require('../common/logger')
const dynamoose = require('dynamoose')

logger.info('Requesting to create tables')

const createTables = async () => {
  const ddb = dynamoose.aws.ddb()
  for (const model of Object.values(models)) {
    const modelTableParams = await model.table.create.request()
    try {
      await ddb.createTable(modelTableParams).promise()
    } catch (error) {
      console.error(error)
    }
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
