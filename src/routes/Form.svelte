<script>
  import { fade } from 'svelte/transition';
</script>

<div transition:fade class="vh-100 vh-75-m vh-75-l flex flex-column justify-center items-center">
  <div class="h2 h3-l h-100 w-100 "></div>
  <form class=" w-90 w-80-m w-60-l self-center h-100" method="POST" action="/#/Thanks"> 
    <p class="dn">
      <label>Don’t fill this out if you're human: <input name="bot-field" /></label>
    </p>
    <label class="f4 f3-m f3-l" for="email">Your email:</label>
    <input class="w-100" type="text" name="email" id="email">
    <label class="f4 f3-m f3-l" for="topic">Select a topic:</label>
    <select class="f4 w-100" name="topic" id="topic">
      <option value="Apply for rmoney">R Money</option>
      <option value="another option">Option A</option>
      <option value="Become Involved">Get Involved</option>
      <option value="generic option">Option B</option>
      <option value="General Enquiry">General Enquiry</option>
    </select>
    <label class="f4 f3-m f3-l" for="enquiry">Your enquiry:</label>
    <textarea class="w-100" name="enquiry" id="enquiry" cols="30" rows="15"></textarea>
    <button class="w-100 f4 f3-m f3-l pointer" type="submit">Submit</button> 
  </form>  
</div>
