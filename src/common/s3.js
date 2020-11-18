/**
 * AWS S3 methods for wallet bucket
 */

const config = require('config')
var AWS = require('aws-sdk');
const fs = require('fs')
const logger = require('../common/logger')

const awsConfig = {
  region: config.AMAZON.AWS_REGION
}
if (config.AMAZON.AWS_ACCESS_KEY_ID && config.AMAZON.AWS_SECRET_ACCESS_KEY) {
  awsConfig.accessKeyId = config.AMAZON.AWS_ACCESS_KEY_ID
  awsConfig.secretAccessKey = config.AMAZON.AWS_SECRET_ACCESS_KEY
}
AWS.config.update(awsConfig)

s3 = new AWS.S3({apiVersion: '2006-03-01'})

/**
 * Create wallet bucket
 */
async function createBucket() {
    await s3.createBucket({ Bucket: config.AMAZON.S3_WALLET_BUCKET}).promise()
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
  // Upload to S3
  await s3.upload(params).promise()
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
  const downloadedFile = await s3.getObject({ Bucket: config.AMAZON.S3_WALLET_BUCKET, Key: key }).promise()
  fs.writeFileSync(filePath, downloadedFile.Body, {mode: 0o644})
}

module.exports = {
  createBucket,
  upload,
  download
}
