<script>
  import jsonp from 'jsonp';  
  import EventCard from './EventCard.svelte';
  import { onMount } from 'svelte';

 let loaded = false;
  let meetups = [];

  let brisEvents = [
    { 
      name: 'Ethereum-Brisbane',
      sig_id: '',
      data: null
    },
    {
      name: 'Bris-Other',
      sig_id: '',
      data: null
    }
  ];

  onMount(()=> {
    setTimeout(() => {
      console.log('test')
      loaded = true;
    }, 1500)

    // brisEvents.forEach(async (meetup) => {
    //   await jsonp(`https://api.meetup.com/${meetup.name}/events?page=3&sig_id=${meetup.sig_id}`, null, (err, data) => {
    //     if (err) {
    //       console.error(err.message);
    //     } else {
    //       meetups.push(data.data);
    //       console.log(meetups);
    //       loaded = true
    //     }
    //   });
    // })
  });
</script>


{#if !loaded}
  <div class="w-100 vh-100 flex f4 f3-m f2-l justify-center items center">
    ...loading Brisbane Meetups.
  </div>
{:else}
  <div class="vh-100">
    <div class="flex flex-column justify-center items-center w-100 h-50"> 
      <h1 class="f5 f4-m f3-l w-100 flex justify-center items-center h3"> Brisbane Meetup</h1> 
      <div class="flex flex-wrap h-100">
       <p>Brisbane meetup here</p> 
	      <!-- {#each meetups[0] as meetup }
		      <EventCard meetup={meetup} />
	      {/each} -->
      </div>
    </div>
    <div class="flex flex-column justify-center items-center w-100 h-50"> 
      <h1 class="f5 f4-m f3-l w-100 flex justify-center items-center h3"> Other Brisbane Meetup</h1> 
      <div class="flex flex-wrap h-100">
       <p>other Brisbane meetup here</p> 
	      <!-- {#each meetups[0] as meetup }
		      <EventCard meetup={meetup} />
	      {/each} -->
      </div>
    </div>
  </div>
{/if}  