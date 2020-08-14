/*
 * Controller for CredDefinitionService.
 */

const { CredDefinitionService } = require('../services')
const { setResHeaders } = require('../common/utils')

/**
 * Search CredDefinitions.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function searchCredDefinitions (req, res) {
  const result = await CredDefinitionService.searchCredDefinitions(req.query)
  setResHeaders(req, res, result)
  res.status(200).send(result.docs)
}

/**
 * Create a CredDefinition.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function createCredDefinition (req, res) {
  const result = await CredDefinitionService.createCredDefinition(req.body)
  res.status(200).send(result)
}

/**
 * Find a CredDefinition.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function getCredDefinition (req, res) {
  const result = await CredDefinitionService.getCredDefinition(req.params.id)
  res.status(200).send(result)
}

/**
 * Delete a CredDefinition.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function deleteCredDefinition (req, res) {
  await CredDefinitionService.deleteCredDefinition(req.params.id)
  res.sendStatus(204)
}

module.exports = {
  searchCredDefinitions,
  createCredDefinition,
  getCredDefinition,
  deleteCredDefinition
}
