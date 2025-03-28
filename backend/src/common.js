'use strict'

const nodemailer = require('nodemailer')

const model = require('./model')
const config = require('../config')

exports.randomString = (length = 16) => {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const charactersLength = characters.length

  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }

  return result
}

exports.getTimestamp = () => Math.round(Date.now() / 1000)

// https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
exports.validateEmail = emailAddress => {
  if (typeof emailAddress !== 'string') {
    return null
  }

  emailAddress = emailAddress.trim().toLowerCase()

  if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(emailAddress)) {
    return null
  }

  return emailAddress
}

exports.fillTemplate = (template, source) => {
  let body = template

  // ta bort mellanslag och tabbar pga. indentering
  body = body.trim().replace(/\n[ \t]+/g, '\n')

  body = body.replace(/\[\[TITLE\]\]/g, source.title)
  body = body.replace(/\[\[DESCRIPTION\]\]/g, source.description)
  body = body.replace(/\[\[CUSTOMER_NAME\]\]/g, source.customerName)
  body = body.replace(/\[\[CONTACT\]\]/g, source.contact)
  body = body.replace(/\[\[URL\]\]/g, config.hostname + '/assignments/' + source.id)
  body = body.replace(/\[\[COMMENT\]\]/g, source.comment)
  body = body.replace(/\[\[LOCATION\]\]/g, source.location)

  return body
}

exports.sendConfirmationEmail = async assignmentId => {
  const assignment = await model.getAssignment(assignmentId)

  this.sendEmail(
    assignment.emailAddress,
    'Bekräftelse på publicerat konsultuppdrag',
    this.fillTemplate(config.templates.confirmation, assignment),
  )
}

exports.sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.username,
      pass: config.email.password,
    },
  })

  if (config.email.to) {
    to = config.email.to
  }

  const options = {
    from: config.email.from,
    to,
    bcc: config.email.bcc,
    subject,
    text,
  }

  return transporter.sendMail(options)
}