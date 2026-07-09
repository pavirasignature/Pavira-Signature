const express = require('express');
const router = express.Router();
const {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon
} = require('../controllers/couponController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin'), getCoupons)
  .post(protect, authorize('admin'), createCoupon);

router.route('/:id')
  .get(protect, authorize('admin'), getCoupon)
  .put(protect, authorize('admin'), updateCoupon)
  .delete(protect, authorize('admin'), deleteCoupon);

router.post('/validate', protect, validateCoupon);

module.exports = router;
