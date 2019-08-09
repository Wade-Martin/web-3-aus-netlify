<script>
  import {link} from 'svelte-spa-router';
  import { onMount } from 'svelte';
  import axios from 'axios';
  import jsonp from 'jsonp';
  import Melbourne from './Melbourne.svelte';
  import Sydney from './Sydney.svelte';
  import Brisbane from './Brisbane.svelte';


  const cities = [
		{ name: 'Melbourne', component: Melbourne   },
		{ name: 'Sydney', component: Sydney },
		{ name: 'Brisbane',  component: Brisbane },
	];

  let selected = cities[0];
  
  const handleClick = () => {
    getEvents()
  }

  let events = {
    loaded: false,
    data: null
  }

  const getEvents = async () => {
    switch (selected.name) {
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

  onMount(getEvents())

</script>

<style>
  .tab {
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

/* Style the tab content */
  .tabcontent {
    display: none;
    padding: 6px 12px;
    border: 1px solid #ccc;
    border-top: none;
  }
</style>

<div class="tab">
	{#each cities as city}
    <button class="tablinks" onclick={handleClick}>{city.name}</button>
	{/each}
</div>

<svelte:component this={selected.component} events={events}/>
