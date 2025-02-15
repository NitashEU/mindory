declare module '@/components/*.vue' {
	import { DefineComponent } from 'vue'
	const component: DefineComponent<{}, {}, any>
	export default component
}