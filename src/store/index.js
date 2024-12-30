import { defineStore } from 'pinia'
import {ref, computed} from "vue";

const validTheme = ['dark', 'light'];
const validLanguage = ['en', 'cn'];

export const useSettingsStore = defineStore('settings', () => {
	const language = ref('cn');

	const theme = ref('dark');

	const currentTheme = computed(() => {
		return theme.value;
	})

	const currentLanguage = computed(() => {
		return language.value;
	})

	function setTheme(newTheme) {
		if (!validTheme.includes(newTheme)) {
			throw new Error('theme not valid');
		}
		theme.value = newTheme;
		if (newTheme === 'dark') {
			// 设置暗色模式
			document.documentElement.setAttribute('theme-mode', 'dark');
		} else {
			// 重置为浅色模式
			document.documentElement.removeAttribute('theme-mode');
		}
	}

	function setLanguage(newLanguage) {
		if (!validLanguage.includes(newLanguage)) {
			throw new Error('language not valid');
		}
		language.value = newLanguage;
	}

	return { currentTheme, currentLanguage, setTheme, setLanguage };
})

export const useContentStore = defineStore('contentStore', () => {

	const settingsStore = useSettingsStore();

	const filePath = ref('');

	const fileEnPath = ref('');

	const isEmpty = computed(() => {
		return !filePath.value;
	})

	const validType = ['pdf', 'html'];

	const contentType = ref('')

	function setContent(newPath, newEnPath, newType) {
		if (newPath === '') {
			filePath.value = newPath;
			contentType.value = '';
			return
		}
		if (!validType.includes(newType)) {
			throw new Error('contentType not valid');
		}
		filePath.value = newPath;
		fileEnPath.value = newEnPath;
		contentType.value = newType;
	}

	const currentType = computed(() => {
		return contentType.value;
	})

	const currentFilePath = computed(() => {
		if (settingsStore.currentLanguage === 'en') {
			return fileEnPath.value;
		}
		return filePath.value;
	})

	return {isEmpty, currentFilePath, currentType, setContent};
})
