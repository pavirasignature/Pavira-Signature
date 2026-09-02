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

  const orderId = (params?.id as string) || "";

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
      setOrder(response.data || response);
    } catch (error) {
      toast.error("Failed to load order details");
      router.push("/dashboard?tab=orders");
    } finally {
      setLoading(false);
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
        label: "Placed",
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
        icon: Package,
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
        return "bg-[#2A7D6B]/10 text-[#2A7D6B] border-[#2A7D6B]/30";
      case "cancelled":
        return "bg-[#A85751]/10 text-[#A85751] border-[#A85751]/30";
      case "shipped":
        return "bg-[#0C3A2E]/10 text-[#0C3A2E] border-[#0C3A2E]/30";
      default:
        return "bg-[#D4AF37]/15 text-[#8F6F12] border-[#D4AF37]/40";
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
    toast.success("Preparing invoice download...");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#0C3A2E] border-t-transparent animate-spin" />
          <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-semibold">Retrieving order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] flex items-center justify-center">
        <div className="text-center bg-white border border-[#1A1A1A]/10 p-12 max-w-md">
          <AlertTriangle className="text-[#A85751] mx-auto mb-4" size={40} />
          <h2 className="text-2xl font-brand mb-2">Order Not Found</h2>
          <p className="text-xs text-[#1A1A1A]/60 mb-6">The requested order consignment could not be located in your cabinet.</p>
          <Link
            href="/dashboard?tab=orders"
            className="inline-block px-6 py-3 bg-[#0C3A2E] text-white text-xs uppercase tracking-widest font-semibold hover:bg-[#0C3A2E]/90 transition"
          >
            Return to Orders
          </Link>
        </div>
      </div>
    );
  }

  // Calculate items total and pricing
  const subtotal =
    order.itemsPrice ||
    (order.items || []).reduce(
      (sum: number, item: any) => sum + (item.price || 0) * (item.quantity || 1),
      0,
    );
  const tax = order.taxPrice || 0;
  const shipping = order.shippingPrice || 0;
  const discount = order.discountPrice || 0;
  const total = order.totalPrice || subtotal + tax + shipping - discount;

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] selection:bg-[#0C3A2E] selection:text-white flex flex-col font-sans">
      <Header />

      <main className="flex-grow pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Actions */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 border-b border-[#1A1A1A]/10 pb-6">
            <div>
              <Link
                href="/dashboard?tab=orders"
                className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-[#0C3A2E] hover:underline mb-2 group"
              >
                <ArrowLeft
                  size={14}
                  className="mr-1.5 transform group-hover:-translate-x-1 transition-transform"
                />
                Back to Orders
              </Link>
              <h1 className="text-3xl font-brand text-[#1A1A1A] font-normal">
                Order #
                {order.orderNumber ||
                  (order.id || order._id || "").substring(0, 8).toUpperCase()}
              </h1>
            </div>

            <button
              onClick={handleDownloadInvoice}
              className="inline-flex items-center gap-2 bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white px-6 py-3 text-xs uppercase tracking-widest font-semibold transition shadow-sm"
            >
              <Download size={14} />
              Download GST Invoice
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left 2 Columns: Order Details & Status */}
            <div className="lg:col-span-2 space-y-8">
              {/* Order Metadata & Tracking Progress */}
              <div className="bg-white border border-[#1A1A1A]/10 p-8 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-6 border-b border-[#1A1A1A]/10">
                  <div>
                    <span className="block text-[10px] uppercase tracking-[0.2em] text-[#1A1A1A]/50 font-bold mb-1">
                      Placement Date
                    </span>
                    <div className="flex items-center gap-2 text-xs text-[#1A1A1A] font-medium">
                      <Calendar size={14} className="text-[#0C3A2E]" />
                      <span>
                        {new Date(order.createdAt).toLocaleDateString(
                          "en-IN",
                          { dateStyle: "long" },
                        )}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`px-3.5 py-1 text-[10px] font-bold tracking-wider border uppercase ${getStatusColor(order.orderStatus)}`}
                  >
                    {getStatusText(order.orderStatus)}
                  </span>
                </div>

                {/* Tracking ID info if shipped */}
                {order.tracking?.trackingNumber && (
                  <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 p-5 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="text-[10px] text-[#1A1A1A]/50 uppercase tracking-wider font-bold">
                        Courier Partner
                      </p>
                      <p className="font-semibold text-[#0C3A2E] uppercase">
                        {order.tracking.carrier || "Delhivery"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] text-[#1A1A1A]/50 uppercase tracking-wider font-bold">Consignment Tracking Number</p>
                      <p className="font-mono font-bold text-[#1A1A1A] select-all">
                        {order.tracking.trackingNumber}
                      </p>
                    </div>
                  </div>
                )}

                {/* Timeline Progress */}
                <div>
                  <h3 className="font-bold text-xs uppercase tracking-wider mb-6 text-[#1A1A1A]">
                    Shipment Progress
                  </h3>

                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
                    <div className="absolute hidden md:block top-4 left-[10%] right-[10%] h-0.5 bg-[#1A1A1A]/10 z-0">
                      <div
                        className="h-full bg-[#0C3A2E] transition-all duration-500"
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
                            className={`w-8 h-8 flex items-center justify-center border transition-all ${
                              step.active || step.completed
                                ? "bg-[#0C3A2E] border-[#0C3A2E] text-white"
                                : "bg-white border-[#1A1A1A]/20 text-[#1A1A1A]/30"
                            }`}
                          >
                            <Icon size={14} />
                          </div>
                          <div>
                            <p
                              className={`text-xs font-semibold uppercase tracking-wider ${
                                step.active || step.completed ? "text-[#1A1A1A]" : "text-[#1A1A1A]/40"
                              }`}
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
              <div className="bg-white border border-[#1A1A1A]/10 p-8 shadow-sm">
                <h3 className="font-brand text-xl mb-6 border-b border-[#1A1A1A]/10 pb-4 text-[#1A1A1A] font-normal">
                  Items in this Acquisition
                </h3>

                <div className="space-y-6">
                  {order.items?.map((item: any, index: number) => (
                    <div key={index} className="flex items-center gap-5 pb-6 border-b border-[#1A1A1A]/5 last:border-0 last:pb-0">
                      <div className="relative w-20 h-20 bg-[#F9F6F0] border border-[#1A1A1A]/10 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-2xl opacity-30">🎨</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-brand font-semibold text-[#1A1A1A] text-base line-clamp-1 mb-1">
                          {item.name}
                        </h4>
                        <p className="text-xs text-[#0C3A2E] font-semibold">
                          ₹{(item.price || 0).toLocaleString("en-IN")}
                        </p>
                        <p className="text-[11px] text-[#1A1A1A]/50 mt-1 uppercase tracking-wider">
                          Quantity: {item.quantity || 1}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-base text-[#1A1A1A]">
                          ₹{((item.price || 0) * (item.quantity || 1)).toLocaleString("en-IN")}
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
              <div className="bg-white border border-[#1A1A1A]/10 p-6 shadow-sm">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A] mb-4 pb-3 border-b border-[#1A1A1A]/10 flex items-center gap-2">
                  <MapPin size={16} className="text-[#0C3A2E]" />
                  <span>Delivery Destination</span>
                </h3>
                <div className="text-xs text-[#1A1A1A]/70 space-y-1">
                  <p className="font-semibold text-[#1A1A1A] text-sm mb-1.5">
                    {order.shippingAddress?.fullName || `${user?.name || 'Customer'}`}
                  </p>
                  <p>{order.shippingAddress?.addressLine1}</p>
                  {order.shippingAddress?.addressLine2 && (
                    <p>{order.shippingAddress?.addressLine2}</p>
                  )}
                  <p>
                    {order.shippingAddress?.city}, {order.shippingAddress?.state}{" "}
                    - {order.shippingAddress?.postalCode}
                  </p>
                  <p className="pt-2 font-medium text-[#1A1A1A]">
                    Phone: {order.shippingAddress?.phone}
                  </p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-white border border-[#1A1A1A]/10 p-6 shadow-sm">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A] mb-4 pb-3 border-b border-[#1A1A1A]/10 flex items-center gap-2">
                  <CreditCard size={16} className="text-[#0C3A2E]" />
                  <span>Payment Status</span>
                </h3>
                <div className="text-xs space-y-3">
                  <div className="flex justify-between items-center text-[#1A1A1A]/70">
                    <span className="uppercase tracking-wider text-[10px]">Payment Method</span>
                    <span className="font-semibold text-[#1A1A1A] uppercase">
                      {order.paymentMethod || "Prepaid"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-[#1A1A1A]/70">
                    <span className="uppercase tracking-wider text-[10px]">Settlement</span>
                    <span
                      className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                        order.isPaid ||
                        order.paymentInfo?.paymentStatus === "succeeded" ||
                        order.paymentInfo?.paymentStatus === "paid" ||
                        order.paymentInfo?.paymentStatus === "completed"
                          ? "bg-[#2A7D6B]/10 text-[#2A7D6B] border-[#2A7D6B]/30"
                          : "bg-[#D4AF37]/15 text-[#8F6F12] border-[#D4AF37]/40"
                      }`}
                    >
                      {order.paymentInfo?.paymentStatus || (order.isPaid ? "Paid" : "Pending")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-white border border-[#1A1A1A]/10 p-6 shadow-sm">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#1A1A1A] mb-5 pb-3 border-b border-[#1A1A1A]/10 flex items-center gap-2">
                  <Receipt size={16} className="text-[#0C3A2E]" />
                  <span>Invoice Valuation</span>
                </h3>

                <div className="text-xs space-y-3 text-[#1A1A1A]/70">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="text-[#1A1A1A] font-medium">₹{subtotal.toLocaleString("en-IN")}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-[#2A7D6B]">
                      <span>Discount Benefit</span>
                      <span>-₹{discount.toLocaleString("en-IN")}</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="text-[#1A1A1A] font-medium">
                      {shipping === 0
                        ? "COMPLIMENTARY"
                        : `₹${shipping.toLocaleString("en-IN")}`}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>GST (Included)</span>
                    <span className="text-[#1A1A1A] font-medium">₹{tax.toLocaleString("en-IN")}</span>
                  </div>

                  <div className="border-t border-[#1A1A1A]/10 pt-4 flex justify-between items-baseline">
                    <span className="font-bold text-sm text-[#1A1A1A] uppercase tracking-wider">
                      Grand Total
                    </span>
                    <span className="text-[#0C3A2E] font-brand text-2xl font-semibold">
                      ₹{total.toLocaleString("en-IN")}
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
