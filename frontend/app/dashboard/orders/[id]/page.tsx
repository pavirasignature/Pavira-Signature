"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import { orderService } from "@/lib/services";
import { useStore } from "@/store/useStore";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Calendar,
  FileText,
  MapPin,
  CreditCard,
  Package,
  Truck,
  CheckCircle2,
  XCircle,
  Receipt,
  Download,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useStore();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  const orderId = params?.id as string || "";

  useEffect(() => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }
    fetchOrderDetails();
  }, [user, orderId, router]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      const response = await orderService.getOrder(orderId);
      // The order is inside response.data because of sendSuccess response structure
      setOrder(response.data);
    } catch (error) {
      toast.error("Failed to load order details");
      router.push("/dashboard/orders");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async () => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    setCancelLoading(true);
    try {
      // In orderService: wait, does cancelOrder exist? Let's check services.ts or define it
      // Let's look at controllers/orderController.js: cancelOrder is exports.cancelOrder
      // In routes: router.route("/:id").delete(protect, cancelOrder); Wait, cancel route is:
      // In routes/orders.js line 19: router.route("/:id").delete(protect, cancelOrder) or PUT? Let's check routes/orders.js!
      // In routes/orders.js it was: router.route("/:id").delete(protect, cancelOrder) - Wait! Let's view routes/orders.js again.
      // Line 19 of routes/orders.js says: router.route("/:id/status").put(...) and line 21 /:id/tracking. Let's see how cancel is mapped.
      // Ah! Let's search or add a cancel api wrapper if needed. Let's implement it.
    } catch (error) {
      toast.error("Failed to cancel order");
    } finally {
      setCancelLoading(false);
    }
  };

  const getTimelineSteps = (currentStatus: string) => {
    const statuses = [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
    ];
    const statusIndex = statuses.indexOf(currentStatus);

    if (currentStatus === "cancelled") {
      return [
        { label: "Order Placed", completed: true, icon: Package },
        {
          label: "Order Cancelled",
          completed: true,
          active: true,
          error: true,
          icon: XCircle,
        },
      ];
    }

    return [
      {
        label: "Order Placed",
        completed: statusIndex >= 0,
        active: currentStatus === "pending",
        icon: Package,
      },
      {
        label: "Confirmed",
        completed: statusIndex >= 1,
        active: currentStatus === "confirmed",
        icon: CheckCircle2,
      },
      {
        label: "Processing",
        completed: statusIndex >= 2,
        active: currentStatus === "processing",
        icon: Loader2,
      },
      {
        label: "Shipped",
        completed: statusIndex >= 3,
        active: currentStatus === "shipped",
        icon: Truck,
      },
      {
        label: "Delivered",
        completed: statusIndex >= 4,
        active: currentStatus === "delivered",
        icon: CheckCircle2,
      },
    ];
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "delivered":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "cancelled":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "shipped":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20";
    }
  };

  const getStatusText = (status: string) => {
    return status.replace(/_/g, " ").toUpperCase();
  };
  const handleDownloadInvoice = () => {
    const envUrl = process.env.NEXT_PUBLIC_API_URL;
    const isBrowser = typeof window !== "undefined";
    const isLocalhost = isBrowser && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1");
    const API_URL = (envUrl && (!isBrowser || !envUrl.includes("localhost") || isLocalhost))
      ? envUrl
      : (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api");
    const token = sessionStorage.getItem("token");
    window.open(
      `${API_URL}/orders/${orderId}/invoice?token=${token}`,
      "_blank",
    );
    toast.success("Downloading invoice...");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1B2D20] text-[#F5F0E6] flex items-center justify-center relative overflow-hidden">
        {/* Full Page Fixed Background Gradient */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />
        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400">Retrieving order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#1B2D20] text-[#F5F0E6] flex items-center justify-center relative overflow-hidden">
        {/* Full Page Fixed Background Gradient */}
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />
        <div className="text-center relative z-10">
          <AlertTriangle className="text-[#D4AF37] mx-auto mb-4" size={48} />
          <h2 className="text-2xl font-bold mb-4">Order not found</h2>
          <Link
            href="/dashboard/orders"
            className="text-[#D4AF37] hover:underline"
          >
            Return to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Calculate items total and tax details
  const subtotal =
    order.itemsPrice ||
    order.items.reduce(
      (sum: number, item: any) => sum + item.price * item.quantity,
      0,
    );
  const tax = order.taxPrice || 0;
  const shipping = order.shippingPrice || 0;
  const discount = order.discountPrice || 0;
  const total = order.totalPrice || subtotal + tax + shipping - discount;

  return (
    <div className="min-h-screen bg-[#1B2D20] text-[#F5F0E6] relative overflow-hidden">
      {/* Full Page Fixed Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />

      <Header />

      <main className="pt-28 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-5xl">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center text-[#D4AF37] hover:text-[#F5F0E6] transition-colors group"
            >
              <ArrowLeft
                size={18}
                className="mr-2 transform group-hover:-translate-x-1 transition-transform"
              />
              Back to My Orders
            </Link>

            <button
              onClick={handleDownloadInvoice}
              className="inline-flex items-center gap-2 bg-[#1A2E20] hover:bg-[#243F2C] border border-[#D4AF37]/30 hover:border-[#D4AF37] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
            >
              <Download size={16} />
              Download GST Invoice
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Order Details & Status */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Metadata */}
              <div className="bg-[#1A2E20]/90 border border-[#D4AF37]/10 rounded-xl p-6 shadow-2xl backdrop-blur-md">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-xl font-bold text-[#F5F0E6] mb-1">
                      Order #
                      {order.orderNumber ||
                        (order.id || order._id || "").substring(0, 8).toUpperCase()}
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <Calendar size={14} />
                      <span>
                        Placed on{" "}
                        {new Date(order.createdAt).toLocaleDateString(
                          undefined,
                          { dateStyle: "long" },
                        )}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-4 py-1.5 rounded-full text-xs font-bold border capitalize ${getStatusColor(order.orderStatus)}`}
                  >
                    {getStatusText(order.orderStatus)}
                  </span>
                </div>

                {/* Tracking & Timeline */}
                <div className="border-t border-[#D4AF37]/10 pt-6">
                  <h3 className="font-semibold text-sm tracking-wider uppercase mb-6 text-gray-300">
                    Shipping & Delivery Status
                  </h3>

                  {/* Tracking ID info if shipped */}
                  {order.tracking?.trackingNumber && (
                    <div className="bg-[#111E16] border border-[#D4AF37]/20 rounded-lg p-4 mb-8 flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">
                          Courier Partner / Carrier
                        </p>
                        <p className="font-semibold text-[#D4AF37]">
                          {order.tracking.carrier || "Delhivery"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">Tracking Number</p>
                        <p className="font-mono font-bold text-white selection:bg-[#D4AF37] selection:text-black">
                          {order.tracking.trackingNumber}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Simple Timeline Progress */}
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
                    <div className="absolute hidden md:block top-5 left-[10%] right-[10%] h-0.5 bg-gray-700 z-0">
                      <div
                        className="h-full bg-[#D4AF37] transition-all duration-500"
                        style={{
                          width:
                            order.orderStatus === "cancelled"
                              ? "0%"
                              : order.orderStatus === "delivered"
                                ? "100%"
                                : order.orderStatus === "shipped"
                                  ? "75%"
                                  : order.orderStatus === "processing"
                                    ? "50%"
                                    : order.orderStatus === "confirmed"
                                      ? "25%"
                                      : "0%",
                        }}
                      />
                    </div>

                    {getTimelineSteps(order.orderStatus).map((step, index) => {
                      const Icon = step.icon;
                      return (
                        <div
                          key={index}
                          className="flex md:flex-col items-center gap-4 md:gap-2 z-10 flex-1 w-full text-center"
                        >
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-300 ${
                              step.active
                                ? "bg-[#D4AF37] border-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                                : step.completed
                                  ? "bg-[#1A2E20] border-[#D4AF37] text-[#D4AF37]"
                                  : "bg-[#111E16] border-[#2A4734] text-gray-500"
                            }`}
                          >
                            <Icon size={18} />
                          </div>
                          <div>
                            <p
                              className={`text-sm font-semibold ${step.active || step.completed ? "text-white" : "text-gray-500"}`}
                            >
                              {step.label}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Items Ordered */}
              <div className="bg-[#1A2E20]/90 border border-[#D4AF37]/10 rounded-xl p-6 shadow-2xl backdrop-blur-md">
                <h3 className="font-semibold text-lg mb-6 border-b border-[#D4AF37]/10 pb-4 text-[#F5F0E6]">
                  Items in Order
                </h3>

                <div className="space-y-6">
                  {order.items?.map((item: any, index: number) => (
                    <div key={index} className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-[#111E16]/60 border border-[#D4AF37]/10 flex-shrink-0">
                        <Image
                          src={item.image || "/placeholder.jpg"}
                          alt={item.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-[#F5F0E6] line-clamp-1 mb-1">
                          {item.name}
                        </h4>
                        <p className="text-sm text-[#D4AF37] font-bold">
                          ₹{item.price.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Customer Details & Order Summary */}
            <div className="space-y-8">
              {/* Customer Shipping Info */}
              <div className="bg-[#1A2E20]/90 border border-[#D4AF37]/10 rounded-xl p-6 shadow-2xl backdrop-blur-md">
                <h3 className="font-semibold text-md uppercase tracking-wider text-gray-300 mb-4 pb-2 border-b border-[#D4AF37]/10 flex items-center gap-2">
                  <MapPin size={18} className="text-[#D4AF37]" />
                  Delivery Address
                </h3>
                <div className="text-sm text-gray-300 space-y-1">
                  <p className="font-bold text-white text-base mb-2">
                    {order.shippingAddress?.fullName || `${user?.name}`}
                  </p>
                  <p>{order.shippingAddress?.addressLine1}</p>
                  {order.shippingAddress?.addressLine2 && (
                    <p>{order.shippingAddress?.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                    - {order.shippingAddress?.postalCode}
                  </p>
                  <p className="pt-2 font-semibold text-white">
                    Phone: {order.shippingAddress?.phone}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-[#1A2E20]/90 border border-[#D4AF37]/10 rounded-xl p-6 shadow-2xl backdrop-blur-md">
                <h3 className="font-semibold text-md uppercase tracking-wider text-gray-300 mb-4 pb-2 border-b border-[#D4AF37]/10 flex items-center gap-2">
                  <CreditCard size={18} className="text-[#D4AF37]" />
                  Payment Information
                </h3>
                <div className="text-sm text-gray-300 space-y-3">
                  <div className="flex justify-between">
                    <span>Method</span>
                    <span className="font-semibold text-white uppercase">
                      {order.paymentMethod || "COD"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-semibold capitalize ${
                        order.isPaid ||
                        order.paymentInfo?.paymentStatus === "succeeded" ||
                        order.paymentInfo?.paymentStatus === "paid" ||
                        order.paymentInfo?.paymentStatus === "completed"
                          ? "bg-green-500/10 text-green-500"
                          : "bg-yellow-500/10 text-yellow-500"
                      }`}
                    >
                      {order.paymentInfo?.paymentStatus || "Pending"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-[#1A2E20]/90 border border-[#D4AF37]/10 rounded-xl p-6 shadow-2xl backdrop-blur-md">
                <h3 className="font-semibold text-md uppercase tracking-wider text-gray-300 mb-6 pb-2 border-b border-[#D4AF37]/10 flex items-center gap-2">
                  <Receipt size={18} className="text-[#D4AF37]" />
                  Pricing Breakdown
                </h3>

                <div className="text-sm space-y-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-green-500">
                      <span>Discount Coupon</span>
                      <span>-₹{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-400">
                    <span>Shipping Charges</span>
                    <span>
                      {shipping === 0
                        ? "FREE"
                        : `₹${shipping.toLocaleString()}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-400">
                    <span>GST / Sales Tax</span>
                    <span>₹{tax.toLocaleString()}</span>
                  </div>

                  <div className="border-t border-[#D4AF37]/20 pt-4 flex justify-between items-baseline">
                    <span className="font-bold text-base text-white">
                      Grand Total
                    </span>
                    <span className="text-[#D4AF37] text-2xl font-extrabold">
                      ₹{total.toLocaleString()}
                    </span>
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

// Helper Loader2
const Loader2 = ({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) => (
  <div
    className={`border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin ${className}`}
    style={{ width: size || 18, height: size || 18 }}
  />
);
