/*
 * Schema service.
 */

const Joi = require('@hapi/joi')
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
  const result = await models.Schema.scan().all().exec()
  return utils.pagenateRecords(result, criteria.page, criteria.perPage)
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
  const [existing] = await models.Schema.query({ name: data.name, version: data.version }).exec()
  if (existing) {
    throw new errors.ConflictError(`schema ${data.name}:${data.version} already exists`)
  }
  const { schemaId } = await VerityService.createSchema(data.name, data.version, data.attrs)
  const result = await models.Schema.createWithDefaults({ schemaId, ...data })
  return result
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
  const result = await models.Schema.get(id)
  if (!result) {
    throw new errors.NotFoundError(`schema with id ${id} not found`)
  }
  return result
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
  const result = await models.Schema.get(id)
  if (!result) {
    throw new errors.NotFoundError(`schema with id ${id} not found`)
  }
  await models.Schema.delete(result)
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
