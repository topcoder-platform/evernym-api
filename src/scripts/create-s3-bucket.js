/**
 * Create table schemes in database
 */

const logger = require('../common/logger')
const s3 = require('../common/s3')

logger.info('Requesting to create s3 bucket')

const createBucket = async () => {
  try {
    await s3.createBucket()
  } catch (error) {
    console.error(error)
  }
}

if (!module.parent) {
  createBucket().then(() => {
    logger.info('Done!')
    process.exit()
  }).catch((e) => {
    logger.logFullError(e)
    process.exit(1)
  })
}

module.exports = {
  createBucket
}
