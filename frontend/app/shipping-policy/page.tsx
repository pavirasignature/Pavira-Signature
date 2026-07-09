import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07241D] text-[#F5F0E6] relative overflow-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,rgba(11,59,46,1)_100%)] z-0 pointer-events-none" />
      <Header />
      <main className="flex-grow pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#F5F0E6] via-[#D4AF37] to-[#F5F0E6] mb-4 text-center">
            Shipping Policy
          </h1>
          <p className="text-center text-[#D4AF37]/80 text-sm tracking-widest uppercase mb-12">
            Pavira Signature — The Art of Luxury
          </p>

          <div className="bg-[#112F24]/70 border border-[#D4AF37]/15 rounded-3xl p-8 md:p-12 backdrop-blur-2xl shadow-2xl space-y-8 font-light leading-relaxed text-[#F5F0E6]/90">
            <p>
              Welcome to <strong className="text-[#D4AF37]">Pavira Signature</strong>!
            </p>
            <p>
              At Pavira Signature, our top priority is to deliver your product safely and as quickly as possible. We ship across India and provide free shipping on prepaid and COD orders, unless mentioned otherwise on the product page or during checkout.
            </p>

            <hr className="border-[#D4AF37]/20" />

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-4">Shipping Rates</h2>
              <p>
                For prepaid and COD orders, we charge no shipping and handling fee. <strong className="text-[#D4AF37]">Free shipping is included</strong> on eligible orders across India.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-4">Order Processing</h2>
              <p className="mb-4">
                Time taken to dispatch a product depends on the type of product, size, quantity, customization, and availability.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  General products like <strong className="text-[#D4AF37]">wall clocks, wall arts, canvas paintings, and designer home décor products</strong> are usually dispatched within <strong className="text-[#D4AF37]">1 to 2 working days</strong> after order confirmation.
                </li>
                <li>
                  Large quantity orders, customized orders, handmade products, or special-size products may take more time. In such cases, the estimated dispatch timeline will be shared with the customer once the order is confirmed.
                </li>
                <li>
                  Our business days are <strong className="text-[#D4AF37]">Monday to Saturday</strong>, excluding Sundays and public holidays.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-4">Courier Partners</h2>
              <p>
                We work with reputed courier partners for domestic deliveries across India. For remote locations where regular courier services are not available, delivery may be done through alternate courier services or India Post/Speed Post, depending on serviceability.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-4">Delivery Time</h2>
              <p className="mb-4">
                For most serviceable pin codes, we try to deliver within <strong className="text-[#D4AF37]">5 to 8 working days</strong> after dispatch.
              </p>
              <p className="mb-4">
                However, depending on the product size, delivery location, courier service, weather, strikes, festivals, remote location, stocking issues, or any other unforeseen circumstances, delivery may take longer.
              </p>
              <p>
                Tracking details will be shared with you by email, SMS, or WhatsApp once your order is shipped.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-4">Customized and Bulk Orders</h2>
              <p>
                For customized and bulk orders, customers are requested to contact us before placing the order. The above shipping timelines may not apply to customized, handmade, bulk, or made-to-order products. Customers will be informed about the production and delivery timeline upfront.
              </p>
            </div>

            <hr className="border-[#D4AF37]/20" />

            <div className="bg-[#0B3B2E]/50 border border-[#D4AF37]/10 p-6 rounded-2xl">
              <h2 className="text-xl font-serif text-[#D4AF37] mb-4">Shipping Support</h2>
              <p className="mb-2">For any shipping-related query, please contact us:</p>
              <div className="space-y-1 text-sm text-[#F5F0E6]/80 font-normal">
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
