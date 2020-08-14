/*
 * Controller for SchemaService.
 */

const { SchemaService } = require('../services')
const { setResHeaders } = require('../common/utils')

/**
 * Search Schemas.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function searchSchemas (req, res) {
  const result = await SchemaService.searchSchemas(req.query)
  setResHeaders(req, res, result)
  res.status(200).send(result.docs)
}

/**
 * Create a Schema.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function createSchema (req, res) {
  const result = await SchemaService.createSchema(req.body)
  res.status(200).send(result)
}

/**
 * Find a Schema.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function getSchema (req, res) {
  const result = await SchemaService.getSchema(req.params.id)
  res.status(200).send(result)
}

/**
 * Delete a Schema.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function deleteSchema (req, res) {
  await SchemaService.deleteSchema(req.params.id)
  res.sendStatus(204)
}

module.exports = {
  searchSchemas,
  createSchema,
  getSchema,
  deleteSchema
}
