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
        <input v-model.trim="emailAddress" type="text" :disabled="isPublishing" :maxlength="50" />
      </label>

      <input type="submit" value="Publicera" :disabled="!emailAddress || isPublishing" />
    </form>
  </template>

  <template v-if="state === 'CRAFT'">
    <p>Använd nedanstående formulär för att publicera ett konsultuppdrag till svenska frilansare och egenkonsulter inom it-branschen.</p>

    <p>Vill du veta mer om vad det här är innan du går vidare? <router-link to="/information">Läs om den här tjänsten »</router-link></p>

    <form @submit.prevent="goToPreview">
      <div class="columns">
        <div class="column">
          <label>
            Uppdragets titel:
            <input v-model.trim="assignment.title" type="text" :maxlength="50" />
          </label>
        </div>

        <div class="column">
          <label>
            Uppdragsgivarens namn:
            <input v-model.trim="assignment.customerName" type="text" :maxlength="50" placeholder="t.ex. företagets namn" />
          </label>
        </div>
      </div>

      <label>
        Beskrivning av uppdraget och uppdragsgivarens behov:
        <textarea v-model.trim="assignment.description" style="height: 300px"></textarea>
      </label>

      <div class="columns">
        <div class="column">
          <label>
            Kontaktuppgifter till ansvarig person (namn, telefonnummer m.m.):
            <textarea v-model.trim="assignment.contact" style="height: 150px"></textarea>
          </label>
        </div>

        <div class="column">
          <label>Hur kommer frilansarens relation med kunden se ut?</label>

          <label class="radio">
            <input v-model="assignment.senderType" type="radio" value="BROKER" />
            Uppdraget innebär avtal med en förmedlare, som i sin tur har avtal med kunden
          </label>

          <label class="radio">
            <input v-model="assignment.senderType" type="radio" value="DIRECT" />
            Den vi söker kommer ha direktavtal med kunden
          </label>
        </div>
      </div>

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
      senderType: null,
      title: '',
      description: '',
      customerName: '',
    },
    emailAddress: '',
    previewMode: false,
    isPublishing: false,
  }),

  computed: {
    somethingIsMissing: function () {
      return !!Object.keys(this.assignment).find(x => !this.assignment[x])
    },
  },

  watch: {
    state: function () {
      window.scrollTo(0, 0)
    },
  },

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
}
</script>
