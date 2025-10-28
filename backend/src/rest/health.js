'use strict'

const express = require('express')

const model = require('../model')

const router = express.Router()

router.get('/', async (req, res) => {
  const databaseHealth = await model.getDatabaseHealth()

  if (!databaseHealth) {
    res.status(500).end()
    return
  }

  res.status(200).end()
})

module.exports = router
