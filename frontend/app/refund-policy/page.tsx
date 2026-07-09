import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07241D] text-[#F5F0E6] relative overflow-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,rgba(11,59,46,1)_100%)] z-0 pointer-events-none" />
      <Header />
      <main className="flex-grow pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#F5F0E6] via-[#D4AF37] to-[#F5F0E6] mb-4 text-center">
            Return & Refund Policy
          </h1>
          <p className="text-center text-[#D4AF37]/80 text-sm tracking-widest uppercase mb-12">
            Pavira Signature — The Art of Luxury
          </p>

          <div className="bg-[#112F24]/70 border border-[#D4AF37]/15 rounded-3xl p-8 md:p-12 backdrop-blur-2xl shadow-2xl space-y-8 font-light leading-relaxed text-[#F5F0E6]/90">
            <p>
              At <strong className="text-[#D4AF37]">Pavira Signature</strong>, we strive to provide high-quality wall décor products to our customers. However, if your online purchase is not quite right, we are here to help.
            </p>
            <p>
              Please read all product details, sizes, colors, materials, and descriptions carefully before confirming your order.
            </p>

            <hr className="border-[#D4AF37]/20" />

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">1. Return Policy</h2>
              <p className="mb-4">
                You can request a return or replacement within <strong className="text-[#D4AF37]">48 hours</strong> of receiving your order. The product must be unused, undamaged, and in its original packaging with all tags, accessories, fittings, invoice, and other items intact.
              </p>
              <div className="bg-[#0B3B2E]/40 border border-yellow-500/20 p-4 rounded-xl mb-4">
                <p className="text-sm text-yellow-500 font-semibold mb-1">Important Requirement:</p>
                <p className="text-sm">You must provide a <strong>clear unboxing video</strong> and <strong>clear images</strong> of the received product to process your return or replacement request.</p>
              </div>
              <p>
                To initiate a return, please email us at <a href="mailto:support@pavirasignature.in" className="text-[#D4AF37] underline">support@pavirasignature.in</a> or WhatsApp at <strong className="text-[#D4AF37]">+91 8487816296</strong> with your order details and the reason for the return.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">2. Wrong, Damaged, or Incomplete Products</h2>
              <p className="mb-4">
                If you receive a wrong item, damaged product, incorrect size sent by us, incomplete product, or product with a manufacturing defect, we will be happy to provide a replacement. Contact must be made within <strong className="text-[#D4AF37]">48 hours</strong> of receiving the product.
              </p>
              <p className="mb-2">Please share:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Order number</li>
                <li>Clear product and outer packaging photos</li>
                <li>Unboxing video & Issue details</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">3. Change of Mind or Size Not as Required</h2>
              <p className="mb-4">
                As these are art and décor products, please note that there may be slight variations in look, finish, color, texture, and size. Minor variations are normal for handmade, hand-finished, customized, or made-to-order products.
              </p>
              <p>
                Returns for &quot;changed my mind&quot; or &quot;size not as per requirement&quot; are accepted only if the product is unused, undamaged, in original packaging, and approved by our team. <strong className="text-[#D4AF37]">Return shipping costs in such cases will be borne by the customer.</strong>
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">4. Non-Returnable and Non-Refundable Items</h2>
              <p className="mb-3">
                The following products are not eligible for return, refund, or exchange unless they are damaged, defective, or wrongly delivered:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Customized and personalized products</li>
                <li>Made-to-order wall clocks & wall arts</li>
                <li>Canvas paintings made as per selected size or design</li>
                <li>Special-size products & Bulk order products</li>
                <li>Clearance or sale items</li>
                <li>Products that have been used, installed, scratched, broken, washed, altered, or modified</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">5. Refund Policy</h2>
              <p className="mb-4">
                Once we receive and inspect the returned product, we will notify you about the approval or rejection of your refund. If approved, the refund will be processed within <strong className="text-[#D4AF37]">5 to 7 working days</strong>.
              </p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li><strong>Prepaid Orders:</strong> Refund processed to the original payment method.</li>
                <li><strong>COD Orders:</strong> Refund processed through bank transfer. The customer must share: Bank Name, Beneficiary Name, Account Number, IFSC Code, and Branch Name.</li>
              </ul>
              <p>
                COD charges, payment gateway charges, and return pickup courier charges, if any, are <strong className="text-red-400">non-refundable</strong>.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">6. Replacement & Exchange Policy</h2>
              <p className="mb-3">
                If you receive a damaged, defective, incorrect, or incomplete product, we offer a replacement for the same product after verification.
              </p>
              <p>
                For exchanges (different design, size, or color), requests must be made within <strong className="text-[#D4AF37]">48 hours</strong> of delivery and require supporting images. Additional charges may apply depending on product price differences and <strong className="text-[#D4AF37]">return pickup costs</strong>.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">7. Cancellation Policy</h2>
              <p>
                Customers must request a cancellation within <strong className="text-[#D4AF37]">4 hours</strong> of placing the order. Cancellations beyond this timeframe will not be accepted. For approved cancellations, a deduction of <strong className="text-[#D4AF37]">up to 20% of the order value</strong>, along with applicable transaction charges of up to 3% for prepaid orders, may apply. Once the order has been dispatched, it cannot be canceled.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">8. Custom Product Orders</h2>
              <p>
                Custom products are non-refundable, non-cancellable, and non-exchangeable. They can only be replaced if they arrive incorrect, damaged, or defective (contact must be made within 24 hours with clear photos and an unboxing video).
              </p>
            </div>

            <hr className="border-[#D4AF37]/20" />

            <div className="bg-[#0B3B2E]/50 border border-[#D4AF37]/10 p-6 rounded-2xl text-sm">
              <h2 className="text-xl font-serif text-[#D4AF37] mb-4">Support & Inquiries</h2>
              <div className="space-y-1 font-normal text-[#F5F0E6]/80">
                <p><strong>Email:</strong> <a href="mailto:support@pavirasignature.in" className="hover:text-[#D4AF37] underline transition-colors">support@pavirasignature.in</a></p>
                <p><strong>WhatsApp:</strong> <a href="https://wa.me/918487816296" className="hover:text-[#D4AF37] underline transition-colors">+91 8487816296</a></p>
                <p><strong>Location:</strong> Ahmedabad, Gujarat, India</p>
                <p><strong>Opening Hours:</strong> Monday to Saturday, 10:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
