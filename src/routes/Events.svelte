<script>
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


<div class="w-100 flex flex-column h-100">
  <div class="h3 h4-ns w-100"></div>
  <div class="w-100 flex flex-column justify-center items-center">
    <h1>Our Events</h1>
	  <p class="f3 mb4 w-80">
		  Our Meetups cover a variety of topics such as the technical details of various Web3 platforms (Ethereum/IPFS/Whisper), as well as more general topics such as 	decentralised trust systems and the social/cultural implications of decentralised/distributed systems.
	  </p>
  </div>
  <div class="w-100 h3 flex justify-center items-center">
  <div class="w-50 flex justify-between"  >
	  {#each cities as city}
      <div class:active="{current === city.name}" class="f3 dim pointer lh-copy" id="{city.name}" on:click={handleClick}> {city.name} </div>
	  {/each}
    </div>
  </div>
  <svelte:component this={selected.component} />
</div>





