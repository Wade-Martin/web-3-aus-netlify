<script>
	import Router from 'svelte-spa-router';
	import NavBar from './NavBar.svelte';
	import Footer from './Footer.svelte';
	import Home from './routes/Home.svelte';
	import Humans from './routes/Humans.svelte';

	const routes = {
    '/': Home,
 
    '/board': Humans, 
}

</script>

<style>
</style>

<NavBar />
<Router {routes} />
