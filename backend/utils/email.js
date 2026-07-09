/**
 * Email Service Utility
 * Handles all email communications
 */

const nodemailer = require("nodemailer");

const EMAIL_SERVICE = process.env.EMAIL_SERVICE || "Gmail";
const EMAIL_USER = process.env.EMAIL_USER || "pavirasignature@gmail.com";
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD || "hatb ijfn wete fhww";
const EMAIL_FROM =
  process.env.EMAIL_FROM || "Pavira Signature <pavirasignature@gmail.com>";

const transporter = nodemailer.createTransport({
  service: EMAIL_SERVICE,
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

/**
 * Send Welcome Email — Luxury Branded Template
 */
const sendWelcomeEmail = async (userEmail, userName) => {
  try {
    const frontendUrl =
      process.env.FRONTEND_URL || "https://pavira-signature.vercel.app";
    const logoUrl = `${frontendUrl}/logo.png`;

    const mailOptions = {
      from: `Pavira Signature <${EMAIL_USER}>`,
      to: userEmail,
      replyTo: EMAIL_USER,
      subject: `Welcome to Pavira Signature, ${userName}!`,
      headers: {
        "X-Priority": "3",
        "X-Mailer": "Pavira Signature Mailer",
        Precedence: "bulk",
        "List-Unsubscribe": `<mailto:${EMAIL_USER}?subject=unsubscribe>`,
      },
      text: `Welcome to Pavira Signature, ${userName}!\n\nThank you for creating your account with Pavira Signature.\n\nWe are delighted to welcome you to our world of premium home decor, crafted to bring elegance, meaning, and luxury to your space.\n\nExplore our exclusive collection of Wall Arts, Wall Clocks, 3D Layer Arts, Mandala Designs, Canvas Painting, and Signature Decor Pieces.\n\nVisit us: ${frontendUrl}/products\n\n© 2026 Pavira Signature. All rights reserved.`,
      html: `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Welcome to Pavira Signature</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .stack-column { display: block !important; width: 100% !important; }
      .mobile-padding { padding: 30px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a1914; font-family: 'Times New Roman', Times, Georgia, serif;">

  <!-- Outer Wrapper -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a1914;">
    <tr>
      <td align="center" style="padding: 30px 15px;">

        <!-- Main Container Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; background-color: #0b1a15; border: 1px solid rgba(212,175,55,0.2); border-radius: 15px; overflow: hidden;">

          <!-- ========== LOGO ========== -->
          <tr>
            <td align="center" style="padding: 45px 40px 15px 40px;" class="mobile-padding">
              <img src="${logoUrl}" alt="Pavira Signature Logo" width="80" height="80" style="display: block; width: 80px; height: 80px; border: 0;" />
            </td>
          </tr>

          <!-- ========== WELCOME TO — with gold lines ========== -->
          <tr>
            <td align="center" style="padding: 10px 40px 0 40px;" class="mobile-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="border-bottom: 1px solid #d4af37; width: 30%;">&nbsp;</td>
                  <td align="center" style="padding: 0 15px; white-space: nowrap;">
                    <span style="font-family: 'Times New Roman', Times, Georgia, serif; font-size: 12px; font-weight: 400; color: #d4af37; text-transform: uppercase; letter-spacing: 3px;">Welcome To</span>
                  </td>
                  <td style="border-bottom: 1px solid #d4af37; width: 30%;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ========== PAVIRA SIGNATURE, ========== -->
          <tr>
            <td align="center" style="padding: 12px 40px 0 40px;" class="mobile-padding">
              <h1 style="margin: 0; font-family: 'Times New Roman', Times, Georgia, serif; font-size: 36px; font-weight: 700; color: #f0f0f0; text-transform: uppercase; letter-spacing: 3px; line-height: 1.2;">
                Pavira Signature,
              </h1>
            </td>
          </tr>

          <!-- ========== NAME — Cursive Gold ========== -->
          <tr>
            <td align="center" style="padding: 0 40px 10px 40px;" class="mobile-padding">
              <p style="margin: 0; font-family: 'Great Vibes', 'Brush Script MT', cursive; font-size: 48px; color: #d4af37; line-height: 1.3;">
                ${userName}!
              </p>
            </td>
          </tr>

          <!-- ========== HEART DIVIDER ========== -->
          <tr>
            <td align="center" style="padding: 5px 60px 20px 60px;" class="mobile-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="border-bottom: 1px solid #d4af37; width: 42%;">&nbsp;</td>
                  <td align="center" style="padding: 0 12px; white-space: nowrap;">
                    <span style="font-size: 18px; color: #d4af37; line-height: 1;">&hearts;</span>
                  </td>
                  <td style="border-bottom: 1px solid #d4af37; width: 42%;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ========== PARAGRAPH 1 ========== -->
          <tr>
            <td align="center" style="padding: 5px 45px;" class="mobile-padding">
              <p style="margin: 0; font-family: 'Times New Roman', Times, Georgia, serif; font-size: 15px; color: #e0e0e0; line-height: 1.7; text-align: center;">
                Thank you for creating your account with<br />
                <span style="color: #d4af37; font-weight: 500;">Pavira Signature.</span>
              </p>
            </td>
          </tr>

          <!-- ========== PARAGRAPH 2 ========== -->
          <tr>
            <td align="center" style="padding: 18px 45px;" class="mobile-padding">
              <p style="margin: 0; font-family: 'Times New Roman', Times, Georgia, serif; font-size: 15px; color: #e0e0e0; line-height: 1.7; text-align: center;">
                We are delighted to welcome you to our world of<br />
                premium home d&eacute;cor, crafted to bring <span style="color: #d4af37; font-weight: 500;">elegance,</span><br />
                <span style="color: #d4af37; font-weight: 500;">meaning,</span> and <span style="color: #d4af37; font-weight: 500;">luxury</span> to your space.
              </p>
            </td>
          </tr>

          <!-- ========== PARAGRAPH 3 ========== -->
          <tr>
            <td align="center" style="padding: 5px 45px;" class="mobile-padding">
              <p style="margin: 0; font-family: 'Times New Roman', Times, Georgia, serif; font-size: 15px; color: #e0e0e0; line-height: 1.7; text-align: center;">
                Explore our exclusive collection of Wall Arts,<br />
                Wall Clocks, 3D Layer Arts, Mandala Designs,<br />
                Resin Arts, and Signature D&eacute;cor Pieces.
              </p>
            </td>
          </tr>

          <!-- ========== CTA BUTTON ========== -->
          <tr>
            <td align="center" style="padding: 35px 40px 45px 40px;" class="mobile-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius: 4px; background: linear-gradient(135deg, #d4af37 0%, #cda45e 100%);" bgcolor="#d4af37">
                    <a href="${frontendUrl}/products" target="_blank" style="display: inline-block; padding: 16px 38px; font-family: 'Times New Roman', Times, Georgia, serif; font-size: 13px; font-weight: 700; color: #0b1a15; text-decoration: none; text-transform: uppercase; letter-spacing: 2.5px; border-radius: 4px; border: 1px solid #d4af37;">
                      Explore Collection
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End Main Container Card -->

        <!-- ========== FOOTER ========== -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; margin-top: 0;">
          <tr>
            <td align="center" style="background-color: #eaddcd; padding: 20px 30px 16px 30px; border-radius: 0 0 10px 10px;">
              <p style="margin: 0; font-family: 'Times New Roman', Times, Georgia, serif; font-size: 12px; font-weight: 400; color: #3a3a3a; letter-spacing: 0.5px;">
                &copy; 2026 Pavira Signature. All rights reserved.
              </p>
            </td>
          </tr>
          <!-- Gold accent strip at bottom of footer -->
          <tr>
            <td style="height: 3px; background-color: #d4af37; border-radius: 0 0 10px 10px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
        </table>
        <!-- End Footer -->

      </td>
    </tr>
  </table>
  <!-- End Outer Wrapper -->

</body>
</html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw error;
  }
};

/**
 * Send Order Confirmation Email
 */
const sendOrderConfirmationEmail = async (userEmail, order) => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: userEmail,
      subject: `Order Confirmation - ${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">PAVIRA</h1>
            <p style="margin: 10px 0 0 0; font-size: 12px; letter-spacing: 3px;">SIGNATURE</p>
          </div>
          <div style="padding: 40px; background-color: #f9f9f9;">
            <h2 style="color: #000; font-size: 20px; margin: 0 0 20px 0;">Order Confirmed!</h2>
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your order. Your order ID is: <strong>${order._id}</strong>
            </p>
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Total Amount: <strong>₹${order.totalPrice.toLocaleString("en-IN")}</strong>
            </p>
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              We're processing your order and you'll receive a shipping update soon.
            </p>
          </div>
          <div style="padding: 20px; background-color: #000; color: #fff; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2026 Pavira Signature. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Order confirmation email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending order confirmation email:", error);
    throw error;
  }
};

/**
 * Send Password Reset Email
 */
const sendPasswordResetEmail = async (userEmail, resetToken) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "https://pavira-signature.vercel.app";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    const logoUrl = `${frontendUrl}/logo.png`;

    const mailOptions = {
      from: EMAIL_FROM,
      to: userEmail,
      subject: "Reset Your Password — Pavira Signature",
      text: `Reset Your Password - Pavira Signature\n\nClick the link below to reset your password. This link is valid for 1 hour.\n\nReset Link: ${resetUrl}\n\nIf you didn't request a password reset, please ignore this email.\n\n© 2026 Pavira Signature. All rights reserved.`,
      html: `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Reset Your Password — Pavira Signature</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <link href="https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap" rel="stylesheet" />
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .stack-column { display: block !important; width: 100% !important; }
      .mobile-padding { padding: 30px 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0a1914; font-family: 'Times New Roman', Times, Georgia, serif;">

  <!-- Outer Wrapper -->
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #0a1914;">
    <tr>
      <td align="center" style="padding: 30px 15px;">

        <!-- Main Container Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; background-color: #0b1a15; border: 1px solid rgba(212,175,55,0.2); border-radius: 15px; overflow: hidden;">

          <!-- ========== LOGO ========== -->
          <tr>
            <td align="center" style="padding: 45px 40px 15px 40px;" class="mobile-padding">
              <img src="${logoUrl}" alt="Pavira Signature Logo" width="80" height="80" style="display: block; width: 80px; height: 80px; border: 0;" />
            </td>
          </tr>

          <!-- ========== WELCOME TO — with gold lines ========== -->
          <tr>
            <td align="center" style="padding: 10px 40px 0 40px;" class="mobile-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="border-bottom: 1px solid #d4af37; width: 25%;">&nbsp;</td>
                  <td align="center" style="padding: 0 15px; white-space: nowrap;">
                    <span style="font-family: 'Times New Roman', Times, Georgia, serif; font-size: 12px; font-weight: 400; color: #d4af37; text-transform: uppercase; letter-spacing: 3px;">Security Update</span>
                  </td>
                  <td style="border-bottom: 1px solid #d4af37; width: 25%;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ========== PAVIRA SIGNATURE ========== -->
          <tr>
            <td align="center" style="padding: 12px 40px 0 40px;" class="mobile-padding">
              <h1 style="margin: 0; font-family: 'Times New Roman', Times, Georgia, serif; font-size: 36px; font-weight: 700; color: #f0f0f0; text-transform: uppercase; letter-spacing: 3px; line-height: 1.2;">
                Pavira Signature
              </h1>
            </td>
          </tr>

          <!-- ========== NAME — Cursive Gold ========== -->
          <tr>
            <td align="center" style="padding: 0 40px 10px 40px;" class="mobile-padding">
              <p style="margin: 0; font-family: 'Great Vibes', 'Brush Script MT', cursive; font-size: 48px; color: #d4af37; line-height: 1.3;">
                Reset Request
              </p>
            </td>
          </tr>

          <!-- ========== HEART DIVIDER ========== -->
          <tr>
            <td align="center" style="padding: 5px 60px 20px 60px;" class="mobile-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="border-bottom: 1px solid #d4af37; width: 42%;">&nbsp;</td>
                  <td align="center" style="padding: 0 12px; white-space: nowrap;">
                    <span style="font-size: 18px; color: #d4af37; line-height: 1;">&hearts;</span>
                  </td>
                  <td style="border-bottom: 1px solid #d4af37; width: 42%;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ========== PARAGRAPH 1 ========== -->
          <tr>
            <td align="center" style="padding: 5px 45px;" class="mobile-padding">
              <p style="margin: 0; font-family: 'Times New Roman', Times, Georgia, serif; font-size: 15px; color: #e0e0e0; line-height: 1.7; text-align: center;">
                We received a request to reset the password for your account with<br />
                <span style="color: #d4af37; font-weight: 500;">Pavira Signature.</span>
              </p>
            </td>
          </tr>

          <!-- ========== PARAGRAPH 2 ========== -->
          <tr>
            <td align="center" style="padding: 18px 45px;" class="mobile-padding">
              <p style="margin: 0; font-family: 'Times New Roman', Times, Georgia, serif; font-size: 15px; color: #e0e0e0; line-height: 1.7; text-align: center;">
                Please click the button below to update your login credentials.<br />
                This secure link will be active for <span style="color: #d4af37; font-weight: 500;">1 hour.</span>
              </p>
            </td>
          </tr>

          <!-- ========== CTA BUTTON ========== -->
          <tr>
            <td align="center" style="padding: 25px 40px 35px 40px;" class="mobile-padding">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="border-radius: 4px; background: linear-gradient(135deg, #d4af37 0%, #cda45e 100%);" bgcolor="#d4af37">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; padding: 16px 38px; font-family: 'Times New Roman', Times, Georgia, serif; font-size: 13px; font-weight: 700; color: #0b1a15; text-decoration: none; text-transform: uppercase; letter-spacing: 2.5px; border-radius: 4px; border: 1px solid #d4af37;">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ========== PARAGRAPH 3 (Notice) ========== -->
          <tr>
            <td align="center" style="padding: 5px 45px 45px 45px;" class="mobile-padding">
              <p style="margin: 0; font-family: 'Times New Roman', Times, Georgia, serif; font-size: 12px; color: #888888; line-height: 1.6; text-align: center;">
                If you did not make this request, you can safely ignore this message.<br />
                Your password will remain secure and unchanged.
              </p>
            </td>
          </tr>

        </table>
        <!-- End Main Container Card -->

        <!-- ========== FOOTER ========== -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="600" class="email-container" style="max-width: 600px; margin-top: 0;">
          <tr>
            <td align="center" style="background-color: #eaddcd; padding: 20px 30px 16px 30px; border-radius: 0 0 10px 10px;">
              <p style="margin: 0; font-family: 'Times New Roman', Times, Georgia, serif; font-size: 12px; font-weight: 400; color: #3a3a3a; letter-spacing: 0.5px;">
                &copy; 2026 Pavira Signature. All rights reserved.
              </p>
            </td>
          </tr>
          <!-- Gold accent strip at bottom of footer -->
          <tr>
            <td style="height: 3px; background-color: #d4af37; border-radius: 0 0 10px 10px; font-size: 0; line-height: 0;">&nbsp;</td>
          </tr>
        </table>
        <!-- End Footer -->

      </td>
    </tr>
  </table>
  <!-- End Outer Wrapper -->

</body>
</html>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};

/**
 * Send Shipping Update Email
 */
const sendShippingUpdateEmail = async (userEmail, order) => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: userEmail,
      subject: `Your Order is Shipped - ${order.orderNumber || order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">PAVIRA</h1>
            <p style="margin: 10px 0 0 0; font-size: 12px; letter-spacing: 3px;">SIGNATURE</p>
          </div>
          <div style="padding: 40px; background-color: #f9f9f9;">
            <h2 style="color: #000; font-size: 20px; margin: 0 0 20px 0;">Your Order is on the Way!</h2>
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Order Number: <strong>${order.orderNumber || order._id}</strong>
            </p>
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Shipping Partner: <strong>${order.tracking?.carrier || "Delhivery"}</strong>
            </p>
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Tracking AWB: <strong>${order.tracking?.trackingNumber || "N/A"}</strong>
            </p>
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Estimated Delivery: <strong>${order.tracking?.estimatedDelivery ? new Date(order.tracking.estimatedDelivery).toLocaleDateString("en-IN") : "3-4 Days"}</strong>
            </p>
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              You can track your package details live under the Pavira Signature dashboard!
            </p>
          </div>
          <div style="padding: 20px; background-color: #000; color: #fff; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2026 Pavira Signature. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Shipping update email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending shipping update email:", error);
    throw error;
  }
};

/**
 * Send Email Verification Email
 */
const sendVerificationEmail = async (
  userEmail,
  userName,
  verificationToken,
) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || "https://pavira-signature.vercel.app";
    const verificationUrl = `${frontendUrl}/verify-email/${verificationToken}`;

    const mailOptions = {
      from: EMAIL_FROM,
      to: userEmail,
      subject: "Verify Your Email - Pavira Signature",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #000 0%, #1a1a1a 100%); padding: 40px; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 300; letter-spacing: 2px;">PAVIRA</h1>
            <p style="margin: 10px 0 0 0; font-size: 12px; letter-spacing: 3px;">SIGNATURE</p>
          </div>
          <div style="padding: 40px; background-color: #f9f9f9;">
            <h2 style="color: #000; font-size: 20px; margin: 0 0 20px 0;">Verify Your Email Address</h2>
            <p style="color: #555; line-height: 1.6; margin-bottom: 20px;">
              Hello ${userName}, thank you for registering with Pavira Signature.
            </p>
            <p style="color: #555; line-height: 1.6; margin-bottom: 30px;">
              Please click the button below to verify your email address and activate your account. This link is valid for 24 hours.
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" style="display: inline-block; background: #d4af37; color: #000; padding: 14px 36px; text-decoration: none; font-weight: bold; letter-spacing: 1px; border-radius: 2px;">VERIFY EMAIL</a>
            </div>
            <p style="color: #888; font-size: 12px; margin-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${verificationUrl}" style="color: #d4af37; word-break: break-all;">${verificationUrl}</a>
            </p>
            <p style="color: #888; font-size: 12px;">
              If you did not create an account, you can safely ignore this email.
            </p>
          </div>
          <div style="padding: 20px; background-color: #000; color: #fff; text-align: center; font-size: 12px;">
            <p style="margin: 0;">© 2026 Pavira Signature. All rights reserved.</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${userEmail}`);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

module.exports = {
  sendWelcomeEmail,
  sendVerificationEmail,
  sendOrderConfirmationEmail,
  sendPasswordResetEmail,
  sendShippingUpdateEmail,
};
