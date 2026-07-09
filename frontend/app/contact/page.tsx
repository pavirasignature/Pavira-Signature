"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Mail, Phone, MapPin, Clock, ArrowRight, Paintbrush, Building2, Hammer, Plus, Minus, CheckCircle2 } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";

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

export default function ContactPage() {
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
    setLoading(true);

    try {
      // Simulated submission logic preserved
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setSubmitted(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error) {
      console.error("Form submission error:", error);
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
    <PublicLayout>
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

        {/* 2. Concierge Contact Section */}
        <section className="py-20 relative z-10">
          <div className="container mx-auto px-4 max-w-7xl">
            <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
              
              {/* Left Column: Contact Info */}
              <motion.div 
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-5 space-y-6"
              >
                <div className="bg-[#112F24]/60 backdrop-blur-xl border border-[#D4AF37]/15 rounded-3xl p-8 lg:p-10 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 blur-3xl rounded-full" />
                  
                  <h2 className="text-3xl font-serif mb-10 text-[#F5F0E6]">The Atelier</h2>
                  
                  <div className="space-y-8">
                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-full bg-[#07241D]/50 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/10 transition-colors">
                        <Mail className="text-[#D4AF37] w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[#F5F0E6]/50 text-xs uppercase tracking-widest font-semibold mb-1">Direct Email</p>
                        <a href={`mailto:${contactInfo.email}`} className="text-lg hover:text-[#D4AF37] transition-colors">{contactInfo.email}</a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-full bg-[#07241D]/50 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/10 transition-colors">
                        <Phone className="text-[#D4AF37] w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[#F5F0E6]/50 text-xs uppercase tracking-widest font-semibold mb-1">Phone Consultancy</p>
                        <a href={`tel:${contactInfo.phone}`} className="text-lg hover:text-[#D4AF37] transition-colors">+91 {contactInfo.phone}</a>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-4 group">
                      <div className="w-12 h-12 rounded-full bg-[#07241D]/50 border border-[#D4AF37]/20 flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37]/10 transition-colors">
                        <MapPin className="text-[#D4AF37] w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[#F5F0E6]/50 text-xs uppercase tracking-widest font-semibold mb-1">Studio Address</p>
                        <p className="text-lg text-[#F5F0E6]/90 leading-relaxed max-w-[250px]">{contactInfo.address}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#112F24]/60 backdrop-blur-xl border border-[#D4AF37]/15 rounded-3xl p-8 shadow-2xl">
                  <div className="flex items-center gap-4 mb-6">
                    <Clock className="text-[#D4AF37] w-6 h-6" />
                    <h3 className="text-xl font-serif">Consultation Hours</h3>
                  </div>
                  <ul className="space-y-3 text-[#F5F0E6]/70">
                    <li className="flex justify-between border-b border-[#D4AF37]/10 pb-3">
                      <span>Monday - Friday</span>
                      <span className="text-[#F5F0E6]">10:00 AM - 6:00 PM</span>
                    </li>
                    <li className="flex justify-between border-b border-[#D4AF37]/10 pb-3">
                      <span>Saturday</span>
                      <span className="text-[#F5F0E6]">10:00 AM - 4:00 PM</span>
                    </li>
                    <li className="flex justify-between pt-1">
                      <span>Sunday</span>
                      <span className="text-[#D4AF37] italic">Closed for Inspiration</span>
                    </li>
                  </ul>
                </div>
              </motion.div>

              {/* Right Column: Luxury Form */}
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="lg:col-span-7"
              >
                <div className="bg-[#112F24]/60 backdrop-blur-xl border border-[#D4AF37]/15 rounded-3xl p-8 lg:p-12 shadow-2xl relative">
                  <h2 className="text-3xl font-serif mb-8 text-[#F5F0E6]">Request a Consultation</h2>

                  <AnimatePresence>
                    {submitted && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-8 p-6 bg-[#0B3B2E] border border-[#D4AF37]/40 rounded-xl flex items-center gap-4"
                      >
                        <CheckCircle2 className="text-[#D4AF37] w-8 h-8 flex-shrink-0" />
                        <div>
                          <h4 className="text-lg font-serif text-[#D4AF37] mb-1">Inquiry Received</h4>
                          <p className="text-[#F5F0E6]/80 text-sm">Thank you for reaching out. One of our master consultants will contact you shortly.</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Name */}
                      <div>
                        <label htmlFor="name" className="block text-xs font-semibold mb-2 text-[#F5F0E6]/70 uppercase tracking-widest">
                          Full Name
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 bg-[#07241D]/80 border border-[#2A4734] focus:border-[#D4AF37] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#F5F0E6] placeholder-[#F5F0E6]/20"
                          placeholder="Your Name"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label htmlFor="email" className="block text-xs font-semibold mb-2 text-[#F5F0E6]/70 uppercase tracking-widest">
                          Email Address
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 bg-[#07241D]/80 border border-[#2A4734] focus:border-[#D4AF37] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#F5F0E6] placeholder-[#F5F0E6]/20"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    {/* Subject */}
                    <div>
                      <label htmlFor="subject" className="block text-xs font-semibold mb-2 text-[#F5F0E6]/70 uppercase tracking-widest">
                        Subject of Inquiry
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-5 py-4 bg-[#07241D]/80 border border-[#2A4734] focus:border-[#D4AF37] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#F5F0E6] placeholder-[#F5F0E6]/20"
                        placeholder="e.g. Custom Mandala Commission"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label htmlFor="message" className="block text-xs font-semibold mb-2 text-[#F5F0E6]/70 uppercase tracking-widest">
                        Message Details
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full px-5 py-4 bg-[#07241D]/80 border border-[#2A4734] focus:border-[#D4AF37] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#F5F0E6] placeholder-[#F5F0E6]/20 resize-none"
                        placeholder="Please share the details of your inquiry, dimensions, or any specific requirements..."
                      />
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={loading || submitted}
                      className="w-full mt-4 px-6 py-4 bg-[#D4AF37] text-[#0B3B2E] font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-[#E6C78B] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] flex justify-center items-center gap-3"
                    >
                      {loading ? "Sending Request..." : "Submit Inquiry"}
                      {!loading && <ArrowRight size={18} />}
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 3. Consultation Services Section */}
        <section className="py-24 bg-[#0B3B2E] border-y border-[#D4AF37]/10 relative overflow-hidden">
          <div className="container mx-auto px-4 max-w-7xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif mb-4">Dedicated Services</h2>
              <p className="text-[#F5F0E6]/70 font-light max-w-2xl mx-auto">Beyond our curated gallery, we offer specialized services tailored for unique spaces and visionary professionals.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-[#07241D]/50 border border-[#D4AF37]/15 rounded-2xl p-8 hover:border-[#D4AF37]/40 transition-colors group"
              >
                <Hammer className="text-[#D4AF37] w-10 h-10 mb-6 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <h3 className="text-xl font-serif mb-3">Custom Commissions</h3>
                <p className="text-[#F5F0E6]/60 font-light text-sm leading-relaxed">Work directly with our master artisans to co-create a bespoke piece tailored perfectly to your dimensions and color palette.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-[#07241D]/50 border border-[#D4AF37]/15 rounded-2xl p-8 hover:border-[#D4AF37]/40 transition-colors group"
              >
                <Paintbrush className="text-[#D4AF37] w-10 h-10 mb-6 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <h3 className="text-xl font-serif mb-3">Interior Design Support</h3>
                <p className="text-[#F5F0E6]/60 font-light text-sm leading-relaxed">We provide dedicated curation advice to interior designers looking for the perfect statement art pieces for their clients.</p>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-[#07241D]/50 border border-[#D4AF37]/15 rounded-2xl p-8 hover:border-[#D4AF37]/40 transition-colors group"
              >
                <Building2 className="text-[#D4AF37] w-10 h-10 mb-6 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                <h3 className="text-xl font-serif mb-3">Corporate Projects</h3>
                <p className="text-[#F5F0E6]/60 font-light text-sm leading-relaxed">Elevate your corporate headquarters, luxury hotel, or commercial space with our exclusive large-scale installations.</p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 4. FAQ Preview */}
        <section className="py-24 bg-[#07241D]">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-serif mb-4">Frequently Asked Questions</h2>
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
    </PublicLayout>
  );
}
