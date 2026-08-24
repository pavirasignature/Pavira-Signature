"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, ArrowRight, Paintbrush, Building2, Hammer, Plus, Minus, CheckCircle2 } from "lucide-react";
import { contactService } from "@/lib/services";
import toast from "react-hot-toast";

const faqs = [
  {
    question: "Do you offer custom dimensions for your mandalas?",
    answer: "Absolutely. We understand that every space is unique. Our artisans can scale most of our designs or create entirely bespoke dimensions to perfectly fit your sanctuary. Please reach out with your requirements."
  },
  {
    question: "What is the typical lead time for a custom commission?",
    answer: "Because each piece is meticulously handcrafted, bespoke commissions typically take between 4 to 6 weeks from final design approval to delivery. We will keep you updated throughout the creation process."
  },
  {
    question: "Do you collaborate with interior designers?",
    answer: "Yes, we frequently partner with interior designers, architects, and luxury property developers. We offer dedicated support and exclusive trade benefits for professional projects."
  },
  {
    question: "How are the pieces packaged for secure delivery?",
    answer: "We employ gallery-standard crating and packaging. Every masterpiece is secured with custom-cut high-density foam and shipped via premium couriers to ensure it arrives in pristine condition."
  }
];

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      toast.error("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await contactService.sendInquiry(formData);
      setSubmitted(true);
      toast.success(
        res.message || "Your inquiry has been transmitted to our team successfully!",
        { duration: 6000 }
      );
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      console.error("Form submission error:", error);
      toast.error(
        error?.response?.data?.message ||
          "Unable to send message. Please try again or reach out at pavirasignature@gmail.com."
      );
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = {
    company: "Pavira Signature",
    phone: "84878 16296",
    address: "A-47, Nilkanth Arcade Estate, G.I.D.C., Road No.15, Kathwada, Odhav, Ahmedabad, Gujarat 382430",
    email: "pavirasignature@gmail.com",
  };

  return (
    <main className="bg-[#07241D] text-[#F5F0E6] selection:bg-[#D4AF37] selection:text-[#0B3B2E] overflow-hidden min-h-screen">
      
      {/* 1. Contact Hero */}
      <section className="relative pt-40 pb-24 flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1)_0%,rgba(7,36,29,1)_100%)] z-0" />
        
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="relative z-10 max-w-4xl"
        >
          <p className="text-[#D4AF37] font-semibold tracking-[0.3em] uppercase text-sm mb-6">
            Concierge Services
          </p>
          <h1 className="text-5xl md:text-7xl font-serif font-bold leading-tight drop-shadow-2xl mb-6">
            Let&apos;s Create Something<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F5F0E6] italic font-light">
              Timeless
            </span>
          </h1>
          <p className="text-xl text-[#F5F0E6]/70 leading-relaxed font-light max-w-2xl mx-auto">
            Our dedicated consulting team is ready to help you find the perfect piece or discuss bespoke commissions for your sanctuary.
          </p>
        </motion.div>
      </section>

      {/* 2. Interactive Split Section */}
      <section className="py-20 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Direct Contact Details */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 flex flex-col justify-between"
            >
              <div>
                <h2 className="text-3xl font-serif mb-8 text-[#D4AF37]">Private Consultations</h2>
                <p className="text-[#F5F0E6]/70 leading-relaxed font-light mb-12">
                  Whether selecting a statement mandala for a penthouse or outfitting a luxury hotel lobby, our art advisors are available to guide your choices.
                </p>

                <div className="space-y-8">
                  {/* Address */}
                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#112F24] border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 text-[#D4AF37] group-hover:scale-110 group-hover:border-[#D4AF37]/50 transition-all duration-300">
                      <MapPin size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg text-[#F5F0E6] mb-1">Our Atelier & Gallery</h4>
                      <p className="text-[#F5F0E6]/60 text-sm leading-relaxed font-light">
                        {contactInfo.address}
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#112F24] border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 text-[#D4AF37] group-hover:scale-110 group-hover:border-[#D4AF37]/50 transition-all duration-300">
                      <Phone size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg text-[#F5F0E6] mb-1">Direct Line</h4>
                      <p className="text-[#F5F0E6]/60 text-sm leading-relaxed font-light mb-1">
                        +91 {contactInfo.phone}
                      </p>
                      <span className="text-xs text-[#D4AF37] tracking-wider uppercase">Mon–Sat, 10am – 7pm IST</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex items-start gap-6 group">
                    <div className="w-12 h-12 rounded-2xl bg-[#112F24] border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 text-[#D4AF37] group-hover:scale-110 group-hover:border-[#D4AF37]/50 transition-all duration-300">
                      <Mail size={22} strokeWidth={1.5} />
                    </div>
                    <div>
                      <h4 className="font-serif text-lg text-[#F5F0E6] mb-1">Electronic Inquiries</h4>
                      <p className="text-[#F5F0E6]/60 text-sm leading-relaxed font-light">
                        {contactInfo.email}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trade Inquiries Box */}
              <div className="mt-16 p-8 rounded-3xl bg-[#112F24]/40 border border-[#D4AF37]/20 backdrop-blur-xl">
                <div className="flex items-center gap-4 text-[#D4AF37] mb-3">
                  <Building2 size={24} strokeWidth={1.5} />
                  <h4 className="font-serif text-lg text-[#F5F0E6]">Trade & Commercial Partners</h4>
                </div>
                <p className="text-[#F5F0E6]/70 text-sm font-light leading-relaxed">
                  We offer specialized catalog access, bespoke dimensions, and curated packages for architects and interior design firms.
                </p>
              </div>
            </motion.div>

            {/* Interactive Form */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7"
            >
              <div className="p-8 md:p-12 rounded-3xl bg-[#112F24]/30 border border-[#D4AF37]/20 backdrop-blur-2xl shadow-2xl relative">
                
                <h3 className="text-2xl md:text-3xl font-serif text-[#F5F0E6] mb-2">Commission an Inquiry</h3>
                <p className="text-[#F5F0E6]/60 text-sm font-light mb-8">
                  Fill in the details below and an art consultant will contact you within 24 hours.
                </p>

                {submitted ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-12 text-center flex flex-col items-center justify-center space-y-4"
                  >
                    <CheckCircle2 className="w-16 h-16 text-[#D4AF37]" strokeWidth={1.5} />
                    <h4 className="text-2xl font-serif text-[#F5F0E6]">Inquiry Received</h4>
                    <p className="text-[#F5F0E6]/70 text-sm font-light max-w-md">
                      Thank you for contacting Pavira Signature. Your message has been sent to our art advisory team at <strong className="text-[#D4AF37]">pavirasignature@gmail.com</strong>. We will review your request and get back to you shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-6 px-8 py-3 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] text-xs uppercase tracking-widest font-semibold rounded-full transition-colors"
                    >
                      Send Another Inquiry
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">Your Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="e.g. Eleanor Vance"
                          className="w-full bg-[#07241D]/60 border border-[#D4AF37]/20 rounded-xl px-5 py-4 text-sm text-[#F5F0E6] placeholder-[#F5F0E6]/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                        />
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="e.g. eleanor@vance.com"
                          className="w-full bg-[#07241D]/60 border border-[#D4AF37]/20 rounded-xl px-5 py-4 text-sm text-[#F5F0E6] placeholder-[#F5F0E6]/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">Nature of Inquiry *</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Custom Mandala Commission, Trade Collaboration"
                        className="w-full bg-[#07241D]/60 border border-[#D4AF37]/20 rounded-xl px-5 py-4 text-sm text-[#F5F0E6] placeholder-[#F5F0E6]/30 focus:outline-none focus:border-[#D4AF37] transition-colors"
                      />
                    </div>

                    {/* Message */}
                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold">Message & Dimension Notes *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        placeholder="Tell us about your space, dimensions, or specific aesthetic goals..."
                        className="w-full bg-[#07241D]/60 border border-[#D4AF37]/20 rounded-xl px-5 py-4 text-sm text-[#F5F0E6] placeholder-[#F5F0E6]/30 focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                      />
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-5 rounded-xl bg-[#D4AF37] text-[#07241D] font-bold uppercase tracking-widest text-sm hover:bg-[#E6C78B] transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading ? (
                        <span>Processing Inquiry...</span>
                      ) : (
                        <>
                          <span>Transmit Message</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* 3. Bespoke Commission Pillars */}
      <section className="py-24 bg-[#0B3B2E]/50 border-y border-[#D4AF37]/10 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="text-center mb-16">
            <span className="text-[#D4AF37] tracking-widest uppercase text-xs font-semibold block mb-3">Tailored Process</span>
            <h2 className="text-3xl md:text-4xl font-serif">Bespoke Commission Services</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-[#07241D]/40 border border-[#D4AF37]/10 text-center flex flex-col items-center">
              <Paintbrush className="text-[#D4AF37] mb-6 w-10 h-10" strokeWidth={1.5} />
              <h3 className="font-serif text-xl mb-3">Custom Dimensions</h3>
              <p className="text-[#F5F0E6]/60 text-sm font-light leading-relaxed">
                Scale any mandala to harmoniously balance your specific architectural niche or massive focal wall.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#07241D]/40 border border-[#D4AF37]/10 text-center flex flex-col items-center">
              <Building2 className="text-[#D4AF37] mb-6 w-10 h-10" strokeWidth={1.5} />
              <h3 className="font-serif text-xl mb-3">Palette Matching</h3>
              <p className="text-[#F5F0E6]/60 text-sm font-light leading-relaxed">
                Adjust layer finishes, wood stains, and metallic leafing to echo your existing interior palette.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-[#07241D]/40 border border-[#D4AF37]/10 text-center flex flex-col items-center">
              <Hammer className="text-[#D4AF37] mb-6 w-10 h-10" strokeWidth={1.5} />
              <h3 className="font-serif text-xl mb-3">Commercial Curation</h3>
              <p className="text-[#F5F0E6]/60 text-sm font-light leading-relaxed">
                Complete multi-piece commissions tailored for private clubs, boutique hotels, and corporate sanctuaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Common Inquiries (FAQ) */}
      <section className="py-24 relative z-10">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-serif mb-4">Concierge Inquiries</h2>
            <p className="text-[#F5F0E6]/60 font-light">Frequently addressed questions regarding custom projects.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className={`border ${openFaqIndex === index ? 'border-[#D4AF37]/40 bg-[#112F24]/40' : 'border-[#D4AF37]/10 bg-[#112F24]/20'} rounded-2xl overflow-hidden transition-colors duration-300`}
              >
                <button 
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-left focus:outline-none"
                >
                  <span className="font-serif text-lg pr-8">{faq.question}</span>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]">
                    {openFaqIndex === index ? <Minus size={16} /> : <Plus size={16} />}
                  </div>
                </button>
                <AnimatePresence>
                  {openFaqIndex === index && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="px-6 pb-6 text-[#F5F0E6]/70 font-light leading-relaxed border-t border-[#D4AF37]/10 pt-4 mt-2">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Closing CTA */}
      <section className="py-24 relative bg-[#0B3B2E] border-t border-[#D4AF37]/20 flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(212,175,55,0.1)_0%,rgba(11,59,46,1)_100%)] z-0" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl"
        >
          <h2 className="text-4xl md:text-5xl font-serif mb-8 italic">Find Immediate Inspiration</h2>
          <p className="text-lg text-[#F5F0E6]/70 mb-10 font-light">
            Not ready for a consultation? Browse our existing gallery of handcrafted masterpieces available for immediate acquisition.
          </p>
          
          <Link 
            href="/products"
            className="inline-flex items-center gap-3 px-10 py-4 bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] font-bold uppercase tracking-widest text-sm rounded-full hover:bg-[#D4AF37] hover:text-[#0B3B2E] transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)]"
          >
            Browse Gallery
          </Link>
        </motion.div>
      </section>

    </main>
  );
}
