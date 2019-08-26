<script>
  import { fade } from 'svelte/transition';
  import Melbourne from './Melbourne.svelte';
  import Sydney from './Sydney.svelte';
  import Brisbane from './Brisbane.svelte';
  
  const cities = [
		{ name: 'Melbourne', component: Melbourne },
		{ name: 'Sydney', component: Sydney },
		{ name: 'Brisbane',  component: Brisbane }
  ];
  
  let selected = cities[0];
  let current = 'Melbourne';
  
  const handleClick = (event) => {
    selected = cities.find( city => {
      return city.name === event.target.id 
    });
    current = event.target.id;
  }

</script>

<style>
.active {
  border-bottom: .25rem solid  rgba( 0, 0, 0, .9 );
}
</style>

<div transition:fade class="w-100 h-100 flex">
  <div class="w-100 flex flex-column h-100">
    <div class="w-100 flex flex-column justify-center items-center">
      <h1>Our Events</h1>
	    <p class="f5 f4-m f3-l tc mb4-l w-80-l w-90">
		    Our Meetups cover a variety of topics such as the technical details of various Web3 platforms (Ethereum/IPFS/Whisper), as well as more general topics such as 	decentralised trust systems and the social/cultural implications of decentralised/distributed systems.
	    </p>
    </div>
    <div class="w-100 flex justify-center items-center">
    <div class="w-90  w-75-m w-50-l flex justify-between"  >
	    {#each cities as city}
        <div class:active="{current === city.name}" class="f5 f4-m f3-l ma1 dim pointer lh-copy" id="{city.name}" on:click={handleClick}> {city.name} </div>
	    {/each}
      </div>
    </div>
    <svelte:component this={selected.component} />
  </div>

</div>


