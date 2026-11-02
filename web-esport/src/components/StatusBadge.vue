<template>
  <span :class="['status', tone]">
    <i />
    <slot />
  </span>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    tone?: 'green' | 'purple' | 'orange' | 'blue' | 'gray'
  }>(),
  {
    tone: 'green',
  }
)
</script>
