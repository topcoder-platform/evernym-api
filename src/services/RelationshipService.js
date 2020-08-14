/*
 * Relationship service.
 */

const Joi = require('@hapi/joi')
const _ = require('lodash')
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
  const result = await models.Relationship.paginate({}, {
    offset: utils.calculateOffset(criteria.page, criteria.perPage),
    limit: criteria.perPage
  })
  result.docs = _.map(result.docs, (doc) => {
    return doc.transform()
  })
  return result
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
  const result = await models.Relationship.create({ relDID, inviteURL, ...data })
  return result.transform()
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
  const result = await models.Relationship.findById(id)
  if (!result) {
    throw new errors.NotFoundError(`relationship with id ${id} not found`)
  }
  return result.transform()
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
  const result = await models.Relationship.findById(id)
  if (!result) {
    throw new errors.NotFoundError(`relationship with id ${id} not found`)
  }
  await result.delete()
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
