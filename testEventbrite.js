const axios = require('axios');

const EVENTBRITE_API_KEY = '5WRPY2TBN3CVPWU7HR';

// Function to fetch events
async function fetchEvents() {
    try {
        const response = await axios.get('https://www.eventbriteapi.com/v3/events/search/', {
            headers: {
                'Authorization': `Bearer ${EVENTBRITE_API_KEY}`
            }
        });

        console.log('Event Data:', response.data);
    } catch (error) {
        console.error('Error fetching events:', error.response?.data || error.message);
    }
}

// Run the function
fetchEvents();
