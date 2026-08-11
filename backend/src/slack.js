const axios = require('axios')

const common = require('./common')
const model = require('./model')
const config = require('../config')

let memberCountCache = null
const REFRESH_INTERVAL_MS = 60 * 60 * 1000
const MEMBER_COUNT_CHANNEL = process.env.SLACK_MEMBER_COUNT_CHANNEL || 'C8P11NBEF'

exports.sync = async () => {
  const ids = await model.getAssignmentThatNeedSlackPropagation()

  for (const id of ids) {
    await this.propagateAssignment(id)
  }

  for (const id of await model.getAssignmentsThatNeedSlackDeletion()) {
    await this.propagateAssignmentDeletion(id)
  }
}

exports.propagateAssignment = async assignmentId => {
  const assignment = await model.getAssignment(assignmentId)

  const text = {
    'INITIAL': common.fillTemplate(config.templates.slackAssignmentInitial, assignment),
    'THREAD': common.fillTemplate(config.templates.slackAssignmentThread, assignment),
  }

  let threadId = assignment.slackId

  for (const job of ['INITIAL', 'THREAD']) {
    // Skip whatever already made it to Slack, so a retry never posts a duplicate.
    if (job === 'INITIAL' && assignment.slackId !== null) {
      continue
    }

    if (job === 'THREAD' && (threadId === null || assignment.slackThreadId !== null)) {
      continue
    }

    const params = new URLSearchParams()

    params.append('token', config.slack.token)
    params.append('channel', assignment.slackChannel)
    params.append('text', text[job])

    if (job === 'THREAD') {
      params.append('thread_ts', threadId)
    }

    let ok, ts, channelId

    try {
      const response = await axios.post('https://slack.com/api/chat.postMessage', params)

      ok = response.data.ok

      if (ok) {
        ts = response.data.ts
        channelId = response.data.channel
      } else {
        throw response.data
      }
    } catch (error) {
      console.error('Failed to post assignment ' + assignmentId + ' for ' + job + ' to Slack:')
      console.error(error)
    }

    if (ok && job === 'INITIAL') {
      await model.setAssignmentSlackId(assignment.id, ts)
      // chat.update needs the channel id; slackChannel holds a channel name.
      await model.setAssignmentSlackChannelId(assignment.id, channelId)
      threadId = ts
    } else if (ok && job === 'THREAD') {
      await model.setAssignmentSlackThreadId(assignment.id, ts)
    }
  }

  // The assignment may have been deleted while the posts above were in flight.
  if (assignment.deleted !== null) {
    await this.propagateAssignmentDeletion(assignmentId)
  }
}

exports.propagateAssignmentComments = async assignmentId => {
  const assignment = await model.getAssignment(assignmentId)

  if (assignment === null || assignment.slackId === null || assignment.deleted !== null) {
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

// Errors that will never succeed on a retry, so treat them as done rather than
// letting sync() attempt the same edit on every startup forever.
const TERMINAL_UPDATE_ERRORS = ['message_not_found', 'cant_update_message', 'channel_not_found']

const updateMessage = async (channel, ts, text) => {
  const params = new URLSearchParams()

  params.append('token', config.slack.token)
  params.append('channel', channel)
  params.append('ts', ts)
  params.append('text', text)

  try {
    const response = await axios.post('https://slack.com/api/chat.update', params)

    if (response.data.ok) {
      return true
    }

    if (TERMINAL_UPDATE_ERRORS.includes(response.data.error)) {
      console.error('Giving up on Slack message ' + ts + ': ' + response.data.error)
      return true
    }

    throw response.data
  } catch (error) {
    console.error('Failed to update Slack message ' + ts + ':')
    console.error(error)

    return false
  }
}

exports.propagateAssignmentDeletion = async assignmentId => {
  const assignment = await model.getAssignment(assignmentId)

  if (assignment === null || assignment.deleted === null) {
    return
  }

  const channel = assignment.slackChannelId || assignment.slackChannel
  const assignmentText = config.templates.slackAssignmentDeleted ?? 'Denna uppdragsannons har raderats.'
  const commentText = config.templates.slackAssignmentCommentDeleted ?? 'Denna komplettering har raderats.'

  let done = true

  if (assignment.slackId !== null) {
    done = await updateMessage(channel, assignment.slackId, assignmentText) && done
  }

  // Assignments posted before slackThreadId existed have no id to update.
  if (assignment.slackThreadId !== null) {
    done = await updateMessage(channel, assignment.slackThreadId, assignmentText) && done
  }

  for (const comment of await model.getAssignmentComments(assignmentId)) {
    if (comment.slackId === null) {
      // Still being posted; retry later rather than leaving its text in Slack.
      done = false
      continue
    }

    done = await updateMessage(channel, comment.slackId, commentText) && done
  }

  if (done) {
    await model.setAssignmentSlackDeleted(assignmentId)
  }
}

exports.getUsers = async () => {
  let users = []
  let cursor

  do {
    const response = await axios.get('https://slack.com/api/users.list', {
      headers: {
        Authorization: `Bearer ${config.slack.token}`,
      },
      params: {
        limit: 200,
        cursor,
      },
    })

    if (!response.data.ok) {
      console.error('failed to get member count:')
      console.error(response.data)
      return null
    }

    users = users.concat(response.data.members)
    cursor = response.data.response_metadata?.next_cursor
  } while (cursor)

  return users
}

exports.refreshMemberCount = async () => {
  try {
    const response = await axios.get('https://slack.com/api/conversations.info', {
      headers: {
        Authorization: `Bearer ${config.slack.token}`,
      },
      params: {
        channel: MEMBER_COUNT_CHANNEL,
        include_num_members: true,
      },
    })

    if (!response.data.ok) {
      console.error('Failed to refresh member count cache:', response.data)
      return
    }

    memberCountCache = response.data.channel.num_members
  } catch (error) {
    console.error('Error refreshing member count cache:', error.message)
  }
}

exports.getMemberCount = () => {
  return memberCountCache
}

exports.startMemberCountRefresh = async () => {
  await exports.refreshMemberCount()
  setInterval(exports.refreshMemberCount, REFRESH_INTERVAL_MS)
}
