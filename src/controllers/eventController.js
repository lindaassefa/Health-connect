const eventService = require('../services/eventService');
const User = require('../models/user');

exports.getRecommendedEvents = async (req, res) => {
    try {
        // Get user's chronic condition from their profile
        const user = await User.findByPk(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const events = await eventService.getRecommendedEvents(user);
        
        // Format the response to include only necessary information
        const formattedEvents = events.map(event => ({
            id: event.id,
            name: event.name.text,
            description: event.description?.text,
            startDate: event.start.local,
            endDate: event.end.local,
            url: event.url,
            venue: event.venue ? {
                name: event.venue.name,
                address: event.venue.address.localized_address_display,
                city: event.venue.address.city
            } : null,
            imageUrl: event.logo?.url
        }));

        res.json(formattedEvents);
    } catch (error) {
        console.error('Error getting recommended events:', error);
        res.status(500).json({ 
            message: 'Error fetching recommended events',
            error: error.message 
        });
    }
};