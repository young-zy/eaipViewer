<script setup>
	import { useRoute } from "vue-router";
	import FileTree from "@/components/FileTree.vue";
	import FileTable from "@/components/FileTable.vue";

	const route = useRoute()
</script>

<template>
  <Transition
    class="transition"
    mode="out-in"
  >
    <FileTree v-if="['AMDT', 'AD', 'GEN','ENR'].includes(route.name)" />
    <FileTable v-else-if="['SUPs', 'AICs', 'NOTAM'].includes(route.name)" />
  </Transition>
</template>

<style scoped>
	.v-enter-active,
	.v-leave-active {
		transition: opacity 0.1s ease;
	}

	.v-enter-from,
	.v-leave-to {
		opacity: 0;
	}

	.transition {
		min-width: 232px;
	}

</style>
