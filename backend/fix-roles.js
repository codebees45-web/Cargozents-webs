const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./src/models/User');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    const users = await User.find({});
    console.log('All Users:', users.map(u => ({ email: u.email, role: u.role, name: u.name, shipperMode: u.shipperMode })));
  })
  .catch(console.error);
