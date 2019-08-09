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

	let locations = [
    { id: 'Select Your City'},
		{ id: 'Melbourne'},
		{ id: 'Sydney'},
		{ id: 'Brisbane'}
	];

	let selected;

  const getEvents = async () => {
    switch (selected) {
      case 'Melbourne':
        await jsonp('https://api.meetup.com/Ethereum-Melbourne/events?page=3&sig_id=225203890', null, (err, data) => {
          if (err) {
            console.error(err.message);
          } else {
            events.data = data.data;
            events.loaded = true;
            console.log('events.data:', events.data)
          }
        }); 
        break;
      case 'Sydney':
          console.log('call sydney meetup api request')
        break;
      case 'Brisbane':
          console.log('call brisbane meetup api request')
        break;
      default:
          console.log('this is the default')
    }
  };

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
      <div class="selectLocation">
        <select bind:value={selected} on:change="{getEvents}">
		      {#each locations as location}
			      <option value={location.id}>
				      {location.id}
			      </option>
		      {/each}
        </select> 
      </div>
    </div>
  </div>
{:else}
  <div class="container">
    <div class="flex-container-location-select">
      <h2>Upcoming Events</h2>
      <div class="selectLocation">
        <select bind:value={selected} on:change="{getEvents}">
		      {#each locations as location}
			      <option value={location.id}>
				      {location.id}
			      </option>
		      {/each}
        </select>  
      </div>
    </div>
    <div class="flex-events">
	    {#each events.data as event }
		    <EventCard {...event}/>
	    {/each}
    </div>
  </div>
{/if}
