/*
 * Schema service.
 */

const Joi = require('@hapi/joi')
const _ = require('lodash')
const models = require('../models')
const errors = require('../common/errors')
const VerityService = require('../services/VerityService')
const utils = require('../common/utils')
const joiSchemas = require('../common/joiSchemas')

/**
 * Search Schemas.
 *
 * @param {Object} criteria the search criteria
 * @returns {Object} the info about the searching result
 */
async function searchSchemas (criteria) {
  const result = await models.Schema.paginate({}, {
    offset: utils.calculateOffset(criteria.page, criteria.perPage),
    limit: criteria.perPage
  })
  result.docs = _.map(result.docs, (doc) => {
    return doc.transform()
  })
  return result
}

searchSchemas.schema = {
  criteria: Joi.object({
    page: joiSchemas.page,
    perPage: joiSchemas.perPage
  })
}

/**
 * Create a schema.
 *
 * @param {Object} data the data of schema
 * @returns {Object} the operation result
 */
async function createSchema (data) {
  const existing = await models.Schema.findOne({ name: data.name, version: data.version })
  if (existing) {
    throw new errors.ConflictError(`schema ${data.name}:${data.version} already exists`)
  }
  const { schemaId } = await VerityService.createSchema(data.name, data.version, data.attrs)
  const result = await models.Schema.create({ schemaId, ...data })
  return result.transform()
}

createSchema.schema = {
  data: Joi.object({
    name: Joi.string().required(),
    version: Joi.string().required(),
    attrs: Joi.array().items(Joi.string()).required()
  }).required()
}

/**
 * Find a schema.
 *
 * @param {String} id the id of schema
 * @returns {Object} the operation result
 */
async function getSchema (id) {
  const result = await models.Schema.findById(id)
  if (!result) {
    throw new errors.NotFoundError(`schema with id ${id} not found`)
  }
  return result.transform()
}

getSchema.schema = {
  id: Joi.string().required()
}

/**
 * Delete a schema.
 *
 * @param {String} id the id of schema
 * @returns {undefined}
 */
async function deleteSchema (id) {
  const result = await models.Schema.findById(id)
  if (!result) {
    throw new errors.NotFoundError(`schema with id ${id} not found`)
  }
  await result.delete()
}

deleteSchema.schema = {
  id: Joi.string().required()
}

module.exports = {
  searchSchemas,
  createSchema,
  getSchema,
  deleteSchema
}
