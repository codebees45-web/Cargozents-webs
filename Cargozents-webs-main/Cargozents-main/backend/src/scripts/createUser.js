/**
 * createUser.js
 *
 * Creates a new user with a given role, or promotes an existing user to a
 * given role, in MongoDB. Works for admin, agency, driver, shipper, buyer.
 *
 * USAGE (run from the backend/ folder, where your .env with MONGO_URI lives):
 *
 *   node src/scripts/createUser.js promote you@example.com admin
 *   node src/scripts/createUser.js promote you@example.com agency
 *
 *   node src/scripts/createUser.js create admin "Admin Name" admin@example.com 9876543210 SomePassword123
 *   node src/scripts/createUser.js create agency "Agency Name" agency@example.com 9876543211 SomePassword123
 *
 * Place this file at: backend/src/scripts/createUser.js
 * (so the ../models/User require below resolves correctly)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const VALID_ROLES = ['buyer', 'shipper', 'driver', 'agency', 'admin'];

const run = async () => {
  const [, , mode, ...args] = process.argv;

  if (!mode || !['promote', 'create'].includes(mode)) {
    console.log('Usage:');
    console.log('  node src/scripts/createUser.js promote <email> <role>');
    console.log('  node src/scripts/createUser.js create <role> <name> <email> <phone> <password>');
    console.log(`Valid roles: ${VALID_ROLES.join(', ')}`);
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error('MONGO_URI is not set — check your .env file.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB.');

  try {
    if (mode === 'promote') {
      const [email, role] = args;
      if (!email || !role) {
        console.error('Usage: node src/scripts/createUser.js promote <email> <role>');
        process.exit(1);
      }
      if (!VALID_ROLES.includes(role)) {
        console.error(`Invalid role "${role}". Valid roles: ${VALID_ROLES.join(', ')}`);
        process.exit(1);
      }

      const user = await User.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { role, isApproved: true, isSuspended: false },
        { new: true }
      );

      if (!user) {
        console.error(`No user found with email "${email}".`);
        process.exit(1);
      }

      console.log(`Updated user to role "${role}": ${user.name} <${user.email}> (id: ${user._id})`);
      console.log('Log out and log back in on the frontend for this to take effect there.');
    }

    if (mode === 'create') {
      const [role, name, email, phone, password] = args;
      if (!role || !name || !email || !phone || !password) {
        console.error(
          'Usage: node src/scripts/createUser.js create <role> <name> <email> <phone> <password>'
        );
        process.exit(1);
      }
      if (!VALID_ROLES.includes(role)) {
        console.error(`Invalid role "${role}". Valid roles: ${VALID_ROLES.join(', ')}`);
        process.exit(1);
      }

      const existing = await User.findOne({ email: email.toLowerCase().trim() });
      if (existing) {
        console.error(`A user with email "${email}" already exists (id: ${existing._id}). Use "promote" instead.`);
        process.exit(1);
      }

      // Password is hashed automatically by the User model's pre('save') hook.
      const user = await User.create({
        name,
        email: email.toLowerCase().trim(),
        phone,
        password,
        role,
        isApproved: true,
        isSuspended: false,
      });

      console.log(`Created new ${role}: ${user.name} <${user.email}> (id: ${user._id})`);
      console.log('You can now log in with this email + the password you provided.');
    }
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected.');
  }
};

run().catch((err) => {
  console.error('Failed:', err.message);
  process.exit(1);
});