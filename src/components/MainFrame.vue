<script setup>
	import { useContentStore, useSettingsStore } from "@/store/index.js";
	import {watch, ref,computed,onMounted} from "vue"

	import VuePdfEmbed from 'vue-pdf-embed'

	// optional styles
	import 'vue-pdf-embed/dist/styles/annotationLayer.css'
	import 'vue-pdf-embed/dist/styles/textLayer.css'

	const contentStore = useContentStore()

	const iframeURL = ref('')

	const iframeDom = ref(null)

	const pdfSource = ref(null)

	watch(() => contentStore.currentFilePath, async (newValue) => {
		console.log(newValue)
		if (newValue) {
			if (contentStore.currentType === 'pdf') {
				pdfSource.value = import.meta.env.VITE_DATA_BASE_URL + newValue
				pdfLoading.value = true;
			} else if (contentStore.currentType === 'html') {
				iframeLoading.value = true;
				iframeURL.value = import.meta.env.VITE_DATA_BASE_URL + newValue;
			}
		}
	})

	const settingsStore = useSettingsStore()

	const iframeLoading = ref(false)

	const pdfLoading = ref(false)

	const iframeLoaded = (e) => {
		console.log('iframeLoaded', e);
		iframeLoading.value = false;
	}

	const pdfLoaded = (e) => {
		console.log('pdfLoaded', e);
		pdfLoading.value = false;
	}

	const loading = computed(() => {
		if (contentStore.currentType === 'html') {
			if (iframeDom.value) {
				return iframeLoading.value;
			} else {
				return true;
			}
		} else if (contentStore.currentType ==='pdf') {
			return pdfLoading.value;
		} else {
			return false;
		}
	})

	onMounted(() => {
		// TODO scroll
	})

</script>

<template>
  <t-loading
    v-show="loading"
    class="loading"
    text="加载中..."
    size="medium"
  />
  <div
    v-show="!loading"
    class="main-frame"
  >
    <div
      v-show="contentStore.currentType === 'pdf'"
      class="pdf-container"
    >
      <VuePdfEmbed
        annotation-layer
        text-layer
        :source="pdfSource"
        @loaded="pdfLoaded"
      />
    </div>
    <div v-show="contentStore.currentType === 'html'">
      <iframe
        ref="iframeDom"
        class="iframe"
        :src="iframeURL"
        :style="{filter: settingsStore.currentTheme === 'dark' ? 'invert(0.8) contrast(0.8)':''}"
        @load="iframeLoaded"
      />
    </div>
    <div
      v-show="contentStore.currentType !== 'pdf' && contentStore.currentType !== 'html'"
      class="empty"
    >
      <span>
        请在左侧选择文件
      </span>
    </div>
  </div>
</template>

<style scoped>
	.loading {
		height: calc(100vh - 132px);
		width: 100%;
	}
	.main-frame {
		height: calc(100vh - 132px);
		max-height: calc(100vh - 132px);
		overflow: auto;
		padding-left: 32px;
		padding-right: 32px;
		.iframe {
			height: calc(100vh - 132px);
			width: 100%;
			border: 0;
		}
		.empty {
			height: 100%;
			width: 100%;
			display: flex;
			justify-content: center;
			align-items: center;
			align-content: center;
		}
		.pdf-container {
			max-height: calc(100vh - 140px);
		}
	}
</style>
