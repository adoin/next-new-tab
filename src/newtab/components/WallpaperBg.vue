<script setup lang="ts">
import { watch, onMounted } from 'vue'
import { useWallpaper } from '../composables/useWallpaper'
import { useSettingsStore } from '../stores'

const props = defineProps<{ mode: 'api' | 'history' }>()
const { current, loading, fetchWallpaper } = useWallpaper()
const settings = useSettingsStore()

const fallbackGradient = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'

onMounted(() => {
  if (props.mode === 'api') fetchWallpaper()
})

watch(() => props.mode, (m) => {
  if (m === 'api') fetchWallpaper()
})

defineExpose({ fetchWallpaper })
</script>

<template>
  <div
    class="absolute inset-0 bg-cover bg-center transition-opacity duration-700"
    :style="{
      backgroundImage: current ? `url(${current.url})` : fallbackGradient,
      opacity: loading ? 0.5 : 1,
    }"
  >
    <slot />
    <div v-if="current" class="absolute bottom-4 right-4 text-white/60 text-sm">
      {{ current.author }} · {{ current.source }}
    </div>
  </div>
</template>
