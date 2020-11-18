/*
 * Schema for Config.
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
  context: {
    type: Object
  }
}, {
  timestamps: true,
  saveUnknown: ['context.**'],
  throughput: {
    read: Number(config.AMAZON.DYNAMODB_READ_CAPACITY_UNITS),
    write: Number(config.AMAZON.DYNAMODB_WRITE_CAPACITY_UNITS)
  }
})

module.exports = schema
