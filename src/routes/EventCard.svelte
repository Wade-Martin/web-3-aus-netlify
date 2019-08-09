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
  export let name;
  export let group;
  export let link;
  export let local_date;
  export let local_time;
  export let venue;
  export let how_to_find_us; 
</script>

<div class="event-card">
  <div>
    <h2 class="day">01</h2>
    <p>January</p >
    <h3><a href={link}>{name}</a></h3>
    <p>18:00 - 21:00</p>
    <p>@ {venue.name}</p>
  </div>
</div>