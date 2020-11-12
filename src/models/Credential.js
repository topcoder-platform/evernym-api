/*
 * Schema for Credential.
 */

const config = require('config')
const {
  Schema
} = require('dynamoose')
const uuid = require('uuid')
const constants = require('../../constants')

const schema = new Schema({
  id: {
    type: String,
    default: () => uuid.v4(),
    hashKey: true
  },
  relDID: {
    type: String
  },
  definitionId: {
    type: String
  },
  credentialData: {
    type: Object
  },
  comment: {
    type: String
  },
  threadId: {
    type: String,
    index: {
      global: true
    }
  },
  status: {
    type: String,
    enum: Object.values(constants.Status.Credential),
    default: constants.Status.Credential.Pending
  }
}, {
  timestamps: true,
  saveUnknown: ['credentialData.**'],
  throughput: {
    read: Number(config.AMAZON.DYNAMODB_READ_CAPACITY_UNITS),
    write: Number(config.AMAZON.DYNAMODB_WRITE_CAPACITY_UNITS)
  }
})

module.exports = schema
