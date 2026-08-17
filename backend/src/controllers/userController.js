const User = require('../models/User'); // Adjust path to your actual User model

// GET: Fetch current user profile details
const getMyProfile = async (req, res) => {
    try {
        // req.user._id comes from your auth middleware
        const user = await User.findById(req.user._id).select('-password');
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        console.error("Fetch Profile Error:", error);
        res.status(500).json({ success: false, message: "Server Error fetching profile." });
    }
};

// POST/PUT: Update user profile & photo
const updateMyProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // Extract everything sent in the form body
        const updates = { ...req.body };

        // If Multer caught a new uploaded file, save the path
        if (req.file) {
            updates.profilePhotoUrl = `/uploads/${req.file.filename}`;
        }

        // Update the user in MongoDB
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: "Profile updated successfully!",
            data: updatedUser
        });

    } catch (error) {
        console.error("Update Profile Error:", error);
        res.status(500).json({ success: false, message: "Server Error saving profile." });
    }
};

module.exports = { getMyProfile, updateMyProfile };