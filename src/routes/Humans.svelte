<script>
  import { fade } from 'svelte/transition';
  import ProfileGrid from './ProfileGrid.svelte'
</script>

<div transition:fade class="w-100 flex flex-column items-center">
 <div class="h2-m h3-l w-100"></div>
  <div class="flex-column w-90 flex">
    <p class="b w-100 flex f4 f3-m f3-l">Committee of Management</p>
    <p class="f5 f4-m f3-l w-100 w-90">The Web3 Australia’s committee of management totals 7 humans and includes academics, entrepreneurs, technologists and software developers.<p>
  </div>
  <div class="w-90 w-80-l">
    <ProfileGrid />
  </div>
</div>

