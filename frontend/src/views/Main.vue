<template>
  <h2>Publicera ett konsultuppdrag</h2>

  <template v-if="state === 'PUBLISHED'">
    <p>Ditt uppdrag har publicerats och en kvittens kommer skickas till den angivna e-postadressen. Tack!</p>

    <p>Om du vill uppdatera din publikation kan du använda dig av länken i kvittensen.</p>
  </template>

  <template v-if="state === 'PREVIEW'">
    <p>Gå igenom det du har skrivit. Om du känner dig nöjd kan du publicera uppdraget till frilansargemenskapen.</p>

    <assignment :assignment="assignment" />

    <p>Vill du ändra något? <a @click="state = 'CRAFT'">Gå tillbaka till formuläret »</a></p>

    <p>I annat fall, ange din e-postadress för att publicera uppdraget. Du kommer få en kvittens skickad till den.</p>

    <form @submit.prevent="publishAssignment">
      <label>
        Din e-postadress:
        <input type="text" v-model.trim="emailAddress" :disabled="isPublishing" :maxlength="50" />
      </label>

      <input type="submit" value="Publicera" :disabled="!emailAddress || isPublishing" />
    </form>
  </template>

  <template v-if="state === 'CRAFT'">
    <p>Använd nedanstående formulär för att publicera ett konsultuppdrag till frilansargemenskapen.</p>

    <form @submit.prevent="goToPreview">
      <div class="columns">
        <div class="column">
          <label>
            Uppdragets titel:
            <input type="text" v-model.trim="assignment.title" :maxlength="50" />
          </label>
        </div>

        <div class="column">
          <label>
            Uppdragsgivarens namn:
            <input type="text" v-model.trim="assignment.customerName" :maxlength="50" placeholder="t.ex. företagets namn" />
          </label>
        </div>
      </div>

      <label>
        Beskrivning av uppdraget och uppdragsgivarens behov:
        <textarea style="height: 300px;" v-model.trim="assignment.description"></textarea>
      </label>

      <label>
        Kontaktuppgifter till ansvarig person (namn, telefonnummer m.m.):
        <textarea style="height: 150px;" v-model.trim="assignment.contact"></textarea>
      </label>

      <input type="submit" value="Fortsätt" :disabled="somethingIsMissing" />
    </form>
  </template>
</template>

<script>
import Assignment from '../components/Assignment.vue'
import axios from 'axios'

export default {
  name: 'Main',

  components: {
    Assignment,
  },

  data: () => ({
    state: 'CRAFT',
    assignment: {
      title: '',
      description: '',
      customerName: '',
    },
    emailAddress: '',
    previewMode: false,
    isPublishing: false,
  }),

  methods: {
    goToPreview() {
      this.state = 'PREVIEW'
    },

    async publishAssignment() {
      this.isPublishing = true

      try {
        await axios.post('/api/assignments', {
          ...this.assignment,
          emailAddress: this.emailAddress,
        })

        this.state = 'PUBLISHED'
      } catch (error) {
        if (error.response) {
          if (error.response.status === 400) {
            switch (error.response.data) {
              case 'INVALID_EMAIL_ADDRESS':
                alert('E-postadressen är ogiltig.')
                return
            }
          }

          alert('Ett okänt fel inträffade när uppdraget skulle publiceras.')
        } else {
          alert('Ett oväntat fel inträffade när uppdraget skulle publiceras.')
        }
      } finally {
        this.isPublishing = false
      }
    },
  },

  watch: {
    state: function() {
      window.scrollTo(0, 0)
    },
  },

  computed: {
    somethingIsMissing: function() {
      return !!Object.keys(this.assignment).find(x => !this.assignment[x])
    },
  },
}
</script>