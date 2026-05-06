<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { useSettingsStore } from './stores'
import { useHistory } from './composables/useHistory'
import WallpaperBg from './components/WallpaperBg.vue'
import SearchBar from './components/SearchBar.vue'
import BookmarkGrid from './components/BookmarkGrid.vue'
import BookmarkEditor from './components/BookmarkEditor.vue'
import BookmarkImporter from './components/BookmarkImporter.vue'
import HistoryPanel from './components/HistoryPanel.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'

const settings = useSettingsStore()
const { events, loading: historyLoading, fetchEvents } = useHistory()

const showSettings = ref(false)
const showEditor = ref(false)
const showImporter = ref(false)
const editId = ref<string | null>(null)
const wallpaperBg = ref<InstanceType<typeof WallpaperBg> | null>(null)

function onEditBookmark(id: string) {
  editId.value = id
  showEditor.value = true
}

function onAddBookmark() {
  editId.value = null
  showEditor.value = true
}

function onCloseEditor() {
  showEditor.value = false
  editId.value = null
}

watch(() => settings.settings.wallpaperMode, (mode) => {
  if (mode === 'history') {
    fetchEvents(settings.settings.historyDomain)
  }
})

watch(() => settings.settings.historyDomain, (domain) => {
  if (settings.settings.wallpaperMode === 'history') {
    fetchEvents(domain)
  }
})

onMounted(() => {
  if (settings.settings.wallpaperMode === 'history') {
    fetchEvents(settings.settings.historyDomain)
  }
})
</script>

<template>
  <WallpaperBg ref="wallpaperBg" :mode="settings.settings.wallpaperMode">
    <div class="relative z-10 w-full h-full flex flex-col items-center justify-start pt-[10vh] px-4">
      <!-- mode tabs -->
      <div class="glass flex gap-1 p-1 mb-8">
        <button
          class="px-4 py-1.5 rounded-lg text-sm transition-colors"
          :class="settings.settings.wallpaperMode === 'api' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'"
          @click="settings.updateSettings({ wallpaperMode: 'api' })"
        >
          壁纸
        </button>
        <button
          class="px-4 py-1.5 rounded-lg text-sm transition-colors"
          :class="settings.settings.wallpaperMode === 'history' ? 'bg-white/20 text-white' : 'text-white/50 hover:text-white'"
          @click="settings.updateSettings({ wallpaperMode: 'history' })"
        >
          历史上的今天
        </button>
      </div>

      <!-- search bar -->
      <SearchBar />

      <!-- spacer -->
      <div :style="{ height: `${settings.settings.searchGap}px` }" />

      <!-- bookmarks -->
      <BookmarkGrid @edit="onEditBookmark" @add="onAddBookmark" />

      <!-- history panel -->
      <HistoryPanel
        v-if="settings.settings.wallpaperMode === 'history'"
        :events="events"
        :loading="historyLoading"
        class="mt-6"
      />
    </div>

    <!-- settings button -->
    <button
      class="fixed bottom-6 right-6 z-20 glass w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded-full"
      @click="showSettings = true"
    >
      ⚙
    </button>

    <!-- importer button -->
    <button
      class="fixed bottom-6 right-20 z-20 glass w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded-full"
      @click="showImporter = true"
      title="从浏览器导入书签"
    >
      📥
    </button>
  </WallpaperBg>

  <BookmarkEditor :visible="showEditor" :edit-id="editId" @close="onCloseEditor" />
  <BookmarkImporter :visible="showImporter" @close="showImporter = false" />
  <SettingsDrawer :visible="showSettings" @close="showSettings = false" />
</template>
