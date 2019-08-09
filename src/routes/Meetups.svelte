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

<script>
  import {link} from 'svelte-spa-router'
  import axios from 'axios';
  import jsonp from 'jsonp';
  import EventCard from './EventCard.svelte'

  let events = {
    loaded: false,
    data: null
  }

  const getMelbEvents = async () => {
    await jsonp('https://api.meetup.com/Ethereum-Melbourne/events?page=3&sig_id=225203890', null, (err, data) => {
      if (err) {
        console.error(err.message);
      } else {
        events.data = data.data;
        events.loaded = true;
        console.log('events.data:', events.data)
      }
    });
    
  }

   const getSydEvents = async () => {
    // events = await axios.get('https://api.meetup.com/Web3-Melbourne/events?key=' + process.env.MEETUP_API_KEY + '&sign=true&page=6');
  }
  
   const getBrisEvents = async () => {
    // events = await axios.get('https://api.meetup.com/Web3-Melbourne/events?key=' + process.env.MEETUP_API_KEY + '&sign=true&page=6');
  }
</script>



    
{#if !events.loaded}
  <div class="container">
    <div class="flex-container-location-select">
      <h2>Upcoming Events</h2>
      <div>
        <h3>Please select your City</h3>
      </div>
      <div class="selectLocation">
        <p on:click={getMelbEvents}>Melbourne</p>
        <p on:click={getSydEvents}>Sydney</p>
        <p on:click={getBrisEvents}>Brisbane</p>
      </div>
    </div>
  </div>
{:else}
  <div class="container">
    <div class="flex-container">
      <h2>Upcoming Events</h2>
      <div class="flex-events">
	      {#each events.data as event }
		      <EventCard {...event}/>
	      {/each}
      </div>
    </div>
  </div>
{/if}
