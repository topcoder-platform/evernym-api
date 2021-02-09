const { AwesomeQR } = require('awesome-qr')
const { RelationshipService } = require('../services')

async function getQR (req, res) {
  try {
    const result = await RelationshipService.createRelationship({ name: req.params.name })
    console.log(`creating QR from ${JSON.stringify(result)}`)

    const buffer = await new AwesomeQR({
      text: result.inviteURL,
      size: 500
    }).draw()

    res.setHeader('Content-Type', 'image/png')
    res.send(buffer)
  } catch (e) {
    console.error(e)
    res.statusCode(500).json(e)
  }
}

module.exports = {
  getQR
}
