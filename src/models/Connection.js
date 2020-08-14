/*
 * Mongoose schema for Connection.
 */

const { Schema } = require('mongoose')

const schema = new Schema({
  connDID: {
    type: String
  },
  relDID: {
    type: String
  },
  createdAt: {
    type: Date,
    default: new Date()
  }
})

module.exports = schema
