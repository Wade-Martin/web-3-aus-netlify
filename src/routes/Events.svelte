<style>
  .tab {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: hidden;
    border: 1px solid #ccc;
    background-color: #f1f1f1;
  }

/* Style the buttons that are used to open the tab content */
  .tab button {
    background-color: inherit;
    float: left;
    border: none;
    outline: none;
    cursor: pointer;
    padding: 14px 16px;
    transition: 0.3s;
  }

/* Change background color of buttons on hover */
  .tab button:hover {
    background-color: #ddd;
  } 

/* Create an active/current tablink class */
  .tab button.active {
    background-color: #ccc;
  }

</style>

<script>
  import jsonp from 'jsonp';
  import Melbourne from './Melbourne.svelte';
  import Sydney from './Sydney.svelte';
  import Brisbane from './Brisbane.svelte';
  import { onMount } from 'svelte';
  
  const cities = [
		{ name: 'Melbourne', component: Melbourne },
		{ name: 'Sydney', component: Sydney },
		{ name: 'Brisbane',  component: Brisbane }
  ];

  let events = {
    loaded: false,
    data: null
  };
  
  let selected;

  const handleClick = (event) => {
    console.log('handling click')
    getMeetups(event)
  };

  onMount(async () => {
    selected = cities[0]
    await jsonp('https://api.meetup.com/Ethereum-Melbourne/events?page=3&sig_id=225203890', null, (err, data) => {
      if (err) {
        console.error(err.message);
      } else {
        events.data = data.data;
        events.loaded = true;
        console.log('events.data:', events.data)
      }
    }); 
  });
  
  const getMeetups = async (event) => {
    console.log('getting meetups')
    events.loaded = false;
    events.data = null;
    let city = event.target.id;
    switch (city) {
      case 'Melbourne':
        await jsonp('https://api.meetup.com/Ethereum-Melbourne/events?page=3&sig_id=225203890', null, (err, data) => {
          if (err) {
            console.error(err.message);
          } else {
            selected = cities[0];
            events.data = data.data;
            events.loaded = true;
            console.log('events.data:', events.data)
          }
        }); 
        break;
      case 'Sydney':
          selected = cities[1];
          console.log('call sydney meetup api request')
        break;
      case 'Brisbane':
          selected = cities[2];
          console.log('call brisbane meetup api request')
        break;
      default:
          console.log('this is the default')
    }
  };
</script>

<div class="tab">
	{#each cities as city}
    <button class="tablinks" id="{city.name}" on:click={handleClick}> Meetups in {city.name} </button>
	{/each}
</div>

{#if !events.loaded}
  <p>...fetching events</p>
{:else}
  <svelte:component this={selected.component} events={events.data}/>
{/if}
