<script setup>
	import {ref, watch, computed} from "vue"
	import { useRoute, useRouter } from "vue-router";
	import { useContentStore, useSettingsStore } from "@/store/index.js";
	import { uiText } from '@/util/uiText.js'

	const route = useRoute()

	const router = useRouter()

	const data = ref([])

	const settingsStore = useSettingsStore()
	const text = computed(() => uiText[settingsStore.currentLanguage])

	const rowKey = ref('')

	const loading = ref(false)

	const contentStore = useContentStore()

	const active = ref(null)

	const selectChange = (key, opts) => {
		checkAndSetContent(opts.currentRowData, opts.currentRowKey)
	}

	const checkAndSetContent = (node, key) => {
		if (node) {
			let contentPath, contentEnPath, type;
			contentPath = node.Document
			contentEnPath = node.Document
			type = 'pdf'
			contentStore.setContent(contentPath, contentEnPath, type, node.SeriesName || node.Serial || node.Subject || '')
			router.push({ name: route.name, params: {id: key} })
		}
	}

	const config = {
		NOTAM: {
			url: import.meta.env.VITE_DATA_BASE_URL + '/Data/JsonPath/NOTAM.JSON',
			varName: 'notamTreeData',
			rowKey: 'SeriesName',
			columns: [
				{
					colKey: 'SeriesName',
					titleKey: 'name',
				},
				{
					colKey: 'GenerateTime',
					titleKey: 'generatedAt'
				}
			]
		},
		AICs: {
			url: import.meta.env.VITE_DATA_BASE_URL+'/Data/JsonPath/AIC.JSON',
			varName: 'aicTreeData',
			rowKey: 'Id',
			columns: [
				{
					colKey: 'Serial',
					titleKey: 'numberYear',
					width: '56px',
				},
				{
					colKey: 'Pub_Date',
					titleKey: 'publishedOn'
				},
				{
					colKey: 'Subject',
					titleKey: 'subject'
				}
			]
		},
		SUPs: {
			url: import.meta.env.VITE_DATA_BASE_URL+'/Data/JsonPath/SUP.JSON',
			varName: 'supTreeData',
			rowKey: 'Id',
			columns: [
				{
					colKey: 'Serial',
					titleKey: 'numberYear',
					width: '56px',
				},
				{
					colKey: 'Subject',
					titleKey: 'subject'
				},
				{
					colKey: 'period',
					titleKey: 'validity'
				},
			]
		}
	}
	const columns = computed(() => (config[route.name]?.columns ?? []).map(({ titleKey, ...column }) => ({
		...column,
		title: text.value[titleKey],
	})))

	const loadData = async (url, varName) => {
		loading.value = true;
		const resp = await fetch(url)
		if (resp.status === 200) {
			data.value = await resp.json();
			loading.value = false;
		}
	}

	watch([() => route.name, () => route.params.id],async  (newVal, oldVal) => {
		const conf = config[newVal[0]]
		if (newVal[0] !== oldVal[0]) {
			if (conf) {
				await loadData(conf.url, conf.varName);
				rowKey.value = conf.rowKey;
			}
		}
		if (newVal[1]) {
			active.value = [newVal[1]];
			// get active node from data
			let node;
			data.value.forEach((item) => {
				if (item[conf.rowKey].toString() === newVal[1]) {
					node = item;
				}
			})
			checkAndSetContent(node, newVal[1])
		}
	}, {immediate: true})
</script>

<template>
  <t-table
    :active-row-keys="active"
    class="table"
    :row-key="rowKey"
    :data="data"
    :foot-data="[{}]"
    :columns="columns"
    :max-height="'calc(100vh - 57px)'"
    :select-on-row-click="true"
    :active-row-type="'single'"
    :border="false"
    row-selection-type="single"
    @select-change="selectChange"
  >
    <template #period="{ row }">
      <p>{{ text.from }} {{ row.Effective_Time }}(UTC)</p>
      <p v-if="row.Out_Date">
        {{ text.to }} {{ row.Out_Date }}(UTC)
      </p>
    </template>
  </t-table>
</template>

<style scoped>
	.table {
		min-height: calc(100vh - 132px);
		width: 100%;
	}

	:deep(.t-table-demo__select-without-handler) {
		.t-table .t-table__row--selected {
			> td {
				color: var(--td-brand-color);
				font-weight: bold;
			}
		}
	}
</style>
