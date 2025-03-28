<script setup>
	import { onMounted, ref, watch, computed, nextTick } from "vue";
	import { extractVarFromJs, listToTDesignTree } from "@/util/util.js";
	import { useContentStore, useSettingsStore } from "@/store/index.js";
	import { useRoute, useRouter } from "vue-router";

	const data = ref(null)

	const settingsStore = useSettingsStore()

	const contentStore = useContentStore()

	const route = useRoute();

	const router = useRouter();

	const expanded = ref([]);

	const treeInstance = ref(null);

	const loading = ref(false);

	const onActive = (value, {node, e, trigger}) => {
		console.log("onActive",value, node.data, e, trigger);
		checkAndSetContent(node)
	}

	const checkAndSetContent = (node) => {
		if (node && node.data) {
			// console.log("node: ",node)
			let contentPath, contentEnPath, type;
			if (node.data.htmlPath) {
				contentPath = node.data.htmlPath
				contentEnPath = node.data.htmlEnPath
				type = 'html'
			} else {
				contentPath = node.data.pdfPath
				contentEnPath = node.data.pdfPath
				type = 'pdf'
			}
			contentStore.setContent(contentPath, contentEnPath, type)
			router.push({ name: route.name, params: {id: node.data.id} })
		}
	}

	const activeId = computed(() => {
		if (route.params.id) {
			return [route.params.id.toString()]
		}
		return null
	})

	const config = {
		AMDT: {
			url: import.meta.env.VITE_DATA_BASE_URL+'/Data/JsonPath/AMDT.JSON',
		},
    AIP: {
      url: import.meta.env.VITE_DATA_BASE_URL+'/Data/JsonPath/AIP.JSON',
    },
	}

	const loadData = async (url, varName) => {
		loading.value = true;
		const resp = await fetch(url)
		if (resp.status === 200) {
			let json = await resp.json();
			data.value = listToTDesignTree(json);
			loading.value = false;
		}
	}

	scrollTo = async  (node) => {
		setTimeout(() => {
			let target = document.querySelector(`[data-value="${node.data.id}"]`)
			const parentDom = target?.parentNode?.parentNode;
			parentDom?.scrollTo({
				top: target.offsetTop,
				behavior: "smooth",
			})
		}, 300)
	}

	watch([() => route.name, () => route.params.id], async (newVal, oldValue) => {
		console.log(newVal, oldValue)
		if (newVal[0] !== oldValue[0]) {
			console.log(newVal, oldValue)
			if (config[newVal[0]]) {
				await loadData(config[newVal[0]].url)
				// check if id exists
			}
		}
		if (newVal[1]) {
			const node = treeInstance.value.getItem(newVal[1])
			const parents = treeInstance.value.getParents(newVal[1])
			parents.forEach(item => {
				if (!expanded.value.includes(item.data.id)) {
					expanded.value.push(item.data.id);
				}
			})
			await nextTick();
			if (node) {
				scrollTo(node)
			}
			// treeInstance.value.scrollTo({key: route.params.id})
			// console.log('scrolled');
			checkAndSetContent(node)
		}
	}, {immediate: true})
</script>

<template>
  <t-loading
    v-if="loading"
    class="loading"
  />
  <t-tree
    v-else
    ref="treeInstance"
    v-model:expanded="expanded"
    :expand-parent="true"
    :actived="activeId"
    :data="data"
    :activable="true"
    :keys="{ value: 'id' }"
    :expand-level="1"
    :line="true"
    :max-height="'calc(100vh - 58px)'"
    :height="'calc(100vh - 58px)'"
    class="tree"
    @active="onActive"
  >
    <template #icon="{ node }">
      <t-icon
        v-if="node.getChildren() && !node.expanded"
        name="caret-right-small"
      />
      <t-icon
        v-else-if="node.getChildren() && node.expanded"
        name="caret-down-small"
      />
      <t-icon
        v-if="node.data.htmlPath"
        name="html5"
      />
      <t-icon
        v-else-if="node.data.pdfPath"
        name="file-pdf"
      />
    </template>
    <template #label="{ node }">
      <t-popup
        :content="settingsStore.currentLanguage === 'cn' ? node.data.name_cn : node.data.name"
        placement="bottom"
        trigger="hover"
      >
        <span style="width: 100%"> {{ settingsStore.currentLanguage === 'cn' ? node.data.name_cn : node.data.name }} </span>
      </t-popup>
    </template>
  </t-tree>
</template>

<style scoped lang="less">
	.tree {
		min-width: 232px;
	}
	.loading {
		min-width: 232px;
	}

  :deep(.t-tree__label) {
    overflow: unset !important;
  }
</style>
