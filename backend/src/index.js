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

model.setPool(pool)

slack.sync()

httpServer.listen(config.listen.port, config.listen.ip)
