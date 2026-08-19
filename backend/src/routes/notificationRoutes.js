const router = require('express').Router();
const { protect } = require('../middleware/auth');
const { getMyNotifications } = require('../controllers/notificationController');

router.use(protect);

router.get('/my', getMyNotifications);

module.exports = router;