/*
 * Provide plugins for mongoose.
 */

/**
 * Rename _id to id on a document.
 *
 * @param {Object} schema the Schema object
 * @param {Object} options the options
 * @returns {undefined}
 */
function transformPlugin (schema, options) {
  schema.methods.transform = function () {
    const obj = this.toObject({ versionKey: false })
    // Rename fields
    obj.id = obj._id
    delete obj._id
    return obj
  }
}

module.exports = {
  transformPlugin
}
