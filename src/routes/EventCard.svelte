<style>
  .event-card {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    max-width: 30%;
    margin-left: 10px;
    padding-left: 10px;
    background: rgb(234, 234, 243)
  }

  .day {
    
  }
</style>

<script>
  import { onMount } from 'svelte';
  export let event;

  onMount(() => {
    console.log(event)
  })

</script>

<div class="event-card">
  <div>
    <h2 class="day">01</h2>
    <p>January</p >
    <h3><a href={event.link}>{event.name}</a></h3>
    <p>18:00 - 21:00</p>
    <p>@ {event.venue.name}</p>
    <p></p>
  </div>
</div>