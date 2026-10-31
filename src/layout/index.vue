<script setup>
import { Icon } from "tdesign-icons-vue-next";
import { useLayoutStore, useSettingsStore } from "@/store/index.js"
import { uiText } from '@/util/uiText.js'
import { computed, ref, onMounted, onBeforeUnmount } from "vue"
import MainFrame from "@/components/MainFrame.vue";
import { useRoute, useRouter } from "vue-router";
import Aside from "@/components/Aside.vue";

const settingsStore = useSettingsStore()
const text = computed(() => uiText[settingsStore.currentLanguage])
const layoutStore = useLayoutStore()
const customerInfo = ref(null)

onMounted(() => {
	const script = document.createElement('script')
	script.src = `${import.meta.env.BASE_URL}Data/Customers.js`
	script.onload = () => {
		customerInfo.value = window.Customers?.[0] ?? null
		script.remove()
	}
	script.onerror = () => script.remove()
	document.head.appendChild(script)
})

const router = useRouter();
const route = useRoute();

const themeChange = (e) => {
	settingsStore.setTheme(e)
}

const languageChange = (e) => {
	settingsStore.setLanguage(e)
}

const menuValue = computed(() => {
	return route.name
})

const menuChanged = (e) => {
	router.push({name:e, params: {  } })
}

const jumpToGithub = () => {
	window.open('https://github.com/young-zy/eaipViewer');
}

const handlePointerMove = (e) => {
	if (!layoutStore.resizing) return
	layoutStore.setSidebarWidth(Math.max(100, Math.min(e.clientX, window.innerWidth - 200)))
}

const stopResizing = () => {
	if (!layoutStore.resizing) return
	layoutStore.setResizing(false)
	document.documentElement.classList.remove('sidebar-resizing')
	window.removeEventListener('pointermove', handlePointerMove)
	window.removeEventListener('pointerup', stopResizing)
	window.removeEventListener('pointercancel', stopResizing)
}

const startResizing = (e) => {
	if (e.button !== 0) return
	e.preventDefault()
	layoutStore.setResizing(true)
	document.documentElement.classList.add('sidebar-resizing')
	window.addEventListener('pointermove', handlePointerMove)
	window.addEventListener('pointerup', stopResizing)
	window.addEventListener('pointercancel', stopResizing)
}

onBeforeUnmount(stopResizing)

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
        :style="{width: layoutStore.sidebarWidth + 'px'}"
      >
        <Aside />
      </t-aside>
      <div
        class="resizer"
        role="separator"
        aria-orientation="vertical"
        @pointerdown="startResizing"
      />
      <t-layout class="reader-layout">
        <t-content class="content">
          <MainFrame />
        </t-content>
        <t-footer class="footer">
          <div v-if="customerInfo" class="data-info">
            {{ customerInfo.DataName }} · {{ customerInfo.DataVersion }} · {{ text.published }}: {{ customerInfo.PublishDate }} · {{ text.effective }}: {{ customerInfo.EffectiveShow }}
          </div>
          <div>
            Copyright © 2024-{{ new Date().getFullYear() }}. {{ text.copyright }}
          </div>
          <div class="source-link">
            {{ text.source }}
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
	.resizer {
		flex: 0 0 auto;
		width: 32px;
		cursor: col-resize;
		touch-action: none;
		display: flex;
		justify-content: center;
		align-items: center;
		background: var(--td-bg-color-container, #fff);
		border-right: 1px solid var(--component-border);
		box-sizing: border-box;
	}
	.resizer::before {
		content: '';
		width: 6px;
		height: 48px;
		border-radius: 4px;
		background: var(--td-brand-color);
	}
	.resizer:hover::before, :global(.sidebar-resizing) .resizer::before {
		background-color: var(--td-brand-color-hover, var(--td-brand-color));
	}
	:global(.sidebar-resizing), :global(.sidebar-resizing *) {
		user-select: none !important;
		cursor: col-resize !important;
	}
	.language-picker {
		margin-right: 8px;
	}

	.aside {
		display: flex;
		flex: 0 0 auto;
		box-sizing: border-box;
		border-right: 1px solid var(--component-border);
		height: calc(100vh - 57px);
		width: 232px;
		min-width: 0;
		overflow-x: auto;
		overflow-y: hidden;
	}

	.content {
		min-width: 0;
		width: 100%;
	}
	.reader-layout {
		min-width: 0;
		flex: 1;
	}

	:deep(.t-menu__operations){
		min-width: 260px;
	}
	.footer {
		display: flex;
		flex-direction: column;
		align-items: center;
		max-height: 70px;
		padding: 4px 8px;
		line-height: 18px;
		.data-info {
			max-width: 100%;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		.source-link {
			display: flex;
			align-items: center;
			gap: 4px;
		}
		.github-icon {
			cursor: pointer;
			align-self: center;
		}
	}
</style>
