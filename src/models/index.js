/*
 * Models entry.
 */

const mongoose = require('mongoose')
const mongoosePaginate = require('mongoose-paginate-v2')
const config = require('config')
const _ = require('lodash')
const { findLocalModules } = require('../common/utils')
const { transformPlugin } = require('../common/mongoosePlugins')
const logger = require('../common/logger')

const plugins = {
  mongoosePaginate,
  transformPlugin
}

const connection = mongoose.createConnection(
  config.MONGODB_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
)

// initilize models
const models = _.reduce(findLocalModules(__dirname), (result, data, moduleName) => {
  const schema = require(data.path)
  for (const plugin of Object.values(plugins)) {
    schema.plugin(plugin)
  }
  result[moduleName] = connection.model(moduleName, schema)
  return result
}, {})

// handle connection errors
connection.on('error', (err) => {
  logger.logFullError(err)
  process.exit(1)
})

module.exports = models
