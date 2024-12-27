<script setup>
import FileTree from "@/components/FileTree.vue";
import { Icon } from "tdesign-icons-vue-next";
import {useSettingsStore} from "@/store/index.js"
import {ref} from "vue"

const settingsStore = useSettingsStore()

const themeChange = (e) => {
	console.log("themeChange", e);
	settingsStore.setTheme(e)
}

const languageChange = (e) => {
	console.log("laguageChange", e);
	settingsStore.setLanguage(e)
}

const menuValue = ref("")

</script>

<template>
	<t-layout>
		<t-header>
			<t-head-menu v-model="menuValue" height="120px" expand-type="popup">
				<template #logo>
					<img width="136" class="logo" :src="'../img/logo-copy.6608b40d.png'" alt="logo" />
				</template>
				<t-submenu value="/AIP">
					<template #title>
						<span>AIP</span>
					</template>
					<t-menu-item value="/AIP/GEN"> GEN </t-menu-item>
					<t-menu-item value="/AIP/ENR"> ENR </t-menu-item>
					<t-menu-item value="/AIP/AD"> AD </t-menu-item>
				</t-submenu>
				<t-menu-item value="/AMDT"> AMDT </t-menu-item>
				<t-menu-item value="/SUPs"> SUPs </t-menu-item>
				<t-menu-item value="/AICs"> AICs </t-menu-item>
				<t-menu-item value="/NOTAM"> NOTAM </t-menu-item>
				<template #operations>
					<div class="language-picker">
						<t-radio-group :value="settingsStore.currentLanguage" @change="languageChange" variant="default-filled" default-value="light">
							<t-radio-button value="cn">
								中文
							</t-radio-button>
							<t-radio-button value="en">
								English
							</t-radio-button>
						</t-radio-group>
					</div>
					<div class="theme-picker">
						<t-radio-group :value="settingsStore.currentTheme" @change="themeChange" variant="default-filled" default-value="light">
							<t-radio-button value="light">
								<icon name="sunny-filled" size="medium" :color="settingsStore.currentTheme === 'light' ? 'rgb(255, 189, 46)' : null" />
							</t-radio-button>
							<t-radio-button value="dark">
								<icon name="moon-filled" size="medium" :color="settingsStore.currentTheme === 'dark' ? 'white' : null"/>
							</t-radio-button>
						</t-radio-group>
					</div>
				</template>
			</t-head-menu>
		</t-header>
		<t-layout>
			<t-aside style="border-top: 1px solid var(--component-border)" overflow="auto">
				<FileTree style="width: 100%; height: 100%; "></FileTree>
			</t-aside>
			<t-layout>
				<t-content>
					<div>Content</div>
				</t-content>
				<t-footer>Copyright @ 2019-{{ new Date().getFullYear() }} Tencent. All Rights Reserved</t-footer>
			</t-layout>
		</t-layout>
	</t-layout>
</template>

<style scoped lang="less">
	.language-picker {
		margin-right: 8px;
	}
</style>
