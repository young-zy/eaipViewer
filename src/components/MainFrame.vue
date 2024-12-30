<script setup>
	import { useContentStore, useSettingsStore } from "@/store/index.js";
	import {watch, ref} from "vue"

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

	watch(() => contentStore.currentFilePath, (newValue) => {
		console.log(newValue)
		if (newValue) {
			if (contentStore.currentType === 'pdf') {
				const container = pdfContainer;
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
			} else if (contentStore.currentType === 'html') {
				iframeURL.value = 'https://eaip.young-zy.com/Data/' + newValue;
			}
		}
	})

	const settingsStore = useSettingsStore()

</script>

<template>
  <div class="main-frame">
    <div
      v-if="contentStore.currentType === 'pdf'"
      ref="pdfContainer"
      class="pdf-container"
    >
      pdf working
    </div>
    <div v-else-if="contentStore.currentType === 'html'">
      <iframe
        class="iframe"
        :src="iframeURL"
        :style="{filter: settingsStore.currentTheme === 'dark' ? 'invert(0.8) contrast(0.8)':''}"
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
	}
</style>
