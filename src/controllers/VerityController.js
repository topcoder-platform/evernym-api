/*
 * Controller for VerityService.
 */

const { VerityService } = require('../services')

/**
 * Handle message from webhook.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function handleMessage (req, res) {
  await VerityService.handleMessage(req.body)
  res.sendStatus(200)
}

/**
 * Request proof.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function requestProof (req, res) {
  const data = await VerityService.requestProof(req.body)
  res.status(200).send(data)
}

/**
 * Return presentation result.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function getPresentationResult (req, res) {
  const data = await VerityService.getPresentationResult(req.params.id)
  res.status(200).send(data)
}

module.exports = {
  handleMessage,
  requestProof,
  getPresentationResult
}
