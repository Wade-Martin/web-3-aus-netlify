<script>
  import { onMount } from 'svelte';
  import { slide, fade } from 'svelte/transition';
  import {link} from 'svelte-spa-router';
  import jsonp from 'jsonp';
  

	let events = [];

	onMount(async () => {
    await jsonp('https://api.meetup.com/Ethereum-Melbourne/events?page=5&sig_id=225203890', null, (err, data) => {
      if (err) {
        console.error(err.message);
      } else {
        events = data.data;
        console.log('events:', events)
      }
    });
  });
</script>

<style>
	.container {
    font-family: 'Space Mono', monospace;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .events {
		width: 85%;
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		grid-gap: 8px;
	}

	.event-box {
		width: 100%;
    border: 1px solid black;
    border-radius: 7.5px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: rgb(234, 234, 243);
	}

  .large {
    font-size: 72px;
  }
</style>

<div class="container">
  <h1>Upcoming Events</h1>
  <div class="events">
	  {#each events as event, i}
		  <div transition:slide|local class="event-box">
		  	<h2>01</h2>
        <p>January</p >
        <h3><a href={event.link}>{event.name}</a></h3>
        <p>18:00 - 21:00</p>
        <p>@ {event.venue.name}</p>
		  </div>
	  {:else}
	  	<h2 out:fade >Loading...</h2>
	  {/each}
  </div>
</div>
