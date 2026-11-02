<template>
  <div class="modal-backdrop" role="presentation" @mousedown="$emit('close')">
    <div
      :class="['modal', { 'modal-wide': wide }]"
      role="dialog"
      aria-modal="true"
      :aria-label="title"
      @mousedown.stop
    >
      <div class="modal-head">
        <div>
          <span>ARENA CORE</span>
          <h2>{{ title }}</h2>
        </div>
        <button
          class="icon-btn"
          @click="$emit('close')"
          aria-label="Tutup dialog"
        >
          <AppIcon name="close" />
        </button>
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import AppIcon from './AppIcon.vue'

withDefaults(
  defineProps<{
    title: string
    wide?: boolean
  }>(),
  {
    wide: false,
  }
)

defineEmits<{
  (e: 'close'): void
}>()
</script>
