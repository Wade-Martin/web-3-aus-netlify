<style>
  nav {
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, .05);
    height: 9%;
  }

  a {
    text-decoration: none;
    color: #212529;
  }
  
</style>

<script>
  import {link} from 'svelte-spa-router'
</script>

<nav class="top-0 fixed w-100 bg-white flex items-center">
  <h3 class="w-25 grow ml6"><a href="/" use:link >Web3 Australia</a></h3>
  <div class="flex-auto w-75 tr mr6">
    <a class="dim" href="/events" use:link>Events</a>
    <a class="dim" href="/board" use:link>Humans</a>
    <a class="dim" href="/Blog" use:link>Blog</a>
  </div>
</nav>
