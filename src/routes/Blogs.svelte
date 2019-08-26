<script>
  import axios from 'axios';
  import BlogCard from './BlogCard.svelte';
  import BlogPost from './BlogPost.svelte';

  let viewWeb3Post;
  let viewFlexPost;
  let content;
  let dnCards = false;
  let dnWeb3Post = true;
  let dnFlexPost = true;
  let selectedPost;

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
  };

  let web3Promise = getWeb3Blog();

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
  };

  let flexPromise = getFlexBlog();

    const openFlexPost = (event) => {
    viewFlexPost = event.detail.post;
    dnCards = !dnCards;
    dnFlexPost = !dnFlexPost;
    window.scrollTo(0, 0);
  };

   const openWeb3Post = (event) => {
    viewWeb3Post = event.detail.post;
    dnCards = !dnCards;
    dnWeb3Post = !dnWeb3Post;
    window.scrollTo(0, 0);
  };

  const closeFlexPost = () => {
    dnCards = !dnCards;
    dnFlexPost = !dnFlexPost;
  };

   const closeWeb3Post = () => {
    dnCards = !dnCards;
    dnWeb3Post = !dnWeb3Post;
  };

</script>

<div class="flex flex-column w-100 h-100 mb5">
  <div class="h2-m h3-l w-100"></div>
  <div class="flex justify-center">  
    <h1 class:dn={dnCards} class="w-75">Our Blogs</h1>
  </div>
  <div class="w-100 h-75 flex justify-center">
    <div class="w-90 w-80-m w-80-l">
    {#await web3Promise}
	    <p>...waiting</p>
    {:then blogData}
      <div class="bt w-100 flex flex-row-l flex-column-reverse justify-center" >
        <div class:dn={dnCards} class="w-100 w-two-thirds-l self-center-l" >
	      {#each blogData.items as post}
          <div  >
            <BlogCard on:click={openWeb3Post} post={post} poster={post.thumbnail} author={post.author} title={post.title} link={post.link} date={post.pubDate} />
          </div>
	      {/each}
        </div>
        <div class="self-center w-90 pa3" class:dn={dnWeb3Post}>
          <BlogPost on:close={closeWeb3Post} post={viewWeb3Post}/>
        </div>
        <div  class:dn={dnCards} class="w-third-l w-100 h-100">
          <h2> <a class="black-80 w-100 ml3 ml0-l w-75 f5 f3-m f3-l" href="{blogData.feed.link}">{blogData.feed.title}</a></h2>
        </div>
      </div>
    {:catch error}
	    <p style="color: red">{error.message}</p>
    {/await}
    {#await flexPromise}
	    <p>...waiting</p>
    {:then blogData}
      <div class="bt w-100 flex flex-row-l flex-column-reverse justify-center" >
        <div class:dn={dnCards} class="w-two-thirds-l self-center-l w-100" >
	      {#each blogData.items as post}
          <div  >
            <BlogCard on:click={openFlexPost} post={post} poster={post.thumbnail} author={post.author} title={post.title} link={post.link} date={post.pubDate} />
          </div>
	      {/each}
        </div>
        <div class="self-center w-90 pa3" class:dn={dnFlexPost}>
          <BlogPost on:close={closeFlexPost} post={viewFlexPost}/>
        </div>
        <div  class:dn={dnCards} class="w-third-l w-100 h-100">
          <h2> <a class="black-80 w-100 ml3 ml0-l w-75 f5 f3-m f3-l" href="{blogData.feed.link}">{blogData.feed.title}</a></h2>
        </div>
      </div>
    {:catch error}
	    <p style="color: red">{error.message}</p>
    {/await}
    </div>
  </div>
</div>
