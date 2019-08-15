<script>
  import axios from 'axios';
  import { fly } from 'svelte/transition';
  import { quintOut } from 'svelte/easing';
  import moment from 'moment';

  const getWeb3Blog = async () => {
    let response = await axios.get('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/web3-australia')
    let blogData = await response.data;
    console.log(blogData)
    if (blogData.status == "ok") {
      return blogData;
		} else {
			throw new Error(text);
		}
  }

  let web3Promise = getWeb3Blog();

  const getFlexBlog = async () => {
    let response = await axios.get('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/flex-dapps')
    let blogData = await response.data;
    console.log(blogData)
    if (blogData.status == "ok") {
      return blogData;
		} else {
			throw new Error(text);
		}
  }

  let flexPromise = getFlexBlog();
</script>

<style>
  .main {
    width: 90%;
    margin-left: 50px;
    margin-top: 50px;
    font-family: 'Space Mono', monospace;
    display: flex;
    border-top: 1px rgba(48, 48, 48, 0.166) solid;

  }

  .blogs {
		display: grid;
    width: 60%;
		grid-template-columns: 1fr;
    grid-template-rows: auto;
		grid-gap: 15px;
    margin-top: 50px;
	}
  
  .blog-group {
    display: flex;
    flex-direction: column;
    margin-left: 25px;
    width: 50%;
    margin-top: 50px;
    padding: 10px;
  }

  h1 {
    margin-top: 25px;
    width: 100%;
    display: flex;
    justify-content: center;  
  }

  .blog {
    border-radius: 7.5px;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 400px;
    width: 100%; 
  }

  .blog-heading {
    padding: 10px;
    max-height: 25%;
  }

  .blog-text {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    max-height: 40%;
    padding: 10px;
  }

  .blog-img {
    overflow: hidden;
    height: 60%;  
   }

  img {
     width: 100%;
  }

  
</style>
<h1>Our Blogs</h1>
<div class="main">

{#await web3Promise}
	<p>...waiting</p>
{:then blogData}
  <div class="blogs" >
	  {#each blogData.items as post, i}
      <div class="blog" transition:fly="{{
        delay: 250, 
        duration: 1000,
        x: -500,
        opacity: 0.5,
        easing: quintOut
      }}">
        <div class="blog-heading" >
          <p>{post.author}</p>
          <p>{moment(post.pubDate).format("MMMM Do YYYY")}</p>
		    </div>
        <div class="blog-img">
          <img src="{post.thumbnail}" alt="post thumbnail image">
        </div>
        <div class="blog-text">
          <h3><a href={post.link}>{post.title}</a></h3>
        </div>
      </div>
	  {/each}
  </div>
  <div class="blog-group">
    <h2> <a href="{blogData.feed.link}">{blogData.feed.title}</a></h2>
    <!-- <p>{blogData.feed.description.split('- Medium')[0]}</p> -->
  </div>
  
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
</div>
<div class="main">
{#await flexPromise}
	<p>...waiting</p>
{:then blogData}
  <div class="blogs" transition:fly="{{
        delay: 250, 
        duration: 1000,
        x: -500,
        opacity: 0.5,
        easing: quintOut
      }}">
	  {#each blogData.items as post, i}
		  <div class="blog">
        <div class="blog-heading" >
          <p>{post.author}</p>
          <p>{moment(post.pubDate).format("MMMM Do YYYY")}</p>
		    </div>
        <div class="blog-img">
          <img src="{post.thumbnail}" alt="post thumbnail image">
        </div>
        <div class="blog-text">
          <h3><a href={post.link}>{post.title}</a></h3>
        </div>
      </div>
	  {/each}
  </div>
  <div class="blog-heading">
    <h2> <a href="{blogData.feed.link}">{blogData.feed.title}</a></h2>
    <!-- <p>{blogData.feed.description.split('- Medium')[0]}</p> -->
  </div>
  
{:catch error}
	<p style="color: red">{error.message}</p>
{/await}
</div>

