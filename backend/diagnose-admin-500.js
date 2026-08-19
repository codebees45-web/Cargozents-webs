/**
 * Diagnostic script — run this from inside your backend/ folder:
 *
 *   node diagnose-admin-500.js
 *
 * It connects to the SAME MongoDB your server uses (via .env) and runs
 * the exact queries that /api/admin/users, /api/admin/drivers,
 * /api/admin/vehicles, and /api/admin/documents run — but prints the
 * FULL error and stack trace instead of swallowing it into a generic
 * "Internal Server Error" the way the Express error handler does.
 *
 * Copy the output here and I can fix the real problem.
 */
require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./src/models/User');
const Vehicle = require('./src/models/Vehicle');
const Document = require('./src/models/Document');

async function run(label, fn) {
  process.stdout.write(`\n=== ${label} ===\n`);
  try {
    const result = await fn();
    console.log(`OK — got ${Array.isArray(result) ? result.length : 'a'} result(s)`);
  } catch (err) {
    console.log('FAILED:');
    console.log('  name:', err.name);
    console.log('  message:', err.message);
    console.log('  full stack:\n', err.stack);
  }
}

(async () => {
  console.log('Node version:', process.version);
  console.log('Mongoose version:', mongoose.version);
  console.log('Connecting to MONGO_URI...');

  try {
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 20000,
      family: 4,
    });
    console.log('Connected OK to:', mongoose.connection.host);
  } catch (err) {
    console.log('COULD NOT CONNECT AT ALL:');
    console.log(err.stack);
    process.exit(1);
  }

  await run('GET /api/admin/users  ->  User.find({}).select("-password -otp").sort({createdAt:-1})', () =>
    User.find({}).select('-password -otp').sort({ createdAt: -1 })
  );

  await run('GET /api/admin/drivers  ->  User.find({role:"driver"}).select("-password -otp").sort({createdAt:-1})', () =>
    User.find({ role: 'driver' }).select('-password -otp').sort({ createdAt: -1 })
  );

  await run('GET /api/admin/vehicles  ->  Vehicle.find({}).populate("driver").populate("agency").sort({createdAt:-1})', () =>
    Vehicle.find({}).populate('driver', 'name phone').populate('agency', 'name phone').sort({ createdAt: -1 })
  );

  await run('GET /api/admin/documents  ->  Document.find({status:"pending"}).populate("owner").populate("vehicle").sort({createdAt:-1})', () =>
    Document.find({ status: 'pending' })
      .populate('owner', 'name phone role')
      .populate('vehicle', 'registrationNumber type')
      .sort({ createdAt: -1 })
  );

  console.log('\nDone. Copy everything above (especially any FAILED sections) back to Claude.');
  await mongoose.disconnect();
  process.exit(0);
})();