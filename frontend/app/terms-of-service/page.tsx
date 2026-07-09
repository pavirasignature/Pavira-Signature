import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07241D] text-[#F5F0E6] relative overflow-hidden">
      {/* Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.1)_0%,rgba(11,59,46,1)_100%)] z-0 pointer-events-none" />
      <Header />
      <main className="flex-grow pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl md:text-5xl font-serif text-transparent bg-clip-text bg-gradient-to-r from-[#F5F0E6] via-[#D4AF37] to-[#F5F0E6] mb-4 text-center">
            Terms of Service
          </h1>
          <p className="text-center text-[#D4AF37]/80 text-sm tracking-widest uppercase mb-12">
            Pavira Signature — The Art of Luxury
          </p>

          <div className="bg-[#112F24]/70 border border-[#D4AF37]/15 rounded-3xl p-8 md:p-12 backdrop-blur-2xl shadow-2xl space-y-8 font-light leading-relaxed text-[#F5F0E6]/90">
            <p>
              This website is operated by <strong className="text-[#D4AF37]">Pavira Signature</strong>. Throughout the site, the terms &quot;we&quot;, &quot;us&quot;, and &quot;our&quot; refer to Pavira Signature. Pavira Signature offers this website, including all information, tools, products, and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here.
            </p>
            <p>
              By visiting our website and/or purchasing something from us, you engage in our &quot;Service&quot; and agree to be bound by the following terms and conditions (&quot;Terms of Service&quot;, &quot;Terms&quot;), including those additional terms, conditions, and policies referenced herein and/or available by hyperlink.
            </p>

            <hr className="border-[#D4AF37]/20" />

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 1 - ONLINE STORE TERMS</h2>
              <p>
                By agreeing to these Terms of Service, you confirm that you are at least the age of majority in your state or province of residence. You may not use our products for any illegal or unauthorized purpose. You must not violate any laws in your jurisdiction while using our website or services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 2 - GENERAL CONDITIONS</h2>
              <p>
                We reserve the right to refuse service to anyone for any reason at any time. You agree not to reproduce, duplicate, copy, sell, resell, or exploit any part of our website, service, product images, product content, designs, or branding without written permission from us.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 3 - ACCURACY & TIMELINESS OF INFORMATION</h2>
              <p>
                We try our best to provide accurate and updated information on our website. However, we are not responsible if information made available on this website is not accurate, complete, or current. Any reliance on the material on this website is at your own risk.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 4 - MODIFICATIONS TO SERVICE & PRICES</h2>
              <p>
                Prices of our products are subject to change without notice. We reserve the right to modify or discontinue any product, offer, service, or content at any time without notice. We shall not be liable to you or any third party for any price change, product modification, suspension, or discontinuation of service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 5 - PRODUCTS OR SERVICES</h2>
              <p>
                Certain products may be available exclusively online through our website. These products may have limited quantities and are subject to return or exchange only according to our Return and Refund Policy. We have made every effort to display product colors and images as accurately as possible. Actual product color, finish, texture, and size may slightly vary. We reserve the right to limit the sales of our products or Services to any person, geographic region, or jurisdiction.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 6 - ACCURACY OF BILLING & ACCOUNT INFORMATION</h2>
              <p>
                We reserve the right to refuse or cancel any order placed with us. We may limit or cancel quantities purchased per person, per household, or per order. You agree to provide current, complete, and accurate purchase and account information for all orders placed on our website.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 7 - OPTIONAL TOOLS & THIRD-PARTY LINKS</h2>
              <p>
                We may provide you with access to third-party tools such as payment gateways, analytics tools, courier tools, or other service tools over which we neither monitor nor have any control. We are not liable for any harm or damages related to the purchase or use of goods, services, resources, content, or any other transactions made in connection with any third-party websites or services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 8 - USER SUBMISSIONS & FEEDBACK</h2>
              <p>
                If you send creative ideas, suggestions, proposals, plans, reviews, feedback, or other materials, you agree that we may, at any time, without restriction, edit, copy, publish, distribute, translate, and otherwise use any comments that you forward to us.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 9 - PERSONAL INFORMATION</h2>
              <p>
                Your submission of personal information through our website is governed by our Privacy Policy.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 10 - ERRORS, INACCURACIES, & OMISSIONS</h2>
              <p>
                Occasionally, there may be information on our website that contains typographical errors, inaccuracies, or omissions. We reserve the right to correct any errors, inaccuracies, or omissions, and to change, update, or cancel orders if any information is inaccurate.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 11 - PROHIBITED USES</h2>
              <p>
                You are prohibited from using our website or its content for any unlawful purpose, to violate any laws, to infringe intellectual property rights, to submit false or misleading information, to upload harmful code or viruses, or to collect personal information of others.
              </p>
            </div>

            <div className="bg-[#0B3B2E]/40 border border-yellow-500/20 p-6 rounded-xl">
              <h2 className="text-xl font-serif text-[#D4AF37] mb-3">SECTION 12 - DISCLAIMER & INSTALLATION</h2>
              <p className="mb-3">
                We do not guarantee that your use of our website or service will be uninterrupted, timely, secure, or error-free. Pavira Signature shall not be liable for any direct, indirect, incidental, special, or consequential damages.
              </p>
              <p className="text-sm">
                <strong className="text-yellow-500">Installation Disclaimer:</strong> Our wall décor items and multi-component setups require proper wall fixing. Pavira Signature is strictly not liable for any damage to walls, property, or the artwork itself resulting from improper installation, failure to use appropriate mounting hardware, or incorrect wall-fixing techniques.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 13 - INDEMNIFICATION</h2>
              <p>
                You agree to indemnify and hold harmless Pavira Signature, its owners, team members, partners, suppliers, and service providers from any claim or demand arising out of your breach of these Terms of Service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 14 - SEVERABILITY</h2>
              <p>
                In the event that any provision of these Terms of Service is determined to be unlawful, void or unenforceable, such provision shall nonetheless be enforceable to the fullest extent permitted by applicable law, and the unenforceable portion shall be deemed to be severed from these Terms of Service.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 15 - TERMINATION</h2>
              <p>
                These Terms of Service are effective unless terminated by either you or us. If we believe that you have failed to comply with any term or provision of these Terms of Service, we may terminate your access to our website or services without notice.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 16 - ENTIRE AGREEMENT</h2>
              <p>
                These Terms of Service, along with our policies posted on this website, constitute the entire agreement between you and Pavira Signature regarding the use of our website and services.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 17 - GOVERNING LAW & JURISDICTION</h2>
              <p>
                These Terms of Service and any separate agreements shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in <strong className="text-[#D4AF37]">Ahmedabad, Gujarat, India</strong>.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-serif text-[#D4AF37] mb-2">SECTION 18 - CHANGES TO TERMS OF SERVICE</h2>
              <p>
                You can review the most current version of the Terms of Service at any time on this page. We reserve the right to update, change or replace any part of these Terms of Service by posting updates on our website. Your continued use of our website following any changes means you accept those changes.
              </p>
            </div>

            <hr className="border-[#D4AF37]/20" />

            <div className="bg-[#0B3B2E]/50 border border-[#D4AF37]/10 p-6 rounded-2xl text-sm">
              <h2 className="text-xl font-serif text-[#D4AF37] mb-4">SECTION 19 - CONTACT INFORMATION</h2>
              <div className="space-y-1 font-normal text-[#F5F0E6]/80">
                <p><strong>Email:</strong> <a href="mailto:support@pavirasignature.in" className="hover:text-[#D4AF37] underline transition-colors">support@pavirasignature.in</a></p>
                <p><strong>Location:</strong> Ahmedabad, Gujarat, India</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
