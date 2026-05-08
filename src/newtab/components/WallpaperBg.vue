<script setup lang="ts">
defineProps<{
  url?: string
  loading?: boolean
}>()

const fallbackGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
</script>

<template>
  <div
    class="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
    :style="{
      backgroundImage: url ? `url(${url})` : fallbackGradient,
      opacity: loading ? 0.5 : 1,
    }"
  >
    <slot />
  </div>
</template>
