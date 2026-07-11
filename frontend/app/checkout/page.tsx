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
import { CreditCard, Truck, Lock, ArrowRight, Check } from "lucide-react";
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
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [order, setOrder] = useState<any>(null);

  const itemsPrice = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const shippingPrice = itemsPrice >= 999 ? 0 : 99;
  const taxPrice = 0; // GST removed
  const totalPrice = itemsPrice + shippingPrice + taxPrice - couponDiscount;
  const hasOutOfStockItems = cart.some((item) => item.stock === 0);

  const [mounted, setMounted] = useState(false);

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
    // Only check cart length after hydration to avoid SSR mismatch
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

          // Find default address or the first one to pre-populate
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
    if (!couponCode) return;
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
      toast.error(error.response?.data?.message || "Invalid coupon");
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

    // Validate shipping fields
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

    const hasOutOfStockItems = cart.some((item) => item.stock === 0);
    if (hasOutOfStockItems) {
      toast.error("please check our website after few time till then pls stay connect to us");
      return;
    }

    setLoading(true);
    try {
      // Create order
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
      setOrder(orderData);
      
      // Process payment based on method
      if (paymentMethod === "card" || paymentMethod === "stripe") {
        // Redirect to the built-in card payment page
        const orderAmount = orderData.totalPrice || totalPrice;
        router.push(
          `/payment/card?orderId=${orderData._id}&amount=${orderAmount}`,
        );
      } else if (paymentMethod === "razorpay") {
        const razorpayResponse = await paymentService.createRazorpayOrder({
          orderId: orderData._id,
        });
        const razorpayData = razorpayResponse.data || razorpayResponse;
        // Integrate Razorpay checkout
        const options = {
          key: razorpayData.keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: razorpayData.amount,
          currency: razorpayData.currency,
          order_id: razorpayData.id,
          handler: async (response: any) => {
            try {
              await paymentService.verifyRazorpayPayment({
                orderId: orderData._id,
                razorpayOrderId: razorpayData.id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              });
              clearCart();
              setIsOrderPlaced(true);
              toast.success("Order placed successfully!");
            } catch (err: any) {
              console.error("Razorpay verification failed:", err);
              toast.error(
                err.response?.data?.message ||
                  "Failed to verify Razorpay payment",
              );
            }
          },
        };
        // @ts-ignore
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // COD
        await paymentService.confirmCODPayment({
          orderId: orderData._id,
        });
        clearCart();
        setIsOrderPlaced(true);
        toast.success("Order placed successfully!");
      }
    } catch (error: any) {
      console.error("Place order failed:", error);
      toast.error(error.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  if (!user || !mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#1B2D20] text-[#F5F0E6] relative overflow-hidden">
      {/* Full Page Fixed Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />

      <Header />

      <main className="pt-24 pb-12 relative z-10">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Forms */}
            <div className="space-y-6">
              {/* Shipping Address */}
              <div className="bg-[#1A2E20]/90 rounded-lg p-6 border border-[#D4AF37]/20">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <Truck className="mr-2 text-[#D4AF37]" />
                  Shipping Address
                </h2>

                {savedAddresses.length > 0 && (
                  <div className="mb-6 p-4 bg-[#111E16]/40 rounded-lg border border-[#2A4734]">
                    <h3 className="text-xs font-semibold mb-3 text-[#D4AF37] uppercase tracking-wider">
                      Select Saved Address
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {savedAddresses.map((addr) => {
                        const isSelected =
                          shippingAddress.addressLine1 === addr.addressLine1 &&
                          shippingAddress.postalCode === addr.postalCode;
                        return (
                          <div
                            key={addr._id || addr.addressLine1}
                            onClick={() => handleSelectAddress(addr)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${
                              isSelected
                                ? "border-[#D4AF37] bg-[#2A4734]/30"
                                : "border-[#2A4734] bg-[#111E16]/50 hover:border-[#D4AF37]/50"
                            }`}
                          >
                            <div className="flex justify-between items-start mb-1 gap-2">
                              <span className="font-semibold text-white text-xs truncate max-w-[120px]">
                                {addr.fullName}
                              </span>
                              {addr.isDefault && (
                                <span className="text-[8px] bg-[#D4AF37] text-black px-1.5 py-0.5 rounded font-bold uppercase shrink-0">
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-400 line-clamp-1">
                              {addr.addressLine1}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {addr.city}, {addr.state} - {addr.postalCode}
                            </p>
                            <p className="text-[11px] text-gray-400">
                              {addr.phone}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Full Name
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
                      className="w-full bg-[#111E16] border border-[#2A4734] rounded-lg px-4 py-2 focus:outline-none focus:border-[#D4AF37] text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={shippingAddress.phone}
                      onChange={(e) =>
                        setShippingAddress({
                          ...shippingAddress,
                          phone: e.target.value,
                        })
                      }
                      className="w-full bg-[#111E16] border border-[#2A4734] rounded-lg px-4 py-2 focus:outline-none focus:border-[#D4AF37] text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Address Line 1
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
                      className="w-full bg-[#111E16] border border-[#2A4734] rounded-lg px-4 py-2 focus:outline-none focus:border-[#D4AF37] text-white"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Address Line 2
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
                      className="w-full bg-[#111E16] border border-[#2A4734] rounded-lg px-4 py-2 focus:outline-none focus:border-[#D4AF37] text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        City
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
                        className="w-full bg-[#111E16] border border-[#2A4734] rounded-lg px-4 py-2 focus:outline-none focus:border-[#D4AF37] text-white"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        State
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
                        className="w-full bg-[#111E16] border border-[#2A4734] rounded-lg px-4 py-2 focus:outline-none focus:border-[#D4AF37] text-white"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Postal Code
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
                      className="w-full bg-[#111E16] border border-[#2A4734] rounded-lg px-4 py-2 focus:outline-none focus:border-[#D4AF37] text-white"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-[#1A2E20]/90 rounded-lg p-6 border border-[#D4AF37]/20">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <CreditCard className="mr-2 text-[#D4AF37]" />
                  Payment Method
                </h2>

                <div className="space-y-3">
                  <label className="flex items-center p-4 bg-[#111E16] rounded-lg cursor-pointer border-2 border-[#2A4734] hover:border-[#D4AF37] transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === "card"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 text-[#D4AF37] focus:ring-0"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-white">
                        Credit/Debit Card
                      </span>
                      <p className="text-sm text-gray-400">
                        Pay securely with your card
                      </p>
                    </div>
                    {paymentMethod === "card" && (
                      <Check className="text-[#D4AF37]" />
                    )}
                  </label>

                  <label className="flex items-center p-4 bg-[#111E16] rounded-lg cursor-pointer border-2 border-[#2A4734] hover:border-[#D4AF37] transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="razorpay"
                      checked={paymentMethod === "razorpay"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 text-[#D4AF37] focus:ring-0"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-white">Razorpay</span>
                      <p className="text-sm text-gray-400">
                        UPI, Cards, Net Banking
                      </p>
                    </div>
                    {paymentMethod === "razorpay" && (
                      <Check className="text-[#D4AF37]" />
                    )}
                  </label>

                  <label className="flex items-center p-4 bg-[#111E16] rounded-lg cursor-pointer border-2 border-[#2A4734] hover:border-[#D4AF37] transition-colors">
                    <input
                      type="radio"
                      name="payment"
                      value="cod"
                      checked={paymentMethod === "cod"}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3 text-[#D4AF37] focus:ring-0"
                    />
                    <div className="flex-1">
                      <span className="font-semibold text-white">
                        Cash on Delivery
                      </span>
                      <p className="text-sm text-gray-400">
                        Pay when you receive
                      </p>
                    </div>
                    {paymentMethod === "cod" && (
                      <Check className="text-[#D4AF37]" />
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div>
              <div className="bg-[#1A2E20]/90 rounded-lg p-6 border border-[#D4AF37]/20 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                {/* Cart Items */}
                <div className="space-y-3 mb-6 max-h-64 overflow-y-auto">
                  {cart.map((item) => (
                    <div key={item.product} className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-[#111E16] border border-[#2A4734] rounded overflow-hidden">
                        <img
                          src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          Qty: {item.quantity}
                        </p>
                        {item.stock === 0 && (
                          <p className="text-[10px] text-red-400 font-light mt-0.5">
                            Out of stock - please check back later
                          </p>
                        )}
                      </div>
                      <span className="text-[#D4AF37] font-semibold">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Coupon */}
                <div className="mb-6">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-[#111E16] border border-[#2A4734] rounded-lg px-4 py-2 focus:outline-none focus:border-[#D4AF37] text-white"
                    />
                    <button
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-[#D4AF37] text-black rounded-lg font-semibold hover:bg-[#D4AF37]/90 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  {couponDiscount > 0 && (
                    <p className="text-green-500 text-sm mt-2">
                      Coupon applied: -₹{couponDiscount.toLocaleString()}
                    </p>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 border-t border-[#D4AF37]/20 pt-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Subtotal</span>
                    <span>₹{itemsPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Shipping</span>
                    <span>
                      {shippingPrice === 0 ? "Free" : `₹${shippingPrice}`}
                    </span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>Discount</span>
                      <span>-₹{couponDiscount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-[#D4AF37]/20 pt-3">
                    <div className="flex justify-between font-bold text-xl">
                      <span>Total</span>
                      <span className="text-[#D4AF37]">
                        ₹{totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                {hasOutOfStockItems && (
                  <div className="mb-4 p-3 bg-red-950/20 border border-red-500/20 text-red-200 text-sm font-light rounded-lg text-center">
                    please check our website after few time till then pls stay connect to us
                  </div>
                )}

                {isOrderPlaced ? (
                  <div className="w-full bg-[#111E16] border border-[#D4AF37] text-[#D4AF37] py-4 rounded-lg font-semibold flex items-center justify-center text-center px-4 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
                    Thanks For Ordering Wait until Owner accepts your order
                  </div>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading || hasOutOfStockItems}
                    className="w-full bg-[#D4AF37] text-black py-4 rounded-lg font-semibold hover:bg-[#D4AF37]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      "Processing..."
                    ) : (
                      <>
                        Place Order
                        <ArrowRight size={20} className="ml-2" />
                      </>
                    )}
                  </button>
                )}

                <div className="flex items-center justify-center mt-4 text-xs text-gray-400">
                  <Lock size={12} className="mr-1" />
                  Secure checkout powered by Stripe & Razorpay
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
