<style>

  .container {
    font-family: 'Space Mono', monospace;;
    width: 100%;
    padding: .74rem 1rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .grid-container {
    width: 60%;
    display: flex;
    justify-content: center;
   }

  .grid {
    grid-template-columns: 1fr 1fr 1fr;
    grid-template-rows: 1fr 1fr;
  }

  .card {
    border: black 1px solid;
    width: 100%;
    height: 250px;
    margin: 10px;
    padding-left: 10px; 
  }

</style>

<script>
  import { onMount } from 'svelte';
  import axios from 'axios';
  let events = false;

  onMount(async () => {
    events = await axios.get('https://api.meetup.com/Web3-Melbourne/events?&sign=true&photo-host=public&page=6');
    // events = [
    //   {
    //     "created": 1551324199000,
    //     "duration": 10800000,
    //     "id": "lpgpsqyzlbkb",
    //     "name": "Weekly Web3 Hack - ConsenSys's Barry Earsman",
    //     "rsvp_limit": 45,
    //     "date_in_series_pattern": false,
    //     "status": "upcoming",
    //     "time": 1565164800000,
    //     "local_date": "2019-08-07",
    //     "local_time": "18:00",
    //     "updated": 1562735528000,
    //     "utc_offset": 36000000,
    //     "waitlist_count": 0,
    //     "yes_rsvp_count": 16,
    //     "venue": {
    //         "id": 25826135,
    //         "name": "RMIT University Building 88",
    //         "lat": -37.808780670166016,
    //         "lon": 144.9609375,
    //         "repinned": true,
    //         "address_1": "Level 3, 440 Elizabeth Street ",
    //         "city": "Melbourne",
    //         "country": "au",
    //         "localized_country_name": "Australia"
    //     },
    //     "group": {
    //         "created": 1490146710000,
    //         "name": "Web3 Melbourne",
    //         "id": 22966256,
    //         "join_mode": "open",
    //         "lat": -37.810001373291016,
    //         "lon": 144.9600067138672,
    //         "urlname": "Web3-Melbourne",
    //         "who": "Web3 Wizards",
    //         "localized_location": "Melbourne, Australia",
    //         "state": "",
    //         "country": "au",
    //         "region": "en_US",
    //         "timezone": "Australia/Melbourne"
    //     },
    //     "link": "https://www.meetup.com/Web3-Melbourne/events/lpgpsqyzlbkb/",
    //     "description": "<p>Tonight, ConsenSys's Barry Earsman will dial in to demo a prototype dApp called Mona Lease. It's designed to allow co-working space owners (like Barry) to make simple rental agreements with members, and have membership fees charged in Ether by the month, week, day or even by the minute. It makes use of a simple Oracle to keep a smart contract updated with the current exchange rate between ETH and AUD.</p> <p>Here's a little more about Barry:</p> <p>Barry is a seasoned developer who has worked in a series of start-ups through and beyond the dot-com boom. He works as a solution architect and developer in ConsenSys Solutions, and is currently working on a decentralised securities exchange in Singapore.</p> <p>An activist within the Transition Town movement, he believes in the potential for decentralised technologies to create, enhance and empower human communities through the formation of new patterns of self-organisation.</p> <p>Barry is a founder of a small co-working space in a town of the Sunshine Coast hinterland.</p> <p>He holds a Bachelor of Informatics from Griffith University.</p> <p>Presentation will start around 7pm.<br/>______________________________________________________________________________</p> <p>Normal Hack Bio:</p> <p>Are you interested in Web3 technologies like blockchains, smart contracts and other decentralised systems? Do you want to meet other curious people or even learn to build on Web3 tech?</p> <p>Well you’ve found the perfect entry point. The Web3 Weekly Hack is an informal gathering of Melbourne’s Web3 devs, hobbyists and learners. There’s no real agenda unless otherwise stated, it's a self directed evening of discussion, coding and fun. We like to sound out our ideas, interrogate problems and build funky stuff.</p> <p>Hosted by Tom Nash and Alexander Ramsey. Tom is a software engineer who has been working with Smart Contracts and Ethereum since November 2016 and Alex has a background in startups and building odd things.</p> <p>We are limited to 30 registrations per hack as the core community of 10-25 Web3 Wizards aren’t usually represented on the attending list and we want to ensure the event will still fit inside the venue. If you want to find a community of people whose purpose is to build and learn instead of speculate, then it’s right here.</p> <p>At the Web3 Weekly Hack you can do things like:<br/>- Find high quality information and start your journey into Web3<br/>- Find people who can introduce you to the broader Australian community.<br/>- Learn how to set up your environment for Smart Contract development<br/>- Learn best practises for developing, like automated tests (they’re super fun trust me) and automatic migrations<br/>- Receive a high level overviews of what’s possible on Ethereum and the challenges you might face in a project<br/>- Make friends!</p> <p>Check out our Learning resources: <a href=\"https://github.com/Web3-Melbourne/learning-resources\" class=\"linkified\">https://github.com/Web3-Melbourne/learning-resources</a><br/>Supported by flexdapps (<a href=\"http://flexdapps.com/\" class=\"linkified\">http://flexdapps.com/</a>), typehuman (<a href=\"http://typehuman.com/\" class=\"linkified\">http://typehuman.com/</a>), consensys (<a href=\"http://consensys.net/\" class=\"linkified\">http://consensys.net/</a>) and RMIT University (<a href=\"https://www.rmit.edu.au/\" class=\"linkified\">https://www.rmit.edu.au/</a>)</p> <p>Also please join the Discord group where we chat about meetups past, present and future, as well as a bunch of other things like hackathons/news/general scheming: <a href=\"https://discord.gg/HVS7BVE\" class=\"linkified\">https://discord.gg/HVS7BVE</a></p> ",
    //     "how_to_find_us": "Floor 3, room 28",
    //     "visibility": "public",
    //     "member_pay_fee": false
    //   }, 
    //   {
    //     "created": 1551324199000,
    //     "duration": 10800000,
    //     "id": "lpgpsqyzlbsb",
    //     "name": "Weekly Web3 Hack",
    //     "rsvp_limit": 45,
    //     "date_in_series_pattern": false,
    //     "status": "upcoming",
    //     "time": 1565769600000,
    //     "local_date": "2019-08-14",
    //     "local_time": "18:00",
    //     "updated": 1551324199000,
    //     "utc_offset": 36000000,
    //     "waitlist_count": 0,
    //     "yes_rsvp_count": 4,
    //     "venue": {
    //         "id": 25826135,
    //         "name": "RMIT University Building 88",
    //         "lat": -37.808780670166016,
    //         "lon": 144.9609375,
    //         "repinned": true,
    //         "address_1": "Level 3, 440 Elizabeth Street ",
    //         "city": "Melbourne",
    //         "country": "au",
    //         "localized_country_name": "Australia"
    //     },
    //     "group": {
    //         "created": 1490146710000,
    //         "name": "Web3 Melbourne",
    //         "id": 22966256,
    //         "join_mode": "open",
    //         "lat": -37.810001373291016,
    //         "lon": 144.9600067138672,
    //         "urlname": "Web3-Melbourne",
    //         "who": "Web3 Wizards",
    //         "localized_location": "Melbourne, Australia",
    //         "state": "",
    //         "country": "au",
    //         "region": "en_US",
    //         "timezone": "Australia/Melbourne"
    //     },
    //     "link": "https://www.meetup.com/Web3-Melbourne/events/lpgpsqyzlbsb/",
    //     "description": "<p>Are you interested in Web3 technologies like blockchains, smart contracts and other decentralised systems? Do you want to meet other curious people or even learn to build on Web3 tech?</p> <p>Well you’ve found the perfect entry point. The Web3 Weekly Hack is an informal gathering of Melbourne’s Web3 devs, hobbyists and learners. There’s no real agenda unless otherwise stated, it's a self directed evening of discussion, coding and fun. We like to sound out our ideas, interrogate problems and build funky stuff.</p> <p>Hosted by Tom Nash and Alexander Ramsey. Tom is a software engineer who has been working with Smart Contracts and Ethereum since November 2016 and Alex has a background in startups and building odd things.</p> <p>We are limited to 30 registrations per hack as the core community of 10-25 Web3 Wizards aren’t usually represented on the attending list and we want to ensure the event will still fit inside the venue. If you want to find a community of people whose purpose is to build and learn instead of speculate, then it’s right here.</p> <p>At the Web3 Weekly Hack you can do things like:<br/>- Find high quality information and start your journey into Web3<br/>- Find people who can introduce you to the broader Australian community.<br/>- Learn how to set up your environment for Smart Contract development<br/>- Learn best practises for developing, like automated tests (they’re super fun trust me) and automatic migrations<br/>- Receive a high level overviews of what’s possible on Ethereum and the challenges you might face in a project<br/>- Make friends!</p> <p>Check out our Learning resources: <a href=\"https://github.com/Web3-Melbourne/learning-resources\" class=\"linkified\">https://github.com/Web3-Melbourne/learning-resources</a><br/>Supported by flexdapps (<a href=\"http://flexdapps.com/\" class=\"linkified\">http://flexdapps.com/</a>), typehuman (<a href=\"http://typehuman.com/\" class=\"linkified\">http://typehuman.com/</a>), consensys (<a href=\"http://consensys.net/\" class=\"linkified\">http://consensys.net/</a>) and RMIT University (<a href=\"https://www.rmit.edu.au/\" class=\"linkified\">https://www.rmit.edu.au/</a>)</p> <p>Also please join the Discord group where we chat about meetups past, present and future, as well as a bunch of other things like hackathons/news/general scheming: <a href=\"https://discord.gg/HVS7BVE\" class=\"linkified\">https://discord.gg/HVS7BVE</a></p> ",
    //     "how_to_find_us": "Floor 3, room 28",
    //     "visibility": "public",
    //     "member_pay_fee": false
    //   },
    //   {
    //     "created": 1551324199000,
    //     "duration": 10800000,
    //     "id": "lpgpsqyzlbcc",
    //     "name": "Weekly Web3 Hack",
    //     "rsvp_limit": 45,
    //     "date_in_series_pattern": false,
    //     "status": "upcoming",
    //     "time": 1566374400000,
    //     "local_date": "2019-08-21",
    //     "local_time": "18:00",
    //     "updated": 1551324199000,
    //     "utc_offset": 36000000,
    //     "waitlist_count": 0,
    //     "yes_rsvp_count": 0,
    //     "venue": {
    //         "id": 25826135,
    //         "name": "RMIT University Building 88",
    //         "lat": -37.808780670166016,
    //         "lon": 144.9609375,
    //         "repinned": true,
    //         "address_1": "Level 3, 440 Elizabeth Street ",
    //         "city": "Melbourne",
    //         "country": "au",
    //         "localized_country_name": "Australia"
    //     },
    //     "group": {
    //         "created": 1490146710000,
    //         "name": "Web3 Melbourne",
    //         "id": 22966256,
    //         "join_mode": "open",
    //         "lat": -37.810001373291016,
    //         "lon": 144.9600067138672,
    //         "urlname": "Web3-Melbourne",
    //         "who": "Web3 Wizards",
    //         "localized_location": "Melbourne, Australia",
    //         "state": "",
    //         "country": "au",
    //         "region": "en_US",
    //         "timezone": "Australia/Melbourne"
    //     },
    //     "link": "https://www.meetup.com/Web3-Melbourne/events/lpgpsqyzlbcc/",
    //     "description": "<p>Are you interested in Web3 technologies like blockchains, smart contracts and other decentralised systems? Do you want to meet other curious people or even learn to build on Web3 tech?</p> <p>Well you’ve found the perfect entry point. The Web3 Weekly Hack is an informal gathering of Melbourne’s Web3 devs, hobbyists and learners. There’s no real agenda unless otherwise stated, it's a self directed evening of discussion, coding and fun. We like to sound out our ideas, interrogate problems and build funky stuff.</p> <p>Hosted by Tom Nash and Alexander Ramsey. Tom is a software engineer who has been working with Smart Contracts and Ethereum since November 2016 and Alex has a background in startups and building odd things.</p> <p>We are limited to 30 registrations per hack as the core community of 10-25 Web3 Wizards aren’t usually represented on the attending list and we want to ensure the event will still fit inside the venue. If you want to find a community of people whose purpose is to build and learn instead of speculate, then it’s right here.</p> <p>At the Web3 Weekly Hack you can do things like:<br/>- Find high quality information and start your journey into Web3<br/>- Find people who can introduce you to the broader Australian community.<br/>- Learn how to set up your environment for Smart Contract development<br/>- Learn best practises for developing, like automated tests (they’re super fun trust me) and automatic migrations<br/>- Receive a high level overviews of what’s possible on Ethereum and the challenges you might face in a project<br/>- Make friends!</p> <p>Check out our Learning resources: <a href=\"https://github.com/Web3-Melbourne/learning-resources\" class=\"linkified\">https://github.com/Web3-Melbourne/learning-resources</a><br/>Supported by flexdapps (<a href=\"http://flexdapps.com/\" class=\"linkified\">http://flexdapps.com/</a>), typehuman (<a href=\"http://typehuman.com/\" class=\"linkified\">http://typehuman.com/</a>), consensys (<a href=\"http://consensys.net/\" class=\"linkified\">http://consensys.net/</a>) and RMIT University (<a href=\"https://www.rmit.edu.au/\" class=\"linkified\">https://www.rmit.edu.au/</a>)</p> <p>Also please join the Discord group where we chat about meetups past, present and future, as well as a bunch of other things like hackathons/news/general scheming: <a href=\"https://discord.gg/HVS7BVE\" class=\"linkified\">https://discord.gg/HVS7BVE</a></p> ",
    //     "how_to_find_us": "Floor 3, room 28",
    //     "visibility": "public",
    //     "member_pay_fee": false
    //   }
    // ]
	});

</script>



{#if !events}
  <div>Loading...</div>
{:else}
  <div class="container">
    <h2>Upcoming Events</h2>
    <div class="grid-container">
      <div class="grid">
	      {#each events as { name, group, link, description, local_date, local_time, venue, how_to_find_us } }
		      <div class="card">
            <h3>{group.name}</h3>
            <p>Meetup: {name} <br>@ {venue.name} on {local_date} at {local_time}</p>  
            <a target="_blank" href="{link}">{link}</a>
          </div>
	      {/each}
      </div>  
    </div>
  </div>
{/if}
