"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import {
  orderService,
  couponService,
  paymentService,
  authService,
} from "@/lib/services";
import { useStore } from "@/store/useStore";
import { motion, AnimatePresence } from "framer-motion";
import {
  CreditCard,
  Truck,
  Lock,
  ArrowRight,
  Check,
  MapPin,
  Tag,
  ShoppingBag,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import toast from "react-hot-toast";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, user, clearCart } = useStore();
  const [loading, setLoading] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    country: "India",
  });
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponApplying, setCouponApplying] = useState(false);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [mounted, setMounted] = useState(false);

  const itemsPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingPrice = itemsPrice >= 999 ? 0 : 99;
  const taxPrice = 0;
  const totalPrice = itemsPrice + shippingPrice + taxPrice - couponDiscount;
  const hasOutOfStockItems = cart.some((item) => typeof item.stock === 'number' && item.stock === 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const token =
      typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }
    if (mounted && cart.length === 0) {
      router.push("/cart");
    }
  }, [user, cart, router, mounted]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await authService.getMe();
        if (response.success && response.data) {
          const addresses = response.data.addresses || [];
          setSavedAddresses(addresses);

          const defaultAddress =
            addresses.find((addr: any) => addr.isDefault) || addresses[0];
          if (defaultAddress) {
            setShippingAddress({
              fullName: defaultAddress.fullName || "",
              phone: defaultAddress.phone || "",
              addressLine1: defaultAddress.addressLine1 || "",
              addressLine2: defaultAddress.addressLine2 || "",
              city: defaultAddress.city || "",
              state: defaultAddress.state || "",
              postalCode: defaultAddress.postalCode || "",
              country: defaultAddress.country || "India",
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch user details:", err);
      }
    };

    const token =
      typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    if (token) {
      fetchUserData();
    }
  }, []);

  const handleSelectAddress = (addr: any) => {
    setShippingAddress({
      fullName: addr.fullName || "",
      phone: addr.phone || "",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.postalCode || "",
      country: addr.country || "India",
    });
    toast.success("Address selected");
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponApplying(true);
    try {
      const response = await couponService.validateCoupon({
        code: couponCode,
        orderAmount: itemsPrice,
        categoryIds: [],
        productIds: cart.map((item) => item.product),
      });
      setCouponDiscount(response.coupon.discount);
      toast.success("Coupon applied successfully");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid coupon code");
    } finally {
      setCouponApplying(false);
    }
  };

  const handlePlaceOrder = async () => {
    const token =
      typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please login to continue");
      router.push("/login");
      return;
    }

    if (!shippingAddress.fullName.trim()) {
      toast.error("Please enter your Full Name");
      return;
    }
    if (!shippingAddress.phone.trim()) {
      toast.error("Please enter your Phone number");
      return;
    }
    if (!shippingAddress.addressLine1.trim()) {
      toast.error("Please enter Address Line 1");
      return;
    }
    if (!shippingAddress.city.trim()) {
      toast.error("Please enter your City");
      return;
    }
    if (!shippingAddress.state.trim()) {
      toast.error("Please enter your State");
      return;
    }
    if (!shippingAddress.postalCode.trim()) {
      toast.error("Please enter your Postal Code");
      return;
    }

    if (hasOutOfStockItems) {
      toast.error(
        "One or more items are out of stock. Please remove them to proceed.",
      );
      return;
    }

    setLoading(true);
    try {
      if (paymentMethod === "razorpay") {
        const isScriptLoaded = await new Promise((resolve) => {
          if (typeof window !== "undefined" && (window as any).Razorpay) {
            return resolve(true);
          }
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
        });

        if (!isScriptLoaded) {
          throw new Error(
            "Razorpay SDK could not load. Please check your internet connection.",
          );
        }
      }

      const orderResponse = await orderService.createOrder({
        items: cart.map((item) => ({
          product: item.product,
          quantity: item.quantity,
          price: item.price,
        })),
        shippingAddress,
        paymentMethod,
        couponCode: couponCode || undefined,
      });

      if (!orderResponse.success) {
        throw new Error(orderResponse.message || "Failed to create order");
      }

      const orderData = orderResponse.data;
      const effectiveOrderId = orderData._id || orderData.id;
      setOrder(orderData);

      if (paymentMethod === "razorpay") {
        const razorpayResponse = await paymentService.createRazorpayOrder({
          orderId: effectiveOrderId,
        });
        const razorpayData = razorpayResponse.data || razorpayResponse;

        const options = {
          key:
            razorpayData.keyId ||
            process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
            "rzp_test_TSgNjvLn7x0WEt",
          amount: razorpayData.amount,
          currency: razorpayData.currency || "INR",
          name: "Pavira Signature",
          description: `Luxury Decor - Order #${orderData.orderNumber || effectiveOrderId}`,
          image: "https://pavirasignature.in/logo.png",
          order_id: razorpayData.id || razorpayData.order_id,
          prefill: {
            name: (user as any)?.name || shippingAddress.fullName || "",
            email: (user as any)?.email || "",
            contact: shippingAddress.phone || "",
          },
          theme: {
            color: "#0C3A2E",
          },
          config: {
            display: {
              hide: [{ method: "card" }],
            },
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              toast("Payment window closed", { icon: "ℹ️" });
            },
          },
          handler: async (response: any) => {
            try {
              await paymentService.verifyRazorpayPayment({
                orderId: effectiveOrderId,
                razorpayOrderId: razorpayData.id || razorpayData.order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              clearCart();
              setIsOrderPlaced(true);
              toast.success("Payment verified! Order placed successfully!");
            } catch (err: any) {
              console.error("Razorpay verification failed:", err);
              toast.error(
                err.response?.data?.message ||
                  "Failed to verify Razorpay payment",
              );
            } finally {
              setLoading(false);
            }
          },
        };

        // @ts-ignore
        const rzp = new (window as any).Razorpay(options);
        rzp.on("payment.failed", (failedRes: any) => {
          console.error("Razorpay payment failed:", failedRes.error);
          setLoading(false);
          toast.error(
            failedRes.error?.description || "Payment failed. Please try again.",
          );
        });
        rzp.open();
      } else {
        // Cash on Delivery
        await paymentService.confirmCODPayment({
          orderId: effectiveOrderId,
        });
        clearCart();
        setIsOrderPlaced(true);
        toast.success("Order placed successfully!");
        setLoading(false);
      }
    } catch (error: any) {
      console.error("Place order failed:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to place order",
      );
      setLoading(false);
    }
  };

  if (!user || !mounted) {
    return null;
  }

  // Order Placed Success Screen
  if (isOrderPlaced) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] flex flex-col font-sans">
        <Header />
        <main className="flex-grow pt-32 pb-24 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md mx-auto px-6"
          >
            <div className="w-20 h-20 bg-[#0C3A2E] flex items-center justify-center mx-auto mb-8">
              <CheckCircle2 className="text-[#D4AF37]" size={40} />
            </div>
            <h1 className="font-brand text-3xl text-[#1A1A1A] font-normal mb-3">
              Order Confirmed
            </h1>
            <p className="text-[#1A1A1A]/60 text-sm mb-2">
              Thank you for your acquisition. We are preparing your consignment
              with exceptional care.
            </p>
            {order?.orderNumber && (
              <p className="text-xs font-mono font-bold text-[#0C3A2E] bg-[#0C3A2E]/10 px-4 py-2 inline-block mt-2 mb-8">
                Order #{order.orderNumber}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <button
                onClick={() => router.push("/dashboard")}
                className="bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-all shadow-sm"
              >
                View My Orders
              </button>
              <button
                onClick={() => router.push("/products")}
                className="border border-[#0C3A2E] text-[#0C3A2E] hover:bg-[#0C3A2E] hover:text-white px-6 py-3 text-xs font-semibold uppercase tracking-widest transition-all"
              >
                Continue Shopping
              </button>
            </div>
          </motion.div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#0C3A2E] selection:text-white">
      <Header />

      <main className="flex-grow pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Page Header */}
          <div className="mb-10 border-b border-[#1A1A1A]/10 pb-6">
            <h1 className="text-3xl md:text-4xl font-brand text-[#1A1A1A] font-normal mb-1">
              Secure Checkout
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/50 font-light">
              Complete your acquisition with confidence
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
            {/* LEFT COLUMN — Shipping & Payment Forms */}
            <div className="lg:col-span-3 space-y-6">

              {/* STEP 1: Shipping Address */}
              <div className="bg-white border border-[#1A1A1A]/10 shadow-sm">
                <div className="px-6 py-4 border-b border-[#1A1A1A]/10 bg-[#F9F6F0] flex items-center gap-3">
                  <div className="w-7 h-7 bg-[#0C3A2E] flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck size={16} className="text-[#0C3A2E]" />
                    <h2 className="font-semibold text-sm uppercase tracking-widest text-[#1A1A1A]">
                      Delivery Address
                    </h2>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Saved Addresses */}
                  {savedAddresses.length > 0 && (
                    <div className="mb-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1A1A1A]/50 mb-3 flex items-center gap-1.5">
                        <MapPin size={11} className="text-[#0C3A2E]" />
                        Select a saved address
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {savedAddresses.map((addr) => {
                          const isSelected =
                            shippingAddress.addressLine1 ===
                              addr.addressLine1 &&
                            shippingAddress.postalCode === addr.postalCode;
                          return (
                            <button
                              key={addr._id || addr.addressLine1}
                              type="button"
                              onClick={() => handleSelectAddress(addr)}
                              className={`text-left p-3.5 border transition-all ${
                                isSelected
                                  ? "border-[#0C3A2E] bg-[#0C3A2E]/5"
                                  : "border-[#1A1A1A]/10 bg-[#F9F6F0] hover:border-[#0C3A2E]/50"
                              }`}
                            >
                              <div className="flex justify-between items-start mb-1 gap-2">
                                <span className="font-semibold text-xs text-[#1A1A1A] truncate">
                                  {addr.fullName}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {addr.isDefault && (
                                    <span className="text-[8px] bg-[#D4AF37] text-[#1A1A1A] px-1.5 py-0.5 font-bold uppercase">
                                      Default
                                    </span>
                                  )}
                                  {isSelected && (
                                    <Check
                                      size={13}
                                      className="text-[#0C3A2E]"
                                    />
                                  )}
                                </div>
                              </div>
                              <p className="text-[11px] text-[#1A1A1A]/60 line-clamp-1">
                                {addr.addressLine1}
                              </p>
                              <p className="text-[11px] text-[#1A1A1A]/60">
                                {addr.city}, {addr.state} – {addr.postalCode}
                              </p>
                              <p className="text-[11px] text-[#1A1A1A]/50">
                                {addr.phone}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                      <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-[#1A1A1A]/10" />
                        </div>
                        <div className="relative flex justify-center">
                          <span className="bg-white px-3 text-[10px] uppercase tracking-widest text-[#1A1A1A]/40 font-bold">
                            or enter manually
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Manual Address Form */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.fullName}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            fullName: e.target.value,
                          })
                        }
                        placeholder="e.g. Adit Panchal"
                        className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/30 outline-none transition"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        value={shippingAddress.phone}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setShippingAddress({ ...shippingAddress, phone: digits });
                        }}
                        placeholder="10-digit mobile number"
                        className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/30 outline-none transition"
                        maxLength={10}
                        inputMode="numeric"
                        pattern="[0-9]{10}"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                      Address Line 1 *
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine1}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          addressLine1: e.target.value,
                        })
                      }
                      placeholder="House / Flat / Block No., Street Name"
                      className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/30 outline-none transition"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                      Address Line 2{" "}
                      <span className="normal-case text-[#1A1A1A]/30 font-normal">
                        (optional)
                      </span>
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.addressLine2}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          addressLine2: e.target.value,
                        })
                      }
                      placeholder="Apartment, Landmark, Area"
                      className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/30 outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                        City *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            city: e.target.value,
                          })
                        }
                        placeholder="e.g. Mumbai"
                        className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/30 outline-none transition"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                        State *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            state: e.target.value,
                          })
                        }
                        placeholder="e.g. Maharashtra"
                        className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/30 outline-none transition"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                        Postal Code *
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) =>
                          setShippingAddress({
                            ...shippingAddress,
                            postalCode: e.target.value,
                          })
                        }
                        placeholder="e.g. 400001"
                        className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] placeholder-[#1A1A1A]/30 outline-none transition"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: Payment Method */}
              <div className="bg-white border border-[#1A1A1A]/10 shadow-sm">
                <div className="px-6 py-4 border-b border-[#1A1A1A]/10 bg-[#F9F6F0] flex items-center gap-3">
                  <div className="w-7 h-7 bg-[#0C3A2E] flex items-center justify-center shrink-0">
                    <span className="text-white text-[10px] font-bold">2</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CreditCard size={16} className="text-[#0C3A2E]" />
                    <h2 className="font-semibold text-sm uppercase tracking-widest text-[#1A1A1A]">
                      Payment Method
                    </h2>
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  {/* Razorpay Option */}
                  <label
                    className={`flex items-start gap-4 p-4 border cursor-pointer transition-all ${
                      paymentMethod === "razorpay"
                        ? "border-[#0C3A2E] bg-[#0C3A2E]/5"
                        : "border-[#1A1A1A]/10 bg-[#F9F6F0] hover:border-[#0C3A2E]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-0.5 accent-[#0C3A2E]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-[#1A1A1A]">
                        Online Payment via Razorpay
                      </p>
                      <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                        UPI (GPay, PhonePe, Paytm), Net Banking, Cards &
                        Wallets — Instant confirmation
                      </p>
                    </div>
                    {paymentMethod === "razorpay" && (
                      <Check size={16} className="text-[#0C3A2E] shrink-0 mt-0.5" />
                    )}
                  </label>

                  {/* COD Option */}
                  <label
                    className={`flex items-start gap-4 p-4 border cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-[#0C3A2E] bg-[#0C3A2E]/5"
                        : "border-[#1A1A1A]/10 bg-[#F9F6F0] hover:border-[#0C3A2E]/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mt-0.5 accent-[#0C3A2E]"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-[#1A1A1A]">
                        Cash on Delivery
                      </p>
                      <p className="text-xs text-[#1A1A1A]/60 mt-0.5">
                        Pay in full when your consignment arrives at your
                        doorstep
                      </p>
                    </div>
                    {paymentMethod === "cod" && (
                      <Check size={16} className="text-[#0C3A2E] shrink-0 mt-0.5" />
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN — Order Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white border border-[#1A1A1A]/10 shadow-sm sticky top-28">
                <div className="px-6 py-4 border-b border-[#1A1A1A]/10 bg-[#F9F6F0] flex items-center gap-2">
                  <ShoppingBag size={16} className="text-[#0C3A2E]" />
                  <h2 className="font-semibold text-sm uppercase tracking-widest text-[#1A1A1A]">
                    Order Summary
                  </h2>
                  <span className="ml-auto text-[10px] font-bold text-[#1A1A1A]/50">
                    {cart.length} {cart.length === 1 ? "piece" : "pieces"}
                  </span>
                </div>

                <div className="p-6 space-y-5">
                  {/* Cart Items List */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                    {cart.map((item) => (
                      <div key={item.product} className="flex items-start gap-3">
                        <div className="w-14 h-14 bg-[#F9F6F0] border border-[#1A1A1A]/10 overflow-hidden flex-shrink-0">
                          <img
                            src={item.image || "/placeholder.jpg"}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#1A1A1A] line-clamp-1">
                            {item.name}
                          </p>
                          <p className="text-[10px] text-[#1A1A1A]/50 mt-0.5">
                            Qty: {item.quantity}
                          </p>
                          {item.stock === 0 && (
                            <p className="text-[10px] text-[#A85751] font-medium mt-0.5 flex items-center gap-1">
                              <AlertCircle size={9} />
                              Out of stock
                            </p>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-[#1A1A1A] shrink-0">
                          ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[#1A1A1A]/10" />

                  {/* Coupon */}
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/50 mb-2 flex items-center gap-1">
                      <Tag size={11} className="text-[#0C3A2E]" />
                      Promo Code
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="e.g. LUXURY20"
                        value={couponCode}
                        onChange={(e) =>
                          setCouponCode(e.target.value.toUpperCase())
                        }
                        className="flex-1 bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-3 py-2 text-xs text-[#1A1A1A] font-mono uppercase placeholder-[#1A1A1A]/30 outline-none transition"
                      />
                      <button
                        onClick={handleApplyCoupon}
                        disabled={couponApplying || !couponCode.trim()}
                        className="px-4 py-2 bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {couponApplying ? (
                          <Loader2 size={13} className="animate-spin" />
                        ) : (
                          "Apply"
                        )}
                      </button>
                    </div>
                    {couponDiscount > 0 && (
                      <p className="text-[11px] text-[#2A7D6B] font-semibold mt-2 flex items-center gap-1">
                        <Check size={11} />
                        Coupon applied: –₹{couponDiscount.toLocaleString("en-IN")}
                      </p>
                    )}
                  </div>

                  {/* Price Breakdown */}
                  <div className="border-t border-[#1A1A1A]/10 pt-4 space-y-2.5">
                    <div className="flex justify-between text-xs text-[#1A1A1A]/60">
                      <span>Subtotal</span>
                      <span className="font-medium text-[#1A1A1A]">
                        ₹{itemsPrice.toLocaleString("en-IN")}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-[#1A1A1A]/60">
                      <span>Shipping</span>
                      <span
                        className={`font-medium ${shippingPrice === 0 ? "text-[#2A7D6B]" : "text-[#1A1A1A]"}`}
                      >
                        {shippingPrice === 0
                          ? "Free"
                          : `₹${shippingPrice.toLocaleString("en-IN")}`}
                      </span>
                    </div>
                    {itemsPrice < 999 && shippingPrice > 0 && (
                      <p className="text-[10px] text-[#1A1A1A]/40 italic">
                        Free shipping on orders above ₹999
                      </p>
                    )}
                    {couponDiscount > 0 && (
                      <div className="flex justify-between text-xs text-[#2A7D6B] font-semibold">
                        <span>Discount</span>
                        <span>–₹{couponDiscount.toLocaleString("en-IN")}</span>
                      </div>
                    )}
                    <div className="border-t border-[#1A1A1A]/10 pt-3">
                      <div className="flex justify-between font-semibold text-[#1A1A1A]">
                        <span className="text-sm">Total</span>
                        <span className="text-xl font-brand">
                          ₹{totalPrice.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#1A1A1A]/40 mt-0.5">
                        Inclusive of all taxes
                      </p>
                    </div>
                  </div>

                  {/* Out of Stock Warning */}
                  {hasOutOfStockItems && (
                    <div className="bg-[#A85751]/8 border border-[#A85751]/25 px-4 py-3 flex items-start gap-2.5">
                      <AlertCircle
                        size={14}
                        className="text-[#A85751] shrink-0 mt-0.5"
                      />
                      <p className="text-[11px] text-[#A85751] font-medium">
                        One or more items in your cart are out of stock. Please
                        remove them before placing your order.
                      </p>
                    </div>
                  )}

                  {/* Place Order CTA */}
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading || hasOutOfStockItems}
                    className="w-full bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white py-4 font-semibold text-xs uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 shadow-sm"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Processing Order...
                      </>
                    ) : (
                      <>
                        Place Order
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>

                  {/* Security Trust Badge */}
                  <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#1A1A1A]/40 pt-1">
                    <Lock size={11} className="text-[#0C3A2E]" />
                    <span>Secured by 256-bit SSL encryption · Razorpay</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
