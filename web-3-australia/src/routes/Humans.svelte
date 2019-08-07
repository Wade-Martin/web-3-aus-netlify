<script>
  import ProfileGrid from './ProfileGrid.svelte'
</script>

<style>

  @import url('https://fonts.googleapis.com/css?family=Space+Mono:400,400i,700,700i&display=swap');

  div {
    font-family: 'Space Mono', monospace;
    width: 100%;
    padding: .74rem 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .container {
    width: 60%;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  h1 {
		font-weight: 700;
    align-self: center;
	}


</style>


<div class="container">
  <h1>Committee of Management</h1>
  <p>The Web3 Australia’s committee of management totals 7 humans and includes academics, entrepreneurs, technologists and software developers.<p>
  <ProfileGrid />
</div>
