/**
 * Invoice/PDF Generation Utility
 * Generate GST invoices and receipts
 */

const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

/**
 * Generate Invoice PDF
 */
const generateInvoice = async (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
      });

      // Create invoices directory if it doesn't exist
      const invoicesDir = path.join(__dirname, "../invoices");
      if (!fs.existsSync(invoicesDir)) {
        fs.mkdirSync(invoicesDir, { recursive: true });
      }

      const filename = `invoice-${order._id}.pdf`;
      const filepath = path.join(invoicesDir, filename);
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header with company logo
      doc.fontSize(24).font("Helvetica-Bold").fillColor("#D4AF37").text("PAVIRA", 50, 50);
      doc.fontSize(10).font("Helvetica").fillColor("#888888").text("SIGNATURE | PREMIUM HOME DECOR", 50, 80);

      // Invoice title
      doc.fontSize(20).font("Helvetica-Bold").fillColor("#D4AF37").text("TAX INVOICE", 400, 50);

      // Invoice details
      doc.fontSize(9).font("Helvetica").fillColor("#333333");
      doc.text(`Invoice No: INV-${order.orderNumber}`, 400, 90);
      doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`, 400, 105);
      doc.text(`Payment: ${order.paymentMethod.toUpperCase()} (${order.paymentInfo?.paymentStatus || "pending"})`, 400, 120);
      doc.text(`Order Status: ${order.orderStatus.toUpperCase()}`, 400, 135);

      // Billing & Shipping information
      doc.fontSize(12).font("Helvetica-Bold").fillColor("#D4AF37").text("BILL & SHIP TO:", 50, 160);
      doc.fontSize(10).font("Helvetica").fillColor("#333333");
      doc.text(`${order.shippingAddress.fullName}`, 50, 180);
      doc.text(`Phone: ${order.shippingAddress.phone}`, 50, 195);
      if (user && user.email) {
        doc.text(`Email: ${user.email}`, 50, 210);
      }
      doc.text(`${order.shippingAddress.addressLine1}`, 50, 225);
      if (order.shippingAddress.addressLine2) {
        doc.text(`${order.shippingAddress.addressLine2}`, 50, 240);
      }
      doc.text(
        `${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.postalCode}`,
        50,
        order.shippingAddress.addressLine2 ? 255 : 240,
      );
      doc.text(`${order.shippingAddress.country}`, 50, order.shippingAddress.addressLine2 ? 270 : 255);

      // Items table header
      const tableTop = 310;
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#D4AF37");
      doc.text("Item Details", 50, tableTop);
      doc.text("Qty", 250, tableTop);
      doc.text("Price", 300, tableTop);
      doc.text("GST (18%)", 370, tableTop);
      doc.text("Total (INR)", 450, tableTop);

      // Draw a line under header
      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).strokeColor("#D4AF37").stroke();

      // Items
      doc.fontSize(10).font("Helvetica").fillColor("#333333");
      let yPosition = tableTop + 25;

      order.items.forEach((item) => {
        const itemTotal = item.price * item.quantity;
        const gst = itemTotal * 0.18;

        doc.text(item.name.substring(0, 28), 50, yPosition);
        doc.text(String(item.quantity), 250, yPosition);
        doc.text(`₹${item.price.toLocaleString("en-IN")}`, 300, yPosition);
        doc.text(`₹${gst.toFixed(2)}`, 370, yPosition);
        doc.text(`₹${itemTotal.toLocaleString("en-IN")}`, 450, yPosition);

        yPosition += 25;
      });

      // Draw another line
      doc.moveTo(50, yPosition).lineTo(550, yPosition).strokeColor("#D4AF37").stroke();

      // Totals section
      yPosition += 15;
      doc.fontSize(11).font("Helvetica-Bold").fillColor("#D4AF37");
      doc.text("Subtotal:", 300, yPosition);
      doc.font("Helvetica").fillColor("#333333").text(`₹${order.itemsPrice.toLocaleString("en-IN")}`, 450, yPosition);

      yPosition += 20;
      doc.font("Helvetica-Bold").fillColor("#D4AF37").text("GST (18%):", 300, yPosition);
      doc.font("Helvetica").fillColor("#333333").text(`₹${order.taxPrice.toLocaleString("en-IN")}`, 450, yPosition);

      yPosition += 20;
      doc.font("Helvetica-Bold").fillColor("#D4AF37").text("Shipping:", 300, yPosition);
      doc.font("Helvetica").fillColor("#333333").text(order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice.toLocaleString("en-IN")}`, 450, yPosition);

      if (order.discountPrice && order.discountPrice > 0) {
        yPosition += 20;
        doc.font("Helvetica-Bold").fillColor("#4CAF50").text("Discount:", 300, yPosition);
        doc.text(`-₹${order.discountPrice.toLocaleString("en-IN")}`, 450, yPosition);
      }

      yPosition += 25;
      doc.fontSize(12).font("Helvetica-Bold").fillColor("#D4AF37");
      doc.text("TOTAL AMOUNT:", 300, yPosition);
      doc.text(`₹${order.totalPrice.toLocaleString("en-IN")}`, 450, yPosition);

      // Footer
      doc.fontSize(8).font("Helvetica").fillColor("#888888");
      doc.text("This is an electronically generated GST tax invoice. No signature required.", 50, 740);
      doc.text("Thank you for your purchase from Pavira Signature!", 50, 755);
      doc.text("© 2026 Pavira Signature. All rights reserved.", 50, 770);

      doc.end();

      stream.on("finish", () => {
        resolve(filepath);
      });
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = {
  generateInvoice,
};
