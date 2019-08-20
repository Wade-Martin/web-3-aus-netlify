<script>
  import { fade } from 'svelte/transition';
  export let meetup;
</script>

<a transition:fade href={meetup.link} class="flex flex-column h-100 mr3 mt3 shadow-3 black-80 mw5 grow">
  <div class="flex h-5 flex-column items-center content-end">
    <div class="flex h-50 w-75 items-end">
      <div class="f1">
        17
      </div>
      <div class="f4 pa2">
        October
      </div>
    </div>
    <p class="pa3 w-90 h-50 f4 no-underline black-80" >{meetup.name}</p>
  </div>
  <div class="bt h4 flex flex-column justify-center content-center">
    <div class="h1 flex w-100 justify-between pa2 h-50 items-center">
      <img class="w-10 tc"  src="./location-pin.svg" alt="location pin">
      <p class="w-80 f4">{meetup.venue.name}</p>
    </div>
    <div class="h1 flex w-100 justify-between pa2 h-50 items-center">
      <img class="w-10 tc" src="./wall-clock.svg" alt="clock">
      <p class="w-80 f4">6pm</p>
    </div>
  </div>
</a>
