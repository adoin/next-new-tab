<script setup lang="ts">
import { ref } from 'vue'
import { useSearch } from '../composables/useSearch'

const { currentEngine, engines, search, switchEngine } = useSearch()
const query = ref('')
const showEngines = ref(false)

function onSubmit() {
  search(query.value)
}

function onSelectEngine(id: string) {
  switchEngine(id)
  showEngines.value = false
}
</script>

<template>
  <div class="relative w-full max-w-xl mx-auto">
    <form @submit.prevent="onSubmit" class="glass flex items-center gap-2 px-4 py-3">
      <button
        type="button"
        class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-lg"
        @click="showEngines = !showEngines"
      >
        {{ currentEngine.icon }}
      </button>
      <input
        v-model="query"
        type="text"
        :placeholder="`用 ${currentEngine.name} 搜索...`"
        class="flex-1 bg-transparent outline-none text-white placeholder-white/50 text-lg"
      />
      <button
        type="submit"
        class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors text-white/70"
      >
        ➜
      </button>
    </form>

    <div v-if="showEngines" class="absolute top-full left-0 right-0 mt-2 glass p-2 z-50">
      <button
        v-for="engine in engines"
        :key="engine.id"
        class="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/20 transition-colors text-white text-left"
        :class="{ 'bg-white/10': engine.id === currentEngine.id }"
        @click="onSelectEngine(engine.id)"
      >
        <span class="text-lg">{{ engine.icon }}</span>
        <span>{{ engine.name }}</span>
        <span v-if="engine.isAi" class="text-xs text-purple-300 ml-auto">AI</span>
      </button>
    </div>
  </div>
</template>
