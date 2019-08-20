<script>
  import { createEventDispatcher } from 'svelte';
  import moment from 'moment';
  export let poster;
  export let author;
  export let date;
  export let title;
  export let link;
  export let post;

  const dispatch = createEventDispatcher();

  const returnPost = () => {
		dispatch('click', {
			post: post
		});
	}

  let formattedDate = moment(date).format("MMMM Do YYYY")
  
</script>

<div on:click={returnPost} class="w-80 flex flex-column shadow-3 mv4">
  <div class="flex items-start items-center-ns h4 f3-ns f4-l ph1 ph2-ns ph3-m">{author}<br>{formattedDate}</div>
  <div class="w-100 ph1-ns overflow-hidden h5">
    <img class="w-100" src={poster} alt="blog poster image">
  </div>
  <div class="lh-title flex items-start items-center-ns h4 f4 overflow-hidden ph1 ph2-ns ph3-m">{title}</div>
</div>
