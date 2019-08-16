<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/tachyons@4.10.0/css/tachyons.min.css"/>
</svelte:head>

<script>
	import Router from 'svelte-spa-router';
	import NavBar from './NavBar.svelte';
	import Footer from './Footer.svelte';
	import LandingPage from './routes/LandingPage.svelte';
	import Humans from './routes/Humans.svelte';
	import Events from './routes/Events.svelte';
	import Meetups from './routes/Meetups.svelte';
	import Blog from './routes/Blog.svelte';
	import Form from './routes/Form.svelte';

	const routes = {
    '/': LandingPage,
 
		'/Board': Humans,
		
		'/Events': Events,

		'/Blog': Blog,

		'/ContactForm': Form,
}
</script>

<style>
</style>



<NavBar />
	<div class="w-100 bg-white"></div>
	<Router {routes} />
<Footer />


 