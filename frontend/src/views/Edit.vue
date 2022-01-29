<template>
  <h2>Hantera publikation</h2>
  <p>Du som har länken till publikationen kan på den här sidan lägga till kompletteringar. Tänk därför på att hålla länken hemlig!</p>

  <assignment :assignment="assignment" />

  <form @submit.prevent="submitComment" v-if="commentState === 'EDITING' || commentState === 'PUBLISHING'">
    <label>
      Komplettera publikationen med ny information:
      <textarea style="height: 150px;" v-model="comment" :disabled="commentState === 'PUBLISHING'"></textarea>

      <input type="submit" value="Spara komplettering" :disabled="!comment || commentState === 'PUBLISHING'" />
    </label>
  </form>

  <p v-if="commentState === 'SAVED'"><strong>Tack!</strong> Din komplettering har sparats. <a @click="commentState = 'EDITING'">Skriv en till »</a></p>
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
  }),

  methods: {
    async loadAssignment() {
      this.assignment = null

      this.assignment = {
        ...(await axios.get('/api/assignments/' + this.$route.params.assignmentId)).data,
        comments: [],
      }

      this.loadAssignmentComments()
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

  async created() {
    await this.loadAssignment()
  },
}
</script>