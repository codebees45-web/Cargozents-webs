const Notification = require('../models/Notification');

/** GET /api/notifications/my — broadcasts targeted at the logged-in user's role (or 'all') */
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({
      audience: { $in: ['all', req.user.role] },
    })
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyNotifications };