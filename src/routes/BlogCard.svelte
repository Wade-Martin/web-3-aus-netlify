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

<div on:click={returnPost} class=" w-100 w-90-l flex flex-column shadow-3 mv4">
  <div class="flex ml2-l items-start items-center-ns h3 h4-m h4-l f5 f3-m f3-l ph1 ph2-ns ph3-m">{author}<br>{formattedDate}</div>
  <div class="w-100 ph1-ns overflow-hidden h4 h5-m h5-l self-center">
    <img class="w-100" src={poster} alt="blog poster image">
  </div>
  <div class="lh-title ml2-l flex items-center h4 f5 f3-m f3-l overflow-hidden ph1 ph2-ns ph3-m">{title}</div>
</div>
