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
	import Blogs from './routes/Blogs.svelte';
	import Form from './routes/Form.svelte';
	import Thanks from './routes/Thanks.svelte';

	

	const routes = {
    '/': LandingPage,
 
		'/Board': Humans,
		
		'/Events': Events,

		'/Blogs': Blogs,

		'/ContactForm': Form,

		'/Thanks' : Thanks,
}
</script>


<div class="black-80 lh-copy h-100 w-100 flex flex-row flex-wrap">
	<NavBar class="w-100"/>
		<div class="w-100">
			<Router {routes} />
		</div>
	<Footer class="w-100" />
</div>




 