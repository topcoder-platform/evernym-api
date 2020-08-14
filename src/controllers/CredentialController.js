/*
 * Controller for CredentialService.
 */

const { CredentialService } = require('../services')
const { setResHeaders } = require('../common/utils')

/**
 * Search Credentials.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function searchCredentials (req, res) {
  const result = await CredentialService.searchCredentials(req.query)
  setResHeaders(req, res, result)
  res.status(200).send(result.docs)
}

/**
 * Create a Credential.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function createCredential (req, res) {
  const result = await CredentialService.createCredential(req.body)
  res.status(200).send(result)
}

/**
 * Find a Credential.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function getCredential (req, res) {
  const result = await CredentialService.getCredential(req.params.id)
  res.status(200).send(result)
}

/**
 * Delete a Credential.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function deleteCredential (req, res) {
  await CredentialService.deleteCredential(req.params.id)
  res.sendStatus(204)
}

module.exports = {
  searchCredentials,
  createCredential,
  getCredential,
  deleteCredential
}
