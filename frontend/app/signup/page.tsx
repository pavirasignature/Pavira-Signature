"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { authAPI } from "@/lib/api";
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { PremiumMandala } from "@/components/PremiumVisuals";

export default function SignupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Email validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      const errMsg = "Please enter a valid email address.";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    if (formData.email.length > 100) {
      const errMsg = "Email address is too long (maximum 100 characters).";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    // Password validations (min 8 chars, max 32 chars, requires 1 uppercase letter and 1 number)
    if (formData.password.length < 8) {
      const errMsg = "Password must be at least 8 characters long.";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    if (formData.password.length > 32) {
      const errMsg = "Password cannot exceed 32 characters.";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    const hasNumber = /\d/.test(formData.password);
    const hasUpperCase = /[A-Z]/.test(formData.password);
    const hasSymbol = /[^A-Za-z0-9]/.test(formData.password);
    if (!hasNumber || !hasUpperCase || !hasSymbol) {
      const errMsg = "Password must contain at least one uppercase letter, one number, and one special character/symbol.";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      const errMsg = "Passwords do not match. Please check your password again.";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    if (!agreed) {
      const errMsg = "You must agree to the Terms & Conditions.";
      setError(errMsg);
      toast.error(errMsg);
      return;
    }

    setLoading(true);

    try {
      const response = await authAPI.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      if (response.data.success) {
        toast.success(response.data.message || "Account created successfully!");
        setTimeout(() => {
          router.push("/login");
        }, 500);
      }
    } catch (err: any) {
      const errMsg = err.response?.data?.message || "Signup failed";
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <main className="min-h-screen w-full flex bg-[#07241D] text-white selection:bg-[#D4AF37] selection:text-[#0B3B2E]">
      {/* Left Panel - Storytelling (Hidden on mobile) */}
      <div className="hidden lg:flex w-[60%] relative overflow-hidden items-center justify-center bg-[#0B3B2E]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.15)_0%,rgba(11,59,46,1)_100%)] z-0" />

        {/* Animated Mandala Background */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
          className="absolute w-[150%] h-[150%] opacity-20 pointer-events-none z-0"
        >
          <PremiumMandala />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 p-20 max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h1 className="text-5xl lg:text-6xl font-serif font-bold mb-6 text-[#F5F0E6] drop-shadow-lg">
              Begin Your<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] to-[#F5F0E6]">
                Artistic Journey
              </span>
            </h1>
            <p className="text-xl text-[#F5F0E6]/80 leading-relaxed font-light">
              Join an exclusive community of connoisseurs. Discover curated pieces that transform ordinary spaces into extraordinary sanctuaries.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth Card */}
      <div className="w-full lg:w-[40%] flex flex-col relative min-h-screen bg-gradient-to-br from-[#112F24] to-[#07241D] overflow-y-auto">
        {/* Back Button */}
        <div className="pt-6 px-6 md:pt-8 md:px-12 w-full z-20">
          <Link href="/" className="inline-flex items-center gap-2 text-[#D4AF37] hover:text-[#F5F0E6] transition-colors text-xs md:text-sm font-semibold tracking-wider uppercase bg-[#111E16]/80 px-4 py-2.5 rounded-full border border-[#D4AF37]/30 hover:border-[#D4AF37] shadow-lg w-fit backdrop-blur-md">
            <ArrowLeft size={16} />
            <span className="text-yellow-500">Back to Gallery</span>
          </Link>
        </div>

        {/* Form Container */}
        <div className="flex-1 flex items-center justify-center p-6 sm:p-12 z-10 relative">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-md"
          >
            <div className="bg-[#112F24]/70 border border-[#D4AF37]/15 rounded-3xl p-8 sm:p-10 backdrop-blur-2xl shadow-2xl">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-serif font-bold mb-3 text-[#F5F0E6]">Create Account</h2>
                <p className="text-[#D4AF37]/80 text-sm tracking-wide">
                  Join <span className="font-brand">Pavira Signature</span> today
                </p>
              </div>

              <motion.form
                onSubmit={handleSubmit}
                className="space-y-5"
                variants={containerVariants}
                initial="hidden"
                animate="show"
              >
                {error && (
                  <motion.div
                    variants={itemVariants}
                    className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm font-light leading-relaxed text-center"
                  >
                    {error}
                  </motion.div>
                )}

                {/* First Name Field */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-semibold mb-2 text-[#F5F0E6]/70 uppercase tracking-widest">
                    First Name
                  </label>
                  <div className="relative group">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 group-focus-within:text-[#D4AF37] transition-colors"
                      size={20}
                    />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-[#111E16]/80 border border-[#2A4734] focus:border-[#D4AF37] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#F5F0E6] placeholder-[#F5F0E6]/20"
                      placeholder="First Name"
                    />
                  </div>
                </motion.div>

                {/* Last Name Field */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-semibold mb-2 text-[#F5F0E6]/70 uppercase tracking-widest">
                    Last Name
                  </label>
                  <div className="relative group">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 group-focus-within:text-[#D4AF37] transition-colors"
                      size={20}
                    />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 bg-[#111E16]/80 border border-[#2A4734] focus:border-[#D4AF37] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#F5F0E6] placeholder-[#F5F0E6]/20"
                      placeholder="Last Name (optional)"
                    />
                  </div>
                </motion.div>

                {/* Email Field */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-semibold mb-2 text-[#F5F0E6]/70 uppercase tracking-widest">
                    Email Address
                  </label>
                  <div className="relative group">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 group-focus-within:text-[#D4AF37] transition-colors"
                      size={20}
                    />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-[#111E16]/80 border border-[#2A4734] focus:border-[#D4AF37] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#F5F0E6] placeholder-[#F5F0E6]/20"
                      placeholder="your@email.com"
                    />
                  </div>
                </motion.div>

                {/* Password Field */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-semibold mb-2 text-[#F5F0E6]/70 uppercase tracking-widest">
                    Password
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 group-focus-within:text-[#D4AF37] transition-colors"
                      size={20}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-12 py-3.5 bg-[#111E16]/80 border border-[#2A4734] focus:border-[#D4AF37] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#F5F0E6] placeholder-[#F5F0E6]/20"
                      placeholder="Enter Your Password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 hover:text-[#D4AF37] transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div variants={itemVariants}>
                  <label className="block text-xs font-semibold mb-2 text-[#F5F0E6]/70 uppercase tracking-widest">
                    Confirm Password
                  </label>
                  <div className="relative group">
                    <Lock
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4AF37]/50 group-focus-within:text-[#D4AF37] transition-colors"
                      size={20}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className="w-full pl-12 pr-4 py-3.5 bg-[#111E16]/80 border border-[#2A4734] focus:border-[#D4AF37] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37]/50 transition-all text-[#F5F0E6] placeholder-[#F5F0E6]/20"
                      placeholder="Enter Your Password"
                    />
                  </div>
                </motion.div>

                {/* Terms & Conditions */}
                <motion.div variants={itemVariants} className="pt-2">
                  <label className="flex items-start gap-3 text-sm cursor-pointer group">
                    <div className="relative flex items-center justify-center w-5 h-5 mt-0.5 rounded border border-[#2A4734] group-hover:border-[#D4AF37] transition-colors bg-[#111E16] flex-shrink-0">
                      <input 
                        type="checkbox" 
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        className="opacity-0 absolute inset-0 cursor-pointer peer" 
                      />
                      <div className="w-2.5 h-2.5 rounded-sm bg-[#D4AF37] scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                    <span className="text-[#F5F0E6]/70 leading-relaxed group-hover:text-[#F5F0E6] transition-colors">
                      I agree to the{" "}
                      <Link href="#" className="text-[#D4AF37] font-semibold hover:text-[#F5F0E6] underline underline-offset-2">
                        Terms & Conditions
                      </Link>
                    </span>
                  </label>
                </motion.div>

                {/* Submit Button */}
                <motion.div variants={itemVariants} className="pt-4">
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loading || !agreed}
                    className="w-full px-6 py-4 bg-[#D4AF37] text-[#0B3B2E] font-bold uppercase tracking-widest text-sm rounded-xl hover:bg-[#E6C78B] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </motion.button>
                </motion.div>
              </motion.form>

              {/* Login Link */}
              <p className="mt-8 text-center text-[#F5F0E6]/60 text-sm">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-[#D4AF37] hover:text-[#F5F0E6] transition-colors font-bold underline underline-offset-4"
                >
                  Sign in here
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
