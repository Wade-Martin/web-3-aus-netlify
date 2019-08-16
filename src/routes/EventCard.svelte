<!-- <style>
  .event-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 30%;
    margin-left: 10px;
    padding-left: 10px;
  }

</style> -->

<script>
  import { onMount } from 'svelte';
  export let event;

  onMount(() => {
    console.log(event)
  })

</script>

<div class=" flex flex-column h-100 mr3 mt3 shadow-3 bg-white mw5">
  <div class="h-50 flex flex-column items-center content-end">
    <div class="flex h-50 w-75 items-end">
      <div class="f1">
        17
      </div>
      <div class="f4 pa1">
        October
      </div>
    </div>
    <a class="pa3 w-90 h-50 f4 no-underline black-80" href={event.link}>{event.name}</a>
  </div>
  <div class="bt h-50 flex flex-column justify-center content-center">
    <div class="h1 flex w-100 justify-between pa2 h-50 items-center">
      <img class="w-10 tc"  src="./location-pin.svg" alt="location pin">
      <p class="w-80 f4">{event.venue.name}</p>
    </div>
    <div class="h1 flex w-100 justify-between pa2 h-50 items-center">
      <img class="w-10 tc" src="./wall-clock.svg" alt="clock">
      <p class="w-80 f4">6pm</p>
    </div>
  </div>
</div>
