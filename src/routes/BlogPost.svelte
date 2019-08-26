<script>
import { createEventDispatcher } from 'svelte';
import { fade } from 'svelte/transition';

const dispatch = createEventDispatcher();

export let post;

</script>



<div transition:fade class="w-100 w-90-m w-90-l">
  <button on:click='{() => dispatch("close")}'>Go Back</button>
  <p class="f4 f3-m f3-l">{post.title}</p>
  <article class=" self-center overflow-scroll overflow-scroll-ls overflow-auto-m overflow-auto-l">{@html `${post.content}`}</article>
</div>
