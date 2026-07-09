const Coupon = require('../models/Coupon');
const { sendError, sendSuccess } = require('../utils/response');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private/Admin
exports.getCoupons = async (req, res, next) => {
  try {
    const coupons = await Coupon.find();

    return sendSuccess(res, 200, { coupons: coupons || [] }, 'Coupons fetched successfully');
  } catch (error) {
    console.error('Get coupons error:', error);
    return sendError(res, 500, 'Error fetching coupons', error.message);
  }
};

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private/Admin
exports.getCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return sendError(res, 404, 'Coupon not found');
    }

    return sendSuccess(res, 200, { coupon }, 'Coupon fetched successfully');
  } catch (error) {
    console.error('Get coupon error:', error);
    return sendError(res, 500, 'Error fetching coupon', error.message);
  }
};

// @desc    Create coupon
// @route   POST /api/coupons
// @access  Private/Admin
exports.createCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.create(req.body);

    return sendSuccess(res, 201, { coupon }, 'Coupon created successfully');
  } catch (error) {
    console.error('Create coupon error:', error);
    return sendError(res, 500, 'Error creating coupon', error.message);
  }
};

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private/Admin
exports.updateCoupon = async (req, res, next) => {
  try {
    let coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return sendError(res, 404, 'Coupon not found');
    }

    coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body);

    return sendSuccess(res, 200, { coupon }, 'Coupon updated successfully');
  } catch (error) {
    console.error('Update coupon error:', error);
    return sendError(res, 500, 'Error updating coupon', error.message);
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
exports.deleteCoupon = async (req, res, next) => {
  try {
    const coupon = await Coupon.findById(req.params.id);

    if (!coupon) {
      return sendError(res, 404, 'Coupon not found');
    }

    await Coupon.findByIdAndDelete(req.params.id);

    return sendSuccess(res, 200, null, 'Coupon deleted successfully');
  } catch (error) {
    console.error('Delete coupon error:', error);
    return sendError(res, 500, 'Error deleting coupon', error.message);
  }
};

// @desc    Validate coupon
// @route   POST /api/coupons/validate
// @access  Private
exports.validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount, categoryIds, productIds } = req.body;
    
    const coupon = await Coupon.findOne({ code: code.toUpperCase() });

    if (!coupon) {
      return sendError(res, 404, 'Invalid coupon code');
    }

    if (typeof coupon.isValid === 'function' && !coupon.isValid()) {
      return sendError(res, 400, 'Coupon is expired or inactive');
    }

    if (typeof coupon.isApplicable === 'function' && !coupon.isApplicable(orderAmount, categoryIds, productIds)) {
      return sendError(res, 400, 'Coupon is not applicable to this order');
    }

    let discount = 0;
    if (typeof coupon.calculateDiscount === 'function') {
      discount = coupon.calculateDiscount(orderAmount);
    } else if (coupon.discountType === 'percentage') {
      discount = (orderAmount * coupon.discountValue) / 100;
    } else {
      discount = coupon.discountValue;
    }

    return sendSuccess(res, 200, {
      coupon: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discount
      }
    }, 'Coupon validated successfully');
  } catch (error) {
    console.error('Validate coupon error:', error);
    return sendError(res, 500, 'Error validating coupon', error.message);
  }
};
