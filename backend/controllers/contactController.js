/**
 * Contact / Inquiry Controller
 * Handles incoming customer inquiries and dispatches notification emails to admin & customer
 * 
 * SECURITY FEATURES:
 * - Rate limiting (5 requests per 15 minutes per IP)
 * - Email validation with RFC 5322 compliance
 * - Disposable email domain blocking (200+ domains)
 * - Duplicate submission detection (10-minute window)
 * - Honeypot field protection (invisible bot trap)
 * - Input sanitization and trimming
 */

const { sendError, sendSuccess } = require("../utils/response");
const {
  sendInquiryEmailToAdmin,
  sendInquiryConfirmationToCustomer,
} = require("../utils/email");
const { supabase } = require("../utils/supabase");
const { validateEmail } = require("../utils/emailValidator");
const { isDuplicateSubmission, recordSubmission } = require("../utils/submissionCache");

exports.submitInquiry = async (req, res) => {
  try {
    const { name, email, subject, message, website, phone_number } = req.body;

    // SECURITY CHECK #1: Honeypot Field Protection
    // "website" and "phone_number" are hidden fields that should remain empty
    // If filled, it indicates a bot submission
    if (website || phone_number) {
      console.warn(`[HONEYPOT TRIGGERED] Bot detected from IP: ${req.ip}`);
      // Return success to avoid revealing anti-bot mechanism
      return sendSuccess(
        res,
        200,
        { sent: true },
        "Your inquiry has been received. Our art concierge team will contact you within 24 hours.",
      );
    }

    // VALIDATION: Basic field presence checks
    if (!name || !name.trim()) {
      return sendError(res, 400, "Please provide your name");
    }

    if (!email || !email.trim()) {
      return sendError(res, 400, "Please provide your email address");
    }

    if (!message || !message.trim()) {
      return sendError(res, 400, "Please provide your inquiry details or message");
    }

    // SECURITY CHECK #2: Advanced Email Validation
    const emailValidation = validateEmail(email);
    if (!emailValidation.valid) {
      return sendError(res, 400, emailValidation.reason);
    }

    const cleanData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: (subject || "General Inquiry").trim(),
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    // SECURITY CHECK #3: Duplicate Submission Detection
    if (isDuplicateSubmission(cleanData.email, cleanData.message)) {
      return sendError(
        res,
        429,
        "You have already submitted this inquiry recently. Please wait 10 minutes before resubmitting, or email us directly at connect@pavirasignature.in.",
      );
    }

    // SECURITY CHECK #3: Duplicate Submission Detection
    if (isDuplicateSubmission(cleanData.email, cleanData.message)) {
      return sendError(
        res,
        429,
        "You have already submitted this inquiry recently. Please wait 10 minutes before resubmitting, or email us directly at care@pavirasignature.in.",
      );
    }

    // 1. Send Notification Email to Admin (care@pavirasignature.in)
    await sendInquiryEmailToAdmin(cleanData);

    // 2. Send Confirmation Email to Customer
    sendInquiryConfirmationToCustomer(cleanData).catch((err) =>
      console.warn("Customer confirmation email non-fatal error:", err.message),
    );

    // 3. Record submission in cache to prevent duplicates
    recordSubmission(cleanData.email, cleanData.message);

    // 4. Store inquiry in Supabase for audit/admin history (if table exists)
    try {
      await supabase.from("inquiries").insert([
        {
          name: cleanData.name,
          email: cleanData.email,
          subject: cleanData.subject,
          message: cleanData.message,
          status: "unread",
          created_at: cleanData.created_at,
        },
      ]);
    } catch (dbErr) {
      console.log("Inquiries table logging note:", dbErr.message);
    }

    console.log(`[INQUIRY SUCCESS] From: ${cleanData.email} | Subject: ${cleanData.subject}`);

    return sendSuccess(
      res,
      200,
      { sent: true },
      "Your inquiry has been received. Our art concierge team will contact you within 24 hours.",
    );
  } catch (error) {
    console.error("Submit inquiry error:", error);
    return sendError(
      res,
      500,
      "Unable to transmit your message at this time. Please try again or email us directly at care@pavirasignature.in.",
      error.message,
    );
  }
};
