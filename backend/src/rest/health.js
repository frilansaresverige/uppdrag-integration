'use strict'

const express = require('express')

const common = require('../common')
const model = require('../model')

const router = express.Router()

router.get('/', common.asyncHandler(async (req, res) => {
  const databaseHealth = await model.getDatabaseHealth()

  if (!databaseHealth) {
    res.status(500).end()
    return
  }

  res.status(200).end()
}))

module.exports = router
