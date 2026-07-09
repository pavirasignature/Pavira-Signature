"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import { paymentService } from "@/lib/services";
import { useStore } from "@/store/useStore";
import { CheckCircle2, ShoppingBag, Truck, Mail, Loader2, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useStore();
  const sessionId = searchParams?.get("session_id") || null;
  const orderId = searchParams?.get("orderId") || null;

  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function verifyPayment() {
      if (sessionId && orderId) {
        try {
          setLoading(true);
          await paymentService.verifyStripePayment({
            sessionId,
            orderId,
          });
          setVerified(true);
          // Clear cart after successful Stripe payment verification
          clearCart();
          toast.success("Payment verified successfully!");
        } catch (err: any) {
          console.error("Stripe verification failed:", err);
          setError(true);
          toast.error("Failed to verify Stripe payment session");
        } finally {
          setLoading(false);
        }
      } else {
        // Assume Razorpay or COD that was already routed here successfully
        setVerified(true);
        setLoading(false);
      }
    }

    verifyPayment();
  }, [sessionId, orderId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Loader2 className="animate-spin text-[#D4AF37] mb-6" size={48} />
        <h2 className="text-2xl font-bold mb-2">Verifying Your Payment</h2>
        <p className="text-gray-400 max-w-md">
          Please wait while we secure your luxury order details and authenticate your payment session.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
          <span className="text-red-500 font-extrabold text-2xl">!</span>
        </div>
        <h2 className="text-2xl font-bold mb-2">Verification Failed</h2>
        <p className="text-gray-400 max-w-md mb-8">
          We encountered an issue verifying your transaction. If money was deducted, please do not worry, our support team will update it.
        </p>
        <Link
          href="/dashboard/orders"
          className="bg-[#D4AF37] text-black px-8 py-3 rounded-lg font-semibold hover:bg-[#D4AF37]/90 transition-colors"
        >
          View My Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-[#1A2E20]/90 border border-[#D4AF37]/20 rounded-2xl p-8 md:p-12 shadow-2xl backdrop-blur-md text-center">
      {/* Decorative Gold Success Circle */}
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 mb-8 animate-pulse">
        <CheckCircle2 className="text-[#D4AF37]" size={40} />
      </div>

      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 text-[#F5F0E6]">
        Order Placed Successfully!
      </h1>
      
      <p className="text-gray-300 text-lg mb-8 leading-relaxed">
        Thank you for choosing <span className="text-[#D4AF37] font-semibold font-brand">Pavira Signature</span>. Your order has been placed successfully and is currently being processed by our artisan workshop.
      </p>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
        <div className="bg-[#111E16] border border-[#2A4734] rounded-xl p-4 flex gap-4 items-start">
          <Mail className="text-[#D4AF37] shrink-0 mt-1" size={20} />
          <div>
            <h4 className="font-semibold text-white text-sm">Confirmation Email</h4>
            <p className="text-xs text-gray-400 mt-1">
              A copy of your GST invoice and order details is being sent to your registered email address.
            </p>
          </div>
        </div>

        <div className="bg-[#111E16] border border-[#2A4734] rounded-xl p-4 flex gap-4 items-start">
          <Truck className="text-[#D4AF37] shrink-0 mt-1" size={20} />
          <div>
            <h4 className="font-semibold text-white text-sm">Express Shipping</h4>
            <p className="text-xs text-gray-400 mt-1">
              Your parcel will be handed to Delhivery/Shiprocket within 24 hours. Tracking details will trigger automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center justify-center gap-2 bg-[#D4AF37] text-black px-8 py-3.5 rounded-lg font-semibold hover:bg-[#D4AF37]/90 transition-colors shadow-lg shadow-[#D4AF37]/10"
        >
          <ShoppingBag size={18} />
          View My Orders
        </Link>
        <Link
          href="/products"
          className="inline-flex items-center justify-center gap-2 bg-transparent border border-gray-700 hover:border-[#D4AF37] text-white px-8 py-3.5 rounded-lg font-semibold transition-colors"
        >
          Continue Shopping
          <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#1B2D20] text-[#F5F0E6] relative overflow-hidden">
      {/* Full Page Fixed Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />

      <Header />
      <main className="pt-32 pb-24 px-4 relative z-10">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <Loader2 className="animate-spin text-[#D4AF37] mb-6" size={48} />
              <h2 className="text-2xl font-bold mb-2">Loading</h2>
            </div>
          }
        >
          <SuccessPageContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
