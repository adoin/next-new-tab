<script setup lang="ts">
import { nextTick, onMounted, ref, watch } from 'vue'

const props = defineProps<{
  text: string
}>()

const emit = defineEmits<{
  select: []
}>()

const trackRef = ref<HTMLElement | null>(null)
const textRef = ref<HTMLElement | null>(null)
const shouldScroll = ref(false)

function measure() {
  const track = trackRef.value
  const text = textRef.value
  if (!track || !text) return
  const overflow = text.scrollWidth > track.clientWidth + 1
  shouldScroll.value = overflow
  if (overflow) {
    track.style.setProperty('--marquee-end', `${track.clientWidth - text.scrollWidth}px`)
  } else {
    track.style.removeProperty('--marquee-end')
  }
}

onMounted(() => {
  nextTick(measure)
})

watch(() => props.text, () => nextTick(measure))
</script>

<template>
  <button
    type="button"
    class="bookmark-jump-history__item"
    :title="text"
    @click="emit('select')"
  >
    <span ref="trackRef" class="bookmark-jump-history__track">
      <span
        ref="textRef"
        class="bookmark-jump-history__text bookmark-title-readable"
        :class="{ 'bookmark-jump-history__text--scroll': shouldScroll }"
      >{{ text }}</span>
    </span>
  </button>
</template>

<style scoped>
.bookmark-jump-history__item {
  display: block;
  width: 100%;
  margin: 0;
  padding: 1px 0;
  border: none;
  background: transparent;
  text-align: left;
  font-size: 10px;
  line-height: 1.35;
  cursor: pointer;
}

.bookmark-jump-history__track {
  display: block;
  overflow: hidden;
  width: 100%;
}

.bookmark-jump-history__text {
  display: inline-block;
  white-space: nowrap;
}

.bookmark-jump-history__text--scroll {
  animation: bookmark-jump-marquee 8s linear infinite;
}

@keyframes bookmark-jump-marquee {
  0%,
  18% {
    transform: translateX(0);
  }
  82%,
  100% {
    transform: translateX(var(--marquee-end, 0));
  }
}
</style>
