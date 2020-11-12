/*
 * Relationship service.
 */

const Joi = require('@hapi/joi')
const models = require('../models')
const errors = require('../common/errors')
const VerityService = require('../services/VerityService')
const utils = require('../common/utils')
const joiSchemas = require('../common/joiSchemas')

/**
 * Search Relationships.
 *
 * @param {Object} criteria the search criteria
 * @returns {Object} the info about the searching result
 */
async function searchRelationships (criteria) {
  const result = await models.Relationship.scan().all().exec()
  return utils.pagenateRecords(result, criteria.page, criteria.perPage)
}

searchRelationships.schema = {
  criteria: Joi.object({
    page: joiSchemas.page,
    perPage: joiSchemas.perPage
  })
}

/**
 * Create a relationship.
 *
 * @param {Object} data the data of relationship
 * @returns {Object} the operation result
 */
async function createRelationship (data) {
  const { relDID, inviteURL } = await VerityService.createRelationship(data.name)
  const result = await models.Relationship.createWithDefaults({ relDID, inviteURL, ...data })
  return result
}

createRelationship.schema = {
  data: Joi.object({
    name: Joi.string().required()
  }).required()
}

/**
 * Find a relationship.
 *
 * @param {String} id the id of relationship
 * @returns {Object} the operation result
 */
async function getRelationship (id) {
  const result = await models.Relationship.get(id)
  if (!result) {
    throw new errors.NotFoundError(`relationship with id ${id} not found`)
  }
  return result
}

getRelationship.schema = {
  id: Joi.string().required()
}

/**
 * Delete a relationship.
 *
 * @param {String} id the id of relationship
 * @returns {undefined}
 */
async function deleteRelationship (id) {
  const result = await models.Relationship.get(id)
  if (!result) {
    throw new errors.NotFoundError(`relationship with id ${id} not found`)
  }
  await models.Relationship.delete(result)
}

deleteRelationship.schema = {
  id: Joi.string().required()
}

module.exports = {
  searchRelationships,
  createRelationship,
  getRelationship,
  deleteRelationship
}
