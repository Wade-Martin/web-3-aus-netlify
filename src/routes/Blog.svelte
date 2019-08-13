<script>
  import axios from 'axios';
  import { slide, fade } from 'svelte/transition';
  import moment from 'moment';

  const getBlog = async () => {
    let response = await axios.get('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/flex-dapps')
    let blogData = await response.data;
    console.log(blogData)
    if (blogData.status == "ok") {
      return blogData;
		} else {
			throw new Error(text);
		}
  }

  let promise = getBlog();
</script>

<style>
  .main {
    width: 100%;
    font-family: 'Space Mono', monospace;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  
  .blog-heading {
    width: 80%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }

  .blogs {
		display: grid;
    width: 80%;
		grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr 1fr 1fr;
		grid-gap: 15px;
	}

  .blog {
    border-radius: 7.5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 600px;
  }

  .blog-text {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: center;
    max-height: 40%;
  }

  .blog-img {
    overflow: hidden;
    height: 60%;
    border-top-left-radius: 7.5px;
    border-top-right-radius: 7.5px;  
   }

  img {
     width: 100%;
  }

  
</style>

<div class="main">
{#await promise}
	<p>...waiting</p>
{:then blogData}
    <div class="blog-heading">
      <h1>Our Blogs</h1>
      <h2> <a href="{blogData.feed.link}">{blogData.feed.title}</a></h2>
      <p>{blogData.feed.description}</p>
    </div>
    <div class="blogs">
	    {#each blogData.items as post, i}
		    <div class="blog" transition:slide|local >
          <div class="blog-img">
            <img src="{post.thumbnail}" alt="post thumbnail image">
          </div>
          <div class="blog-text">
            <h3><a href={post.link}>{post.title}</a></h3>
            <p>Written by {post.author}</p>
            <p>{moment(post.pubDate).format("MMMM Do YYYY")}</p>
          </div>
		    </div>
	    {/each}
    </div>
  
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
</div>
