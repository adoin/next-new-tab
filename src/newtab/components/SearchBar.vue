<script setup lang="ts">
import { ref } from 'vue'
import { useSearch } from '../composables/useSearch'

const { search } = useSearch()
const query = ref('')

function onSubmit() {
  search(query.value)
}
</script>

<template>
  <div class="relative w-full max-w-xl mx-auto">
    <form @submit.prevent="onSubmit" class="glass flex items-center gap-3 px-4 py-3">
      <input
        v-model="query"
        type="text"
        placeholder="搜索..."
        class="flex-1 bg-transparent outline-none text-white placeholder-white/50 text-lg border-none"
      />
      <button
        type="submit"
        class="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/15 transition-colors hover:text-white text-base hover:bg-white/25 text-lg"
      >
        Go
      </button>
    </form>
  </div>
</template>
