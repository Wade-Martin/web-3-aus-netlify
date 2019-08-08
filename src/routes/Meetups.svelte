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

  .grid-container {
    width: 60%;
    display: flex;
    justify-content: center;
   }

  .grid {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .card {
    border: black 1px solid;
    width: 100%;
    height: 250px;
    margin: 10px;
    padding-left: 10px; 
  }

</style>

<script>
  import {link} from 'svelte-spa-router'
  import axios from 'axios';
  import jsonp from 'jsonp';

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


<h2>Upcoming Events</h2>
<div class="selectLocation">
  <p on:click={getMelbEvents}>Melbourne Events</p>
  <p on:click={getSydEvents}>Sydney Events</p>
  <p on:click={getBrisEvents}>Brisbane Events</p>
</div>
    
{#if !events.loaded}
  <div>
    <p>Please select your City</p>
  </div>
{:else}
  <div class="container">
    <div class="grid-container">
      <div class="grid">
	      {#each events.data as { name, group, link, description, local_date, local_time, venue, how_to_find_us } }
		      <div class="card">
            <h3>{group.name}</h3>
            <p>Meetup: {name} <br>@ {venue.name} on {local_date} at {local_time}</p>  
            <a target="_blank" href="{link}">{link}</a>
          </div>
	      {/each}
      </div>  
    </div>
  </div>
{/if}
