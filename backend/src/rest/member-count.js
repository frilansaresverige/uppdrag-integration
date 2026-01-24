'use strict'

const express = require('express')

const slack = require('../slack')

const router = express.Router()

router.get('/', (req, res) => {
  const cached = slack.getMemberCount()

  if (cached === null) {
    return res.status(503).end()
  }

  res.json(cached)
})

module.exports = router
