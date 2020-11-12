/*
 * Provide some common functions.
 */

const fs = require('fs')
const getParams = require('get-parameter-names')
const querystring = require('querystring')
const util = require('util')
const config = require('config')
const _ = require('lodash')
const Joi = require('@hapi/joi')
const logger = require('./logger')

/**
 * Wrap async function to standard express function
 *
 * @param {Function} fn the async function
 * @returns {Function} the wrapped function
 * @private
 */
function _wrapExpress (fn) {
  return function (req, res, next) {
    fn(req, res, next).catch(next)
  }
}

/**
 * Wrap all functions from object
 * @param obj the object (controller exports)
 * @returns {Object|Array} the wrapped object
 */
function autoWrapExpress (obj) {
  if (_.isArray(obj)) {
    return obj.map(autoWrapExpress)
  }
  if (_.isFunction(obj)) {
    if (obj.constructor.name === 'AsyncFunction') {
      return _wrapExpress(obj)
    }
    return obj
  }
  _.each(obj, (value, key) => {
    obj[key] = autoWrapExpress(value)
  })
  return obj
}

/**
 * Convert array with arguments to object
 *
 * @param {Array} params the name of parameters
 * @param {Array} arr the array with values
 * @private
 */
const _combineObject = (params, arr) => {
  const ret = {}
  _.each(arr, (arg, i) => {
    ret[params[i]] = arg
  })
  return ret
}

/**
 * Remove invalid properties from the object and hide long arrays
 *
 * @param {Object} obj the object
 * @returns {Object} the new object with removed properties
 * @private
 */
const _sanitizeObject = (obj) => {
  try {
    return JSON.parse(JSON.stringify(obj, (name, value) => {
      if (_.isArray(value) && value.length > 30) {
        return `Array(${value.length})`
      }
      return value
    }))
  } catch (e) {
    return obj
  }
}

/**
 * Decorate all functions of a service and validate input values
 * and replace input arguments with sanitized result form Joi
 * Service method must have a `schema` property with Joi schema
 *
 * @param {Object} service the service
 */
function decorateWithValidators (service) {
  _.each(service, (method, name) => {
    if (!method.schema) {
      return
    }
    const params = getParams(method)
    service[name] = async function () {
      const args = Array.prototype.slice.call(arguments)
      const value = _combineObject(params, args)
      const normalized = Joi.attempt(value, Joi.object(method.schema))
      const newArgs = []
      _.each(params, (param) => {
        newArgs.push(normalized[param])
      })
      return method.apply(this, newArgs)
    }
    service[name].params = params
  })
}

/**
 * Decorate all functions of a service and log debug information if DEBUG is enabled
 * @param {Object} service the service
 */
function decorateWithLogging (service) {
  if (config.LOG_LEVEL !== 'debug') {
    return
  }
  _.each(service, (method, name) => {
    const params = method.params || getParams(method)
    service[name] = async function () {
      logger.debug(`ENTER ${name}`)
      logger.debug('input arguments')
      const args = Array.prototype.slice.call(arguments)
      logger.debug(util.inspect(_sanitizeObject(_combineObject(params, args))))
      try {
        const result = await method.apply(this, arguments)
        logger.debug(`EXIT ${name}`)
        logger.debug('output arguments')
        if (result !== null && result !== undefined) {
          logger.debug(util.inspect(_sanitizeObject(result)))
        }
        return result
      } catch (e) {
        logger.logFullError(e, name)
        throw e
      }
    }
  })
}

/**
 * Get link for a given page.
 * @param {Object} req the HTTP request
 * @param {Number} page the page number
 * @returns {String} link for the page
 */
function _getPageLink (req, page) {
  const q = _.assignIn({}, req.query, { page })
  return `${req.protocol}://${req.get('Host')}${req.baseUrl}${req.path}?${querystring.stringify(q)}`
}

/**
 * Set HTTP response headers from result.
 * @param {Object} req the HTTP request
 * @param {Object} res the HTTP response
 * @param {Object} result the operation result
 */
function setResHeaders (req, res, result) {
  if (result.hasPrevPage) {
    res.set('X-Prev-Page', result.prevPage)
  }
  if (result.hasNextPage) {
    res.set('X-Next-Page', result.nextPage)
  }
  res.set('X-Page', result.page)
  res.set('X-Per-Page', result.limit)
  res.set('X-Total', result.totalDocs)
  res.set('X-Total-Pages', result.totalPages)
  // set Link header
  if (result.totalPages > 0) {
    let link = `<${_getPageLink(req, 1)}>; rel="first", <${_getPageLink(req, result.totalPages)}>; rel="last"`
    if (result.hasPrevPage) {
      link += `, <${_getPageLink(req, result.page - 1)}>; rel="prev"`
    }
    if (result.hasNextPage) {
      link += `, <${_getPageLink(req, result.page + 1)}>; rel="next"`
    }
    res.set('Link', link)
  }
}

/**
 * Find all modules under specified directory except "index.js".
 * @param {String} dir the working directory
 *
 * @returns {Object} the modules object
 */
function findLocalModules (dir) {
  const modules = {}
  fs.readdirSync(dir)
    .filter(file => (file.indexOf('.') !== 0) && (file !== 'index.js') && (file.slice(-3) === '.js'))
    .forEach((file) => {
      const name = file.slice(0, -3)
      modules[name] = {
        path: `./${file}`
      }
    })
  return modules
}

/**
 * Paginate records fetched from DynamoDB.
 *
 * @param {Array} records all records
 * @param {Number} page the page number
 * @param {Number} perPage the per page size
 * @returns {Object} the pagination object
 */
function pagenateRecords (records, page, perPage) {
  const totalPages = Math.ceil(records.length / perPage)
  const result = {
    limit: perPage,
    page,
    totalPages,
    totalDocs: records.length,
    docs: records.slice((page - 1) * perPage, page * perPage)
  }
  if (page > 1) {
    result.hasPrevPage = true
    result.prevPage = page - 1
  }
  if (page < totalPages) {
    result.hasNextPage = true
    result.nextPage = page + 1
  }
  return result
}

module.exports = {
  autoWrapExpress,
  decorateWithLogging,
  decorateWithValidators,
  setResHeaders,
  findLocalModules,
  pagenateRecords
}
