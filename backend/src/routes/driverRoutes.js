const express = require('express');
const multer = require('multer');
const fs = require('fs');
const { protect, authorize } = require('../middleware/auth');
const {
  registerVehicle,
  getMyVehicles,
  uploadDocument,
  getMyDocuments,
  setAvailability,
  updateLocation,
  stopSharingLocation,
  getWallet,
} = require('../controllers/driverController');

const router = express.Router();

// Multer config for documents
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/documents/';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '-'))
});
const upload = multer({ storage });

router.use(protect, authorize('driver'));

router.post('/vehicles', registerVehicle);
router.get('/vehicles/mine', getMyVehicles);
router.post('/documents', upload.single('documentFile'), uploadDocument);
router.get('/documents/mine', getMyDocuments);
router.patch('/availability', setAvailability);
router.patch('/location', updateLocation);
router.patch('/location/stop', stopSharingLocation);
router.get('/wallet', getWallet);

module.exports = router;