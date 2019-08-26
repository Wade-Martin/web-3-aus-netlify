<script>
  import {link} from 'svelte-spa-router'
  
  let dnDropdown = true;
  let dbDropdown = false;
  

  const toggleDropdown = () => {
    console.log('toggleDropdown', dnDropdown)
    dnDropdown = !dnDropdown;
    dbDropdown = !dbDropdown;
  }

</script>


<nav class="top-0 fixed w-100 h3 bg-white flex flex-column shadow-2 z-1">
  <div class="w-100 h-100 flex">
    <div class="w-10"></div>
      <div class="flex dn h-100 w-80">
        <div class="w-75 flex dn-l items-center">
          <div class="overflow-hidden">
            <svg on:click={toggleDropdown} class="z-1 w2 h2 dn-l bg-center v-mid pointer" viewBox="0 0 32 32"  xmlns="http://www.w3.org/2000/svg" >
              <path d="M4,   10h24c1.104,0,2-0.896,2-2s-0.896-2-2-2H4C2.896,6,2,6.896,2,8S2.896,10,4,10z M28,14H4c-1.104,0-2,0.896-2,2  s0.896,2,2,2h24c1.104,0,2-0.896, 2-2S29.104,14,28,14z M28,22H4c-1.104,0-2,0.896-2,2s0.896,2,2,2h24c1.104,0,2-0.896,2-2  S29.104,22,28,22z"/>
            </svg>
            <div class:dn={dnDropdown} class:db={dbDropdown} class="absolute mr6 dn-l w4 shadow-3 z-1 bg-white black-80 no-underline">
              <a class="dim w-100 pa1 db tl black-80 no-underline" href="/" use:link>Home</a>
              <a class="dim w-100 pa1 db tl black-80 no-underline" href="/Events" use:link>Events</a>
              <a class="dim w-100 pa1 db tl black-80 no-underline" href="/Board" use:link>Humans</a>
              <a class="dim w-100 pa1 db tl black-80 no-underline" href="/Blogs" use:link>Blogs</a>
              <a class="dim w-100 pa1 db tl black-80 no-underline" href="/ContactForm" use:link>Contact Us</a>
            </div>
          </div>
        </div>
      <div class="dim h-100 w-90 w-75-l flex items-center justify-end justify-start-l"><a class="f5 f5-ns f3-m f3-l black-80 no-underline" href="/" use:link >Web3 Australia</a></div>
      <div class="w-100 h-100 items-center dn dn-ns dn-m flex-l justify-between">
        <div class="w-10"></div>
          <a class="dim ma1 black-80 no-underline" href="/" use:link>Home</a>
          <a class="dim ma1 black-80 no-underline" href="/Events" use:link>Events</a>
          <a class="dim ma1 black-80 no-underline" href="/Board" use:link>Humans</a>
          <a class="dim ma1 black-80 no-underline" href="/Blogs" use:link>Blogs</a>
          <a class="dim ma1 black-80 no-underline" href="/ContactForm" use:link>Contact Us</a>
      </div>
    </div>
  </div>
</nav>






