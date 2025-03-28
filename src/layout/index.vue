<script setup>
import FileTree from "@/components/FileTree.vue";
import { Icon } from "tdesign-icons-vue-next";
import { useSettingsStore } from "@/store/index.js"
import { computed } from "vue"
import MainFrame from "@/components/MainFrame.vue";
import { useRoute, useRouter } from "vue-router";
import Aside from "@/components/Aside.vue";

const settingsStore = useSettingsStore()

const router = useRouter();
const route = useRoute();

const themeChange = (e) => {
	console.log("themeChange", e);
	settingsStore.setTheme(e)
}

const languageChange = (e) => {
	console.log("languageChange", e);
	settingsStore.setLanguage(e)
}

const menuValue = computed(() => {
	return route.name
})

const menuChanged = (e) => {
	console.log("menuChanged", e);
	router.push({name:e, params: {  } })
}

const jumpToGithub = () => {
	window.open('https://github.com/young-zy/eaipViewer');
}

</script>

<template>
  <t-layout>
    <t-header>
      <t-head-menu
        :value="menuValue?.toString()"
        height="120px"
        expand-type="popup"
        @change="menuChanged"
      >
        <template #logo>
          <img
            width="136"
            class="logo"
            :src="'../img/logo-copy.6608b40d.png'"
            alt="logo"
          >
        </template>
        <t-menu-item value="AIP">
          AIP
        </t-menu-item>
        <t-menu-item value="AMDT">
          AMDT
        </t-menu-item>
        <t-menu-item value="SUPs">
          SUPs
        </t-menu-item>
        <t-menu-item value="AICs">
          AICs
        </t-menu-item>
        <t-menu-item value="NOTAM">
          NOTAM
        </t-menu-item>
        <template
          #operations
        >
          <div class="language-picker">
            <t-radio-group
              :value="settingsStore.currentLanguage"
              variant="default-filled"
              default-value="light"
              @change="languageChange"
            >
              <t-radio-button value="cn">
                中文
              </t-radio-button>
              <t-radio-button value="en">
                English
              </t-radio-button>
            </t-radio-group>
          </div>
          <div class="theme-picker">
            <t-radio-group
              :value="settingsStore.currentTheme"
              variant="default-filled"
              default-value="light"
              @change="themeChange"
            >
              <t-radio-button value="light">
                <icon
                  name="sunny-filled"
                  size="medium"
                  :color="settingsStore.currentTheme === 'light' ? 'rgb(255, 189, 46)' : null"
                />
              </t-radio-button>
              <t-radio-button value="dark">
                <icon
                  name="moon-filled"
                  size="medium"
                  :color="settingsStore.currentTheme === 'dark' ? 'white' : null"
                />
              </t-radio-button>
            </t-radio-group>
          </div>
        </template>
      </t-head-menu>
    </t-header>
    <t-layout>
      <t-aside
        class="aside"
        style="border-top: 1px solid var(--component-border);"
      >
        <Aside />
      </t-aside>
      <t-layout>
        <t-content class="content">
          <MainFrame />
        </t-content>
        <t-footer class="footer">
          <div>
            Copyright @ 2024-{{ new Date().getFullYear() }}. All Rights Reserved
          </div>
          <div style="display: flex;">
            <p>
              Source:
            </p>
            <Icon
              size="16px"
              class="github-icon"
              name="logo-github-filled"
              @click="jumpToGithub"
            />
          </div>
        </t-footer>
      </t-layout>
    </t-layout>
  </t-layout>
</template>

<style scoped lang="less">
	.language-picker {
		margin-right: 8px;
	}

	.aside {
		display: flex;
		height: calc(100vh - 57px);
		width: 232px;
		overflow: auto;
	}

	.content {
		max-width:  calc(100vw - 232px);
	}

	:deep(.t-menu__operations){
		min-width: 260px;
	}
	.footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-height: 70px;
		padding: 8px;
		.github-icon {
			cursor: pointer;
			align-self: center;
		}
	}
</style>
