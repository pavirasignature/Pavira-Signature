/**
 * Contact / Inquiry Controller
 * Handles incoming customer inquiries and dispatches notification emails to admin & customer
 */

const { sendError, sendSuccess } = require("../utils/response");
const {
  sendInquiryEmailToAdmin,
  sendInquiryConfirmationToCustomer,
} = require("../utils/email");
const { supabase } = require("../utils/supabase");

exports.submitInquiry = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !name.trim()) {
      return sendError(res, 400, "Please provide your name");
    }

    if (!email || !email.trim() || !email.includes("@")) {
      return sendError(res, 400, "Please provide a valid email address");
    }

    if (!message || !message.trim()) {
      return sendError(res, 400, "Please provide your inquiry details or message");
    }

    const cleanData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: (subject || "General Inquiry").trim(),
      message: message.trim(),
      created_at: new Date().toISOString(),
    };

    // 1. Send Notification Email to Admin (connect@pavirasignature.in)
    await sendInquiryEmailToAdmin(cleanData);

    // 2. Send Confirmation Email to Customer
    sendInquiryConfirmationToCustomer(cleanData).catch((err) =>
      console.warn("Customer confirmation email non-fatal error:", err.message),
    );

    // 3. Store inquiry in Supabase for audit/admin history (if table exists)
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
      "Unable to transmit your message at this time. Please try again or email us directly at connect@pavirasignature.in.",
      error.message,
    );
  }
};
