/*
 * Mongoose schema for Credential.
 */

const { Schema } = require('mongoose')
const constants = require('../../constants')

const schema = new Schema({
  relDID: { type: String },
  definitionId: { type: String },
  credentialData: { type: Object },
  comment: { type: String },
  threadId: { type: String },
  status: {
    type: String,
    enum: Object.values(constants.Status.Credential),
    default: constants.Status.Credential.Pending
  }
}, { timestamps: true })

module.exports = schema
