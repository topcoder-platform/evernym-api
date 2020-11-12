/*
 * Credential service.
 */

const Joi = require('@hapi/joi')
const models = require('../models')
const errors = require('../common/errors')
const VerityService = require('../services/VerityService')
const utils = require('../common/utils')
const joiSchemas = require('../common/joiSchemas')

/**
 * Search Credentials.
 *
 * @param {Object} criteria the search criteria
 * @returns {Object} the info about the searching result
 */
async function searchCredentials (criteria) {
  const result = await models.Credential.scan().all().exec()
  return utils.pagenateRecords(result, criteria.page, criteria.perPage)
}

searchCredentials.schema = {
  criteria: Joi.object({
    page: joiSchemas.page,
    perPage: joiSchemas.perPage
  })
}

/**
 * Create a credential.
 *
 * @param {Object} data the data of credential
 * @returns {Object} the operation result
 */
async function createCredential (data) {
  const relationship = await models.Relationship.query({ relDID: data.relDID }).exec()
  if (!relationship) {
    throw new errors.NotFoundError(`relationship with relDID ${data.relDID} not found`)
  }
  const credDefinition = await models.CredDefinition.query({ definitionId: data.definitionId }).exec()
  if (!credDefinition) {
    throw new errors.NotFoundError(`credDefinition with definitionId ${data.definitionId} not found`)
  }
  const { threadId } = await VerityService.issueCredential(
    data.relDID,
    data.definitionId,
    data.credentialData,
    data.comment
  )
  const result = await models.Credential.createWithDefaults({ ...data, threadId })
  return result
}

createCredential.schema = {
  data: Joi.object({
    relDID: Joi.string().required(),
    definitionId: Joi.string().required(),
    credentialData: Joi.object().required(),
    comment: Joi.string().required()
  }).required()
}

/**
 * Find a credential.
 *
 * @param {String} id the id of credential
 * @returns {Object} the operation result
 */
async function getCredential (id) {
  const result = await models.Credential.get(id)
  if (!result) {
    throw new errors.NotFoundError(`credential with id ${id} not found`)
  }
  return result
}

getCredential.schema = {
  id: Joi.string().required()
}

/**
 * Delete a credential.
 *
 * @param {String} id the id of credential
 * @returns {undefined}
 */
async function deleteCredential (id) {
  const result = await models.Credential.get(id)
  if (!result) {
    throw new errors.NotFoundError(`credential with id ${id} not found`)
  }
  await models.Credential.delete(result)
}

deleteCredential.schema = {
  id: Joi.string().required()
}

module.exports = {
  searchCredentials,
  createCredential,
  getCredential,
  deleteCredential
}
