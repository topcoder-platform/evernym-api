/*
 * Mongoose schema for Relationship.
 */

const { Schema } = require('mongoose')

const schema = new Schema({
  relDID: {
    type: String
  },
  inviteURL: {
    type: String
  },
  name: {
    type: String
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
})

module.exports = schema
