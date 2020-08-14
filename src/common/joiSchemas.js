/*
 * Provide common used schemas.
 */

const Joi = require('@hapi/joi')
const constants = require('../../constants')

module.exports = {
  page: Joi.number().min(constants.Pagination.MinPage).default(constants.Pagination.DefaultPage),
  perPage: Joi.number().min(constants.Pagination.MinPerPage).default(constants.Pagination.DefaultPerPage)
}
