/*
 * Schema for Subscriber.
 */

const config = require('config')
const {
  Schema
} = require('dynamoose')

const schema = new Schema({
  token: {
    type: String,
    hashKey: true
  },
  device: {
    type: String
  },
  username: {
    type: String
  },
  evernymRelationshipDid: {
    type: String,
    index: {
      global: true,
      rangeKey: 'sponsee',
      project: true,
      name: 'evernymRelationshipDid-sponsee-index',
      throughput: {
        read: Number(config.AMAZON.DYNAMODB_READ_CAPACITY_UNITS),
        write: Number(config.AMAZON.DYNAMODB_WRITE_CAPACITY_UNITS)
      }
    }
  },
  sponsee: {
    type: String
  },
  endpointArn: {
    type: String
  }
}, {
  throughput: {
    read: Number(config.AMAZON.DYNAMODB_READ_CAPACITY_UNITS),
    write: Number(config.AMAZON.DYNAMODB_WRITE_CAPACITY_UNITS)
  }
})

module.exports = schema
