const router = require('express').Router();
const {
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.post('/', createComplaint);
router.get('/my', getMyComplaints);
router.get('/:id', getComplaintById);
router.get('/', authorize('admin'), getAllComplaints);
router.put('/:id', authorize('admin'), updateComplaint);
router.delete('/:id', authorize('admin'), deleteComplaint);

module.exports = router;