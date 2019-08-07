<style>
  .navbar {
    height: 2rem;
    margin-bottom: 0;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, .05);
    border: none;
    position: fixed;
    top: 0;
    z-index: 250;
    width: 100%;
    padding: .74rem 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  nav {
    font-family: 'Space Mono', monospace;;
    text-align: center;
    width: 60%;
    display: flex;
    justify-content: space-between;
  }

  a {
    text-decoration: none;
    color: #212529;
  }
</style>

<script>
  import {link} from 'svelte-spa-router'
</script>

<div class="navbar">
  <nav>
    <a href="/" use:link class="navbar-brand">Web3 Australia</a>
    <div class="main-nav">
      <a href="/board" use:link>Humans</a>
    </div>
  </nav>
</div>
