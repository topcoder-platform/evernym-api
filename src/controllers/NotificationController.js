/*
 * Controller for NotificationService.
 */

const { NotificationService } = require('../services')

/**
 * Create subscriber.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function createSubscriber (req, res) {
  const data = await NotificationService.createSubscriber(req.body)
  res.status(200).send(data)
}

/**
 * Send notification.
 *
 * @param {Object} req the request object
 * @param {Object} res the response object
 * @returns {undefined}
 */
async function sendNotification (req, res) {
  await NotificationService.sendNotification(req.body)
  res.sendStatus(200)
}

module.exports = {
  createSubscriber,
  sendNotification
}
