<script setup>
	import { extractVarFromJs, listToTDesignTree } from "@/util/util.js";
	import {ref, watch} from "vue"
	import { useRoute, useRouter } from "vue-router";
	import { useContentStore } from "@/store/index.js";

	const route = useRoute()

	const router = useRouter()

	const data = ref([])

	const columns = ref([])

	const rowKey = ref('')

	const loading = ref(false)

	const contentStore = useContentStore()

	const active = ref(null)

	const selectChange = (key, opts) => {
		console.log('selectChange', key ,opts)
		checkAndSetContent(opts.currentRowData, opts.currentRowKey)
	}

	const checkAndSetContent = (node, key) => {
		if (node) {
			// console.log("node: ",node)
			let contentPath, contentEnPath, type;
			contentPath = node.Document
			contentEnPath = node.Document
			type = 'pdf'
			contentStore.setContent(contentPath, contentEnPath, type)
			router.push({ name: route.name, params: {id: key} })
		}
	}

	const config = {
		NOTAM: {
			url: import.meta.env.VITE_DATA_BASE_URL + 'JsonPath/NOTAM.js',
			varName: 'notamTreeData',
			rowKey: 'SeriesName',
			columns: [
				{
					colKey: 'SeriesName',
					title: '名称',
				},
				{
					colKey: 'GenerateTime',
					title: '生成时间'
				}
			]
		},
		AICs: {
			url: import.meta.env.VITE_DATA_BASE_URL+'JsonPath/AIC.js',
			varName: 'aicTreeData',
			rowKey: 'SeriesName',
			columns: [
				{
					colKey: 'Serial',
					title: 'NR/Year',
					width: '56px',
				},
				{
					colKey: 'Pub_Date',
					title: 'Published on'
				},
				{
					colKey: 'Subject',
					title: 'Subject'
				}
			]
		},
		SUPs: {
			url: import.meta.env.VITE_DATA_BASE_URL+'JsonPath/SUP.js',
			varName: 'supTreeData',
			rowKey: 'Id',
			columns: [
				{
					colKey: 'Serial',
					title: 'NR/Year',
					width: '56px',
				},
				{
					colKey: 'Subject',
					title: 'Subject'
				},
				{
					colKey: 'period',
					title: 'Period of validity'
				},
			]
		}
	}

	const loadData = async (url, varName) => {
		loading.value = true;
		const resp = await fetch(url)
		if (resp.status === 200) {
			let js = await resp.text();
			data.value = extractVarFromJs(js, varName);
			loading.value = false;
		}
	}

	watch([() => route.name, () => route.params.id],async  (newVal, oldVal) => {
		const conf = config[newVal[0]]
		if (newVal[0] !== oldVal[0]) {
			if (conf) {
				await loadData(conf.url, conf.varName);
				rowKey.value = conf.rowKey;
				columns.value = conf.columns;
			}
		}
		if (newVal[1]) {
			active.value = newVal[1];
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
      <p>from {{ row.Effective_Time }}(UTC)</p>
      <p v-if="row.Out_Date">
        to {{ row.Out_Date }}(UTC)
      </p>
    </template>
  </t-table>
</template>

<style scoped>
	.table {
		min-height: calc(100vh - 132px);
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
