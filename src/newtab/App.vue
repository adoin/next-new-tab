<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { useSettingsStore } from './stores'
import { useWallpaper } from './composables/useWallpaper'
import { useTheme } from './composables/useTheme'
import WallpaperBg from './components/WallpaperBg.vue'
import SearchBar from './components/SearchBar.vue'
import BookmarkGrid from './components/BookmarkGrid.vue'
import BookmarkEditor from './components/BookmarkEditor.vue'
import BookmarkImporter from './components/BookmarkImporter.vue'
import SettingsDrawer from './components/SettingsDrawer.vue'
import WallpaperPicker from './components/WallpaperPicker.vue'

const settings = useSettingsStore()
const wallpaper = useWallpaper()
const { extractFromImage } = useTheme()

watch(() => wallpaper.current.value?.url, (url) => {
  if (url) extractFromImage(url)
})

const showSettings = ref(false)
const showEditor = ref(false)
const showImporter = ref(false)
const showPicker = ref(false)
const editId = ref<string | null>(null)

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

function onSelectWallpaper(item: any) {
  wallpaper.setManualWallpaper(item)
}

onMounted(() => {
  wallpaper.initWallpaper()
})

onUnmounted(() => {
  wallpaper.cleanup()
})
</script>

<template>
  <WallpaperBg :url="wallpaper.current.value?.url" :loading="wallpaper.loading.value">
    <div
      class="relative z-10 w-full h-full overflow-y-auto flex flex-col items-center pb-20 px-4"
      :style="{ paddingTop: `${settings.settings.searchTopMargin}px` }"
    >
      <SearchBar />
      <div :style="{ height: `${settings.settings.searchGap}px` }" />
      <BookmarkGrid @edit="onEditBookmark" @add="onAddBookmark" />
    </div>
  </WallpaperBg>

  <!-- bottom-right buttons -->
  <div class="fixed bottom-6 right-6 z-20 flex items-center gap-3">
    <!-- random refresh: random mode OR manual mode but no wallpaper chosen -->
    <button
      v-if="settings.settings.wallpaperMode === 'random' || !wallpaper.manualWallpaperChosen.value"
      class="glass w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded-full"
      @click="wallpaper.fetchRandom()"
      title="换一张"
    >
      &#x21bb;
    </button>

    <!-- pick wallpaper: manual mode -->
    <button
      v-if="settings.settings.wallpaperMode === 'manual'"
      class="glass w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded-full"
      @click="showPicker = true"
      title="选择壁纸"
    >
      &#x1f5bc;
    </button>

    <!-- settings -->
    <button
      class="glass w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded-full"
      @click="showSettings = true"
    >
      &#x2699;
    </button>
  </div>

  <BookmarkEditor :visible="showEditor" :edit-id="editId" @close="onCloseEditor" />
  <BookmarkImporter :visible="showImporter" @close="showImporter = false" />
  <SettingsDrawer
    :visible="showSettings"
    @close="showSettings = false"
    @open-picker="showPicker = true"
    @open-importer="showImporter = true; showSettings = false"
  />
  <WallpaperPicker
    :visible="showPicker"
    :categories="wallpaper.categories.value"
    :wallpapers="wallpaper.wallpapers.value"
    :loading="wallpaper.manualLoading.value"
    :active-category-id="wallpaper.activeCategoryId.value"
    :page="wallpaper.page.value"
    :total="wallpaper.total.value"
    :page-size="wallpaper.pageSize"
    @close="showPicker = false"
    @select-category="wallpaper.selectCategory"
    @select-wallpaper="onSelectWallpaper"
    @go-page="wallpaper.goPage"
  />
</template>
