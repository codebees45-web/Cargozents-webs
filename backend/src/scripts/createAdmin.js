/**
 * createAdmin.js
 *
 * Creates a new admin user, or promotes an existing user to admin, in MongoDB.
 *
 * USAGE (run from the backend/ folder, where your .env with MONGO_URI lives):
 *
 *   node src/scripts/createAdmin.js promote you@example.com
 *   node src/scripts/createAdmin.js create "Admin Name" admin@example.com 9876543210 SomePassword123
 *
 * Place this file at: backend/src/scripts/createAdmin.js
 * (so the ../models/User require below resolves correctly)
 */

require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

const run = async () => {
  const [, , mode, ...args] = process.argv;

  if (!mode || !['promote', 'create'].includes(mode)) {
    console.log('Usage:');
    console.log('  node src/scripts/createAdmin.js promote <email>');
    console.log('  node src/scripts/createAdmin.js create <name> <email> <phone> <password>');
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
      const [email] = args;
      if (!email) {
        console.error('Missing email. Usage: node src/scripts/createAdmin.js promote <email>');
        process.exit(1);
      }

      const user = await User.findOneAndUpdate(
        { email: email.toLowerCase().trim() },
        { role: 'admin', isApproved: true, isSuspended: false },
        { new: true }
      );

      if (!user) {
        console.error(`No user found with email "${email}".`);
        process.exit(1);
      }

      console.log(`Promoted user to admin: ${user.name} <${user.email}> (id: ${user._id})`);
    }

    if (mode === 'create') {
      const [name, email, phone, password] = args;
      if (!name || !email || !phone || !password) {
        console.error(
          'Usage: node src/scripts/createAdmin.js create <name> <email> <phone> <password>'
        );
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
        role: 'admin',
        isApproved: true,
        isSuspended: false,
      });

      console.log(`Created new admin: ${user.name} <${user.email}> (id: ${user._id})`);
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