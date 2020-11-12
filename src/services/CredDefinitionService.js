/*
 * CredDefinition service.
 */

const Joi = require('@hapi/joi')
const models = require('../models')
const errors = require('../common/errors')
const VerityService = require('../services/VerityService')
const utils = require('../common/utils')
const joiSchemas = require('../common/joiSchemas')

/**
 * Search CredDefinitions.
 *
 * @param {Object} criteria the search criteria
 * @returns {Object} the info about the searching result
 */
async function searchCredDefinitions (criteria) {
  const result = await models.CredDefinition.scan().all().exec()
  return utils.pagenateRecords(result, criteria.page, criteria.perPage)
}

searchCredDefinitions.schema = {
  criteria: Joi.object({
    page: joiSchemas.page,
    perPage: joiSchemas.perPage
  })
}

/**
 * Create a credDefinition.
 *
 * @param {Object} data the data of credDefinition
 * @returns {Object} the operation result
 */
async function createCredDefinition (data) {
  const [schema] = await models.Schema.query({ schemaId: data.schemaId }).exec()
  if (!schema) {
    throw new errors.NotFoundError(`schema with schemaId ${data.schemaId} not found`)
  }
  const [existing] = await models.CredDefinition.query({ schemaId: data.schemaId, tag: data.tag }).exec()
  if (existing) {
    throw new errors.ConflictError(`credDefinition ${data.name}:${data.tag} already exists`)
  }
  const { definitionId } = await VerityService.createCredDefinition(data.schemaId, data.name, data.tag)
  const result = await models.CredDefinition.createWithDefaults({ definitionId, ...data })
  return result
}

createCredDefinition.schema = {
  data: Joi.object({
    schemaId: Joi.string().required(),
    name: Joi.string().required(),
    tag: Joi.string().required()
  }).required()
}

/**
 * Find a credDefinition.
 *
 * @param {String} id the id of credDefinition
 * @returns {Object} the operation result
 */
async function getCredDefinition (id) {
  const result = await models.CredDefinition.get(id)
  if (!result) {
    throw new errors.NotFoundError(`credDefinition with id ${id} not found`)
  }
  return result
}

getCredDefinition.schema = {
  id: Joi.string().required()
}

/**
 * Delete a credDefinition.
 *
 * @param {String} id the id of credDefinition
 * @returns {undefined}
 */
async function deleteCredDefinition (id) {
  const result = await models.CredDefinition.get(id)
  if (!result) {
    throw new errors.NotFoundError(`credDefinition with id ${id} not found`)
  }
  await models.CredDefinition.delete(result)
}

deleteCredDefinition.schema = {
  id: Joi.string().required()
}

module.exports = {
  searchCredDefinitions,
  createCredDefinition,
  getCredDefinition,
  deleteCredDefinition
}
