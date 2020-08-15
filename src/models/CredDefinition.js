/*
 * Mongoose schema for CredDefinition.
 */

const { Schema } = require('mongoose')

const schema = new Schema({
  definitionId: { type: String },
  schemaId: { type: String },
  name: { type: String },
  tag: { type: String },
  createdAt: {
    type: Date,
    default: new Date()
  }
})

module.exports = schema
