const Truck = require('../models/Vehicle');

exports.getAvailableTrucks = async (req, res) => {
  try {
    // Find trucks belonging to this specific logged-in agency that are available
    // "Available" matches the agency's manual isActive toggle (see AvailableTrucks.jsx)
    const availableTrucks = await Truck.find({ 
      agency: req.user._id, 
      isActive: true 
    });
    
    res.status(200).json(availableTrucks);
  } catch (error) {
    res.status(500).json({ message: 'Server Error fetching trucks' });
  }
};