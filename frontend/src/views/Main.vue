<template>
  <h2>Publicera ett konsultuppdrag</h2>

  <template v-if="state === 'PUBLISHED'">
    <p>Ditt uppdrag har publicerats och en kvittens kommer skickas till den angivna e-postadressen. Tack!</p>

    <p>Om du vill uppdatera din publikation kan du använda dig av länken i kvittensen.</p>
  </template>

  <template v-if="state === 'PREVIEW'">
    <p>Gå igenom det du har skrivit. Om du känner dig nöjd kan du publicera uppdraget till frilansargemenskapen.</p>

    <assignment :assignment="assignment" />

    <p>Vill du ändra något? <a @click="goBack">Gå tillbaka till formuläret »</a></p>

    <p>I annat fall, ange din e-postadress för att publicera uppdraget. Du kommer få en kvittens skickad till den.</p>

    <form @submit.prevent="publishAssignment">
      <label>
        Din e-postadress:
        <input v-model.trim="emailAddress" type="email" :disabled="isPublishing" :maxlength="50" />
      </label>

      <input type="submit" value="Publicera" :disabled="!emailAddress || isPublishing" />
    </form>
  </template>

  <template v-if="state === 'CRAFT'">
    <p>Använd nedanstående formulär för att publicera ett konsultuppdrag till svenska frilansare och egenkonsulter.</p>

    <p>Vill du veta mer om vad det här är innan du går vidare? <router-link to="/information">Läs om den här tjänsten »</router-link></p>

    <form @submit.prevent="goToPreview">
      <div class="columns">
        <div class="column">
          <label>
            Uppdragets titel:
            <input v-model.trim="assignment.title" type="text" :maxlength="50" />
          </label>
        </div>
      </div>

      <div class="column">
        <label>
          Plats:
          <input v-model.trim="assignment.location" type="text" :maxlength="50" placeholder="t.ex. Remote / Göteborg / Hybrid Stockholm (2dgr/v)" />
        </label>
      </div>
      <div class="columns">
        <div class="column">
          <label>
            Uppdragsgivarens namn:
            <input v-model.trim="assignment.customerName" type="text" :maxlength="50" placeholder="t.ex. företagets namn" />
          </label>
        </div>

        <div v-if="assignment.senderType === 'BROKER'" class="column">
          <label>
            Vårt bolags sida på allabolag.se:
            <input v-model.trim="assignment.customerCompanyURL" type="url" :maxlength="300" placeholder="https://allabolag.se/..." />
          </label>
        </div>
      </div>

      <div class="columns">
        <div class="column">
          <label>
            Minimumarvode till frilansaren:
            <div class="with-unit">
              <input v-model.number="assignment.clientHourlyRate" type="number" placeholder="t.ex 1000" />
              <span class="unit">kr/h</span>
            </div>
          </label>
        </div>
      </div>

      <div v-if="assignment.senderType === 'BROKER'" class="columns">
        <div class="column">
          <div>
            <label>Vår avgift som mellanhand är</label>
            <input v-model.trim="assignment.customerFee" type="text" placeholder="t.ex. 10 % eller 50 kr/h" :disabled="assignment.isNonTransparentFee" :required="!assignment.isNonTransparentFee && assignment.senderType === 'BROKER'" />
          </div>
          <div class="checkbox-wrapper">
            <input v-model="assignment.isNonTransparentFee" type="checkbox" class="transparent-checkbox" />
            <label class="checkbox-label">Vi är inte transparenta med vår avgift</label>
          </div>
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
      customerCompanyURL: null,
      customerFee: null,
      isNonTransparentFee: false,
      clientHourlyRate: null,
      contact: '',
      location: '',
    },
    emailAddress: '',
    previewMode: false,
    isPublishing: false,
  }),

  computed: {
    somethingIsMissing: function () {
      const requiredFieldsFilled = !!this.assignment.title && !!this.assignment.description && !!this.assignment.customerName && !!this.assignment.senderType && !!this.assignment.contact
      const brokerFeeFilled = this.assignment.senderType !== 'BROKER' || this.assignment.isNonTransparentFee || !!this.assignment.customerFee

      return !requiredFieldsFilled || !brokerFeeFilled
    },
  },

  watch: {
    state: function () {
      window.scrollTo(0, 0)
    },
    'assignment.isNonTransparentFee': function (newVal) {
      if (newVal) {
        this.assignment.customerFee = null
      }
    },
  },

  methods: {
    goToPreview() {
      this.state = 'PREVIEW'
    },

    goBack() {
      this.state = 'CRAFT'
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
        this.handleApiError(error)
      } finally {
        this.isPublishing = false
      }
    },

    handleApiError(error) {
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
    },
  },
}
</script>

<style scoped>
.with-unit {
  position: relative;
}

.with-unit input {
  width: 100%;
  padding-right: 50px;
  box-sizing: border-box;
}

.with-unit .unit {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.checkbox-wrapper {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  position: relative;
}

.transparent-checkbox {
  display: inline-block !important;
  width: auto !important;
  margin: 0 5px 0 0 !important;
  vertical-align: middle !important;
}

.checkbox-label {
  display: inline !important;
  margin: 0 !important;
}

.checkbox-wrapper + div label {
  margin-top: 0 !important;
}

input[type='checkbox'].transparent-checkbox {
  position: relative;
  top: -1px;
}
</style>
