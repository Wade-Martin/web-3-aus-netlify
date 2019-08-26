<div class="vh-100 w-100 flex flex-column justify-center items-center">
  <div class="h2 h3-l w-100"></div>
  <form class="w-90 h-100" method="POST" netlify  action="/thanks"> 
    <p class="dn">
      <label>Don’t fill this out if you're human: <input name="bot-field" /></label>
    </p>
    <label for="email">Your email:</label>
    <input class="w-100" type="text" name="email" id="email">
    <label for="topic">Select a topic:</label>
    <select class="w-100" name="topic" id="topic">
      <option value="Apply for rmoney">R Money</option>
      <option value="another option">Option A</option>
      <option value="Become Involved">Get Involved</option>
      <option value="generic option">Option B</option>
      <option value="General Enquiry">General Enquiry</option>
    </select>
    <label for="enquiry">Your enquiry:</label>
    <textarea class="w-100" name="enquiry" id="enquiry" cols="30" rows="10"></textarea>
    <button class="w-100" type="submit">Submit</button> 
  </form>  
</div>
