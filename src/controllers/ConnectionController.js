/*
 * Controller for ConnectionService.
 */

const { ConnectionService } = require('../services')
const { setResHeaders } = require('../common/utils')

/**
 * Search Connections.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function searchConnections (req, res) {
  const result = await ConnectionService.searchConnections(req.query)
  setResHeaders(req, res, result)
  res.status(200).send(result.docs)
}

/**
 * Create a Connection.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function createConnection (req, res) {
  const result = await ConnectionService.createConnection()
  res.status(200).send(result)
}

/**
 * Find a Connection.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function getConnection (req, res) {
  const result = await ConnectionService.getConnection(req.params.id)
  res.status(200).send(result)
}

/**
 * Delete a Connection.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function deleteConnection (req, res) {
  await ConnectionService.deleteConnection(req.params.id)
  res.sendStatus(204)
}

module.exports = {
  searchConnections,
  createConnection,
  getConnection,
  deleteConnection
}
