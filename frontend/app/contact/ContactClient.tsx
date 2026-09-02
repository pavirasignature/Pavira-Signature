"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, ArrowRight, HelpCircle, Palette, DraftingCompass, Building2, CheckCircle2 } from "lucide-react";
import { contactService } from "@/lib/services";
import toast from "react-hot-toast";

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      toast.success(res.message || "Your inquiry has been transmitted to our team successfully!");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Unable to send message. Please try again or reach out at care@pavirasignature.in.");
    } finally {
      setLoading(false);
    }
  };

  const contactInfo = {
    phone: "+91 84878 16296",
    address: "A-47, Nilkanth Arcade Estate, G.I.D.C., Kathwada, Odhav, Ahmedabad, Gujarat 382430",
    email: "care@pavirasignature.in",
  };

  return (
    <main className="bg-background text-foreground overflow-hidden pt-24 min-h-screen">
      
      {/* 1. Contact Hero */}
      <section className="relative pt-24 pb-16 flex flex-col items-center justify-center text-center px-6">
        <div className="max-w-4xl relative z-10">
          <h1 className="text-4xl md:text-6xl font-brand leading-tight mb-6">
            Contact Pavira
          </h1>
          <p className="text-lg text-muted-foreground font-light max-w-2xl mx-auto">
            Our team is available Monday to Saturday, 10am to 7pm IST, to assist you with orders, design consultations, and custom projects.
          </p>
        </div>
      </section>

      {/* 2. How Can We Help? (Categories) */}
      <section className="py-16 bg-muted/30 border-y border-border/50">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-8 border border-border bg-background text-center flex flex-col items-center">
              <HelpCircle className="text-accent mb-4" size={28} strokeWidth={1.5} />
              <h3 className="font-semibold mb-2">Customer Support</h3>
              <p className="text-sm text-muted-foreground font-light">Questions about an order, product or delivery?</p>
            </div>
            <div className="p-8 border border-border bg-background text-center flex flex-col items-center">
              <Palette className="text-accent mb-4" size={28} strokeWidth={1.5} />
              <h3 className="font-semibold mb-2">Design Consultation</h3>
              <p className="text-sm text-muted-foreground font-light">Need help choosing the right size or design?</p>
            </div>
            <div className="p-8 border border-border bg-background text-center flex flex-col items-center">
              <DraftingCompass className="text-accent mb-4" size={28} strokeWidth={1.5} />
              <h3 className="font-semibold mb-2">Custom Projects</h3>
              <p className="text-sm text-muted-foreground font-light">Looking for a custom size, finish or bulk requirement?</p>
            </div>
            <Link href="/professionals" className="p-8 border border-border bg-background hover:border-accent transition-colors text-center flex flex-col items-center cursor-pointer group">
              <Building2 className="text-accent mb-4 group-hover:scale-110 transition-transform" size={28} strokeWidth={1.5} />
              <h3 className="font-semibold mb-2">Architects & Designers</h3>
              <p className="text-sm text-muted-foreground font-light">Trade pricing, project catalogue, or custom requirements.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* 3. Interactive Split Section */}
      <section className="py-24">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Direct Contact Details */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-brand mb-10">Get in Touch</h2>

                <div className="space-y-10">
                  {/* Email */}
                  <div className="flex items-start gap-4">
                    <Mail size={24} className="text-accent mt-1" strokeWidth={1.5} />
                    <div>
                      <h4 className="font-semibold mb-1">Email</h4>
                      <a href={`mailto:${contactInfo.email}`} className="text-muted-foreground hover:text-accent transition-colors font-light">
                        {contactInfo.email}
                      </a>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex items-start gap-4">
                    <Phone size={24} className="text-accent mt-1" strokeWidth={1.5} />
                    <div>
                      <h4 className="font-semibold mb-1">Phone</h4>
                      <p className="text-muted-foreground font-light mb-1">{contactInfo.phone}</p>
                      <span className="text-xs text-muted-foreground uppercase tracking-widest">Mon–Sat, 10am – 7pm IST</span>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="flex items-start gap-4">
                    <MapPin size={24} className="text-accent mt-1" strokeWidth={1.5} />
                    <div>
                      <h4 className="font-semibold mb-1">Studio & Workshop</h4>
                      <p className="text-muted-foreground leading-relaxed font-light">
                        {contactInfo.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Form */}
            <div className="lg:col-span-7">
              <div className="p-8 md:p-12 border border-border bg-muted/10 relative">
                <h3 className="text-2xl font-brand mb-8">Send a Message</h3>

                {submitted ? (
                  <div className="py-12 text-center flex flex-col items-center justify-center space-y-4">
                    <CheckCircle2 className="w-16 h-16 text-accent" strokeWidth={1.5} />
                    <h4 className="text-2xl font-brand">Message Received</h4>
                    <p className="text-muted-foreground font-light max-w-md mx-auto">
                      Thank you for contacting Pavira Signature. Your message has been sent to our team at <strong className="text-foreground font-medium">care@pavirasignature.in</strong>. We will review your request and get back to you shortly.
                    </p>
                    <button
                      type="button"
                      onClick={() => setSubmitted(false)}
                      className="mt-6 px-6 py-3 border border-border hover:border-foreground transition-colors uppercase tracking-widest text-xs font-semibold"
                    >
                      Send Another Message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Inquiry Type *</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Order Support, Design Consultation"
                        className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Message *</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        className="w-full bg-background border border-border px-4 py-3 text-sm focus:outline-none focus:border-foreground transition-colors resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 bg-[#0C3A2E] text-white uppercase tracking-widest text-xs font-semibold hover:bg-[#0C3A2E]/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? "Sending..." : "Send Message"} <ArrowRight size={15} />
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
