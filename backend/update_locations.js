const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Shipment = require('./src/models/Shipment');
  const Vehicle = require('./src/models/Vehicle');
  
  const s = await Shipment.findOne();
  if (s) {
    await Vehicle.updateMany({}, { 
      $set: { 
        'currentLocation.coordinates': s.pickup.location.coordinates,
        'homeBaseLocation.coordinates': s.drop.location.coordinates
      } 
    });
    console.log('Updated vehicles to be near pickup');
  }
  process.exit(0);
});
