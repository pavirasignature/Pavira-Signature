const express = require('express');
const router = express.Router();
const {
  register,
  login,
  googleLogin,
  verifyEmail,
  getMe,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  logout,
  deleteAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.get('/verify-email/:verificationToken', verifyEmail);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.put('/password', protect, updatePassword);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);
router.post('/logout', protect, logout);
router.delete('/account', protect, deleteAccount);

module.exports = router;
