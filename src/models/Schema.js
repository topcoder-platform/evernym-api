/*
 * Schema for Schema.
 */

const config = require('config')
const {
  Schema
} = require('dynamoose')
const uuid = require('uuid')

const schema = new Schema({
  id: {
    type: String,
    default: () => uuid.v4(),
    hashKey: true
  },
  schemaId: {
    type: String,
    index: {
      global: true
    }
  },
  name: {
    type: String,
    index: {
      global: true,
      rangeKey: 'version'
    }
  },
  version: {
    type: String
  },
  createdAt: {
    type: Date,
    default: () => new Date()
  },
  attrs: {
    type: Array,
    schema: [{
      type: String
    }]
  }
}, {
  throughput: {
    read: Number(config.AMAZON.DYNAMODB_READ_CAPACITY_UNITS),
    write: Number(config.AMAZON.DYNAMODB_WRITE_CAPACITY_UNITS)
  }
})

module.exports = schema
