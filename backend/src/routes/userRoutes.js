const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/auth'); // Ensure this matches your auth middleware path
const { getMyProfile, updateMyProfile } = require('../controllers/userController');

const router = express.Router();

// Multer config for storing photos locally on the server
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage });

// All profile routes are protected by auth middleware
router.use(protect);

// GET: Fetch existing signup/onboarding details
router.get('/profile', getMyProfile);

// POST: Save/Update profile details and images
router.post('/profile', upload.single('profilePhoto'), updateMyProfile);

module.exports = router;