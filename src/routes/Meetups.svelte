<style>
  .selectLocation {
    display: flex;
    justify-content: space-between;
    align-items: center; 
  }

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
   }

  .flex {
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
    <div class="flex-container">
      <h2>Upcoming Events</h2>
      <div class="selectLocation">
        <h3 on:click={getMelbEvents}>Melbourne Events</h3>
        <h3 on:click={getSydEvents}>Sydney Events</h3>
        <h3 on:click={getBrisEvents}>Brisbane Events</h3>
      </div>
      <div>
        <h3>Please select your City</h3>
      </div>
    </div>
  </div>
{:else}
  <div class="container">
    <div class="flex-container">
      <h2>Upcoming Events</h2>
      <div class="flex">
	      {#each events.data as event }
		      <EventCard {...event}/>
	      {/each}
      </div>  
    </div>
  </div>
{/if}
