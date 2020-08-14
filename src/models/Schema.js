/*
 * Mongoose schema for Defintion.
 */

const { Schema } = require('mongoose')

const schema = new Schema({
  schemaId: {
    type: String
  },
  name: {
    type: String
  },
  version: {
    type: String
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
})

module.exports = schema
