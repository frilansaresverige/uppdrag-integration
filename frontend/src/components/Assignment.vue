<template>
  <div v-if="assignment" class="wrapper">
    <h3>{{ assignment.title }}</h3>

    <p v-if="assignment.deleted" class="deleted">Denna uppdragsannons har raderats.</p>

    <template v-else>
      <p>{{ assignment.description }}</p>

      <h4>Uppdragsgivare</h4>
      <p>{{ assignment.customerName }}</p>

      <h4>Kontaktuppgifter</h4>
      <p>{{ assignment.contact }} ({{ niceSenderType(assignment.senderType) }})</p>

      <template v-if="assignment.comments">
        <template v-for="comment in assignment.comments" :key="comment.id">
          <h4>Komplettering {{ niceTimestamp(comment.created) }}</h4>
          <p>{{ comment.comment }}</p>
        </template>
      </template>
    </template>
  </div>
</template>

<script>
import { format } from 'date-fns'
import { sv } from 'date-fns/locale'

export default {
  name: 'Assignment',

  props: {
    assignment: {
      type: Object,
      default: undefined,
    },
  },

  methods: {
    niceTimestamp(timestamp) {
      return format(timestamp * 1000, "'den' PPP 'klockan' p", { locale: sv })
    },

    niceSenderType(senderType) {
      switch (senderType) {
        case 'BROKER':
          return 'förmedlare'
        case 'DIRECT':
          return 'slutkund'

        default:
          throw 'unknown senderType ' + senderType
      }
    },
  },
}
</script>

<style scoped>
.wrapper {
  border: 1px dotted #cccccc;
  margin-bottom: 25px;
  padding: 15px;
}

.detail {
  margin-bottom: 25px;
}

.wrapper p:last-of-type {
  margin-bottom: 0;
}

p {
  white-space: pre-wrap;
}

.deleted {
  color: #777777;
  font-style: italic;
}
</style>
