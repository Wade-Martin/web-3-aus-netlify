<script>
  import {link} from 'svelte-spa-router'
  import jsonp from 'jsonp';
  import EventCard from './EventCard.svelte'

  export let events;

</script>

<div class="flex flex-column justify-center items-center w-100 vh-100">
  <div class="flex-container-location-select h5">  
    <div class="flex flex-wrap h-100">
	    {#each events as event }
		    <EventCard event={event} />
	    {/each}
    </div>
  </div>
</div>