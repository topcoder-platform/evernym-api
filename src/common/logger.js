/*
 * Logger using winston.
 */

const { createLogger, format, transports } = require('winston')
const config = require('config')
const util = require('util')

const logger = createLogger({
  level: config.LOG_LEVEL,
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp(),
        format.printf(({ level, message, label, timestamp }) => {
          return `${timestamp} ${level} ${message}`
        })
      )
    })
  ]
})

logger.logFullError = (err) => {
  if (err.logged) {
    return
  }
  logger.error(util.inspect(err))
  err.logged = true
}

module.exports = logger
