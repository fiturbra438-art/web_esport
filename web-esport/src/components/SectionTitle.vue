<template>
  <div class="section-title">
    <div>
      <span v-if="kicker">{{ kicker }}</span>
      <h2>{{ title }}</h2>
    </div>
    <slot name="action" />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  kicker?: string
  title: string
}>()
</script>
