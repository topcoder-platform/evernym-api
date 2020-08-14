/*
 * Controller for RelationshipService.
 */

const { RelationshipService } = require('../services')
const { setResHeaders } = require('../common/utils')

/**
 * Search Relationships.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function searchRelationships (req, res) {
  const result = await RelationshipService.searchRelationships(req.query)
  setResHeaders(req, res, result)
  res.status(200).send(result.docs)
}

/**
 * Create a Relationship.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function createRelationship (req, res) {
  const result = await RelationshipService.createRelationship(req.body)
  res.status(200).send(result)
}

/**
 * Find a Relationship.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function getRelationship (req, res) {
  const result = await RelationshipService.getRelationship(req.params.id)
  res.status(200).send(result)
}

/**
 * Delete a Relationship.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function deleteRelationship (req, res) {
  await RelationshipService.deleteRelationship(req.params.id)
  res.sendStatus(204)
}

module.exports = {
  searchRelationships,
  createRelationship,
  getRelationship,
  deleteRelationship
}
