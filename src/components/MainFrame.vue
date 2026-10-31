<script setup>
	import { useContentStore, useLayoutStore, useSettingsStore } from "@/store/index.js";
	import { uiText } from '@/util/uiText.js'
	import {watch, ref,computed, onMounted, onBeforeUnmount} from "vue"

	import VuePdfEmbed from 'vue-pdf-embed'

	import 'vue-pdf-embed/dist/styles/annotationLayer.css'
	import 'vue-pdf-embed/dist/styles/textLayer.css'

	const contentStore = useContentStore()

	const layoutStore = useLayoutStore()

	const iframeURL = ref('')

	const iframeDom = ref(null)

	const pdfEmbed = ref(null)
	const mainFrame = ref(null)
	const pdfScrollArea = ref(null)
	let resizeObserver
	const availableWidth = ref(0)
	const pageWidth = ref(0)
	const currentScale = ref(0)
	let fitNewDocument = false
	const width = computed(() => pageWidth.value * currentScale.value)
	const fitPage = () => {
		if (fitNewDocument && pageWidth.value && availableWidth.value) {
			currentScale.value = availableWidth.value / pageWidth.value
			fitNewDocument = false
		}
	}
	const autoScale = () => {
		if (pageWidth.value && pdfScrollArea.value?.clientWidth) {
			currentScale.value = pdfScrollArea.value.clientWidth / pageWidth.value
		}
	}
	const downloadPdf = async () => {
		if (!pdfSource.value) return
		const originalName = decodeURIComponent(new URL(pdfSource.value, location.href).pathname.split('/').pop()) || 'document.pdf'
		const fileName = (contentStore.currentFileName || originalName).trim().replace(/[\\/:*?"<>|]/g, '_') || originalName
		const dataVersion = window.Customers?.[0]?.DataVersion?.trim().replace(/[\\/:*?"<>|]/g, '_')
		const downloadName = dataVersion ? `${dataVersion}_${fileName}` : fileName
		try {
			const response = await fetch(pdfSource.value)
			if (!response.ok) throw new Error(`PDF download failed: ${response.status}`)
			const blobUrl = URL.createObjectURL(await response.blob())
			const link = document.createElement('a')
			link.href = blobUrl
			link.download = /\.pdf$/i.test(downloadName) ? downloadName : `${downloadName}.pdf`
			document.body.appendChild(link)
			link.click()
			link.remove()
			setTimeout(() => URL.revokeObjectURL(blobUrl), 60000)
		} catch (error) {
			console.error(error)
			window.alert(text.value.downloadFailed)
		}
	}
	onMounted(() => {
		resizeObserver = new ResizeObserver(([entry]) => {
			availableWidth.value = Math.max(0, entry.contentRect.width - 10)
			fitPage()
		})
		if (mainFrame.value) resizeObserver.observe(mainFrame.value)
	})
	onBeforeUnmount(() => resizeObserver?.disconnect())

	const pdfSource = ref(null)

	watch(() => contentStore.currentFilePath, (newValue) => {
		if (newValue) {
			if (contentStore.currentType === 'pdf') {
				fitNewDocument = true
				pageWidth.value = 0
				pdfSource.value = import.meta.env.VITE_DATA_BASE_URL + newValue
				pdfLoading.value = true;
			} else if (contentStore.currentType === 'html') {
				iframeLoading.value = true;
				iframeURL.value = import.meta.env.VITE_DATA_BASE_URL + newValue;
			}
		}
	})

	const settingsStore = useSettingsStore()
	const text = computed(() => uiText[settingsStore.currentLanguage])

	const iframeLoading = ref(false)

	const pdfLoading = ref(false)


	const styleIframeScrollbar = () => {
		try {
			const doc = iframeDom.value?.contentDocument
			if (!doc?.head) return
			const style = doc.createElement('style')
			style.textContent = `
				:root { color-scheme: light; --scrollbar-thumb: #b8c1cc; --scrollbar-track: #f3f5f7; }
				* { scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track); }
				*::-webkit-scrollbar { width: 10px; height: 10px; }
				*::-webkit-scrollbar-track { background: var(--scrollbar-track); }
				*::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); border: 2px solid var(--scrollbar-track); border-radius: 8px; }
				*::-webkit-scrollbar-thumb:hover { background: #929eac; }
				*::-webkit-scrollbar-corner { background: var(--scrollbar-track); }
			`
			doc.getElementById('viewer-scrollbar-style')?.remove()
			style.id = 'viewer-scrollbar-style'
			doc.head.appendChild(style)
		} catch {
			// Cross-origin iframe documents cannot be styled from the parent page.
		}
	}
	const iframeLoaded = () => {
		styleIframeScrollbar()
		iframeLoading.value = false;
	}

	const pdfLoaded = async () => {
		const page = await pdfEmbed.value.doc.getPage(1)
		pageWidth.value = page.getViewport({scale: 1}).width;
		fitPage()
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

	let lastZoomTime = 0
	let lastZoomDirection = 0
	let zoomStreak = 0
	const changeScale = (direction) => {
		const now = performance.now()
		zoomStreak = direction === lastZoomDirection && now - lastZoomTime < 450 ? zoomStreak + 1 : 0
		lastZoomTime = now
		lastZoomDirection = direction
		const step = [1, 2, 5, 10, 20][Math.min(Math.floor(zoomStreak / 2), 4)]
		displayScale.value = Number(displayScale.value) + direction * step
	}

	const pdfStyle = computed(() => {
		return {
			filter: settingsStore.currentTheme === 'dark' ? 'invert(0.8) hue-rotate(180deg) contrast(1)':'',
		}
	})

	const displayScale = computed({
		get: () => {
			return (currentScale.value * 100).toFixed(2);
		},
		set: (newScale) => {
			if (newScale < 0.01) {
				newScale = 0.01;
			}
			let newWidth = pageWidth.value * newScale / 100;
			if (newWidth > 7000) {
				newWidth = 7000
				newScale = newWidth * 100 / pageWidth.value;
			}
			currentScale.value = newScale / 100;
		}
	})

</script>

<template>
  <t-loading
    v-show="loading"
    class="loading"
    :text="text.loading"
    size="medium"
  />
  <div
    v-show="!loading"
    ref="mainFrame"
    class="main-frame"
    :class="{
      'main-frame--pdf': contentStore.currentType === 'pdf',
      'main-frame--html': contentStore.currentType === 'html',
    }"
  >
    <div
      v-show="contentStore.currentType === 'pdf'"
      class="pdf-container"
    >
      <div
        class="pdf-tool-bar"
      >
        <div class="pdf-zoom-left">
          <t-button variant="outline" @click="autoScale">{{ text.autoScale }}</t-button>
          <t-button variant="outline" @click="changeScale(-1)">−</t-button>
        </div>
        <t-input-number
          v-model="displayScale"
          theme="normal"
          :decimal-places="2"
          :auto-width="true"
          align="right"
          suffix="%"
        />
        <t-button class="pdf-zoom-in" variant="outline" @click="changeScale(1)">+</t-button>
        <t-button class="pdf-download" variant="outline" @click="downloadPdf">{{ text.downloadPdf }}</t-button>
      </div>
      <div ref="pdfScrollArea" class="pdf-scroll-area">
        <div class="pdf-pages">
          <VuePdfEmbed
            ref="pdfEmbed"
            annotation-layer
            text-layer
            :width="width"
            :source="pdfSource"
            :style="pdfStyle"
            @loaded="pdfLoaded"
          />
        </div>
      </div>
    </div>
    <div v-show="contentStore.currentType === 'html'" class="html-container">
      <iframe
        ref="iframeDom"
        class="iframe"
        :src="iframeURL"
        :style="{
          filter: settingsStore.currentTheme === 'dark' ? 'invert(0.8) contrast(0.8)':'',
          pointerEvents: layoutStore.resizing ? 'none': 'auto', // prevent iframe event on resizing
        }"
        @load="iframeLoaded"
      />
    </div>
    <div
      v-show="contentStore.currentType !== 'pdf' && contentStore.currentType !== 'html'"
      class="empty"
    >
      <span>
        {{ text.selectFile }}
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
		box-sizing: border-box;
		width: 100%;
		min-width: 0;
		height: calc(100vh - 132px);
		max-height: calc(100vh - 132px);
		overflow: auto;
		&.main-frame--pdf {
			overflow: hidden;
			padding-left: 0;
			padding-right: 0;
		}
		&.main-frame--html {
			overflow: hidden;
		}
		padding-left: 32px;
		padding-right: 32px;
		.html-container {
			height: 100%;
		}
		.iframe {
			display: block;
			height: 100%;
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
			height: 100%;
			width: 100%;
			display: flex;
			flex-direction: column;
			min-width: 0;
		}
		.pdf-scroll-area {
			flex: 1;
			min-height: 0;
			min-width: 0;
			overflow: auto;
		}
		.pdf-pages {
			width: max-content;
			margin-inline: auto;
		}
		.pdf-tool-bar {
			flex: 0 0 48px;
			position: relative;
			display: grid;
			grid-template-columns: 1fr auto 1fr;
			align-items: center;
			.pdf-zoom-left {
				justify-self: end;
				display: flex;
				align-items: center;
			}
			.pdf-zoom-in {
				justify-self: start;
			}
			.pdf-download {
				position: absolute;
				right: 0;
			}
		}
		.t-button {
			margin-left: 4px;
			margin-right: 4px;
		}
	}
</style>
