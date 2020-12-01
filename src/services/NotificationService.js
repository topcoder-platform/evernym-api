/*
 * Notification service.
 */

const config = require('config')
const AWS = require('aws-sdk')
const Joi = require('@hapi/joi')
const models = require('../models')
const errors = require('../common/errors')
const constants = require('../../constants')

const snsClient = new AWS.SNS({
  apiVersion: constants.AMAZON.SNSApiVersion,
  region: config.AMAZON.AWS_REGION,
  accessKeyId: config.AMAZON.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.AMAZON.AWS_SECRET_ACCESS_KEY
})

/**
 * Create a subscriber.
 *
 * @param {Object} data the subscriber data
 * @returns {Object} the operation result
 */
async function createSubscriber (data) {
  const existing = await models.Subscriber.get(data.token)
  if (existing) {
    throw new errors.ConflictError(`Subscriber ${data.token} already exists`)
  }
  const ret = await snsClient.createPlatformEndpoint({
    PlatformApplicationArn: config.AMAZON.SNS_PLATFORM_APPLICATION_ANDROID_ARN,
    Token: data.token
  }).promise()
  data.endpointArn = ret.EndpointArn
  const result = await models.Subscriber.create(data)
  return result
}

createSubscriber.schema = {
  data: Joi.object({
    device: Joi.string().required(),
    token: Joi.string().required(),
    username: Joi.string().required(),
    evernymRelationshipDid: Joi.string().required(),
    sponsee: Joi.string().required()
  }).required()
}

/**
 * Send notification
 *
 * @param {Object} data the notification data
 */
async function sendNotification (data) {
  const subscribers = await models.Subscriber.query({ sponsee: data.sponseeDetails, evernymRelationshipDid: data.relationshipDid }).exec()
  for (const subscriber of subscribers) {
    await snsClient.publish({
      TargetArn: subscriber.endpointArn,
      Message: JSON.stringify({
        GCM: JSON.stringify({
          data,
          notification: {
            title: config.AMAZON.SNS_NOTIFICATION_TITLE,
            body: config.AMAZON.SNS_NOTIFICATION_BODY
          }
        }),
        APNS: JSON.stringify({
          data,
          aps: {
            alert: {
              title: config.AMAZON.SNS_NOTIFICATION_TITLE,
              body: config.AMAZON.SNS_NOTIFICATION_BODY
            }
          }
        })
      }),
      MessageStructure: 'json'
    }).promise()
  }
}

sendNotification.schema = {
  data: Joi.object({
    msgId: Joi.string().required(),
    sponseeDetails: Joi.string().required(),
    relationshipDid: Joi.string().required(),
    metaData: Joi.object({
      msgType: Joi.string().required(),
      msgSenderName: Joi.string().required()
    }).required()
  }).required()
}

module.exports = {
  createSubscriber,
  sendNotification
}
