/*
 * Connection service.
 */

const Joi = require('@hapi/joi')
const _ = require('lodash')
const models = require('../models')
const errors = require('../common/errors')
const utils = require('../common/utils')
const joiSchemas = require('../common/joiSchemas')

/**
 * Search Connections.
 *
 * @param {Object} criteria the search criteria
 * @returns {Object} the info about the searching result
 */
async function searchConnections (criteria) {
  const result = await models.Connection.paginate({}, {
    offset: utils.calculateOffset(criteria.page, criteria.perPage),
    limit: criteria.perPage
  })
  result.docs = _.map(result.docs, (doc) => {
    return doc.transform()
  })
  return result
}

searchConnections.schema = {
  criteria: Joi.object({
    page: joiSchemas.page,
    perPage: joiSchemas.perPage
  })
}

/**
 * Create a connection.
 *
 * @returns {Object} the operation result
 */
async function createConnection (data) {
  const relationship = await models.Relationship.findOne({ relDID: data.relDID })
  if (!relationship) {
    throw new errors.NotFoundError(`Relationship with relDID ${data.relDID} does not exist`)
  }
  const result = await models.Connection.create(data)
  return result.transform()
}

createConnection.schema = {
  data: Joi.object({
    relDID: Joi.string().required()
  }).required()
}

/**
 * Find a connection.
 *
 * @param {String} id the id of connection
 * @returns {Object} the operation result
 */
async function getConnection (id) {
  const result = await models.Connection.findById(id)
  if (!result) {
    throw new errors.NotFoundError(`connection with id ${id} not found`)
  }
  return result.transform()
}

getConnection.schema = {
  id: Joi.string().required()
}

/**
 * Delete a connection.
 *
 * @param {String} id the id of connection
 * @returns {undefined}
 */
async function deleteConnection (id) {
  const result = await models.Connection.findById(id)
  if (!result) {
    throw new errors.NotFoundError(`connection with id ${id} not found`)
  }
  await result.delete()
}

deleteConnection.schema = {
  id: Joi.string().required()
}

module.exports = {
  searchConnections,
  createConnection,
  getConnection,
  deleteConnection
}
