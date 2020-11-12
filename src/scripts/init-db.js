/**
 * Initialize database tables. All data will be cleared.
 */
const models = require('../models')
const logger = require('../common/logger')

logger.info('Initialize database tables.')

const initDB = async () => {
  // clear data
  for (const model of Object.values(models)) {
    const entities = await model.scan().all().exec()
    for (const item of entities) {
      await model.delete(item)
    }
  }
}

if (!module.parent) {
  initDB().then(() => {
    logger.info('Done!')
    process.exit()
  }).catch((e) => {
    logger.logFullError(e)
    process.exit(1)
  })
}

module.exports = {
  initDB
}
