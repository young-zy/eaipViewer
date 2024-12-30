<script setup>
	import { useContentStore, useSettingsStore } from "@/store/index.js";
	import {watch, ref, nextTick,computed} from "vue"

	import * as pdfjs from 'pdfjs-dist/build/pdf';
	import {
		PDFLinkService,
		PDFFindController,
		PDFScriptingManager,
		PDFSinglePageViewer,
		EventBus
	} from "pdfjs-dist/web/pdf_viewer"
	import "pdfjs-dist/web/pdf_viewer.css";

	const pdfContainer = ref(null)

	const contentStore = useContentStore()

	const iframeURL = ref('')

	const iframeDom = ref(null)

	watch(() => contentStore.currentFilePath, async (newValue) => {
		console.log(newValue)
		if (newValue) {
			if (contentStore.currentType === 'pdf') {
				await nextTick();
				const container = pdfContainer.value;
				const eventBus = new EventBus();
				// (Optionally) enable hyperlinks within PDF files.
				const pdfLinkService = new PDFLinkService({
					eventBus,
				});

				// (Optionally) enable find controller.
				const pdfFindController = new PDFFindController({
					eventBus,
					linkService: pdfLinkService,
				});

				// // (Optionally) enable scripting support.
				// const pdfScriptingManager = new PDFScriptingManager({
				// 	eventBus,
				// 	sandboxBundleSrc: SANDBOX_BUNDLE_SRC,
				// });

				const pdfSinglePageViewer = new PDFSinglePageViewer({
					container,
					eventBus,
					linkService: pdfLinkService,
					findController: pdfFindController,
					// scriptingManager: pdfScriptingManager,
				});
				pdfLinkService.setViewer(pdfSinglePageViewer);
				// pdfScriptingManager.setViewer(pdfSinglePageViewer);
				pdfLinkService.setDocument('https://eaip.young-zy.com/Data/' + newValue)
			} else if (contentStore.currentType === 'html') {
				iframeLoading.value = true;
				iframeURL.value = 'https://eaip.young-zy.com/Data/' + newValue;
			}
		}
	})

	const settingsStore = useSettingsStore()

	const iframeLoading = ref(false)

	const iframeLoaded = (e) => {
		console.log('iframeLoaded', e);
		iframeLoading.value = false;
	}

	const loading = computed(() => {
		if (contentStore.currentType === 'html') {
			if (iframeDom.value) {
				return iframeLoading.value;
			} else {
				return true;
			}
		} else if (contentStore.currentType ==='pdf') {
			return false;
		} else {
			return true;
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
      v-if="contentStore.currentType === 'pdf'"
      ref="pdfContainer"
      class="pdf-container"
    >
      <div />
    </div>
    <div v-else-if="contentStore.currentType === 'html'">
      <iframe
        ref="iframeDom"
        class="iframe"
        :src="iframeURL"
        :style="{filter: settingsStore.currentTheme === 'dark' ? 'invert(0.8) contrast(0.8)':''}"
        @load="iframeLoaded"
      />
    </div>
    <div
      v-else
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
			position: absolute;
		}
	}
</style>
