<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSearch } from '../composables/useSearch'
import { useTheme } from '../composables/useTheme'

const { search } = useSearch()
const { colors } = useTheme()
const query = ref('')

const shadowFlood = computed(() => colors.value.searchShadowFlood)

function onSubmit() {
  search(query.value)
}
</script>

<template>
  <div class="relative w-full max-w-xl mx-auto">
    <form class="glass search-bar flex items-center gap-3 px-4 py-2.5" @submit.prevent="onSubmit">
      <input
        v-model="query"
        type="text"
        placeholder="搜索..."
        class="search-bar__input flex-1 bg-transparent outline-none text-lg border-none"
      />
      <button type="submit" class="search-bar__submit" aria-label="搜索">
        <svg
          class="search-bar__icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="22"
          height="22"
          aria-hidden="true"
        >
          <defs>
            <filter
              id="nnt-icon-outline"
              filterUnits="userSpaceOnUse"
              x="-6"
              y="-6"
              width="36"
              height="36"
              color-interpolation-filters="sRGB"
            >
              <feMorphology in="SourceAlpha" operator="dilate" radius="1" result="m-outer" />
              <feGaussianBlur in="m-outer" stdDeviation="2" result="b-outer" />
              <feFlood :flood-color="shadowFlood" flood-opacity="0.95" result="c-outer" />
              <feComposite in="c-outer" in2="b-outer" operator="in" result="s-outer" />

              <feMorphology in="SourceAlpha" operator="dilate" radius="0.55" result="m-down" />
              <feOffset in="m-down" dx="0" dy="1" result="o-down" />
              <feGaussianBlur in="o-down" stdDeviation="1.2" result="b-down" />
              <feFlood :flood-color="shadowFlood" flood-opacity="0.95" result="c-down" />
              <feComposite in="c-down" in2="b-down" operator="in" result="s-down" />

              <feMorphology in="SourceAlpha" operator="dilate" radius="0.4" result="m-up" />
              <feOffset in="m-up" dx="0" dy="-1" result="o-up" />
              <feGaussianBlur in="o-up" stdDeviation="0.65" result="b-up" />
              <feFlood :flood-color="shadowFlood" flood-opacity="0.85" result="c-up" />
              <feComposite in="c-up" in2="b-up" operator="in" result="s-up" />

              <feMorphology in="SourceAlpha" operator="dilate" radius="0.4" result="m-right" />
              <feOffset in="m-right" dx="1" dy="0" result="o-right" />
              <feGaussianBlur in="o-right" stdDeviation="0.9" result="b-right" />
              <feFlood :flood-color="shadowFlood" flood-opacity="0.8" result="c-right" />
              <feComposite in="c-right" in2="b-right" operator="in" result="s-right" />

              <feMorphology in="SourceAlpha" operator="dilate" radius="0.4" result="m-left" />
              <feOffset in="m-left" dx="-1" dy="0" result="o-left" />
              <feGaussianBlur in="o-left" stdDeviation="0.9" result="b-left" />
              <feFlood :flood-color="shadowFlood" flood-opacity="0.8" result="c-left" />
              <feComposite in="c-left" in2="b-left" operator="in" result="s-left" />

              <feMerge>
                <feMergeNode in="s-outer" />
                <feMergeNode in="s-down" />
                <feMergeNode in="s-up" />
                <feMergeNode in="s-right" />
                <feMergeNode in="s-left" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path
            filter="url(#nnt-icon-outline)"
            fill="currentColor"
            fill-rule="evenodd"
            d="M18.298 5.683c-.38.068-.916.244-1.776.53L10.03 8.378c-.828.276-1.412.471-1.832.635a5 5 0 0 0-.452.199c-.086.045-.116.07-.118.07a1 1 0 0 0 0 1.437a1 1 0 0 0 .118.071c.1.053.245.118.452.2c.42.163 1.004.358 1.832.634l.056.019c.273.09.513.17.734.287a3 3 0 0 1 1.25 1.25c.117.22.197.46.287.734l.02.056c.275.828.47 1.412.634 1.832a4 4 0 0 0 .199.452c.045.086.07.116.07.118a1 1 0 0 0 1.437 0a1 1 0 0 0 .071-.118c.053-.1.118-.245.2-.453c.163-.42.358-1.003.634-1.83l2.163-6.491c.287-.86.463-1.398.53-1.777l.005-.023zm.259-.023l-.01-.001zm-.216-.208l-.001-.009zm-.393-1.738c.55-.098 1.305-.127 1.885.453s.55 1.334.453 1.885c-.096.542-.323 1.221-.578 1.987l-.024.072l-2.164 6.49l-.01.03c-.264.792-.474 1.424-.659 1.896c-.173.445-.378.905-.688 1.227a3 3 0 0 1-4.326 0c-.31-.322-.515-.782-.688-1.227c-.185-.472-.395-1.104-.66-1.897l-.01-.028c-.12-.361-.147-.433-.176-.488a1 1 0 0 0-.417-.417c-.055-.03-.127-.056-.488-.177l-.028-.01c-.793-.264-1.425-.474-1.898-.659c-.444-.173-.904-.378-1.226-.688a3 3 0 0 1 0-4.326c.322-.31.782-.515 1.226-.688a45 45 0 0 1 1.898-.66l.028-.01l6.491-2.163l.072-.024c.766-.255 1.445-.482 1.987-.578"
            clip-rule="evenodd"
          />
        </svg>
      </button>
    </form>
  </div>
</template>

<style scoped>
.search-bar__input {
  color: var(--theme-search-text, #fff);
  text-shadow: var(--theme-search-shadow);
}

.search-bar__input::placeholder {
  color: var(--theme-search-placeholder, rgba(255, 255, 255, 0.92));
  text-shadow: var(--theme-search-shadow);
}

.search-bar__submit {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  border: none;
  background: none;
  cursor: pointer;
  color: var(--theme-search-icon, #fff);
  -webkit-appearance: none;
  appearance: none;
  line-height: 0;
}

.search-bar__submit:focus {
  outline: none;
}

.search-bar__submit:focus-visible {
  opacity: 0.85;
}

.search-bar__submit:hover {
  opacity: 0.88;
}

.search-bar__submit:active {
  transform: scale(0.94);
}

.search-bar__icon {
  display: block;
  overflow: visible;
}
</style>
