'use strict'

const common = require('./common')
const slack = require('./slack')

exports.pool = null

exports.setPool = pool => {
  this.pool = pool
}

exports.saveAssignment = async (emailAddress, customerName, title, description, contact) => {
  const id = common.randomString()
  const created = common.getTimestamp()
  const slackId = null

  await this.pool.query(
    `
		INSERT INTO assignment (
			id,
			emailAddress,
			customerName,
			title,
			description,
			contact,
			created,
			slackId
		)
		VALUES(?, ?, ?, ?, ?, ?, ?, ?)
		`, [
      id,
      emailAddress,
      customerName,
      title,
      description,
      contact,
      created,
      slackId,
    ],
  )

  slack.propagateAssignment(id)

  return id
}

exports.getAssignment = async assignmentId => {
  const [assignments] = await this.pool.query(
    `
		SELECT
			id,
			emailAddress,
			customerName,
			title,
			description,
			contact,
			created,
			slackId
		FROM assignment
		WHERE id = ?
		`,
    [assignmentId],
  )

  if (assignments.length !== 1) {
    return null
  }

  return assignments[0]
}

exports.assignmentExists = async assignmentId => {
  const count = (await this.pool.query(
    `
		SELECT COUNT(*) AS count
		FROM assignment
		WHERE id = ?
		`,
    [assignmentId],
  ))[0][0].count

  return count === 1
}

exports.getAssignmentComments = async assignmentId => {
  const [comments] = await this.pool.query(
    `
		SELECT
			id,
			comment,
			created,
			slackId
		FROM assignmentComment
		WHERE assignment = ?
		`,
    [assignmentId],
  )

  return comments
}

exports.saveAssignmentComment = async (assignmentId, comment) => {
  const created = common.getTimestamp()
  const slackId = null

  await this.pool.query(
    `
		INSERT INTO assignmentComment (
			assignment,
			id,
			comment,
			created,
			slackId
		)
		VALUES(?, (
			SELECT COUNT(*) + 1
			FROM assignmentComment AS t
			WHERE t.assignment = ?
		), ?, ?, ?)
		`, [
      assignmentId,
      assignmentId,
      comment,
      created,
      slackId,
    ],
  )

  slack.propagateAssignmentComments(assignmentId)
}

exports.setAssignmentSlackId = async (assignmentId, slackId) => await this.pool.query(
  `
	UPDATE assignment
	SET slackId = ?
	WHERE id = ?
	`, [
    slackId,
    assignmentId,
  ],
)

exports.setAssignmentCommentSlackId = async (assignmentId, id, slackId) => await this.pool.query(
  `
	UPDATE assignmentComment
	SET slackId = ?
	WHERE assignment = ? AND id = ?
	`, [
    slackId,
    assignmentId,
    id,
  ],
)