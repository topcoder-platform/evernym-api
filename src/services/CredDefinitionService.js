/*
 * CredDefinition service.
 */

const Joi = require('@hapi/joi')
const _ = require('lodash')
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
  const result = await models.CredDefinition.paginate({}, {
    offset: utils.calculateOffset(criteria.page, criteria.perPage),
    limit: criteria.perPage
  })
  result.docs = _.map(result.docs, (doc) => {
    return doc.transform()
  })
  return result
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
  const schema = await models.Schema.findOne({ schemaId: data.schemaId })
  if (!schema) {
    throw new errors.NotFoundError(`schema with schemaId ${data.schemaId} not found`)
  }
  const existing = await models.CredDefinition.findOne({ schemaId: data.schemaId, tag: data.tag })
  if (existing) {
    throw new errors.ConflictError(`credDefinition ${data.name}:${data.tag} already exists`)
  }
  const { definitionId } = await VerityService.createCredDefinition(data.schemaId, data.name, data.tag)
  const result = await models.CredDefinition.create({ definitionId, ...data })
  return result.transform()
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
  const result = await models.CredDefinition.findById(id)
  if (!result) {
    throw new errors.NotFoundError(`credDefinition with id ${id} not found`)
  }
  return result.transform()
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
  const result = await models.CredDefinition.findById(id)
  if (!result) {
    throw new errors.NotFoundError(`credDefinition with id ${id} not found`)
  }
  await result.delete()
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
