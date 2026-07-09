import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07241D] text-[#F5F0E6] relative overflow-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,rgba(11,59,46,1)_100%)] z-0 pointer-events-none" />
      <Header />
      <main className="flex-grow pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#F5F0E6] via-[#D4AF37] to-[#F5F0E6] mb-4 text-center">
            Privacy Policy
          </h1>
          <p className="text-center text-[#D4AF37]/80 text-sm tracking-widest uppercase mb-12">
            Pavira Signature — The Art of Luxury
          </p>

          <div className="bg-[#112F24]/70 border border-[#D4AF37]/15 rounded-3xl p-8 md:p-12 backdrop-blur-2xl shadow-2xl space-y-8 font-light leading-relaxed text-[#F5F0E6]/90">
            <p>
              At <strong className="text-[#D4AF37]">Pavira Signature</strong>, we respect your privacy and are committed to protecting your personal information. This Privacy Policy explains how we collect, use, store and share your information when you visit our website, create an account, place an order or contact us.
            </p>
            <p>
              By using our website, submitting your details, placing an order or contacting us, you agree to the terms of this Privacy Policy.
            </p>

            <hr className="border-[#D4AF37]/20" />

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">Pavira Signature Approach to Security</h2>
              <p>
                Pavira Signature takes reasonable security measures to protect customer information and provide a safe shopping experience. We use trusted third-party payment gateway partners for online transactions. Pavira Signature does not store complete debit card details, credit card details, CVV, UPI PIN, net banking password or other sensitive banking information on our website.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">Respecting Your Privacy</h2>
              <p>
                Pavira Signature is committed to respecting your privacy. We collect customer information only to process orders, provide support, improve our services and deliver a better shopping experience. We value the trust you place in us. If you have any questions regarding this Privacy Policy, please contact our customer support.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">1. Information We Collect</h2>
              <p className="mb-4">We may collect your contact details such as:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Name</li>
                <li>Email address</li>
                <li>Phone number</li>
                <li>Billing address and Shipping address</li>
                <li>Postal address</li>
              </ul>
              <p className="mb-4">We may collect your order details such as:</p>
              <ul className="list-disc pl-6 mb-4 space-y-1">
                <li>Products purchased and Customization details, if any</li>
                <li>Order value and Transaction status</li>
                <li>Invoice and Delivery details</li>
                <li>Return, refund or exchange details, if any</li>
              </ul>
              <p className="mb-4">We may also collect technical and website usage information such as:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>IP address, Browser type, and Device information</li>
                <li>Operating system and Date/time of visit</li>
                <li>Pages or products viewed and Website interaction details</li>
                <li>Cookies and similar browsing data</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">2. Payment Information</h2>
              <p>
                When you make a payment on our website, your payment is processed through secure third-party payment gateway partners. Pavira Signature does not store your complete card details, CVV, UPI PIN, net banking password or other sensitive banking details. Payment-related information may be processed by our payment gateway partners only as required to complete your transaction.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">3. How We Use Your Information</h2>
              <p className="mb-4">We use your personal information to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Process and confirm your order</li>
                <li>Arrange shipping and delivery</li>
                <li>Provide invoices and order confirmations</li>
                <li>Share order updates and tracking details</li>
                <li>Communicate with you regarding your order</li>
                <li>Provide customer support</li>
                <li>Handle returns, refunds, exchanges and complaints</li>
                <li>Confirm customization details</li>
                <li>Improve our website, products and services</li>
                <li>Prevent fraud, misuse or unauthorized activity</li>
                <li>Send offers, updates, new launches or promotional communication where permitted</li>
                <li>Comply with legal, tax, accounting or regulatory requirements</li>
              </ul>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">4. How We Share Your Information</h2>
              <p>
                We do not sell your personal information. We may share necessary information with trusted third parties only when required to provide our services. This may include: Courier and logistics partners, Payment gateway providers, Website hosting and technology partners, Analytics and marketing service providers, Customer support tools, and Legal, tax or government authorities, where required by law.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">5. Cookies Policy</h2>
              <p>
                Our website may use cookies and similar technologies to improve your shopping experience. Cookies may help us remember your cart, recently viewed products, preferences and browsing activity. Cookies may also help us understand website performance and improve our services. You can disable cookies from your browser settings. However, some website features may not work properly if cookies are disabled.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">6. Marketing Communication</h2>
              <p>
                We may use your contact information to send you updates about orders, offers, new launches, product information and promotional content. You may opt out of non-essential marketing communication where such option is provided. Important service-related communication, such as order confirmation, payment updates, delivery updates, return updates or support communication, may still be sent to you.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">7. Data Security</h2>
              <p>
                We take reasonable steps to protect your personal information from unauthorized access, misuse, loss, disclosure or alteration. However, no online platform, website or electronic storage method can be guaranteed to be 100% secure.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">8. Data Retention</h2>
              <p>
                We may retain your personal information for as long as required for order processing, customer support, legal records, tax compliance, accounting, fraud prevention, dispute resolution and business purposes.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">9. User Consent</h2>
              <p>
                By using our website, submitting your information, creating an account, contacting us or placing an order, you consent to the collection and use of your information as described in this Privacy Policy. If you do not agree with this Privacy Policy, please do not use our website or services.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">10. Your Rights</h2>
              <p>
                You may contact us to request access, correction, update or deletion of your personal information, subject to legal, tax, accounting and business requirements. To protect your information, we may ask you to verify your identity before processing such requests.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">11. Third-Party Links</h2>
              <p>
                Our website may contain links to third-party websites or services. We are not responsible for the privacy practices, policies or content of third-party websites. Please review the privacy policy of such third-party websites before sharing any personal information with them.
              </p>
            </div>

            <div>
              <h2 className="text-2xl font-serif text-[#D4AF37] mb-3">12. Changes to This Privacy Policy</h2>
              <p>
                We may update this Privacy Policy from time to time to reflect changes in our practices, services, legal requirements or website features. Users are requested to review this page periodically to stay informed about any updates.
              </p>
            </div>

            <hr className="border-[#D4AF37]/20" />

            <div className="bg-[#0B3B2E]/50 border border-[#D4AF37]/10 p-6 rounded-2xl">
              <h2 className="text-xl font-serif text-[#D4AF37] mb-4">13. Contact Us</h2>
              <p className="mb-2">For questions, concerns or complaints regarding this Privacy Policy, please contact us:</p>
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
