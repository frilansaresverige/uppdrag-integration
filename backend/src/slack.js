const axios = require('axios')

const common = require('./common')
const model = require('./model')
const config = require('../config')

exports.sync = async () => {
  const ids = await model.getAssignmentThatNeedSlackPropagation()

  for (const id of ids) {
    await this.propagateAssignment(id)
  }
}

exports.propagateAssignment = async assignmentId => {
  const assignment = await model.getAssignment(assignmentId)

  const text = common.fillTemplate(config.templates.slackAssignment, assignment)

  const params = new URLSearchParams()

  params.append('token', config.slack.token)
  params.append('channel', assignment.slackChannel)
  params.append('text', text)

  let ok, ts

  try {
    const response = await axios.post('https://slack.com/api/chat.postMessage', params)

    ok = response.data.ok

    if (ok) {
      ts = response.data.ts
    } else {
      throw response.data
    }
  } catch (error) {
    console.error('Failed to post assignment ' + assignmentId + ' to Slack:')
    console.error(error)
  }

  if (ok) {
    await model.setAssignmentSlackId(assignment.id, ts)
  }
}

exports.propagateAssignmentComments = async assignmentId => {
  const assignment = await model.getAssignment(assignmentId)

  if (assignment === null || assignment.slackId === null) {
    return
  }

  const comments = await model.getAssignmentComments(assignmentId)

  for (const comment of comments) {
    if (comment.slackId !== null) {
      continue
    }

    const text = common.fillTemplate(config.templates.slackAssignmentComment, comment)

    const params = new URLSearchParams()
    
    params.append('token', config.slack.token)
    params.append('channel', assignment.slackChannel)
    params.append('thread_ts', assignment.slackId)
    params.append('reply_broadcast', 'true')
    params.append('text', text)
    
    let ok, ts

    try {
      const response = await axios.post('https://slack.com/api/chat.postMessage', params)

      ok = response.data.ok

      if (ok) {
        ts = response.data.ts
      } else {
        throw response.data
      }
    } catch (error) {
      console.error('Failed to post assignment comment (' + assignmentId + ', ' + comment.id + ') to Slack:')
      console.error(error)
    }

    if (ok) {
      await model.setAssignmentCommentSlackId(assignment.id, comment.id, ts)
    }
  }
}