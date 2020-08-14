/*
 * Provide operations upon verity-sdk.
 */

const sdk = require('verity-sdk')
const request = require('superagent')
const config = require('config')
const Joi = require('@hapi/joi')
const fs = require('fs')
const _ = require('lodash')
const logger = require('../common/logger')
const errors = require('../common/errors')
const constants = require('../../constants')

const handlers = new sdk.Handlers()
let context
let issuerInfo

/**
 * Create error object from error message.
 *
 * @param {Object} message the error message object
 * @returns {Object} the error object
 */
function errorFromMessage (message) {
  if (message.message && message.message.includes('client request invalid')) {
    return new errors.BadRequestError(JSON.stringify(message))
  }
  return new Error(`cannot not handle the error message:  ${JSON.stringify(message)}`)
}

/**
 * Save context to file.
 *
 * @param {Object} context the Context object
 * @returns {undefined}
 */
function saveContext (context) {
  logger.debug(`Context: ${JSON.stringify(context.getConfig())}`)
  fs.writeFileSync(config.VERITY_CONTEXT_PATH, JSON.stringify(context.getConfig()))
}

/**
 * Initilize issuer.
 *
 * @returns {undefined}
 */
async function init () {
  // initilize context
  if (!fs.existsSync(config.VERITY_CONTEXT_PATH)) {
    logger.info('creating context...')
    const basicContext = await sdk.Context.create(config.VERITY_WALLET_NAME, config.VERITY_WALLET_KEY, config.VERITY_SERVER_URL, '')
    if (!config.VERITY_PROVISION_TOKEN) {
      throw new Error('VERITY_PROVISION_TOKEN cannot be empty')
    }
    const provision = new sdk.protocols.v0_7.Provision(null, config.VERITY_PROVISION_TOKEN)
    context = await provision.provision(basicContext)
    logger.info('context created')
    saveContext(context)
  } else {
    logger.info(`reuse existing context from ${config.VERITY_CONTEXT_PATH}`)
    context = await sdk.Context.createWithConfig(fs.readFileSync(config.VERITY_CONTEXT_PATH))
  }
  // update webhook endpoint
  if (config.VERITY_WEBHOOK_ENDPOINT_URL && config.VERITY_WEBHOOK_ENDPOINT_URL !== context.endpointUrl) {
    context.endpointUrl = config.VERITY_WEBHOOK_ENDPOINT_URL
    await new sdk.protocols.UpdateEndpoint().update(context)
    logger.info('webhook endpoint updated')
    saveContext(context)
  }
  // update institution info
  const updateConfigs = new sdk.protocols.UpdateConfigs(config.VERITY_INSTITUTION_NAME, config.VERITY_INSTITUTION_LOGO_URL)
  await updateConfigs.update(context)
  logger.info('institution info updated')
  // 1) try to setup issuer using existing identifier
  const issuerSetup = new sdk.protocols.IssuerSetup()
  logger.info('quering public identifier...')
  const promise01 = new Promise((resolve, reject) => {
    handlers.addHandler(issuerSetup.msgFamily, issuerSetup.msgFamilyVersion, async (msgName, message) => {
      logger.debug(`msgName: ${msgName}, message: ${JSON.stringify(message)}`)
      if (msgName !== issuerSetup.msgNames.PUBLIC_IDENTIFIER) {
        resolve()
        return
      }
      logger.info('issuer identifier found')
      resolve({
        issuerDID: message.did,
        issuerVerkey: message.verKey
      })
    })
  })
  await issuerSetup.currentPublicIdentifier(context)
  issuerInfo = await promise01
  // 2) if issuer identifier not found, create new issuer identifier and write it to the ledger
  if (!issuerInfo) {
    logger.info('Creating issuer identifier...')
    const promise02 = new Promise((resolve, reject) => {
      handlers.addHandler(issuerSetup.msgFamily, issuerSetup.msgFamilyVersion, async (msgName, message) => {
        logger.debug(`msgName: ${msgName}, message: ${JSON.stringify(message)}`)
        if (msgName !== issuerSetup.msgNames.PUBLIC_IDENTIFIER_CREATED) {
          reject(new Error(`Unexpected message name: ${msgName}`))
        }
        logger.info('issuer identifier created')
        resolve({
          issuerDID: message.identifier.did,
          issuerVerkey: message.identifier.verKey
        })
      })
    })
    await issuerSetup.create(context)
    issuerInfo = await promise02
    await request
      .post(config.VERITY_SELF_REGISTRATION_URL)
      .send({
        network: constants.NetType.StagingNet,
        did: issuerInfo.issuerDID,
        verkey: issuerInfo.issuerVerkey,
        paymentaddr: ''
      })
  }
  logger.debug(`issuer info: ${JSON.stringify(issuerInfo)}`)
  logger.info('issuer initilized successfully')
}

/**
 * Create relationship.
 *
 * @param {String} relationshipName the relationship name
 * @returns {Object} the result from the operation
 */
async function createRelationship (relationshipName) {
  // create relationship key
  const relProvisioning = new sdk.protocols.v1_0.Relationship(null, null, relationshipName)
  const promise01 = new Promise((resolve, reject) => {
    handlers.addHandler(relProvisioning.msgFamily, relProvisioning.msgFamilyVersion, async (msgName, message) => {
      logger.debug(`msgName: ${msgName}, message: ${JSON.stringify(message)}`)
      if (msgName === constants.MessageType.ProblemReport) {
        reject(errorFromMessage(message))
      }
      if (msgName !== relProvisioning.msgNames.CREATED) {
        reject(new Error(`Unexpected message name: ${msgName}`))
      }
      resolve({
        threadId: message['~thread'].thid,
        relDID: message.did
      })
    })
  })
  await relProvisioning.create(context)
  const { relDID, threadId } = await promise01
  // create invitation
  const relationship = new sdk.protocols.v1_0.Relationship(relDID, threadId)
  const promise02 = new Promise((resolve, reject) => {
    handlers.addHandler(relProvisioning.msgFamily, relProvisioning.msgFamilyVersion, async (msgName, message) => {
      logger.debug(`msgName: ${msgName}, message: ${JSON.stringify(message)}`)
      if (msgName === constants.MessageType.ProblemReport) {
        reject(errorFromMessage(message))
      }
      if (msgName !== relationship.msgNames.INVITATION) {
        reject(new Error(`Unexpected message name: ${msgName}`))
      }
      resolve(message.inviteURL)
    })
  })
  await relationship.connectionInvitation(context)
  const inviteURL = await promise02
  logger.debug(`invite URL: ${inviteURL}`)
  return {
    relDID,
    inviteURL
  }
}

/**
 * Waiting for a connection.
 *
 * @returns {Object} the result from the operation
 */
async function waitForConnection () {
  const connecting = new sdk.protocols.v1_0.Connecting()
  logger.info('Waiting for connection...')
  const { connDID, myDID } = await new Promise((resolve, reject) => {
    handlers.addHandler(connecting.msgFamily, connecting.msgFamilyVersion, async (msgName, message) => {
      logger.debug(`msgName: ${msgName}, message: ${JSON.stringify(message)}`)
      if (msgName === constants.MessageType.ProblemReport) {
        reject(errorFromMessage(message))
      }
      if (msgName !== connecting.msgNames.REQUEST_RECEIVED) {
        reject(new Error(`Unexpected message name: ${msgName}`))
      }
      resolve({
        connDID: message.conn.DID,
        myDID: message.myDID
      })
    })
  })
  await new Promise((resolve, reject) => {
    handlers.addHandler(connecting.msgFamily, connecting.msgFamilyVersion, async (msgName, message) => {
      logger.debug(`msgName: ${msgName}, message: ${JSON.stringify(message)}`)
      if (msgName === constants.MessageType.ProblemReport) {
        reject(errorFromMessage(message))
      }
      if (msgName !== connecting.msgNames.RESPONSE_SENT) {
        reject(new Error(`Unexpected message name: ${msgName}`))
      }
      logger.info('Connected')
      resolve()
    })
  })
  return { connDID, relDID: myDID }
}

/**
 * Write a schema to Ledger.
 *
 * @param {String} schemaName the name of schema
 * @param {String} schemaVersion the version of schema
 * @param {Array} schemaAttrs the schema attributes
 * @returns {Object} the result from the operation
 */
async function createSchema (schemaName, schemaVersion, schemaAttrs) {
  const schema = new sdk.protocols.WriteSchema(schemaName, schemaVersion, schemaAttrs)
  const promise = new Promise((resolve, reject) => {
    handlers.addHandler(schema.msgFamily, schema.msgFamilyVersion, async (msgName, message) => {
      logger.debug(`msgName: ${msgName}, message: ${JSON.stringify(message)}`)
      if (msgName === constants.MessageType.ProblemReport) {
        reject(errorFromMessage(message))
      }
      if (msgName !== schema.msgNames.STATUS) {
        reject(new Error(`Unexpected message name: ${msgName}`))
      }
      resolve(message.schemaId)
    })
  })
  await schema.write(context)
  const schemaId = await promise
  logger.debug(`schema ID: ${schemaId}`)
  return { schemaId }
}

/**
 * Write credential definition to Ledger.
 *
 * @param {String} schemaId the schema ID
 * @param {String} definitionName the definition name
 * @param {String} definitionTag the definition tag
 * @returns {Object} the result from the operation
 */
async function createCredDefinition (schemaId, definitionName, definitionTag) {
  const def = new sdk.protocols.WriteCredentialDefinition(definitionName, schemaId, definitionTag)
  const promise = new Promise((resolve, reject) => {
    handlers.addHandler(def.msgFamily, def.msgFamilyVersion, async (msgName, message) => {
      logger.debug(`msgName: ${msgName}, message: ${JSON.stringify(message)}`)
      if (msgName === constants.MessageType.ProblemReport) {
        reject(errorFromMessage(message))
      }
      if (msgName !== def.msgNames.STATUS) {
        reject(new Error(`Unexpected message name: ${msgName}`))
      }
      resolve(message.credDefId)
    })
  })
  await def.write(context)
  const definitionId = await promise
  return { definitionId }
}

/**
 * Issue credential.
 *
 * @param {String} relDID the relationship DID
 * @param {String} definitionId the definition id
 * @param {Object} credentialData the credential data
 * @param {String} comment the comment
 * @returns {undefined}
 */
async function issueCredential (relDID, definitionId, credentialData, comment) {
  const issue = new sdk.protocols.v1_0.IssueCredential(relDID, null, definitionId, credentialData, comment, 0, true)
  // wait for the offer sent
  const promise = new Promise((resolve, reject) => {
    handlers.addHandler(issue.msgFamily, issue.msgFamilyVersion, async (msgName, message) => {
      logger.debug(`msgName: ${msgName}, message: ${JSON.stringify(message)}`)
      if (msgName === constants.MessageType.ProblemReport) {
        reject(errorFromMessage(message))
      }
      if (msgName !== issue.msgNames.SENT) {
        reject(new Error(`Unexpected message name: ${msgName}`))
      }
      resolve()
    })
  })
  await issue.offerCredential(context)
  logger.info('Waiting for user accept the credential...')
  await promise
  // wait for the credential sent
  await new Promise((resolve, reject) => {
    handlers.addHandler(issue.msgFamily, issue.msgFamilyVersion, async (msgName, message) => {
      logger.debug(`msgName: ${msgName}, message: ${JSON.stringify(message)}`)
      if (msgName === constants.MessageType.ProblemReport) {
        reject(errorFromMessage(message))
      }
      if (msgName !== issue.msgNames.SENT) {
        reject(new Error(`Unexpected message name: ${msgName}`))
      }
      resolve()
    })
  })
  logger.info('credential being accepted')
}

/**
 * Request proof.
 *
 * @param {Object} data the data to request proof
 * @returns {undefined}
 */
async function requestProof (data) {
  const { relDID, name: proofName, attrs } = data
  const proofAttrs = attrs.map((attr) => ({
    name: attr,
    restrictions: [{ issuer_did: issuerInfo.issuerDID }]
  }))
  const proof = new sdk.protocols.v1_0.PresentProof(relDID, null, proofName, proofAttrs)
  const promise = new Promise((resolve, reject) => {
    handlers.addHandler(proof.msgFamily, proof.msgFamilyVersion, async (msgName, message) => {
      if (msgName === constants.MessageType.ProblemReport) {
        reject(errorFromMessage(message))
      }
      logger.debug(`msgName: ${msgName}, message: ${JSON.stringify(message)}`)
      if (msgName !== proof.msgNames.PRESENTATION_RESULT) {
        reject(new Error(`Unexpected message name: ${msgName}`))
      }
      resolve(message)
    })
  })
  await proof.request(context)
  logger.info('Waiting for presentation result...')
  const result = await promise
  logger.info('presentation result received')
  return _.pick(result, ['verification_result', 'requested_presentation'])
}

requestProof.schema = {
  data: Joi.object({
    relDID: Joi.string().required(),
    name: Joi.string().required(),
    attrs: Joi.array().items(Joi.string()).required()
  }).required()
}

/**
 * Handle message from webhook.
 *
 * @param {Object} message the message from webhook
 * @returns {undefined}
 */
async function handleMessage (message) {
  await handlers.handleMessage(context, Buffer.from(message, 'utf8'))
}

module.exports = {
  init,
  createRelationship,
  waitForConnection,
  createSchema,
  createCredDefinition,
  issueCredential,
  requestProof,
  handleMessage
}
