import { createRouter, createWebHashHistory } from 'vue-router';
import Layout from "@/layout/index.vue";
import MainFrame from "@/components/MainFrame.vue";

const routes = [
	{
		path: '/',
		component: Layout,
		redirect: to => {
			// the function receives the target route as the argument
			// we return a redirect path/location here.
			return { path: '/AMDT' }
		},
		children: [
			{
				path: 'AIP/',
				children: [
					{
						name: 'GEN',
						path: 'GEN/:id?',
						component: MainFrame,
						type: 'tree',
					},
					{
						name: 'ENR',
						path: 'ENR/:id?',
						component: MainFrame,
						type: 'tree'
					},
					{
						name: 'AD',
						path: 'AD/:id?',
						component: MainFrame,
						type: 'tree'
					},
				]
			},
			{
				name: 'AMDT',
				path: 'AMDT/:id?',
				component: MainFrame,
				type: 'tree'
			},
			{
				name: 'SUPs',
				path: 'SUPs/:id?',
				component: MainFrame,
				type: 'table'
			},
			{
				name: 'AICs',
				path: 'AICs/:id?',
				component: MainFrame,
				type: 'table'
			},
			{
				name: 'NOTAM',
				path: 'NOTAM/:id?',
				component: MainFrame,
				type: 'list'
			},
		]
	},
	{
		path: '/:pathMatch(.*)*',
		name: 'NotFound',
		redirect: to => {
			// the function receives the target route as the argument
			// we return a redirect path/location here.
			return { path: '/AMDT' }
		},
	}
]

export const router = createRouter({
	history: createWebHashHistory(),
	routes,
})
