/*
 * Provide operations upon verity-sdk.
 */

const sdk = require('verity-sdk')
const request = require('superagent')
const path = require('path')
const config = require('config')
const Joi = require('@hapi/joi')
const fs = require('fs')
const _ = require('lodash')
const models = require('../models')
const logger = require('../common/logger')
const errors = require('../common/errors')
const utils = require('../common/utils')
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
 * Save context config to both local file and db. Context would be overwritten if already exists.
 *
 * @param {Object} context the Context object
 * @returns {undefined}
 */
async function saveContextConfig (context) {
  logger.debug(`Context: ${JSON.stringify(context.getConfig())}`)
  logger.info('persisting conext config to local file')
  fs.writeFileSync(config.VERITY_CONTEXT_PATH, JSON.stringify(context.getConfig()))
  logger.info('persisting conext config to db')
  const [evernymConfig] = await models.Config.scan().exec()
  if (!evernymConfig) {
    await models.Config.create({ context: context.getConfig() })
    return
  }
  evernymConfig.context = context.getConfig()
  await evernymConfig.save()
}

/**
 * Try to reuse context config from local file or from db.
 *
 * @returns {Buffer} the context buffer
 */
async function getContextConfig () {
  if (fs.existsSync(config.VERITY_CONTEXT_PATH)) {
    logger.info(`reuse existing context config from ${config.VERITY_CONTEXT_PATH}`)
    return fs.readFileSync(config.VERITY_CONTEXT_PATH)
  }
  const [evernymConfig] = await models.Config.scan().exec()
  if (evernymConfig) {
    logger.info('reuse existing context config stored in db')
    return Buffer.from(JSON.stringify(evernymConfig.context))
  }
}

/**
 * Save wallet file to S3.
 *
 * @returns {undefined}
 */
async function saveWallet () {
  const s3 = utils.getS3Client()
  logger.info(`uploading wallet file to s3 bucket ${config.AMAZON.S3_BUCKET_WALLET}`)
  await s3.putObject({
    Bucket: config.AMAZON.S3_BUCKET_WALLET,
    Key: constants.VerityWalletFile.Basename,
    Body: fs.readFileSync(constants.VerityWalletFile.Pathname)
  }).promise()
  logger.info(`successfully uploaded wallet file to s3 bucket ${config.AMAZON.S3_BUCKET_WALLET}`)
}

/**
 * Fetch the wallet file from s3 to local filesystem.
 *
 * @returns {undefined}
 */
async function replicateWalletFromS3 () {
  const s3 = utils.getS3Client()
  logger.info('downloading wallet file from s3')
  const stream = s3.getObject({
    Bucket: config.AMAZON.S3_BUCKET_WALLET,
    Key: constants.VerityWalletFile.Basename
  }).createReadStream()
  const walletFileDirname = path.dirname(constants.VerityWalletFile.Pathname)
  if (!fs.existsSync(walletFileDirname)) {
    fs.mkdirSync(path.dirname(constants.VerityWalletFile.Pathname), { recursive: true })
  }
  stream.pipe(fs.createWriteStream(constants.VerityWalletFile.Pathname))
  await new Promise((resolve, reject) => {
    stream.on('end', () => resolve())
    stream.on('error', (err) => reject(err))
  })
  logger.info('successfully download wallet file to local filesystem')
}

/**
 * Initilize issuer.
 *
 * @returns {undefined}
 */
async function init () {
  // initilize context
  const contextConfig = await getContextConfig()
  if (!contextConfig) {
    logger.info('No existing context found. Creating context...')
    const basicContext = await sdk.Context.create(config.VERITY_WALLET_NAME, config.VERITY_WALLET_KEY, config.VERITY_SERVER_URL, '')
    await saveWallet()
    if (!config.VERITY_PROVISION_TOKEN) {
      throw new Error('VERITY_PROVISION_TOKEN cannot be empty')
    }
    const provision = new sdk.protocols.v0_7.Provision(null, config.VERITY_PROVISION_TOKEN)
    context = await provision.provision(basicContext)
    logger.info('context created')
    await saveContextConfig(context)
  } else {
    if (!fs.existsSync(constants.VerityWalletFile.Pathname)) {
      await replicateWalletFromS3()
    }
    context = await sdk.Context.createWithConfig(contextConfig)
  }
  // update webhook endpoint
  if (config.VERITY_WEBHOOK_ENDPOINT_URL && config.VERITY_WEBHOOK_ENDPOINT_URL !== context.endpointUrl) {
    context.endpointUrl = `${config.VERITY_WEBHOOK_ENDPOINT_URL}/verity/webhook`
    await new sdk.protocols.UpdateEndpoint().update(context)
    logger.info('webhook endpoint updated')
    saveContextConfig(context)
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
 * Initilize handlers that deal with messages from webhook.
 *
 * @returns {undefined}
 */
function initMessageHandlers () {
  handleConnections()
  handleIssuingCredential()
  handlePresentationResult()
}

/**
 * Intialize connection handler.
 *
 * @returns {undefined}
 */
function handleConnections () {
  const connecting = new sdk.protocols.v1_0.Connecting()
  handlers.addHandler(connecting.msgFamily, connecting.msgFamilyVersion, async (msgName, message) => {
    logger.debug(`[handleConnections] msgName: ${msgName}, message: ${JSON.stringify(message)}`)
    if (msgName === constants.MessageType.ProblemReport) {
      logger.logFullError(errorFromMessage(message))
      return
    }
    if (msgName !== connecting.msgNames.REQUEST_RECEIVED) {
      return
    }
    const [connection] = await models.Connection.query({ relDID: message.myDID }).exec()
    if (!connection) {
      logger.logFullError(`[handleConnections] Connection with relDID ${message.myDID} not found`)
      return
    }
    connection.status = constants.Status.Connection.Active
    logger.info(`Connection with relDID ${message.myDID} is active`)
    await connection.save()
  })
}

/**
 * Intialize issuing credential handler.
 *
 * @returns {undefined}
 */
function handleIssuingCredential () {
  const issue = new sdk.protocols.v1_0.IssueCredential()
  handlers.addHandler(issue.msgFamily, issue.msgFamilyVersion, async (msgName, message) => {
    logger.debug(`[handleIssuingCredential] msgName: ${msgName}, message: ${JSON.stringify(message)}`)
    if (msgName === constants.MessageType.ProblemReport) {
      logger.logFullError(errorFromMessage(message))
      return
    }
    const threadId = message['~thread'].thid
    const [credential] = await models.Credential.query({ threadId }).exec()
    if (!credential) {
      logger.logFullError(`[handleIssuingCredential] Credential with threadId ${threadId} not found`)
      return
    }
    // handle 'sent` message when the offer is sent
    if (_.get(message, 'msg["offers~attach"]')) {
      credential.status = constants.Status.Credential.Offered
      await credential.save()
      logger.info(`[handleIssuingCredential] the status of Credential ${credential._id} changed to ${credential.status}`)
      return
    }
    // handle 'sent` message when the offer for credential is accepted and credential sent
    if (_.get(message, 'msg["credentials~attach"]')) {
      credential.status = constants.Status.Credential.Accepted
      await credential.save()
      logger.info(`[handleIssuingCredential] the status of Credential ${credential._id} changed to ${credential.status}`)
      return
    }
    logger.logFullError(`[handleIssuingCredential] Unexpected message ${JSON.stringify(message)}`)
  })
}

async function handlePresentationResult () {
  const proof = new sdk.protocols.v1_0.PresentProof()
  handlers.addHandler(proof.msgFamily, proof.msgFamilyVersion, async (msgName, message) => {
    logger.debug(`[handlePresentationResult] msgName: ${msgName}, message: ${JSON.stringify(message)}`)
    if (msgName === constants.MessageType.ProblemReport) {
      logger.logFullError(errorFromMessage(message))
      return
    }
    if (msgName !== proof.msgNames.PRESENTATION_RESULT) {
      logger.logFullError(`Unexpected message kind: ${msgName}`)
      return
    }
    const threadId = message['~thread'].thid
    const [presentationResult] = await models.PresentationResult.query({ threadId }).exec()
    if (!presentationResult) {
      logger.logFullError(`[handlePresentationResults] PresentationResult with threadId ${threadId} not found`)
      return
    }
    presentationResult.data = _.pick(message, ['verification_result', 'requested_presentation'])
    presentationResult.status = constants.Status.PresentationResult.Ready
    await presentationResult.save()
  })
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
  logger.info('creating Relationship...')
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
  logger.info(`Relationship ${relDID} created`)
  logger.debug(`invite URL: ${inviteURL}`)
  return {
    relDID,
    inviteURL
  }
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
  logger.info('creating Schema...')
  await schema.write(context)
  const schemaId = await promise
  logger.info(`Schema ${schemaId} created`)
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
  logger.info('creating CredDefinition...')
  await def.write(context)
  const definitionId = await promise
  logger.info(`CredDefinition ${definitionId} created`)
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
  logger.info('offering credential...')
  await issue.offerCredential(context)
  return { threadId: issue.threadId }
}

/**
 * Request proof.
 *
 * @param {Object} data the data to request proof
 * @returns {undefined}
 */
async function requestProof (data) {
  const relationship = await models.Relationship.query({ relDID: data.relDID }).exec()
  if (!relationship) {
    throw new errors.NotFoundError(`relationship with relDID ${data.relDID} not found`)
  }
  const { relDID, name: proofName, attrs } = data
  const proofAttrs = attrs.map((attr) => ({
    name: attr,
    restrictions: [{ issuer_did: issuerInfo.issuerDID }]
  }))
  const proof = new sdk.protocols.v1_0.PresentProof(relDID, null, proofName, proofAttrs)
  const result = await models.PresentationResult.createWithDefaults({ ...data, threadId: proof.threadId })
  logger.info('requesting proof...')
  await proof.request(context)
  return result
}

requestProof.schema = {
  data: Joi.object({
    relDID: Joi.string().required(),
    name: Joi.string().required(),
    attrs: Joi.array().items(Joi.string()).required()
  }).required()
}

/**
 * Find a presentationResult.
 *
 * @param {String} id the id of presentationResult
 * @returns {Object} the operation result
 */
async function getPresentationResult (id) {
  const result = await models.PresentationResult.get(id)
  if (!result) {
    throw new errors.NotFoundError(`presentationResult with id ${id} not found`)
  }
  return result
}

getPresentationResult.schema = {
  id: Joi.string().required()
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
  initMessageHandlers,
  createRelationship,
  createSchema,
  createCredDefinition,
  issueCredential,
  requestProof,
  getPresentationResult,
  handleMessage
}
