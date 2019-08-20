<script>
  import jsonp from 'jsonp';
  import EventCard from './EventCard.svelte';
  import { onMount } from 'svelte';
  
  let loaded = false;
  let meetups = [];

  let melbMeetups = [
    { 
      name: 'Ethereum-Melbourne',
      sig_id: '225203890',
      data: null
    },
    // {
    //    name: 'Melb-Other',
    //    sig_id: '',
    //    data: null
    // }
  ];

  onMount(()=> {
    melbMeetups.forEach(async (meetup) => {
      await jsonp(`https://api.meetup.com/${meetup.name}/events?page=3&sig_id=${meetup.sig_id}`, null, (err, data) => {
        if (err) {
          console.error(err.message);
        } else {
          meetups.push(data.data);
          loaded = true
        }
      });
    })
  });

</script>


{#if !loaded}
  <div class="w-100 vh-100 flex f1 justify-center items center">
    ....loading Melbourne Meetups.
  </div>
{:else}
  <div class="vh-100">
    <div class="flex flex-column justify-center items-center w-100"> 
      <h1 class="f3 w-100 mt4 flex justify-center items-center"> Ethereum Melbourne Meetup</h1> 
      <div class="flex flex-wrap">
	      {#each meetups[0] as meetup }
		      <EventCard meetup={meetup} />
	      {/each}
      </div>
    </div>
    <div class="flex flex-column justify-center items-center w-100 ma2"> 
      <h1 class="f3 w-100 flex justify-center items-center h3"> Other Melbourne Meetup</h1> 
      <div class="flex flex-wrap h-100">
       <p>other melb meetup here</p> 
	      <!-- {#each events[1] as event }
		      <EventCard event={event} />
	      {/each} -->
      </div>
    </div>
  </div>
{/if}
