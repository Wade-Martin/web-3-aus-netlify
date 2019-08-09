<script>
  import {link} from 'svelte-spa-router'
  import axios from 'axios';
  import jsonp from 'jsonp';
  import EventCard from './EventCard.svelte'

  export let events = {
    loaded: false,
    data: null
  };


</script>

<style>
  .container {
    font-family: 'Space Mono', monospace;;
    width: 100%;
    padding: .74rem 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .flex-container {
    width: 60%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
   }

   .flex-container-location-select {
    width: 60%;
    display: flex;
    flex-direction: column;
    align-items: center;
   }

   .selectLocation {
    display: flex;
    width: 100%;
    align-items: center;
    justify-content: space-evenly; 
  }

  .flex-events {
    display: flex;
    flex-wrap: wrap;
  }
</style>

<div class="container">
  <div class="flex-container-location-select">  
    <h2>Upcoming Events</h2>
    {#if !events.loaded}
      <p>Loading...</p>
    {:else}
      <div class="flex-events">
	      {#each events.data as event }
		      <EventCard {...event}/>
	      {/each}
      </div>
    {/if}
  </div>
</div>