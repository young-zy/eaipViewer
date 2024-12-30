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

	let initiated = false;

	const onActive = (value, {node, e, trigger}) => {
		console.log("onActive",value, node.data, e, trigger);
		checkAndSetContent(node)
	}

	const checkAndSetContent = (node) => {
		if (node && node.data) {
			console.log("node: ",node)
			let contentPath, type;
			if (node.data.htmlPath) {
				contentPath = node.data.htmlPath
				type = 'html'
			} else {
				contentPath = node.data.pdfPath
				type = 'pdf'
			}
			contentStore.setContent(contentPath, type)
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
			url: 'https://eaip.young-zy.com/Data/JsonPath/AMDT.js',
			varName: 'amdtTreeData'
		},
		GEN: {
			url: 'https://eaip.young-zy.com/Data/JsonPath/GEN.js',
			varName: 'genTreeData'
		},
		ENR: {
			url: 'https://eaip.young-zy.com/Data/JsonPath/ENR.js',
			varName: 'enrTreeData'
		},
		AD: {
			url: 'https://eaip.young-zy.com/Data/JsonPath/AD.js',
			varName: 'adTreeData'
		},
	}

	watch(() => route.name, async (newVal, oldValue) => {
		console.log(newVal, oldValue)
		if (!initiated || newVal !== oldValue) {
			console.log(newVal, oldValue)
			initiated = true;
			if (config[newVal]) {
				await loadData(config[newVal].url,config[newVal].varName)
				// check if id exists
				if (route.params.id) {
					const node = treeInstance.value.getItem(route.params.id)
					const parents = treeInstance.value.getParents(route.params.id)
					parents.forEach(item => {
						if (!expanded.value.includes(item.data.id)) {
							// await nextTick()
							// await nextTick()
							expanded.value.push(item.data.id);
						}
					})
					checkAndSetContent(node)
				}
			}
		}
	})

	watch(
			() => route.params.id,
			async id => {
				console.log("id", id)
				if (id) {
					activeId.value = [id.toString()]
					const node = treeInstance.value.getItem(id)
					const parents = treeInstance.value.getParents(id)
					parents.forEach(item => {
						if (!expanded.value.includes(item.data.id)) {
							// await nextTick()
							// await nextTick()
							expanded.value.push(item.data.id);
						}
					})
					checkAndSetContent(node)
				}
			}
	)

	const loadData = async (url, varName) => {
		const resp = await fetch(url)
		if (resp.status === 200) {
			let js = await resp.text();
			data.value = listToTDesignTree(extractVarFromJs(js, varName));
		}
	}

	onMounted(async () => {
		// TODO get route
		// TODO load data js
		// TODO set data
	})
</script>

<template>
  <t-tree
    ref="treeInstance"
    v-model:expanded="expanded"
    :expand-parent="true"
    :actived="activeId"
    :data="data"
    :activable="true"
    :keys="{ value: 'id' }"
    :expand-level="1"
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
        :show-arrow="true"
      >
        <span> {{ settingsStore.currentLanguage === 'cn' ? node.data.name_cn : node.data.name }} </span>
      </t-popup>
    </template>
  </t-tree>
</template>

<style scoped lang="less">

</style>
