/*
 * Mongoose schema for Credential.
 */

const { Schema } = require('mongoose')

const schema = new Schema({
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
  createdAt: {
    type: Date,
    default: new Date()
  }
})

module.exports = schema
