/*
 * Mongoose schema for Connection.
 */

const { Schema } = require('mongoose')
const constants = require('../../constants')

const schema = new Schema({
  relDID: { type: String },
  status: {
    type: String,
    enum: Object.values(constants.Status.Connection),
    default: constants.Status.Connection.Pending
  }
}, { timestamps: true })

module.exports = schema
