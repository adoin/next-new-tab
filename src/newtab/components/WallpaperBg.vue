<script setup lang="ts">
defineProps<{
  url?: string
  loading?: boolean
}>()

/** 无缓存壁纸时的占位（与默认主题接近，避免长时间亮蓝紫） */
const fallbackGradient = 'linear-gradient(160deg, #1e293b 0%, #0f172a 55%, #1a1a2e 100%)'
</script>

<template>
  <div
    class="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
    :style="{
      backgroundImage: url ? `url(${url})` : fallbackGradient,
      opacity: loading && !url ? 0.6 : 1,
    }"
  >
    <slot />
  </div>
</template>
