/*
 * Mongoose schema for PresentationResult.
 */

const { Schema } = require('mongoose')
const constants = require('../../constants')

const schema = new Schema({
  relDID: { type: String },
  name: { type: String },
  attrs: {
    type: Array,
    items: {
      type: String
    }
  },
  threadId: { type: String },
  status: {
    type: String,
    enum: Object.values(constants.Status.PresentationResult),
    default: constants.Status.PresentationResult.Pending
  },
  data: { type: Object }
}, { timestamps: true })

module.exports = schema
