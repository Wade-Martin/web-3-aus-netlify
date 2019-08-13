<svelte:head>
	<link rel="stylesheet" href="https://unpkg.com/tachyons@4.10.0/css/tachyons.min.css"/>
</svelte:head>

<script>
	import Router from 'svelte-spa-router';
	import NavBar from './NavBar.svelte';
	import Footer from './Footer.svelte';
	import Home from './routes/Home.svelte';
	import Humans from './routes/Humans.svelte';
	import Events from './routes/Events.svelte';
	import Meetups from './routes/Meetups.svelte';
	import Blog from './routes/Blog.svelte';

	const routes = {
    '/': Home,
 
		'/board': Humans,
		
		'/events': Events,

		'/meetups': Meetups,

		'/Blog': Blog,
		
}

</script>

<style>
	.main {	
		overflow: auto;
  	position: absolute;
  	top: 60px;
  	left: 0;
  	right: 0;
  	bottom: 0;		
	}
</style>

<NavBar />
<div class="main">
	<Router {routes} />
	<Footer />
</div>
	

 