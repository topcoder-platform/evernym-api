/*
 * Handle routing.
 */

const { Router } = require('express')
const routes = require('./routes')
const { autoWrapExpress } = require('./common/utils')

const router = new Router()

// build routings
for (const [path, subPath] of Object.entries(routes)) {
  for (const [httpMethod, definition] of Object.entries(subPath)) {
    const controller = require(`./controllers/${definition.controller}`)
    const operation = autoWrapExpress(controller[definition.method])
    router[httpMethod](path, operation)
  }
}

// handle requests with wrong request method or wrong endpoint
router.use('*', (req, res) => {
  if (routes[req.path]) {
    res.status(404).sendMessage(`The request method for endpoint ${req.path} is not supported`)
    return
  }
  res.status(404).sendMessage('The request endpoint not found')
})

module.exports = router
