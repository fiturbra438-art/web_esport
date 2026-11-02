<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="1.8"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
    v-html="pathSvg"
  ></svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type IconName =
  | 'grid'
  | 'users'
  | 'trophy'
  | 'calendar'
  | 'shield'
  | 'logOut'
  | 'bell'
  | 'search'
  | 'arrow'
  | 'plus'
  | 'trash'
  | 'crown'
  | 'check'
  | 'clock'
  | 'swords'
  | 'menu'
  | 'close'
  | 'user'
  | 'mail'
  | 'lock'
  | 'gamepad'
  | 'chevron'
  | 'more'
  | 'bolt'

const props = withDefaults(
  defineProps<{
    name: IconName
    size?: number
  }>(),
  {
    size: 20,
  }
)

const rawIcons: Record<IconName, string> = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />',
  trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4Z" /><path d="M7 6H3v2a4 4 0 0 0 4 4M17 6h4v2a4 4 0 0 1-4 4" />',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 10h18" />',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />',
  logOut: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />',
  bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0" />',
  search: '<circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />',
  arrow: '<path d="M5 12h14M13 6l6 6-6 6" />',
  plus: '<path d="M12 5v14M5 12h14" />',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v5M14 11v5" />',
  crown: '<path d="m3 7 4 4 5-7 5 7 4-4-2 11H5L3 7Z" />',
  check: '<path d="m5 12 4 4L19 6" />',
  clock: '<circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />',
  swords: '<path d="m14.5 17.5 3 3 3-3-3-3M13 19l6-6M5 3l6 6M9 5l2-2 2 2M5 9 3 7l2-2M3 21l7-7" />',
  menu: '<path d="M4 7h16M4 12h16M4 17h16" />',
  close: '<path d="m6 6 12 12M18 6 6 18" />',
  user: '<path d="M20 21a8 8 0 0 0-16 0" /><circle cx="12" cy="7" r="4" />',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" />',
  lock: '<rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" />',
  gamepad: '<path d="M8 6h8a6 6 0 0 1 5.7 7.9l-1 3A3 3 0 0 1 16 18l-2-2h-4l-2 2a3 3 0 0 1-4.7-1.1l-1-3A6 6 0 0 1 8 6Z" /><path d="M7 10v4M5 12h4M16 11h.01M18 14h.01" />',
  chevron: '<path d="m9 18 6-6-6-6" />',
  more: '<circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" />',
  bolt: '<path d="m13 2-9 12h7l-1 8 9-12h-7l1-8Z" />',
}

const pathSvg = computed(() => rawIcons[props.name] || '')
</script>
