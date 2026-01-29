'use strict'

const express = require('express')

const slack = require('../slack')

const router = express.Router()

router.get('/', (req, res) => {
  const cached = slack.getMemberCount()

  if (cached === null) {
    return res.status(503).end()
  }

  res.type('text/plain').send(String(cached))
})

module.exports = router
