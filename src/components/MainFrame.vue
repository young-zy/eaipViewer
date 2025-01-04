<script setup>
	import { useContentStore, useSettingsStore } from "@/store/index.js";
	import {watch, ref,computed,onMounted,onBeforeUnmount} from "vue"

	import VuePdfEmbed from 'vue-pdf-embed'

	// optional styles
	import 'vue-pdf-embed/dist/styles/annotationLayer.css'
	import 'vue-pdf-embed/dist/styles/textLayer.css'

	const contentStore = useContentStore()

	const iframeURL = ref('')

	const iframeDom = ref(null)

	const pdfEmbed = ref(null)

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

	const currentScale = ref(0)

	const iframeLoaded = (e) => {
		console.log('iframeLoaded', e);
		iframeLoading.value = false;
	}

	const pdfLoaded = async (e) => {
		console.log('pdfLoaded', e);
		console.log('doc data',await pdfEmbed.value.doc.getViewerPreferences());
		const page = await pdfEmbed.value.doc.getPage(1)
		const pageWidth = page.getViewport({scale: 1}).width;

		currentScale.value = width.value / pageWidth;
		console.log('current scale',currentScale.value);
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

	// onMounted(() => {
	// 	window.addEventListener('resize', onResize);
	// })
	//
	// onBeforeUnmount(() => {
	// 	window.removeEventListener('resize', onResize);
	// })

	// const vw = ref(window.innerWidth);
	// const vh = ref(window.innerHeight);
	const width = ref(window.innerWidth - 232 - 64);

	// const onResize = () => {
	// 	vw.value = window.innerWidth;
	// 	vh.value = window.innerHeight;
	// }

	const increaseScale = () => {
		const newScale = parseFloat((currentScale.value + 0.01).toFixed(2));
		const newWidth = width.value / currentScale.value * newScale;
		console.log('new width', newWidth);
		console.log('new scale', newScale);
		currentScale.value = newScale;
		width.value = newWidth;
	}

	const decreaseScale = () => {
		const newScale = parseFloat((currentScale.value - 0.01).toFixed(2));
		const newWidth = width.value / currentScale.value * newScale;
		console.log('new width', newWidth);
		console.log('new scale', newScale);
		currentScale.value = newScale;
		width.value = newWidth;
	}

	const pdfStyle = computed(() => {
		return {
			filter: settingsStore.currentTheme === 'dark' ? 'invert(0.8) contrast(1)':'',
			overflow: 'auto',
		}
	})

	function debounce(func, delay) {
		// A timer variable to track the delay period
		let timer;
		// Return a function that takes arguments
		return function(...args) {
			// Clear the previous timer if any
			clearTimeout(timer);
			// Set a new timer that will execute the function after the delay period
			timer = setTimeout(() => {
				// Apply the function with arguments
				func.apply(this, args);
			}, delay);
		};
	}

	const displayScale = computed({
		get: () => {
			return (currentScale.value * 100).toFixed(2);
		},
		set: (newScale) => {
			debounce(() => {
				if (newScale < 0.01) {
					newScale = 0.01;
				}
				let newWidth = width.value / currentScale.value * newScale / 100;
				if (newWidth > 7000) {
					newWidth = 7000
					newScale = newWidth * 100 / width.value * currentScale.value;
				}
				console.log('new width', newWidth);
				console.log('new scale', newScale);
				currentScale.value = newScale / 100;
				width.value = newWidth;
			}, 1000)
		}
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
      <div
        class="pdf-tool-bar"
      >
        <t-input-number
          v-model="displayScale"
          :decimal-places="2"
          :auto-width="true"
          align="right"
          suffix="%"
        />
      </div>
      <VuePdfEmbed
        ref="pdfEmbed"
        annotation-layer
        text-layer
        :width="width"
        :source="pdfSource"
        :style="pdfStyle"
        style="max-height: calc(100vh - 180px)"
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
			max-width: calc(100vw - 232px);
			overflow: auto;
		}
		.pdf-tool-bar {
			display: flex;
			align-items: center;
			justify-content: center;
			height: 48px;
		}
		.t-button {
			margin-left: 4px;
			margin-right: 4px;
		}
	}
</style>
