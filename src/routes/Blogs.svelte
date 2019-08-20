<script>
  import axios from 'axios';
  import BlogCard from './BlogCard.svelte';
  import BlogPost from './BlogPost.svelte';

  let viewWeb3Post;
  let viewFlexPost;

  const getWeb3Blog = async () => {
    let response = await axios.get('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/web3-australia')
    let blogData = await response.data;
    viewWeb3Post = blogData.items[0];
    console.log(blogData)
    if (blogData.status == "ok") {
      return blogData;
		} else {
			throw new Error(text);
		}
  }

  let web3Promise = getWeb3Blog();
  let content;
  let dnCards = false;
  let dnWeb3Post = true;
  let dnFlexPost = true;
  let selectedPost;

  const openFlexPost = (event) => {
    viewFlexPost = event.detail.post;
    dnCards = !dnCards;
    dnFlexPost = !dnFlexPost;
  }

   const openWeb3Post = (event) => {
    viewWeb3Post = event.detail.post;
    dnCards = !dnCards;
    dnWeb3Post = !dnWeb3Post;
  }

  const closeFlexPost = () => {
    dnCards = !dnCards;
    dnFlexPost = !dnFlexPost;
  }

   const closeWeb3Post = () => {
    dnCards = !dnCards;
    dnWeb3Post = !dnWeb3Post;
  }

  const getFlexBlog = async () => {
    let response = await axios.get('https://api.rss2json.com/v1/api.json?rss_url=https://medium.com/feed/flex-dapps')
    let blogData = await response.data;
    viewFlexPost = blogData.items[0];
    console.log(blogData)
    if (blogData.status == "ok") {
      return blogData;
		} else {
			throw new Error(text);
    }
  }

  let flexPromise = getFlexBlog();

</script> 

<div class="flex flex-column w-100 h-100">
  <div class="h3 h4-ns w-100"></div>
  <div class="flex justify-center">  
    <h1 class:dn={dnCards} class="w-75">Our Blogs</h1>
  </div>
  <div class="w-100 h-75 flex justify-center">
    <div class="w-80">
    {#await web3Promise}
	    <p>...waiting</p>
    {:then blogData}
      <div class="bt w-100 flex flex-row-l flex-column-reverse justify-center" >
        <div class="w-two-thirds-l self-center-l w-100" >
	      {#each blogData.items as post}
          <div class:dn={dnCards} >
            <BlogCard on:click={openWeb3Post} post={post} poster={post.thumbnail} author={post.author} title={post.title} link={post.link} date={post.pubDate} />
          </div>
	      {/each}
        </div>
        <div class:dn={dnWeb3Post}>
          <BlogPost on:close={closeWeb3Post} post={viewWeb3Post}/>
        </div>
        <div class="items-end-l w-third-l w-100 flex flex-column h-100">
          <h2 class:dn={dnCards} class="f4-m f4-ns f4" > <a class="black-80" href="{blogData.feed.link}">{blogData.feed.title}</a></h2>
        </div>
      </div>
    {:catch error}
	    <p style="color: red">{error.message}</p>
    {/await}
    {#await flexPromise}
	    <p>...waiting</p>
    {:then blogData}
      <div class="bt w-100 flex flex-row-l flex-column-reverse justify-center" >
        <div class="w-two-thirds-l self-center-l w-100" >
	      {#each blogData.items as post}
          <div class:dn={dnCards} >
            <BlogCard on:click={openFlexPost} post={post} poster={post.thumbnail} author={post.author} title={post.title} link={post.link} date={post.pubDate} />
          </div>
	      {/each}
        </div>
        <div class:dn={dnFlexPost}>
          <BlogPost on:close={closeFlexPost} post={viewFlexPost}/>
        </div>
        <div class="items-end-l w-third-l w-100 flex flex-column h-100">
          <h2> <a class:dn={dnCards} class="black-80" href="{blogData.feed.link}">{blogData.feed.title}</a></h2>
        </div>
      </div>
    {:catch error}
	    <p style="color: red">{error.message}</p>
    {/await}
    </div>
  </div>
</div>
