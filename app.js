/*
 * The app entry
 */

const express = require('express')
const bodyParser = require('body-parser')
const config = require('config')
const logger = require('./src/common/logger')
const { VerityService } = require('./src/services')
const router = require('./src/router')

const app = express()
// attach a shortcut function to the res object
app.use((req, res, next) => {
  res.sendMessage = (message) => res.send({ message })
  next()
})
app.use(bodyParser.json())
app.use(bodyParser.text({
  type: () => 'text'
}))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(router)

// handle errors
app.use((err, req, res, next) => {
  logger.logFullError(err)
  // handle joi errors
  if (err.isJoi) {
    res.status(400).sendMessage(err.details[0].message)
    return
  }
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    logger.info(err)
    res.status(400).sendMessage(err.message)
    return
  }
  // handle errors with status code
  for (const propertyName of ['statusCode', 'httpStatus']) {
    if (err[propertyName]) {
      res.status(err[propertyName]).sendMessage(err.message)
      return
    }
  }
  // handle internal errors
  res.status(500).sendMessage('internal server error')
})

app.listen(config.PORT, () => {
  logger.info(`APP is listening on ${config.PORT}`)
  const init = async () => {
    await VerityService.init()
    VerityService.initMessageHandlers()
  }
  init().catch((err) => {
    logger.logFullError(err)
    process.exit(1)
  })
})
