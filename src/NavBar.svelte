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

<nav class="top-0 fixed w-100 h4 bg-white flex items-center">
  <h3 class="w-25 dim ml6"><a href="/" use:link >Web3 Australia</a></h3>
  <div class="flex-auto w-75 tr mr6">
    <a class="dim" href="/Events" use:link>Events</a>
    <a class="dim" href="/Board" use:link>Humans</a>
    <a class="dim" href="/Blogs" use:link>Blogs</a>
    <a class="dim" href="/ContactForm" use:link>Contact Us</a>
  </div>
</nav>
