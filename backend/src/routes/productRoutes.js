const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  getProducts,
  getMyProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require('../controllers/productController');

const router = express.Router();

// Public browse — no auth required so the landing/marketing site can list products too.
router.get('/', getProducts);

router.get('/mine', protect, authorize('shipper'), getMyProducts);
router.post('/', protect, authorize('shipper'), createProduct);
router.patch('/:id', protect, authorize('shipper'), updateProduct);
router.delete('/:id', protect, authorize('shipper'), deleteProduct);

router.get('/:id', getProductById);

module.exports = router;
