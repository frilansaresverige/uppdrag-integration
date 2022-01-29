'use strict'

const express = require('express')

const common = require('../common')
const model = require('../model')

const router = express.Router()

router.post('/', async (req, res) => {
  let emailAddress = req.body.emailAddress
  let customerName = req.body.customerName
  let title = req.body.title
  let description = req.body.description
  let contact = req.body.contact

  if (typeof customerName !== 'string' || typeof title !== 'string' || typeof description !== 'string' || typeof contact !== 'string') {
    res.status(400).end()
    return
  }

  emailAddress = common.validateEmail(emailAddress)

  if (emailAddress === null) {
    res.status(400).json('INVALID_EMAIL_ADDRESS')
    return
  }

  if (emailAddress.length > 50 || title.length > 50 || title.length > 50) {
    res.status(400).end()
    return
  }

  const assignmentId = await model.saveAssignment(
    emailAddress,
    customerName,
    title,
    description,
    contact
  )

  res.status(201).end()

  common.sendConfirmationEmail(assignmentId)
})

router.get('/:assignmentId', async (req, res) => {
  const assignment = await model.getAssignment(req.params.assignmentId)

  if (assignment === null) {
    res.status(404).end()
    return
  }

  res.json({
    id: assignment.id,
    customerName: assignment.customerName,
    title: assignment.title,
    description: assignment.description,
    contact: assignment.contact,
  })
})

router.get('/:assignmentId/comments', async (req, res) => {
  if (!await model.assignmentExists(req.params.assignmentId)) {
    res.status(404).end()
    return
  }

  res.json((await model.getAssignmentComments(req.params.assignmentId)).map(comment => ({
    id: comment.id,
    comment: comment.comment,
    created: comment.created,
  })))
})

router.post('/:assignmentId/comments', async (req, res) => {
  if (!await model.assignmentExists(req.params.assignmentId)) {
    res.status(404).end()
    return
  }

  const comment = req.body.comment

  if (typeof comment !== 'string') {
    req.status(400).end()
    return
  }

  await model.saveAssignmentComment(req.params.assignmentId, comment)

  res.status(201).end()
})

module.exports = router