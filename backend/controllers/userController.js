const User = require('../models/User');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const { name, email, role, isBlocked, phone } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.isBlocked = isBlocked !== undefined ? isBlocked : user.isBlocked;
    user.phone = phone || user.phone;

    await user.save();

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add address
// @route   POST /api/users/address
// @access  Private
exports.addAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    if (!user.addresses) {
      user.addresses = [];
    }

    const newAddress = {
      ...req.body,
      _id: req.body._id || req.body.id || Math.random().toString(36).substring(2, 9) + Date.now().toString(36)
    };

    user.addresses.push(newAddress);
    
    // If this is the first address or marked as default, set it as default
    if (user.addresses.length === 1 || req.body.isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
      newAddress.isDefault = true;
    }

    await user.save();

    res.status(201).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update address
// @route   PUT /api/users/address/:addressId
// @access  Private
exports.updateAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.addresses) {
      user.addresses = [];
    }

    // Find address index by matching _id or id
    const addressIndex = user.addresses.findIndex(
      addr => (addr._id && addr._id.toString() === req.params.addressId) || 
              (addr.id && addr.id.toString() === req.params.addressId)
    );

    if (addressIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    // Merge updates
    user.addresses[addressIndex] = {
      ...user.addresses[addressIndex],
      ...req.body
    };

    if (req.body.isDefault) {
      user.addresses.forEach((addr, idx) => {
        addr.isDefault = idx === addressIndex;
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete address
// @route   DELETE /api/users/address/:addressId
// @access  Private
exports.deleteAddress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id || req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!user.addresses) {
      user.addresses = [];
    }

    const initialLength = user.addresses.length;
    user.addresses = user.addresses.filter(
      addr => (addr._id && addr._id.toString() !== req.params.addressId) && 
              (addr.id && addr.id.toString() !== req.params.addressId)
    );

    if (user.addresses.length === initialLength) {
      return res.status(404).json({
        success: false,
        message: 'Address not found'
      });
    }

    await user.save();

    res.status(200).json({
      success: true,
      addresses: user.addresses
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add to wishlist
// @route   POST /api/users/wishlist
// @access  Private
exports.addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.wishlist.includes(productId)) {
      user.wishlist.push(productId);
      await user.save();
    }

    res.status(200).json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove from wishlist
// @route   DELETE /api/users/wishlist/:productId
// @access  Private
exports.removeFromWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    user.wishlist = user.wishlist.filter(id => id.toString() !== req.params.productId);
    await user.save();

    res.status(200).json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get wishlist
// @route   GET /api/users/wishlist
// @access  Private
exports.getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    
    res.status(200).json({
      success: true,
      wishlist: user.wishlist
    });
  } catch (error) {
    next(error);
  }
};
