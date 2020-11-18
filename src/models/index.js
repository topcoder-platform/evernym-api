/**
 * Initialize DynamoDB models
 */

const config = require('config')
const dynamoose = require('dynamoose')
const _ = require('lodash')
const {
  findLocalModules
} = require('../common/utils')

const awsConfig = {
  region: config.AMAZON.AWS_REGION
}
if (config.AMAZON.AWS_ACCESS_KEY_ID && config.AMAZON.AWS_SECRET_ACCESS_KEY) {
  awsConfig.accessKeyId = config.AMAZON.AWS_ACCESS_KEY_ID
  awsConfig.secretAccessKey = config.AMAZON.AWS_SECRET_ACCESS_KEY
}
dynamoose.aws.sdk.config.update(awsConfig)

if (config.AMAZON.IS_LOCAL_DB) {
  dynamoose.aws.ddb.local(config.AMAZON.DYNAMODB_URL)
}

dynamoose.model.defaults.set({
  create: false,
  update: false,
  waitForActive: false
})

/**
 * Currently default values would not be applied to a document immediately
 * after its instantiation(https://github.com/dynamoose/dynamoose/issues/905).
 * Here provides a model method to workaround that.
 *
 * @param {Object} model the dynamoose model
 * @returns {undefined}
 */
function setCreateWithDefaults (model) {
  model.methods.set('createWithDefaults', async function (data) {
    const schema = model.schemas[0]
    const dataPopulated = {}
    for (const [propertyName, propertySchema] of Object.entries(schema.schemaObject)) {
      if (data[propertyName]) {
        continue
      }
      if (!propertySchema.default) {
        continue
      }
      if (typeof propertySchema.default !== 'function') {
        dataPopulated[propertyName] = propertySchema.default
        continue
      }
      dataPopulated[propertyName] = await propertySchema.default()
    }
    return model.create({
      ...data,
      ...dataPopulated
    })
  })
}

const models = _.reduce(findLocalModules(__dirname), (result, data, moduleName) => {
  const schema = require(data.path)
  const model = dynamoose.model(`${config.AMAZON.TABLE_NAME_PREFIX}${moduleName}`, schema)
  setCreateWithDefaults(model)
  result[moduleName] = model
  return result
}, {})

module.exports = models
