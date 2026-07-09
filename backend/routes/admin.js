const express = require('express');
const router = express.Router();
const {
  getAnalytics,
  getLowStockProducts,
  getSalesReport,
  generateInvoice
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.get('/analytics', protect, authorize('admin'), getAnalytics);
router.get('/low-stock', protect, authorize('admin'), getLowStockProducts);
router.get('/sales-report', protect, authorize('admin'), getSalesReport);
router.post('/invoice/:orderId', protect, authorize('admin'), generateInvoice);

module.exports = router;
