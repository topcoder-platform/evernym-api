/*
 * The entry of Services
 */

const _ = require('lodash')
const { findLocalModules, decorateWithValidators, decorateWithLogging } = require('../common/utils')

const services = _.reduce(findLocalModules(__dirname), (result, data, moduleName) => {
  const service = require(data.path)
  decorateWithValidators(service)
  decorateWithLogging(service)
  result[moduleName] = service
  return result
}, {})

module.exports = services
