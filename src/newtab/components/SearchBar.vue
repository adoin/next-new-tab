<script setup lang="ts">
import { ref } from 'vue'
import { useSearch } from '../composables/useSearch'

const { currentEngine, engines, search, switchEngine } = useSearch()
const query = ref('')
const showEngines = ref(false)

function getEngineIcon(engine: { icon: string; urlTemplate: string }): string {
  if (engine.icon.startsWith('http')) return engine.icon
  try {
    const url = engine.urlTemplate.replace('%s', 'test')
    const hostname = new URL(url).hostname
    return `https://t1.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=https://${hostname}&size=128`
  } catch {
    return ''
  }
}

function onSubmit() {
  search(query.value)
}

function onSelectEngine(id: string) {
  switchEngine(id)
  showEngines.value = false
}

function onClickOutside() {
  showEngines.value = false
}
</script>

<template>
  <div class="relative w-full max-w-xl mx-auto">
    <form @submit.prevent="onSubmit" class="glass flex items-center gap-3 px-4 py-3">
      <button
        type="button"
        class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/15 transition-colors text-white hover:bg-white/25"
        @click="showEngines = !showEngines"
        title="管理搜索引擎"
      >
        &#x2699;
      </button>
      <input
        v-model="query"
        type="text"
        :placeholder="`用 ${currentEngine.name} 搜索...`"
        class="flex-1 bg-transparent outline-none text-white placeholder-white/50 text-lg border-none"
      />
      <button
        type="submit"
        class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/15 transition-colors hover:text-white  text-base hover:bg-white/25 text-lg"
      >
        Go
      </button>
    </form>

    <Transition name="dropdown">
      <div v-if="showEngines" class="absolute top-full left-0 right-0 mt-2 glass p-1.5 z-50 max-h-80 overflow-y-auto">
        <button
          v-for="engine in engines"
          :key="engine.id"
          class="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-white text-left group relative"
          :class="engine.id === currentEngine.id
            ? 'bg-white/10 font-medium'
            : 'hover:bg-white/8'"
          @click="onSelectEngine(engine.id)"
        >
          <!-- accent bar for selected -->
          <span
            v-if="engine.id === currentEngine.id"
            class="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-blue-400"
          />
          <img
            v-if="getEngineIcon(engine)"
            :src="getEngineIcon(engine)"
            :alt="engine.name"
            class="w-5 h-5 object-contain rounded-sm"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
          <span v-else class="text-base w-6 text-center">{{ engine.icon }}</span>
          <span class="text-sm">{{ engine.name }}</span>
          <span v-if="engine.isAi" class="ml-auto px-1.5 py-0.5 rounded text-[10px] bg-purple-500/30 text-purple-200">AI</span>
          <span v-if="engine.builtin" class="ml-auto px-1.5 py-0.5 rounded text-[10px] bg-white/10 text-white/40">内置</span>
        </button>
      </div>
    </Transition>

    <!-- click outside to close -->
    <div v-if="showEngines" class="fixed inset-0 z-40" @click="onClickOutside" />
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
