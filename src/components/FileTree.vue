<script setup>
	import { onMounted, ref } from "vue";
	import { extractVarFromJs, listToTDesignTree } from "@/util/util.js";
	import { useSettingsStore } from "@/store/index.js";

	const data = ref(null)

	const settingsStore = useSettingsStore()


	const onActive = (value, {node, e, trigger}) => {
		console.log("onActive",value, node.data, e, trigger);
	}

	onMounted(async () => {
		let url = 'https://eaip.young-zy.com/Data/JsonPath/AMDT.js'
		const resp = await fetch(url)
		if (resp.status === 200) {
			let js = await resp.text();
			data.value = listToTDesignTree(extractVarFromJs(js, 'amdtTreeData'));
		}
	})
</script>

<template>
	<div style="overflow: auto">
		<t-tree :data=data @active="onActive" :activable="true" >
			<template #icon="{ node }">
				<t-icon v-if="node.getChildren() && !node.expanded" name="caret-right-small" />
<!--				<t-icon v-else-if="node.getChildren() && node.expanded && node.loading" name="loading" />-->
				<t-icon v-else-if="node.getChildren() && node.expanded" name="caret-down-small" />
				<t-icon v-if="node.data.htmlPath" name="html5"/>
				<t-icon v-else-if="node.data.pdfPath" name="file-pdf"/>
			</template>
			<template #label="{ node }">
				<span> {{ settingsStore.currentLanguage === 'cn' ? node.data.name_cn : node.data.name }} </span>
			</template>
		</t-tree>
	</div>
</template>

<style scoped>

</style>
