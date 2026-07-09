const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  addAddress,
  updateAddress,
  deleteAddress,
  addToWishlist,
  removeFromWishlist,
  getWishlist
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.route('/')
  .get(protect, authorize('admin'), getUsers);

router.route('/:id')
  .get(protect, authorize('admin'), getUser)
  .put(protect, authorize('admin'), updateUser)
  .delete(protect, authorize('admin'), deleteUser);

router.route('/address')
  .post(protect, addAddress);

router.route('/address/:addressId')
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.route('/wishlist')
  .get(protect, getWishlist)
  .post(protect, addToWishlist);

router.route('/wishlist/:productId')
  .delete(protect, removeFromWishlist);

module.exports = router;
