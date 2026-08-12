<template>
  <div class="backdrop" @mousedown.self="cancel">
    <div ref="dialog" class="dialog" role="dialog" aria-modal="true" :aria-labelledby="headingId" @keydown.esc.prevent="cancel" @keydown.tab="keepFocus">
      <h3 :id="headingId">{{ title }}</h3>
      <p>{{ message }}</p>

      <div class="actions">
        <button ref="cancelButton" type="button" :disabled="busy" @click="cancel">{{ cancelLabel }}</button>
        <button type="button" class="confirm" :disabled="busy" @click="$emit('confirm')">{{ busy ? busyLabel : confirmLabel }}</button>
      </div>
    </div>
  </div>
</template>

<script>
let headingCounter = 0

export default {
  name: 'ConfirmModal',

  props: {
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    confirmLabel: {
      type: String,
      default: 'Ja',
    },
    cancelLabel: {
      type: String,
      default: 'Avbryt',
    },
    busyLabel: {
      type: String,
      default: 'Vänta …',
    },
    busy: {
      type: Boolean,
      default: false,
    },
  },

  emits: ['confirm', 'cancel'],

  data: () => ({
    headingId: 'confirm-modal-heading-' + ++headingCounter,
    previouslyFocused: null,
  }),

  mounted() {
    this.previouslyFocused = document.activeElement
    this.$refs.cancelButton.focus()
  },

  unmounted() {
    if (this.previouslyFocused) {
      this.previouslyFocused.focus()
    }
  },

  methods: {
    cancel() {
      if (!this.busy) {
        this.$emit('cancel')
      }
    },

    keepFocus(event) {
      const focusable = [...this.$refs.dialog.querySelectorAll('button:not([disabled])')]

      if (focusable.length === 0) {
        return
      }

      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    },
  },
}
</script>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 100;
}

.dialog {
  background-color: #ffffff;
  border: 1px solid #aaaaaa;
  padding: 20px;
  width: 100%;
  max-width: 500px;
  box-sizing: border-box;
}

.dialog p {
  margin-bottom: 20px;
}

.actions {
  display: flex;
  gap: 10px;
}

button {
  padding: 5px 25px;
  font-size: 1.5em;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  border: 1px solid #aaaaaa;
  border-radius: 0;
  background-color: #ffffff;
  color: #444444;
  cursor: pointer;
}

button:active {
  background-color: #cccccc;
}

button.confirm {
  background-color: #bbffb9;
}

button:focus-visible {
  outline: none;
  border: 1px solid #444444;
  color: #222222;
}

button[disabled] {
  background-color: #aaaaaa;
  color: #777777;
  cursor: default;
}
</style>
