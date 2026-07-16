'use strict'

const express = require('express')
const http = require('http')
const mysql = require('mysql2/promise')
const bodyParser = require('body-parser')

const model = require('./model')
const slack = require('./slack')
const config = require('../config')

const app = express()

const httpServer = http.Server(app)

const pool = mysql.createPool({
  host: config.mysql.host,
  user: config.mysql.username,
  password: config.mysql.password,
  database: config.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
})

app.use(express.json())

app.use(express.urlencoded({
  extended: true,
}))

app.use(bodyParser.urlencoded({ extended : true }))

app.use('/api/assignments', require('./rest/assignments'))

app.use('/api/health', require('./rest/health'))

app.use('/api/member-count', require('./rest/member-count'))

app.use((error, req, res, next) => {
  console.error('Unhandled error while handling ' + req.method + ' ' + req.originalUrl + ':')
  console.error(error)

  if (!res.headersSent) {
    res.status(500).end()
  }
})

model.setPool(pool)

slack.sync().catch(error => {
  console.error('Failed to sync assignments to Slack on startup:')
  console.error(error)
})

slack.startMemberCountRefresh()

httpServer.listen(config.listen.port, config.listen.ip)
