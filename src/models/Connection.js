/*
 * Schema for Connection.
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
    type: String,
    index: {
      global: true
    }
  },
  status: {
    type: String,
    enum: Object.values(constants.Status.Connection),
    default: constants.Status.Connection.Pending
  }
}, {
  timestamps: true,
  throughput: {
    read: Number(config.AMAZON.DYNAMODB_READ_CAPACITY_UNITS),
    write: Number(config.AMAZON.DYNAMODB_WRITE_CAPACITY_UNITS)
  }
})

module.exports = schema
