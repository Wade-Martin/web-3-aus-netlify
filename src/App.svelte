<script>
	import Router from 'svelte-spa-router';
	import NavBar from './NavBar.svelte';
	import Footer from './Footer.svelte';
	import Home from './routes/Home.svelte';
	import Humans from './routes/Humans.svelte';
	import Events from './routes/Events.svelte'

	const routes = {
    '/': Home,
 
		'/board': Humans,
		
		'/events': Events,
		
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
	

 