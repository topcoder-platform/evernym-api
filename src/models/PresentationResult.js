/*
 * Schema for PresentationResult.
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
  name: {
    type: String
  },
  attrs: {
    type: Array,
    schema: [{
      type: String
    }]
  },
  threadId: {
    type: String,
    index: {
      global: true
    }
  },
  status: {
    type: String,
    enum: Object.values(constants.Status.PresentationResult),
    default: constants.Status.PresentationResult.Pending
  },
  data: {
    type: Object
  }
}, {
  timestamps: true,
  saveUnknown: ['data.**'],
  throughput: {
    read: Number(config.AMAZON.DYNAMODB_READ_CAPACITY_UNITS),
    write: Number(config.AMAZON.DYNAMODB_WRITE_CAPACITY_UNITS)
  }
})

module.exports = schema
