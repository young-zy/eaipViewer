<script setup>
	import { ref, watch, computed, nextTick } from "vue";
	import { listToTDesignTree } from "@/util/util.js";
	import { useContentStore, useSettingsStore } from "@/store/index.js";
	import { useRoute, useRouter } from "vue-router";
	import { CaretDownSmallIcon, CaretRightSmallIcon, FilePdfIcon, Html5Icon } from "tdesign-icons-vue-next";
	import { SearchIcon } from 'tdesign-icons-vue-next';

	const filterStr = ref("");

	const data = ref(null)

	const settingsStore = useSettingsStore()

	const contentStore = useContentStore()

	const route = useRoute();

	const router = useRouter();

	const expanded = ref([]);

	const treeInstance = ref(null);

	const loading = ref(false);

	const onActive = (value, {node}) => {
		checkAndSetContent(node)
	}

	const checkAndSetContent = (node) => {
		if (node && node.data) {
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
			contentStore.setContent(contentPath, contentEnPath, type, node.data.name_cn, node.data.name)
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

	const loadData = async (url, _) => {
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
		if (newVal[0] !== oldValue[0]) {
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
			checkAndSetContent(node)
		}
	}, {immediate: true})

	let filter = ref(null)

	const filterChange = () => {
		if (filterStr.value) {
			filter.value = (node) => {
				return node.data.name_cn.toUpperCase().includes(filterStr.value.toUpperCase()) ||
						node.data.name.toUpperCase().includes(filterStr.value.toUpperCase())
			}
		} else {
			filter.value = null;
		}
	}

	const inputKeyPress = (value, ctx) => {
		if (ctx.e.keyCode === 13) {
			filterChange()
		}
	}

</script>

<template>
  <t-loading
    v-if="loading"
    class="loading"
  />
  <div v-else>
    <t-input-adornment :prepend="settingsStore.currentLanguage === 'cn' ? '过滤：' :'filter:'">
      <t-input
        v-model="filterStr"
        placeholder=""
        style="width: 100%;"
        :clearable="true"
        @blur="filterChange"
        @clear="filterChange"
        @keypress="inputKeyPress"
      >
        <template #suffixIcon>
          <search-icon :style="{ cursor: 'pointer' }" />
        </template>
      </t-input>
    </t-input-adornment>
    <t-tree
      ref="treeInstance"
      v-model:expanded="expanded"
      :expand-parent="true"
      :actived="activeId"
      :data="data"
      :activable="true"
      :keys="{ value: 'id' }"
      :expand-level="1"
      :line="true"
      :max-height="'calc(calc(100vh - 58px) - 32px)'"
      :height="'calc(100vh - 58px)'"
      :filter="filter"
      :allow-fold-node-on-filter="true"
      class="tree"
      @active="onActive"
    >
      <template #icon="{ node }">
        <CaretRightSmallIcon
          v-if="node.getChildren() && !node.expanded"
        />
        <CaretDownSmallIcon
          v-else-if="node.getChildren() && node.expanded"
        />
        <Html5Icon
          v-if="node.data.htmlPath"
        />
        <FilePdfIcon
          v-else-if="node.data.pdfPath"
        />
      </template>
      <template #label="{ node }">
        <t-popup
          :content="settingsStore.currentLanguage === 'cn' ? node.data.name_cn : node.data.name"
          placement="bottom"
          trigger="hover"
        >
          <span
            :class="{modified: node.data.Is_Modified === 'Y'}"
            style="width: 100%"
          > {{ settingsStore.currentLanguage === 'cn' ? node.data.name_cn : node.data.name }} </span>
        </t-popup>
      </template>
    </t-tree>
  </div>
</template>

<style scoped lang="less">
	.tree {
		width: 100%;
		min-width: 0;
	}
	.loading {
		width: 100%;
	}

  :deep(.t-tree__label) {
    overflow: unset !important;
  }

	.modified {
		color: #ff2a2a;
		[theme-mode=dark] &{
			color: #ff6060;
		}
	}

</style>
