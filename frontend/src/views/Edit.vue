<template>
  <h2>Hantera publikation</h2>

  <template v-if="error">
    <p>Den publikation du söker kunde inte hittas.</p>
  </template>

  <template v-if="assignment !== null">
    <p>Du som har länken till publikationen kan på den här sidan lägga till kompletteringar. Tänk därför på att hålla länken hemlig!</p>

    <assignment :assignment="assignment" />

    <form v-if="commentState === 'EDITING' || commentState === 'PUBLISHING'" @submit.prevent="submitComment">
      <label>
        Komplettera publikationen med ny information:
        <textarea v-model="comment" style="height: 150px" :disabled="commentState === 'PUBLISHING'"></textarea>

        <input type="submit" value="Spara komplettering" :disabled="!comment || commentState === 'PUBLISHING'" />
      </label>
    </form>

    <p v-if="commentState === 'SAVED'"><strong>Tack!</strong> Din komplettering har sparats. <a @click="commentState = 'EDITING'">Skriv en till »</a></p>
  </template>
</template>

<script>
import Assignment from '../components/Assignment.vue'
import axios from 'axios'

export default {
  name: 'Edit',

  components: {
    Assignment,
  },

  data: () => ({
    assignment: null,
    comment: '',
    commentState: 'EDITING',
    error: false,
  }),

  async created() {
    await this.loadAssignment()
  },

  methods: {
    async loadAssignment() {
      this.assignment = null

      try {
        this.assignment = {
          ...(await axios.get('/api/assignments/' + this.$route.params.assignmentId)).data,
          comments: [],
        }

        this.loadAssignmentComments()
      } catch {
        this.error = true
      }
    },

    async loadAssignmentComments() {
      this.assignment.comments = (await axios.get('/api/assignments/' + this.assignment.id + '/comments')).data.sort((a, b) => a.id - b.id)
    },

    async submitComment() {
      this.commentState = 'PUBLISHING'

      try {
        await axios.post('/api/assignments/' + this.assignment.id + '/comments', {
          comment: this.comment,
        })

        this.commentState = 'SAVED'
        this.comment = ''

        this.loadAssignmentComments()
      } catch (error) {
        alert('Ett oväntat fel inträffade när kompletteringen skulle sparas.')
        this.commentState = 'EDITING'
      }
    },
  },
}
</script>