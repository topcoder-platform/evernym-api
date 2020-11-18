/**
 * AWS S3 methods for wallet bucket
 */

const config = require('config')
var AWS = require('aws-sdk');
const fs = require('fs')
const logger = require('./logger')
const constants = require('../../constants')

let s3Client

/**
 * Create S3 client.
 *
 * @returns {Object} the client
 */
function getS3Client () {
  if (s3Client) {
    return s3Client
  }
  if (config.AMAZON.IS_LOCAL_S3) {
    logger.debug('using local S3 service')
    s3Client = new AWS.S3({
      apiVersion: constants.AMAZON.S3ApiVersion,
      accessKeyId: config.AMAZON.AWS_ACCESS_KEY_ID,
      secretAccessKey: config.AMAZON.AWS_SECRET_ACCESS_KEY,
      s3ForcePathStyle: true,
      sslEnabled: false,
      endpoint: config.AMAZON.S3_ENDPOINT
    })
    return s3Client
  }
  s3Client = new AWS.S3({
    apiVersion: constants.AMAZON.S3ApiVersion,
    accessKeyId: config.AMAZON.AWS_ACCESS_KEY_ID,
    secretAccessKey: config.AMAZON.AWS_SECRET_ACCESS_KEY,
  })
  return s3Client
}

/**
 * Create wallet bucket
 */
async function createBucket() {
  await getS3Client().createBucket({ Bucket: config.AMAZON.S3_WALLET_BUCKET}).promise()
}


/**
 * Upload one file to S3
 * @param {String} key The key in S3
 * @param {String} filePath The file path to be uploaded
 */
async function upload(key, filePath) {
  if (config.AMAZON.IS_LOCAL_S3) {
    logger.info('Local S3, skip uploading')
    return
  }
  const file = fs.readFileSync(filePath)
  const params = {
    Bucket: config.AMAZON.S3_WALLET_BUCKET,
    Key: key,
    Body: file
  }
  logger.info(`Uploading ${filePath} to ${config.AMAZON.S3_WALLET_BUCKET}/${key}`)
  // Upload to S3
  await getS3Client().upload(params).promise()
}

/**
 * Download file from S3 to local
 * @param {String} key The key in S3
 * @param {String} filePath The path to store the file
 */
async function download(key, filePath) {
  if (config.AMAZON.IS_LOCAL_S3) {
    logger.info('Local S3, skip downloading')
    return
  }
  logger.info(`Downloading ${config.AMAZON.S3_WALLET_BUCKET}/${key} to ${filePath}`)
  const downloadedFile = await getS3Client().getObject({ Bucket: config.AMAZON.S3_WALLET_BUCKET, Key: key }).promise()
  fs.writeFileSync(filePath, downloadedFile.Body, {mode: 0o644})
}

module.exports = {
  getS3Client,
  createBucket,
  upload,
  download
}
