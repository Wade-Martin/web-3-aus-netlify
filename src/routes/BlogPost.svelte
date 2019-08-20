<script>
import { createEventDispatcher } from 'svelte';
import { fade } from 'svelte/transition';

const dispatch = createEventDispatcher();

export let post;

</script>

<div in:fade out:fade>
  <button on:click='{() => dispatch("close")}'>Go Back</button>
  <h1>{post.title}</h1>
  <article>{@html `${post.content}`}</article>
</div>
