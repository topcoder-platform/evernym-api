const qr = require('awesome-qr')
const { RelationshipService } = require('../services')

async function getQR (req, res) {
  const result = await RelationshipService.createRelationship(req.body)
  
  const buffer = await new AwesomeQR({
    text: result.inviteURL,
    size: 500
  }).draw()
  
  res.send(buffer)
}

module.exports = {
  getQR
}