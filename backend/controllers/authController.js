/**
 * Authentication Controller
 * Handles user registration, login, and password management
 */

const User = require("../models/User");
const { generateToken, verifyToken } = require("../utils/jwt");
const { sendError, sendSuccess } = require("../utils/response");
const { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } = require("../utils/email");
const { supabase } = require("../utils/supabase");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

/**
 * User Registration
 * POST /api/auth/register
 */
exports.register = async (req, res) => {
  try {
    // Support both { name } and { firstName, lastName } formats
    let { firstName, lastName, name, email, password, confirmPassword, phone } = req.body;

    // Handle single 'name' field (from signup form) by splitting
    if (!firstName && !lastName && name) {
      const parts = name.trim().split(" ");
      firstName = parts[0];
      lastName = parts.slice(1).join(" ") || "";
    }

    // Validation
    if (!firstName || !email || !password || !confirmPassword) {
      return sendError(res, 400, "First name, email, password, and confirm password are required");
    }

    if (password !== confirmPassword) {
      return sendError(res, 400, "Passwords do not match");
    }

    if (password.length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters");
    }

    // Check if user already exists
    const { data: existingUsers } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim());

    if (existingUsers && existingUsers.length > 0) {
      return sendError(res, 409, "User already exists with this email");
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate email verification token (32-byte hex)
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const baseUserPayload = {
      firstName,
      lastName: lastName || "",
      name: `${firstName} ${lastName || ""}`.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone || "",
      role: "customer",
      isBlocked: false,
      isActive: true,
    };

    // Preferred path: create unverified user with verification token
    let newUser = null;
    let requiresVerification = true;
    let insertError = null;

    const firstInsert = await supabase
      .from("users")
      .insert([{
        ...baseUserPayload,
        isVerified: false,
        verificationToken,
      }])
      .select()
      .single();

    newUser = firstInsert.data;
    insertError = firstInsert.error;

    // Fallback for older databases that don't yet have verificationToken column
    if (insertError && /verificationToken/i.test(insertError.message || "")) {
      requiresVerification = false;
      const fallbackInsert = await supabase
        .from("users")
        .insert([{
          ...baseUserPayload,
          isVerified: true,
        }])
        .select()
        .single();

      newUser = fallbackInsert.data;
      insertError = fallbackInsert.error;
    }

    if (insertError) {
      console.error("Supabase insert error:", insertError);
      return sendError(res, 500, "Error creating user", insertError.message);
    }

    if (requiresVerification) {
      try {
        await sendVerificationEmail(newUser.email, newUser.firstName, verificationToken);
      } catch (emailError) {
        console.error("Verification email failed:", emailError);
      }

      try {
        await sendWelcomeEmail(newUser.email, newUser.firstName);
      } catch (emailError) {
        console.error("Welcome email failed:", emailError);
      }

      return sendSuccess(
        res,
        201,
        null,
        "Registration successful! Please check your email to verify your account before logging in."
      );
    }

    // Send welcome email immediately if verification is disabled/skipped
    try {
      await sendWelcomeEmail(newUser.email, newUser.firstName);
    } catch (emailError) {
      console.error("Welcome email failed:", emailError);
    }

    return sendSuccess(
      res,
      201,
      null,
      "Registration successful! Your account is ready to use."
    );
  } catch (error) {
    console.error("Registration error:", error);
    return sendError(res, 500, "Error during registration", error.message);
  }
};

/**
 * User Login
 * POST /api/auth/login
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return sendError(res, 400, "Email and password are required");
    }

    // Find user by email
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("email", email.toLowerCase().trim());

    if (fetchError || !users || users.length === 0) {
      return sendError(res, 401, "Invalid email or password");
    }

    const user = users[0];

    // Check if user is blocked
    if (user.isBlocked) {
      return sendError(res, 403, "Your account has been blocked");
    }

    // Check if user is active
    if (!user.isActive) {
      return sendError(res, 403, "Your account has been deactivated");
    }

    // Check if email is verified (per authentication guide requirement)
    if (!user.isVerified) {
      return sendError(res, 401, "Please verify your email first. Check your inbox for the verification link.");
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return sendError(res, 401, "Invalid email or password");
    }

    // Update last login
    await supabase
      .from("users")
      .update({ lastLogin: new Date().toISOString() })
      .eq("id", user.id);

    // Generate token
    const token = generateToken(user.id);

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses || [],
    };

    return sendSuccess(res, 200, { user: userData, token }, "Login successful");
  } catch (error) {
    console.error("Login error:", error);
    return sendError(res, 500, "Error during login", error.message);
  }
};

/**
 * Verify Email
 * GET /api/auth/verify-email/:verificationToken
 */
exports.verifyEmail = async (req, res) => {
  try {
    const { verificationToken } = req.params;

    if (!verificationToken) {
      return sendError(res, 400, "Invalid verification token");
    }

    // Find user with this verification token
    const { data: users, error } = await supabase
      .from("users")
      .select("*")
      .eq("verificationToken", verificationToken);

    if (error || !users || users.length === 0) {
      return sendError(res, 400, "Invalid or expired verification token. You may already be verified.");
    }

    const user = users[0];

    // Already verified
    if (user.isVerified) {
      return sendSuccess(res, 200, null, "Email is already verified. You can now login.");
    }

    // Mark as verified and clear the token
    const { error: updateError } = await supabase
      .from("users")
      .update({
        isVerified: true,
        verificationToken: null,
      })
      .eq("id", user.id);

    if (updateError) {
      return sendError(res, 500, "Error verifying email", updateError.message);
    }

    // Now send the welcome email (only after successful verification)
    try {
      await sendWelcomeEmail(user.email, user.firstName);
    } catch (emailError) {
      console.error("Welcome email failed:", emailError);
    }

    return sendSuccess(res, 200, null, "Email verified successfully! You can now login.");
  } catch (error) {
    console.error("Verify email error:", error);
    return sendError(res, 500, "Error during email verification", error.message);
  }
};

/**
 * Google Login
 * POST /api/auth/google
 */
exports.googleLogin = async (req, res) => {
  try {
    const { email, firstName, lastName, googleId, photoUrl } = req.body;

    if (!email || !googleId) {
      return sendError(res, 400, "Email and googleId are required");
    }

    // Find user by googleId
    const { data: users } = await supabase
      .from("users")
      .select("*")
      .eq("googleId", googleId);

    let user;

    if (users && users.length > 0) {
      user = users[0];
    } else {
      // Check if email exists
      const { data: emailUsers } = await supabase
        .from("users")
        .select("*")
        .ilike("email", email.toLowerCase());

      if (emailUsers && emailUsers.length > 0) {
        // Update existing user with googleId
        const { data: updatedUser } = await supabase
          .from("users")
          .update({ googleId })
          .eq("id", emailUsers[0].id)
          .select()
          .single();
        user = updatedUser;
      } else {
        // Create new user
        const { data: newUser, error } = await supabase
          .from("users")
          .insert([{
            firstName: firstName || "User",
            lastName: lastName || "",
            email: email.toLowerCase(),
            googleId,
            role: "customer",
            isBlocked: false,
            isVerified: true, // Google users are auto-verified
            isActive: true,
          }])
          .select()
          .single();

        if (error) {
          console.error("Supabase insert error:", error);
          return sendError(res, 500, "Error creating user", error.message);
        }

        user = newUser;
      }
    }

    // Generate token
    const token = generateToken(user.id);

    // Set token in cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      addresses: user.addresses || [],
    };

    return sendSuccess(res, 200, { user: userData, token }, "Login successful");
  } catch (error) {
    console.error("Google login error:", error);
    return sendError(res, 500, "Error during login", error.message);
  }
};

/**
 * Get Current User
 * GET /api/auth/me
 */
exports.getMe = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return sendError(res, 401, "User not authenticated");
    }

    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !user) {
      return sendError(res, 404, "User not found");
    }

    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      email: user.email,
      phone: user.phone,
      role: user.role,
      isVerified: user.isVerified,
      addresses: user.addresses || [],
    };

    return sendSuccess(res, 200, userData, "User retrieved successfully");
  } catch (error) {
    console.error("Get user error:", error);
    return sendError(res, 500, "Error retrieving user", error.message);
  }
};

/**
 * Update Profile
 * PUT /api/auth/profile
 */
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userId;
    const { firstName, lastName, phone, email } = req.body;

    if (!userId) {
      return sendError(res, 401, "User not authenticated");
    }

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (req.body.name) updateData.name = req.body.name;
    if (phone) updateData.phone = phone;
    if (email) updateData.email = email;

    const { data: user, error } = await supabase
      .from("users")
      .update(updateData)
      .eq("id", userId)
      .select()
      .single();

    if (error) {
      return sendError(res, 500, "Error updating profile", error.message);
    }

    const userData = {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      addresses: user.addresses || [],
    };

    return sendSuccess(res, 200, userData, "Profile updated successfully");
  } catch (error) {
    console.error("Update profile error:", error);
    return sendError(res, 500, "Error updating profile", error.message);
  }
};

/**
 * Update Password
 * PUT /api/auth/password
 */
exports.updatePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!userId) {
      return sendError(res, 401, "User not authenticated");
    }

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      return sendError(res, 400, "All password fields are required");
    }

    if (newPassword !== confirmPassword) {
      return sendError(res, 400, "New passwords do not match");
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters");
    }

    // Get user
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("id", userId)
      .single();

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return sendError(res, 401, "Current password is incorrect");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    const { error } = await supabase
      .from("users")
      .update({ password: hashedPassword })
      .eq("id", userId);

    if (error) {
      return sendError(res, 500, "Error updating password", error.message);
    }

    return sendSuccess(res, 200, null, "Password updated successfully");
  } catch (error) {
    console.error("Update password error:", error);
    return sendError(res, 500, "Error updating password", error.message);
  }
};

/**
 * Forgot Password
 * POST /api/auth/forgot-password
 */
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return sendError(res, 400, "Email is required");
    }

    // Find user
    const { data: users } = await supabase
      .from("users")
      .select("*")
      .ilike("email", email.toLowerCase());

    if (!users || users.length === 0) {
      // Don't reveal if email exists for security
      return sendSuccess(res, 200, null, "If email exists, reset link has been sent");
    }

    const user = users[0];

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");
    const resetTokenExpire = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Update user with reset token
    await supabase
      .from("users")
      .update({
        resetPasswordToken: resetTokenHash,
        resetPasswordExpire: resetTokenExpire.toISOString(),
      })
      .eq("id", user.id);

    // Send email
    try {
      await sendPasswordResetEmail(user.email, resetToken);
    } catch (emailError) {
      console.error("Password reset email failed:", emailError);
      return sendError(res, 500, "Error sending reset email");
    }

    return sendSuccess(res, 200, null, "Password reset email sent");
  } catch (error) {
    console.error("Forgot password error:", error);
    return sendError(res, 500, "Error processing forgot password", error.message);
  }
};

/**
 * Reset Password
 * PUT /api/auth/reset-password/:resetToken
 */
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken } = req.params;
    const { password, confirmPassword } = req.body;

    // Validation
    if (!password || !confirmPassword) {
      return sendError(res, 400, "Password and confirm password are required");
    }

    if (password !== confirmPassword) {
      return sendError(res, 400, "Passwords do not match");
    }

    if (password.length < 6) {
      return sendError(res, 400, "Password must be at least 6 characters");
    }

    // Hash the token to compare with database
    const resetTokenHash = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Find user with valid reset token
    const { data: users } = await supabase
      .from("users")
      .select("*")
      .eq("resetPasswordToken", resetTokenHash);

    if (!users || users.length === 0) {
      return sendError(res, 400, "Invalid or expired reset token");
    }

    const user = users[0];

    // Check if token is expired
    if (new Date() > new Date(user.resetPasswordExpire)) {
      return sendError(res, 400, "Reset token has expired");
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user
    const { error } = await supabase
      .from("users")
      .update({
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpire: null,
      })
      .eq("id", user.id);

    if (error) {
      return sendError(res, 500, "Error resetting password", error.message);
    }

    return sendSuccess(res, 200, null, "Password reset successfully");
  } catch (error) {
    console.error("Reset password error:", error);
    return sendError(res, 500, "Error resetting password", error.message);
  }
};

/**
 * Logout
 * POST /api/auth/logout
 */
exports.logout = async (req, res) => {
  try {
    res.clearCookie("token");
    return sendSuccess(res, 200, null, "Logged out successfully");
  } catch (error) {
    console.error("Logout error:", error);
    return sendError(res, 500, "Error during logout", error.message);
  }
};

/**
 * Delete Account
 * DELETE /api/auth/account
 */
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return sendError(res, 401, "User not authenticated");
    }

    const { error } = await supabase.from("users").delete().eq("id", userId);

    if (error) {
      return sendError(res, 500, "Error deleting account", error.message);
    }

    res.clearCookie("token");
    return sendSuccess(res, 200, null, "Account deleted successfully");
  } catch (error) {
    console.error("Delete account error:", error);
    return sendError(res, 500, "Error deleting account", error.message);
  }
};
