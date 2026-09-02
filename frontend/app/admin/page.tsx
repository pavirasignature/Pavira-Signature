"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Header from "@/components/navigation/Header";
import Footer from "@/components/navigation/Footer";
import { useStore } from "@/store/useStore";
import { config, getBackendUrl } from "@/lib/config";
import {
  productService,
  orderService,
  categoryService,
  adminService,
  couponService,
  uploadService,
} from "@/lib/services";
import { authAPI } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart3,
  Plus,
  Edit,
  Trash2,
  Package,
  ShoppingBag,
  Users,
  IndianRupee,
  ArrowUpRight,
  AlertCircle,
  ChevronRight,
  X,
  Loader2,
  Check,
  Truck,
  Tag,
  Eye,
  RefreshCw,
  Calendar,
  EyeOff,
  Upload,
  Download,
} from "lucide-react";
import toast from "react-hot-toast";

type ActiveTab = "overview" | "products" | "orders" | "coupons";

// Helper to get valid product image URL
const getValidProductImageUrl = (imageUrl: string | undefined): string => {
  if (!imageUrl) return "/placeholder.jpg";
  if (
    imageUrl.includes("file://") ||
    imageUrl.includes("D:") ||
    imageUrl.includes("Downloads")
  ) {
    return "/placeholder.jpg";
  }
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  if (imageUrl.startsWith("/")) {
    return `${getBackendUrl()}${imageUrl}`;
  }
  if (imageUrl.startsWith("uploads/")) {
    return `${getBackendUrl()}/${imageUrl}`;
  }
  return "/placeholder.jpg";
};

export default function AdminDashboard() {
  const router = useRouter();
  const { user, setUser } = useStore();
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [isMounted, setIsMounted] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // States for Analytics & Overview
  const [analytics, setAnalytics] = useState<any>(null);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // States for Products
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    compareAtPrice: "",
    category: "",
    stock: "",
    images: [""],
    specifications: [{ key: "", value: "" }],
    featured: false,
    trending: false,
    bestSeller: false,
  });
  const [uploadedDeviceImages, setUploadedDeviceImages] = useState<string[]>(
    [],
  );
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // States for Orders
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [orderStatusForm, setOrderStatusForm] = useState({
    status: "",
    note: "",
  });
  const [trackingForm, setTrackingForm] = useState({
    carrier: "Delhivery",
    trackingNumber: "",
    estimatedDelivery: "",
  });

  // States for Coupons
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loadingCoupons, setLoadingCoupons] = useState(false);
  const [couponModalOpen, setCouponModalOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: "",
    discountType: "percentage",
    discountAmount: "",
    minPurchase: "",
    maxDiscount: "",
    expiryDate: "",
    usageLimit: "",
  });

  // Verification & Initial Loading
  // Prevent body scrolling when any modal is open
  useEffect(() => {
    if (productModalOpen || orderModalOpen || couponModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [productModalOpen, orderModalOpen, couponModalOpen]);

  useEffect(() => {
    const bootstrapAdmin = async () => {
      setIsMounted(true);

      const token =
        typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
      const storedUserStr =
        typeof window !== "undefined" ? sessionStorage.getItem("user") : null;

      if (!token) {
        router.replace("/login");
        return;
      }

      let activeUser = user;

      if (!activeUser && storedUserStr) {
        try {
          activeUser = JSON.parse(storedUserStr);
          setUser(activeUser as any);
        } catch (e) {
          activeUser = null;
        }
      }

      if (!activeUser) {
        try {
          const meRes = await authAPI.getMe();
          const fetchedUser = meRes.data?.data || meRes.data?.user || null;
          if (fetchedUser) {
            activeUser = fetchedUser;
            setUser(fetchedUser);
          }
        } catch (error) {
          router.replace("/login");
          return;
        }
      }

      if (!activeUser) {
        router.replace("/login");
        return;
      }

      if (activeUser.role !== "admin") {
        toast.error("Unauthorized access. Admin privileges required.");
        router.replace("/dashboard");
        return;
      }

      loadOverviewData();
    };

    bootstrapAdmin();
  }, [user, router, setUser]);

  // Load Overview Analytics Data
  const loadOverviewData = async () => {
    try {
      setLoadingAnalytics(true);
      const analyticsRes = await adminService.getAnalytics();
      setAnalytics(analyticsRes.data?.analytics || analyticsRes.analytics);

      const lowStockRes = await adminService.getLowStock();
      setLowStock(lowStockRes.data?.products || lowStockRes.products || []);
    } catch (error: any) {
      console.error("Failed to load analytics:", error);
      toast.error(
        error.response?.data?.message || "Failed to retrieve analytics metrics",
      );
    } finally {
      setLoadingAnalytics(false);
    }
  };

  // Load Products Catalog
  const loadProducts = async () => {
    try {
      setLoadingProducts(true);

      // Load categories first
      const catRes = await categoryService.getCategories();
      const categoriesData = catRes.data || [];
      setCategories(categoriesData);

      // Then load products
      const prodRes = await productService.getProducts({ limit: 100, timestamp: Date.now() });
      const productsData = prodRes.data || [];
      setProducts(productsData);

      if (productsData.length === 0) {
        console.log("No products found in catalog");
      }
    } catch (error: any) {
      console.error("Failed to load products:", error);
      toast.error(
        error.response?.data?.message || "Failed to retrieve product list",
      );
      setProducts([]);
      setCategories([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // Load All Orders
  const loadOrders = async () => {
    try {
      setLoadingOrders(true);
      const ordRes = await orderService.getMyOrders({ limit: 100 });
      const ordersData = ordRes.data || [];
      setOrders(ordersData);

      if (ordersData.length === 0) {
        console.log("No orders found in queue");
      }
    } catch (error: any) {
      console.error("Failed to load orders:", error);
      toast.error(
        error.response?.data?.message || "Failed to load admin orders list",
      );
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Load All Coupons
  const loadCoupons = async () => {
    try {
      setLoadingCoupons(true);
      const coupRes = await couponService.getCoupons();
      const couponsData = coupRes.coupons || [];
      setCoupons(couponsData);

      if (couponsData.length === 0) {
        console.log("No active promotion coupons configured");
      }
    } catch (error: any) {
      console.error("Failed to load coupons:", error);
      toast.error(
        error.response?.data?.message || "Failed to load active coupons list",
      );
      setCoupons([]);
    } finally {
      setLoadingCoupons(false);
    }
  };

  // Handle Tab Switch
  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === "overview") loadOverviewData();
    if (tab === "products") loadProducts();
    if (tab === "orders") loadOrders();
    if (tab === "coupons") loadCoupons();
  };

  // Product CRUD Handlers
  const openAddProductModal = () => {
    setEditingProduct(null);
    setUploadedDeviceImages([]);
    setProductForm({
      name: "",
      description: "",
      price: "",
      compareAtPrice: "",
      category: categories[0]?.id || categories[0]?._id || "",
      stock: "",
      images: [""],
      specifications: [{ key: "", value: "" }],
      featured: false,
      trending: false,
      bestSeller: false,
    });
    setProductModalOpen(true);
  };

  const openEditProductModal = (product: any) => {
    setEditingProduct(product);
    setUploadedDeviceImages([]);
    setProductForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      compareAtPrice: String(product.compareAtPrice || ""),
      category: product.category?.id || product.category?._id || product.category || "",
      stock: String(product.stock),
      images:
        product.images && product.images.length > 0
          ? product.images.map((img: any) => typeof img === "string" ? img : (img?.url || img || ""))
          : [""],
      specifications:
        product.specifications && typeof product.specifications === "object" && !Array.isArray(product.specifications) && Object.keys(product.specifications).length > 0
          ? Object.entries(product.specifications).map(([key, value]) => ({ key, value: String(value) }))
          : Array.isArray(product.specifications) && product.specifications.length > 0
            ? product.specifications
            : [{ key: "", value: "" }],
      featured: !!product.featured,
      trending: !!product.trending,
      bestSeller: !!product.bestSeller,
    });
    setProductModalOpen(true);
  };

  // Handle device image upload
  const handleDeviceImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingImages(true);
    try {
      console.log("Uploading", files.length, "images...");
      const response = await uploadService.uploadMultiple(Array.from(files));
      console.log("Upload response:", response);

      if (response.success && response.images) {
        const uploadedUrls = response.images.map((img: any) => img.url);
        console.log("Uploaded URLs:", uploadedUrls);
        setUploadedDeviceImages((prev) => [...prev, ...uploadedUrls]);

        // Add to product form images
        setProductForm((prev) => ({
          ...prev,
          images: [
            ...prev.images.filter((url) => url.trim() !== ""),
            ...uploadedUrls,
          ],
        }));

        toast.success(`${files.length} image(s) uploaded successfully`);
      } else {
        console.error("Unexpected response format:", response);
        toast.error("Failed to upload images: Unexpected response format");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.response?.data?.message || error.message || "Failed to upload images");
    } finally {
      setIsUploadingImages(false);
      e.target.value = "";
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !productForm.name ||
      !productForm.description ||
      !productForm.price ||
      !productForm.category ||
      !productForm.stock
    ) {
      toast.error("Please fill in all required product fields");
      return;
    }

    const specificationsObj: { [key: string]: string } = {};
    productForm.specifications.forEach((spec) => {
      if (spec.key.trim() && spec.value.trim()) {
        specificationsObj[spec.key.trim()] = spec.value.trim();
      }
    });

    const firstImageUrl = productForm.images.filter((url) => url.trim() !== "")[0] || "";

    const payload = {
      name: productForm.name,
      description: productForm.description,
      price: Number(productForm.price),
      compareAtPrice: productForm.compareAtPrice
        ? Number(productForm.compareAtPrice)
        : undefined,
      category: productForm.category,
      stock: Number(productForm.stock),
      image: firstImageUrl,
      images: productForm.images
        .filter((url) => url.trim() !== "")
        .map((url) => ({ url })),
      specifications: specificationsObj,
      featured: productForm.featured,
      trending: productForm.trending,
      bestSeller: productForm.bestSeller,
    };

    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id || editingProduct._id, payload);
        toast.success("Product updated successfully");
      } else {
        await productService.createProduct(payload);
        toast.success("Product created successfully");
      }
      setProductModalOpen(false);
      setUploadedDeviceImages([]);
      loadProducts();
    } catch (error) {
      toast.error("Failed to submit product details");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await productService.deleteProduct(id);
      toast.success("Product deleted successfully");
      loadProducts();
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleDeleteOrder = async (id: string, orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete order #${orderNumber || id}?`)) return;
    try {
      await orderService.deleteOrder(id);
      toast.success(`Order #${orderNumber || id} deleted successfully`);
      loadOrders();
    } catch (error: any) {
      console.error("Delete order error:", error);
      toast.error(error.response?.data?.message || "Failed to delete order");
    }
  };

  // Order Admin Operations
  const openOrderActionModal = (order: any) => {
    setSelectedOrder(order);
    setOrderStatusForm({
      status: order.orderStatus,
      note: "",
    });
    setTrackingForm({
      carrier: order.tracking?.carrier || "Delhivery",
      trackingNumber: order.tracking?.trackingNumber || "",
      estimatedDelivery: order.tracking?.estimatedDelivery
        ? new Date(order.tracking.estimatedDelivery)
            .toISOString()
            .substring(0, 10)
        : "",
    });
    setOrderModalOpen(true);
  };

  const handleUpdateOrderStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await orderService.updateOrderStatus(
        selectedOrder.id || selectedOrder._id,
        orderStatusForm.status,
        orderStatusForm.note,
      );
      toast.success("Order status updated successfully");
      setOrderModalOpen(false);
      loadOrders();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleUpdateOrderTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await orderService.updateOrderTracking(selectedOrder.id || selectedOrder._id, trackingForm);
      toast.success("Shipping carrier tracking details updated");
      setOrderModalOpen(false);
      loadOrders();
    } catch (error) {
      toast.error("Failed to update shipping information");
    }
  };

  // Coupon Admin Operations
  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.discountAmount) {
      toast.error("Code and discount amount are mandatory");
      return;
    }

    const payload = {
      code: couponForm.code.toUpperCase(),
      discountType: couponForm.discountType,
      discountAmount: Number(couponForm.discountAmount),
      minPurchase: couponForm.minPurchase ? Number(couponForm.minPurchase) : 0,
      maxDiscount: couponForm.maxDiscount
        ? Number(couponForm.maxDiscount)
        : undefined,
      expiryDate: couponForm.expiryDate || undefined,
      usageLimit: couponForm.usageLimit
        ? Number(couponForm.usageLimit)
        : undefined,
    };

    try {
      await couponService.createCoupon(payload);
      toast.success("New promotion coupon created");
      setCouponModalOpen(false);
      loadCoupons();
    } catch (error) {
      toast.error("Failed to create promotion coupon");
    }
  };

  const handleDeleteCoupon = async (id: string, code: string) => {
    if (!window.confirm(`Delete coupon promotion code ${code}?`)) return;
    try {
      await couponService.deleteCoupon(id);
      toast.success("Coupon removed successfully");
      loadCoupons();
    } catch (error) {
      toast.error("Failed to remove coupon code");
    }
  };

  const downloadOrdersExcel = async () => {
    const toastId = toast.loading("Preparing Excel file...");
    try {
      const ordRes = await orderService.getMyOrders({ limit: 1000 });
      const allOrders = ordRes.data || [];

      if (allOrders.length === 0) {
        toast.error("No orders exist in the system to export", { id: toastId });
        return;
      }

      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();

      let targetOrders = allOrders.filter((order: any) => {
        const dateStr = order.createdAt || order.created_at;
        if (!dateStr) return false;
        const orderDate = new Date(dateStr);
        if (isNaN(orderDate.getTime())) return false;
        return (
          orderDate.getFullYear() === currentYear &&
          orderDate.getMonth() === currentMonth
        );
      });

      let isFallbackAll = false;
      if (targetOrders.length === 0) {
        targetOrders = allOrders;
        isFallbackAll = true;
      }

      const xlsxModule = await import("xlsx");
      const XLSX = xlsxModule.utils ? xlsxModule : (xlsxModule as any).default || xlsxModule;

      const formattedData = targetOrders.map((order: any, index: number) => {
        const orderId = order.id || order._id || "";
        const orderNumber = order.orderNumber || (typeof orderId === 'string' && orderId.length >= 8 ? orderId.substring(0, 8).toUpperCase() : String(orderId));

        const customerName = order.user?.name ||
          (order.user?.firstName ? `${order.user.firstName} ${order.user.lastName || ''}`.trim() : null) ||
          order.shippingAddress?.fullName ||
          "Customer";

        const customerEmail = order.user?.email || "";
        const customerPhone = order.user?.phone || order.shippingAddress?.phone || "";

        const itemsDetails = (order.items || [])
          .map((item: any) => `${item.name} x ${item.quantity} (₹${item.price})`)
          .join(", ");

        const shippingAddr = order.shippingAddress
          ? `${order.shippingAddress.addressLine1 || ""}, ${order.shippingAddress.addressLine2 || ""}, ${order.shippingAddress.city || ""}, ${order.shippingAddress.state || ""} - ${order.shippingAddress.postalCode || ""}`
          : "";

        return {
          "S.No": index + 1,
          "Order ID": orderId,
          "Order Number": `#${orderNumber}`,
          "Date": new Date(order.createdAt || order.created_at).toLocaleString(),
          "Customer Name": customerName,
          "Email": customerEmail,
          "Phone": customerPhone,
          "Items Count": order.items?.length || 0,
          "Items Details": itemsDetails,
          "Subtotal (INR)": order.itemsPrice || 0,
          "Shipping (INR)": order.shippingPrice || 0,
          "Discount (INR)": order.discountPrice || 0,
          "Total Price (INR)": order.totalPrice || 0,
          "Order Status": order.orderStatus || "pending",
          "Payment Method": order.paymentMethod || "N/A",
          "Payment Status": order.paymentInfo?.paymentStatus || "pending",
          "Shipping Address": shippingAddr,
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, isFallbackAll ? "All Orders" : "Current Month Orders");

      const maxColWidths = Object.keys(formattedData[0] || {}).map((key) => {
        let maxLen = key.length;
        formattedData.forEach((row: any) => {
          const val = String(row[key] || "");
          if (val.length > maxLen) maxLen = val.length;
        });
        return { wch: Math.min(maxLen + 3, 50) };
      });
      worksheet["!cols"] = maxColWidths;

      const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
      ];

      const fileName = isFallbackAll
        ? `Orders_All_Time_${Date.now()}.xlsx`
        : `Orders_${monthNames[currentMonth]}_${currentYear}.xlsx`;

      XLSX.writeFile(workbook, fileName);

      if (isFallbackAll) {
        toast.success("No orders found for this month. Exported all orders instead!", { id: toastId });
      } else {
        toast.success("Excel sheet downloaded successfully!", { id: toastId });
      }
    } catch (error: any) {
      console.error("Excel download error:", error);
      toast.error("Failed to generate excel sheet", { id: toastId });
    }
  };

  let activeUser = user;
  if (!activeUser && typeof window !== "undefined") {
    const storedUserStr = sessionStorage.getItem("user");
    if (storedUserStr) {
      try {
        activeUser = JSON.parse(storedUserStr);
      } catch (e) {}
    }
  }

  if (!isMounted) return null;
  if (!activeUser || activeUser.role !== "admin") return null;

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#0C3A2E] selection:text-white">
      <Header />

      <main className="flex-grow pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Admin Page Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-[#1A1A1A]/10 pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-brand text-[#1A1A1A] font-normal mb-1">
                Admin Operations
              </h1>
              <p className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/60 font-light">
                Catalog curation, order fulfillment, tracking & promotion campaigns
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[10px] bg-[#0C3A2E] text-[#D4AF37] border border-[#D4AF37]/30 px-3.5 py-1.5 font-bold uppercase tracking-widest shadow-sm">
                System Administrator
              </span>
              <button
                onClick={async () => {
                  setIsRefreshing(true);
                  try {
                    if (activeTab === "overview") await loadOverviewData();
                    else if (activeTab === "products") await loadProducts();
                    else if (activeTab === "orders") await loadOrders();
                    else if (activeTab === "coupons") await loadCoupons();
                    toast.success("Data refreshed successfully");
                  } catch (error) {
                    console.error("Refresh error:", error);
                  } finally {
                    setIsRefreshing(false);
                  }
                }}
                disabled={isRefreshing}
                className="p-2.5 bg-white hover:bg-[#F9F6F0] border border-[#1A1A1A]/15 text-[#1A1A1A] disabled:opacity-50 transition-all shadow-sm"
                title="Refresh current data"
              >
                <RefreshCw
                  size={16}
                  className={isRefreshing ? "animate-spin text-[#0C3A2E]" : "text-[#1A1A1A]"}
                />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap items-center gap-2 mb-8 bg-white p-2 border border-[#1A1A1A]/10 shadow-sm">
            {[
              { id: "overview", label: "Dashboard Overview", icon: BarChart3 },
              { id: "products", label: "Product Catalog", icon: Package },
              { id: "orders", label: "Order Processing", icon: ShoppingBag },
              { id: "coupons", label: "Coupon Campaigns", icon: Tag },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id as ActiveTab)}
                  className={`flex items-center gap-2.5 px-5 py-3 font-semibold text-xs tracking-wider uppercase transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-[#0C3A2E] text-white shadow-sm"
                      : "text-[#1A1A1A]/70 hover:bg-[#F9F6F0] hover:text-[#0C3A2E]"
                  }`}
                >
                  <Icon size={15} className={activeTab === tab.id ? "text-[#D4AF37]" : ""} />
                  {tab.label}
                </button>
              );
            })}
            <button
              onClick={downloadOrdersExcel}
              className="flex items-center gap-2 px-5 py-3 font-semibold text-xs tracking-wider uppercase transition-all text-[#0C3A2E] border border-[#0C3A2E] hover:bg-[#0C3A2E] hover:text-white ml-auto"
              title="Download orders of the current month as Excel"
            >
              <Download size={15} />
              Export Orders (Excel)
            </button>
          </div>

          {/* Tab Views Content */}
          <div className="min-h-[450px]">
            {/* 1. OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {loadingAnalytics ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="w-8 h-8 text-[#0C3A2E] animate-spin" />
                    <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-semibold">Loading aggregate metrics...</p>
                  </div>
                ) : (
                  <>
                    {/* Stats Widget Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        {
                          label: "Total Revenue",
                          value: `₹${(analytics?.totalSales || 0).toLocaleString("en-IN")}`,
                          icon: IndianRupee,
                        },
                        {
                          label: "Total Orders",
                          value: String(analytics?.totalOrders || 0),
                          icon: ShoppingBag,
                        },
                        {
                          label: "Active Products",
                          value: String(analytics?.totalProducts || 0),
                          icon: Package,
                        },
                        {
                          label: "Registered Patrons",
                          value: String(analytics?.totalUsers || 0),
                          icon: Users,
                        },
                      ].map((card, i) => {
                        const Icon = card.icon;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white border border-[#1A1A1A]/10 p-6 flex items-center justify-between shadow-sm"
                          >
                            <div>
                              <p className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-[0.2em] font-bold mb-1.5">
                                {card.label}
                              </p>
                              <p className="text-2xl md:text-3xl font-brand font-semibold text-[#1A1A1A]">
                                {card.value}
                              </p>
                            </div>
                            <div className="w-12 h-12 bg-[#F9F6F0] border border-[#1A1A1A]/10 flex items-center justify-center shrink-0">
                              <Icon className="text-[#0C3A2E]" size={20} />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Chart / Report Visualization & Alert Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Monthly Revenue Visualization */}
                      <div className="lg:col-span-2 bg-white border border-[#1A1A1A]/10 p-6 md:p-8 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#1A1A1A]/10">
                          <h3 className="font-brand text-xl text-[#1A1A1A] font-normal flex items-center gap-2">
                            <BarChart3 size={18} className="text-[#0C3A2E]" />
                            <span>Monthly Revenue Progression</span>
                          </h3>
                        </div>

                        {analytics?.revenueByMonth?.length > 0 ? (
                          <div className="flex-1 flex items-end justify-between gap-3 pt-10 min-h-[220px]">
                            {analytics.revenueByMonth
                              .slice()
                              .reverse()
                              .map((item: any, i: number) => {
                                const maxVal = Math.max(
                                  ...analytics.revenueByMonth.map(
                                    (m: any) => m.revenue,
                                  ),
                                );
                                const heightPct =
                                  maxVal > 0
                                    ? (item.revenue / maxVal) * 80 + 10
                                    : 10;

                                const months = [
                                  "",
                                  "Jan",
                                  "Feb",
                                  "Mar",
                                  "Apr",
                                  "May",
                                  "Jun",
                                  "Jul",
                                  "Aug",
                                  "Sep",
                                  "Oct",
                                  "Nov",
                                  "Dec",
                                ];
                                const label = `${months[item._id.month]} ${item._id.year}`;

                                return (
                                  <div
                                    key={i}
                                    className="flex-1 flex flex-col items-center group relative"
                                  >
                                    {/* Tooltip on Hover */}
                                    <div className="absolute bottom-full mb-2 bg-[#0C3A2E] text-white border border-[#D4AF37]/30 text-xs px-3 py-1.5 shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                                      <p className="font-bold text-[#D4AF37]">
                                        ₹{item.revenue.toLocaleString("en-IN")}
                                      </p>
                                      <p className="text-[10px] text-white/70">
                                        {item.orders} Orders
                                      </p>
                                    </div>

                                    {/* Bar column */}
                                    <div
                                      className="w-full max-w-[28px] bg-[#0C3A2E] group-hover:bg-[#D4AF37] transition-all cursor-pointer shadow-sm"
                                      style={{ height: `${heightPct}%` }}
                                    />
                                    <span className="text-[10px] text-[#1A1A1A]/60 mt-2 whitespace-nowrap transform -rotate-12 md:rotate-0 font-medium">
                                      {label}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="flex-grow flex items-center justify-center py-12">
                            <p className="text-[#1A1A1A]/40 text-xs font-light uppercase tracking-wider">
                              No monthly transaction logs recorded yet
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Stock Alerts Widget */}
                      <div className="bg-white border border-[#1A1A1A]/10 p-6 md:p-8 shadow-sm flex flex-col">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#1A1A1A]/10">
                          <h3 className="font-brand text-xl text-[#1A1A1A] font-normal flex items-center gap-2">
                            <AlertCircle size={18} className="text-[#A85751]" />
                            <span>Low Stock Alerts</span>
                          </h3>
                        </div>

                        <div className="flex-grow overflow-y-auto max-h-[220px] space-y-3 pr-1">
                          {lowStock.length > 0 ? (
                            lowStock.map((prod) => (
                              <div
                                key={prod.id || prod._id}
                                className="flex items-center justify-between gap-3 p-3.5 bg-[#F9F6F0] border border-[#1A1A1A]/10 hover:border-[#0C3A2E] transition-all"
                              >
                                <div className="min-w-0">
                                  <p className="font-semibold text-xs text-[#1A1A1A] truncate">
                                    {prod.name}
                                  </p>
                                  <p className="text-[10px] text-[#1A1A1A]/50">
                                    Threshold: {prod.lowStockThreshold || 5} units
                                  </p>
                                </div>
                                <span className="bg-[#A85751]/10 text-[#A85751] border border-[#A85751]/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap">
                                  Stock: {prod.stock}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="h-full flex items-center justify-center py-12">
                              <p className="text-[#1A1A1A]/40 text-xs text-center font-light uppercase tracking-wider">
                                All inventory levels are healthy
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders List Table */}
                    <div className="bg-white border border-[#1A1A1A]/10 p-6 md:p-8 shadow-sm">
                      <div className="flex justify-between items-center mb-6 pb-4 border-b border-[#1A1A1A]/10">
                        <h3 className="font-brand text-xl text-[#1A1A1A] font-normal">
                          Recent Acquisitions
                        </h3>
                        <button
                          onClick={() => handleTabChange("orders")}
                          className="text-[#0C3A2E] hover:underline text-xs font-semibold uppercase tracking-wider flex items-center gap-1"
                        >
                          View All Orders
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-[#F9F6F0] text-[#1A1A1A]/60 text-[10px] font-bold uppercase tracking-wider border-b border-[#1A1A1A]/10">
                              <th className="py-3.5 px-4">Order ID</th>
                              <th className="py-3.5 px-4">Customer</th>
                              <th className="py-3.5 px-4">Total Amount</th>
                              <th className="py-3.5 px-4">Status</th>
                              <th className="py-3.5 px-4">Payment</th>
                              <th className="py-3.5 px-4">Date</th>
                            </tr>
                          </thead>
                          <tbody>
                            {analytics?.recentOrders?.length > 0 ? (
                              analytics.recentOrders.map((ord: any) => {
                                const orderId = ord.id || ord._id || '';
                                const orderIdDisplay = ord.orderNumber || (typeof orderId === 'string' && orderId.length >= 8 ? orderId.substring(0, 8).toUpperCase() : String(orderId));
                                const userName = ord.user?.name || (ord.user?.firstName ? `${ord.user.firstName} ${ord.user.lastName || ''}`.trim() : null) || ord.shippingAddress?.fullName || 'Customer';
                                return (
                                <tr
                                  key={orderId}
                                  className="border-b border-[#1A1A1A]/5 hover:bg-[#F9F6F0]/50 transition-colors text-xs text-[#1A1A1A]"
                                >
                                  <td className="py-3.5 px-4 font-mono font-bold text-[#0C3A2E]">
                                    #{orderIdDisplay}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <p className="font-semibold text-[#1A1A1A]">
                                      {userName}
                                    </p>
                                    <p className="text-[11px] text-[#1A1A1A]/50">
                                      {ord.user?.email || "Guest"}
                                    </p>
                                  </td>
                                  <td className="py-3.5 px-4 font-semibold text-[#1A1A1A]">
                                    ₹{(ord.totalPrice || 0).toLocaleString("en-IN")}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span
                                      className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                        ord.orderStatus === "delivered"
                                          ? "bg-[#2A7D6B]/10 text-[#2A7D6B] border-[#2A7D6B]/30"
                                          : ord.orderStatus === "cancelled"
                                            ? "bg-[#A85751]/10 text-[#A85751] border-[#A85751]/30"
                                            : ord.orderStatus === "shipped"
                                              ? "bg-[#0C3A2E]/10 text-[#0C3A2E] border-[#0C3A2E]/30"
                                              : "bg-[#D4AF37]/15 text-[#8F6F12] border-[#D4AF37]/40"
                                      }`}
                                    >
                                      {ord.orderStatus || 'pending'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-xs font-medium text-[#1A1A1A]/70 uppercase">
                                    {ord.paymentMethod || 'Prepaid'} •{" "}
                                    <span
                                      className={
                                        ord.paymentInfo?.paymentStatus === "completed" ||
                                        ord.paymentInfo?.paymentStatus === "succeeded" ||
                                        ord.paymentInfo?.paymentStatus === "paid" ||
                                        ord.isPaid
                                          ? "text-[#2A7D6B] font-semibold"
                                          : "text-[#D4AF37] font-semibold"
                                      }
                                    >
                                      {ord.paymentInfo?.paymentStatus || (ord.isPaid ? "Paid" : "Pending")}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-xs text-[#1A1A1A]/60">
                                    {new Date(
                                      ord.created_at || ord.createdAt,
                                    ).toLocaleDateString("en-IN")}
                                  </td>
                                </tr>
                              );})
                            ) : (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="py-12 text-center text-[#1A1A1A]/40 text-xs uppercase tracking-wider"
                                >
                                  No transaction history found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* 2. PRODUCTS TAB */}
            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-brand text-2xl text-[#1A1A1A] font-normal">
                    Product Catalog ({products.length})
                  </h3>
                  <button
                    onClick={openAddProductModal}
                    className="bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white px-5 py-2.5 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Plus size={14} />
                    Add Product Item
                  </button>
                </div>

                {loadingProducts ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="w-8 h-8 text-[#0C3A2E] animate-spin" />
                    <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-semibold">
                      Fetching catalog items...
                    </p>
                  </div>
                ) : (
                  <div className="bg-white border border-[#1A1A1A]/10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F9F6F0] text-[#1A1A1A]/60 text-[10px] font-bold uppercase tracking-wider border-b border-[#1A1A1A]/10">
                            <th className="py-4 px-6">Product Details</th>
                            <th className="py-4 px-6">Category</th>
                            <th className="py-4 px-6">Price</th>
                            <th className="py-4 px-6">Current Stock</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {products.length > 0 ? (
                            products.map((prod) => (
                              <tr
                                key={prod.id || prod._id}
                                className="border-b border-[#1A1A1A]/5 hover:bg-[#F9F6F0]/50 transition-colors text-xs text-[#1A1A1A]"
                              >
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-4">
                                    <div className="relative w-12 h-12 bg-[#F9F6F0] border border-[#1A1A1A]/10 overflow-hidden flex-shrink-0">
                                      <Image
                                        src={getValidProductImageUrl(
                                          prod.images[0]?.url,
                                        )}
                                        alt={prod.name}
                                        fill
                                        sizes="48px"
                                        className="object-cover"
                                      />
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-sm text-[#1A1A1A] truncate">
                                        {prod.name}
                                      </p>
                                      <div className="flex gap-2 mt-1">
                                        {prod.featured && (
                                          <span className="text-[9px] bg-[#0C3A2E]/10 text-[#0C3A2E] border border-[#0C3A2E]/20 px-1.5 py-0.5 font-bold uppercase tracking-wider">
                                            Featured
                                          </span>
                                        )}
                                        {prod.trending && (
                                          <span className="text-[9px] bg-[#D4AF37]/15 text-[#8F6F12] border border-[#D4AF37]/40 px-1.5 py-0.5 font-bold uppercase tracking-wider">
                                            Trending
                                          </span>
                                        )}
                                        {prod.bestSeller && (
                                          <span className="text-[9px] bg-[#2A7D6B]/10 text-[#2A7D6B] border border-[#2A7D6B]/30 px-1.5 py-0.5 font-bold uppercase tracking-wider">
                                            Bestseller
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-[#1A1A1A]/70 font-medium">
                                  {prod.category?.name || "Uncategorized"}
                                </td>
                                <td className="py-4 px-6">
                                  <p className="font-semibold text-sm text-[#1A1A1A]">
                                    ₹{prod.price?.toLocaleString("en-IN")}
                                  </p>
                                  {prod.compareAtPrice && (
                                    <p className="text-[11px] text-[#1A1A1A]/40 line-through">
                                      ₹{prod.compareAtPrice?.toLocaleString("en-IN")}
                                    </p>
                                  )}
                                </td>
                                <td className="py-4 px-6">
                                  <span
                                    className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                      prod.stock <= (prod.lowStockThreshold || 5)
                                        ? "bg-[#A85751]/10 text-[#A85751] border-[#A85751]/30"
                                        : "bg-[#2A7D6B]/10 text-[#2A7D6B] border-[#2A7D6B]/30"
                                    }`}
                                  >
                                    {prod.stock} items
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => openEditProductModal(prod)}
                                      className="p-2 bg-[#F9F6F0] hover:bg-[#0C3A2E] text-[#0C3A2E] hover:text-white border border-[#1A1A1A]/15 transition-all"
                                      title="Edit Product Info"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteProduct(prod.id || prod._id, prod.name)
                                      }
                                      className="p-2 bg-[#A85751]/10 hover:bg-[#A85751] text-[#A85751] hover:text-white border border-[#A85751]/30 transition-all"
                                      title="Delete Product"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={5}
                                className="py-12 text-center text-[#1A1A1A]/40 text-xs uppercase tracking-wider"
                              >
                                No products configured in catalog
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 3. ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-brand text-2xl text-[#1A1A1A] font-normal">
                    Order Fulfillments & Processing
                  </h3>
                </div>

                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="w-8 h-8 text-[#0C3A2E] animate-spin" />
                    <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-semibold">Loading order queue...</p>
                  </div>
                ) : (
                  <div className="bg-white border border-[#1A1A1A]/10 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-[#F9F6F0] text-[#1A1A1A]/60 text-[10px] font-bold uppercase tracking-wider border-b border-[#1A1A1A]/10">
                            <th className="py-4 px-6">Order ID</th>
                            <th className="py-4 px-6">Customer</th>
                            <th className="py-4 px-6">Items</th>
                            <th className="py-4 px-6">Grand Total</th>
                            <th className="py-4 px-6">Fulfillment Status</th>
                            <th className="py-4 px-6">Payment</th>
                            <th className="py-4 px-6 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.length > 0 ? (
                            orders.map((ord) => {
                              const orderId = ord.id || ord._id || '';
                              const orderIdDisplay = ord.orderNumber || (typeof orderId === 'string' && orderId.length >= 8 ? orderId.substring(0, 8).toUpperCase() : String(orderId));
                              const userName = ord.user?.name || (ord.user?.firstName ? `${ord.user.firstName} ${ord.user.lastName || ''}`.trim() : null) || ord.shippingAddress?.fullName || 'Customer';
                              return (
                              <tr
                                key={orderId}
                                className="border-b border-[#1A1A1A]/5 hover:bg-[#F9F6F0]/50 transition-colors text-xs text-[#1A1A1A]"
                              >
                                <td className="py-4 px-6 font-mono font-bold text-[#0C3A2E]">
                                  #{orderIdDisplay}
                                </td>
                                <td className="py-4 px-6">
                                  <p className="font-semibold text-sm text-[#1A1A1A]">
                                    {userName}
                                  </p>
                                  <p className="text-[11px] text-[#1A1A1A]/60">
                                    {ord.shippingAddress?.city},{" "}
                                    {ord.shippingAddress?.state}
                                  </p>
                                </td>
                                <td className="py-4 px-6">
                                  <p className="text-[#1A1A1A] font-medium">
                                    {ord.items?.length || 0} pieces
                                  </p>
                                  <p className="text-[10px] text-[#1A1A1A]/40 truncate max-w-[150px]">
                                    {(ord.items || [])
                                      .map((item: any) => item.name)
                                      .join(", ")}
                                  </p>
                                </td>
                                <td className="py-4 px-6 font-semibold text-sm text-[#1A1A1A]">
                                  ₹{(ord.totalPrice || 0).toLocaleString("en-IN")}
                                </td>
                                <td className="py-4 px-6">
                                  <span
                                    className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                      ord.orderStatus === "delivered"
                                        ? "bg-[#2A7D6B]/10 text-[#2A7D6B] border-[#2A7D6B]/30"
                                        : ord.orderStatus === "cancelled"
                                          ? "bg-[#A85751]/10 text-[#A85751] border-[#A85751]/30"
                                          : ord.orderStatus === "shipped"
                                            ? "bg-[#0C3A2E]/10 text-[#0C3A2E] border-[#0C3A2E]/30"
                                            : "bg-[#D4AF37]/15 text-[#8F6F12] border-[#D4AF37]/40"
                                    }`}
                                  >
                                    {ord.orderStatus || 'pending'}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-xs">
                                  <p className="uppercase font-semibold text-[#1A1A1A]">
                                    {ord.paymentMethod || 'Prepaid'}
                                  </p>
                                  <p
                                    className={
                                      ord.paymentInfo?.paymentStatus === "completed" ||
                                      ord.paymentInfo?.paymentStatus === "succeeded" ||
                                      ord.paymentInfo?.paymentStatus === "paid" ||
                                      ord.isPaid
                                        ? "text-[#2A7D6B] font-semibold text-[10px]"
                                        : "text-[#D4AF37] font-semibold text-[10px]"
                                    }
                                  >
                                    {ord.paymentInfo?.paymentStatus || (ord.isPaid ? "Paid" : "Pending")}
                                  </p>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => openOrderActionModal(ord)}
                                      className="p-2 bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white transition-all shadow-sm"
                                      title="Fulfill and Update Tracking"
                                    >
                                      <Truck size={14} />
                                    </button>
                                    <Link
                                      href={`/dashboard/orders/${orderId}`}
                                      className="p-2 bg-[#F9F6F0] hover:bg-[#1A1A1A] text-[#1A1A1A] hover:text-white border border-[#1A1A1A]/15 transition-all"
                                      title="View Detailed Order Invoice & Tracking"
                                    >
                                      <Eye size={14} />
                                    </Link>
                                    <button
                                      onClick={() => handleDeleteOrder(orderId, ord.orderNumber)}
                                      className="p-2 bg-[#A85751]/10 hover:bg-[#A85751] text-[#A85751] hover:text-white border border-[#A85751]/30 transition-all"
                                      title="Delete Order Record"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );})
                          ) : (
                            <tr>
                              <td
                                colSpan={7}
                                className="py-12 text-center text-[#1A1A1A]/40 text-xs uppercase tracking-wider"
                              >
                                No orders logged in processing queue
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 4. COUPONS TAB */}
            {activeTab === "coupons" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-brand text-2xl text-[#1A1A1A] font-normal">
                    Promotional Coupon Campaigns
                  </h3>
                  <button
                    onClick={() => {
                      setCouponForm({
                        code: "",
                        discountType: "percentage",
                        discountAmount: "",
                        minPurchase: "",
                        maxDiscount: "",
                        expiryDate: "",
                        usageLimit: "",
                      });
                      setCouponModalOpen(true);
                    }}
                    className="bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white px-5 py-2.5 text-xs uppercase tracking-widest font-semibold flex items-center gap-2 shadow-sm transition-all"
                  >
                    <Plus size={14} />
                    Create Promo Coupon
                  </button>
                </div>

                {loadingCoupons ? (
                  <div className="flex flex-col items-center justify-center py-24 space-y-4">
                    <Loader2 className="w-8 h-8 text-[#0C3A2E] animate-spin" />
                    <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-semibold">Loading promotion campaigns...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.length > 0 ? (
                      coupons.map((coupon) => (
                        <div
                          key={coupon.id || coupon._id}
                          className="bg-white border border-[#1A1A1A]/10 hover:border-[#0C3A2E] p-6 shadow-sm flex flex-col justify-between relative group transition-all duration-300"
                        >
                          <button
                            onClick={() =>
                              handleDeleteCoupon(coupon.id || coupon._id, coupon.code)
                            }
                            className="absolute top-4 right-4 text-[#A85751]/60 hover:text-[#A85751] transition-colors p-1"
                            title="Remove Promo Coupon"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div>
                            <span className="bg-[#0C3A2E] text-[#D4AF37] px-3 py-1 font-mono font-bold text-xs uppercase tracking-widest inline-block shadow-sm">
                              {coupon.code}
                            </span>
                            <div className="mt-4 space-y-1.5 text-sm text-[#1A1A1A]">
                              <p className="text-3xl font-brand font-bold text-[#1A1A1A]">
                                {coupon.discountType === "percentage"
                                  ? `${coupon.discountAmount}% OFF`
                                  : `₹${coupon.discountAmount} OFF`}
                              </p>
                              <p className="text-xs text-[#1A1A1A]/60">
                                Minimum Order: ₹{coupon.minPurchase || 0}
                              </p>
                              {coupon.maxDiscount && (
                                <p className="text-xs text-[#1A1A1A]/60">
                                  Maximum Discount: ₹{coupon.maxDiscount}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-[#1A1A1A]/10 flex items-center justify-between text-xs text-[#1A1A1A]/60 font-medium">
                            <span className="flex items-center gap-1">
                              <Calendar size={13} className="text-[#0C3A2E]" />
                              Expires:{" "}
                              {coupon.expiryDate
                                ? new Date(coupon.expiryDate).toLocaleDateString("en-IN")
                                : "Never"}
                            </span>
                            <span>
                              Uses: {coupon.usedCount || 0} / {coupon.usageLimit || "∞"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="md:col-span-2 lg:col-span-3 py-16 text-center bg-white border border-[#1A1A1A]/10 p-12">
                        <Tag className="mx-auto text-[#1A1A1A]/30 mb-3" size={40} />
                        <h4 className="font-brand text-lg text-[#1A1A1A] font-normal mb-1">
                          No Active Campaigns
                        </h4>
                        <p className="text-xs text-[#1A1A1A]/60">
                          Create a promotional campaign coupon to incentivize purchases
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />

      {/* MODAL 1: ADD / EDIT PRODUCT */}
      <AnimatePresence>
        {productModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#1A1A1A]/15 shadow-2xl w-full max-w-3xl max-h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#1A1A1A]/10 flex justify-between items-center bg-[#F9F6F0]">
                <h3 className="font-brand text-xl text-[#1A1A1A] font-normal">
                  {editingProduct
                    ? "Edit Catalog Piece"
                    : "Add New Catalog Piece"}
                </h3>
                <button
                  onClick={() => {
                    setProductModalOpen(false);
                    setUploadedDeviceImages([]);
                  }}
                  className="text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <form
                onSubmit={handleProductSubmit}
                className="p-6 md:p-8 overflow-y-auto space-y-6 flex-grow"
                data-lenis-prevent="true"
              >
                {/* Product Name */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                    Piece Name *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="Signature Metal Wall Art"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                    Curated Description *
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition h-24 resize-none"
                    placeholder="Describe material, finishing, craftsmanship and architectural aesthetics..."
                    required
                  />
                </div>

                {/* Pricing & Stock Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                      Price (₹) *
                    </label>
                    <input
                      type="number"
                      value={productForm.price}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          price: e.target.value,
                        })
                      }
                      className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] font-semibold outline-none transition"
                      placeholder="e.g. 4999"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                      Compare At Price (₹)
                    </label>
                    <input
                      type="number"
                      value={productForm.compareAtPrice}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          compareAtPrice: e.target.value,
                        })
                      }
                      className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                      placeholder="e.g. 6999"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                      Stock Inventory *
                    </label>
                    <input
                      type="number"
                      value={productForm.stock}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          stock: e.target.value,
                        })
                      }
                      className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                      placeholder="e.g. 25"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                      Category *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                      className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                      required
                    >
                      <option value="" disabled>
                        Select category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat.id || cat._id} value={cat.id || cat._id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Images */}
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                    Product Imagery *
                  </label>
                  {productForm.images.map((url, index) => (
                    <div key={`image-${index}`} className="flex items-center gap-2 mb-2">
                      {(url.startsWith("data:") ||
                        url.startsWith("http://") ||
                        url.startsWith("https://")) &&
                      url.trim() !== "" ? (
                        <div className="relative w-10 h-10 bg-[#F9F6F0] border border-[#1A1A1A]/15 overflow-hidden flex-shrink-0">
                          <Image
                            src={url}
                            alt="Preview"
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        </div>
                      ) : null}
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => {
                          const newImages = [...productForm.images];
                          newImages[index] = e.target.value;
                          setProductForm({ ...productForm, images: newImages });
                        }}
                        className="flex-1 bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2 text-xs text-[#1A1A1A] outline-none transition"
                        placeholder="https://... image CDN URL"
                      />
                      {productForm.images.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = productForm.images.filter(
                              (_, i) => i !== index,
                            );
                            setProductForm({
                              ...productForm,
                              images: newImages,
                            });
                          }}
                          className="p-2 bg-[#A85751]/10 text-[#A85751] hover:bg-[#A85751] hover:text-white border border-[#A85751]/30 transition"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    multiple
                    accept="image/*"
                    onChange={handleDeviceImageUpload}
                    className="hidden"
                  />

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() =>
                        setProductForm({
                          ...productForm,
                          images: [...productForm.images, ""],
                        })
                      }
                      className="text-xs text-[#0C3A2E] hover:underline flex items-center gap-1 font-semibold uppercase tracking-wider"
                    >
                      <Plus size={13} /> Add URL Field
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={isUploadingImages}
                      className="text-xs text-[#0C3A2E] hover:underline flex items-center gap-1 font-semibold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload size={13} />{" "}
                      {isUploadingImages ? "Uploading..." : "Upload from Device"}
                    </button>
                  </div>
                </div>

                {/* Promo Checkboxes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-[#1A1A1A]/10 pt-4">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          featured: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-[#0C3A2E]"
                    />
                    <span className="text-xs text-[#1A1A1A] font-medium">
                      Featured Collection
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.trending}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          trending: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-[#0C3A2E]"
                    />
                    <span className="text-xs text-[#1A1A1A] font-medium">
                      Trending Piece
                    </span>
                  </label>

                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.bestSeller}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          bestSeller: e.target.checked,
                        })
                      }
                      className="w-4 h-4 accent-[#0C3A2E]"
                    />
                    <span className="text-xs text-[#1A1A1A] font-medium">
                      Best Seller Showcase
                    </span>
                  </label>
                </div>

                {/* Technical Specifications */}
                <div className="border-t border-[#1A1A1A]/10 pt-4 space-y-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                    Artisan Specifications
                  </label>
                  {productForm.specifications.map((spec, index) => (
                    <div key={`spec-${index}`} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={spec.key}
                        onChange={(e) => {
                          const newSpecs = [...productForm.specifications];
                          newSpecs[index].key = e.target.value;
                          setProductForm({
                            ...productForm,
                            specifications: newSpecs,
                          });
                        }}
                        className="w-1/3 bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2 text-xs text-[#1A1A1A] outline-none transition"
                        placeholder="e.g. Dimensions / Material"
                      />
                      <input
                        type="text"
                        value={spec.value}
                        onChange={(e) => {
                          const newSpecs = [...productForm.specifications];
                          newSpecs[index].value = e.target.value;
                          setProductForm({
                            ...productForm,
                            specifications: newSpecs,
                          });
                        }}
                        className="w-2/3 bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2 text-xs text-[#1A1A1A] outline-none transition"
                        placeholder="e.g. 36 x 36 Inches"
                      />
                      {productForm.specifications.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            const newSpecs = productForm.specifications.filter(
                              (_, i) => i !== index,
                            );
                            setProductForm({
                              ...productForm,
                              specifications: newSpecs,
                            });
                          }}
                          className="p-2 bg-[#A85751]/10 text-[#A85751] hover:bg-[#A85751] hover:text-white border border-[#A85751]/30 transition"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setProductForm({
                        ...productForm,
                        specifications: [
                          ...productForm.specifications,
                          { key: "", value: "" },
                        ],
                      })
                    }
                    className="text-xs text-[#0C3A2E] hover:underline flex items-center gap-1 font-semibold uppercase tracking-wider pt-1"
                  >
                    <Plus size={13} /> Add Specification
                  </button>
                </div>
              </form>

              {/* Actions Footer */}
              <div className="p-6 border-t border-[#1A1A1A]/10 flex justify-end gap-3 bg-[#F9F6F0]">
                <button
                  type="button"
                  onClick={() => {
                    setProductModalOpen(false);
                    setUploadedDeviceImages([]);
                  }}
                  className="border border-[#1A1A1A]/20 hover:bg-white text-[#1A1A1A]/70 px-5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProductSubmit}
                  className="bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white px-6 py-2.5 text-xs uppercase tracking-widest font-semibold shadow-sm transition-all"
                >
                  Save Piece to Catalog
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ORDER ACTIONS */}
      <AnimatePresence>
        {orderModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#1A1A1A]/15 shadow-2xl w-full max-w-xl max-h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#1A1A1A]/10 flex justify-between items-center bg-[#F9F6F0]">
                <div>
                  <h3 className="font-brand text-xl text-[#1A1A1A] font-normal">
                    Fulfill & Dispatch Consignment
                  </h3>
                  <p className="text-xs text-[#0C3A2E] font-semibold mt-0.5">
                    Order #
                    {selectedOrder.orderNumber ||
                      (selectedOrder.id || selectedOrder._id || "").substring(0, 8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setOrderModalOpen(false)}
                  className="text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-8 flex-grow" data-lenis-prevent="true">
                {/* Part 1: Update Status */}
                <form onSubmit={handleUpdateOrderStatus} className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2">
                    1. Consignment Lifecycle Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase font-bold text-[#1A1A1A]/60 tracking-wider">
                        New Status
                      </label>
                      <select
                        value={orderStatusForm.status}
                        onChange={(e) =>
                          setOrderStatusForm({
                            ...orderStatusForm,
                            status: e.target.value,
                          })
                        }
                        className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase font-bold text-[#1A1A1A]/60 tracking-wider">
                        Status Note
                      </label>
                      <input
                        type="text"
                        value={orderStatusForm.note}
                        onChange={(e) =>
                          setOrderStatusForm({
                            ...orderStatusForm,
                            note: e.target.value,
                          })
                        }
                        className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                        placeholder="e.g. Dispatched via Air"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 shadow-sm transition-all"
                  >
                    Update Lifecycle Status
                  </button>
                </form>

                {/* Part 2: Shipping AWB Tracking */}
                <form
                  onSubmit={handleUpdateOrderTracking}
                  className="space-y-4 pt-6 border-t border-[#1A1A1A]/10"
                >
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] border-b border-[#1A1A1A]/10 pb-2">
                    2. Courier Consignment Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase font-bold text-[#1A1A1A]/60 tracking-wider">
                        Carrier Partner
                      </label>
                      <select
                        value={trackingForm.carrier}
                        onChange={(e) =>
                          setTrackingForm({
                            ...trackingForm,
                            carrier: e.target.value,
                          })
                        }
                        className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                      >
                        <option value="Delhivery">Delhivery Express</option>
                        <option value="Shiprocket">Shiprocket Economy</option>
                        <option value="BlueDart">BlueDart Priority</option>
                        <option value="DHL">DHL Express</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase font-bold text-[#1A1A1A]/60 tracking-wider">
                        Tracking AWB Code
                      </label>
                      <input
                        type="text"
                        value={trackingForm.trackingNumber}
                        onChange={(e) =>
                          setTrackingForm({
                            ...trackingForm,
                            trackingNumber: e.target.value,
                          })
                        }
                        className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition font-mono"
                        placeholder="AWB100234598"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] uppercase font-bold text-[#1A1A1A]/60 tracking-wider">
                        Est. Delivery
                      </label>
                      <input
                        type="date"
                        value={trackingForm.estimatedDelivery}
                        onChange={(e) =>
                          setTrackingForm({
                            ...trackingForm,
                            estimatedDelivery: e.target.value,
                          })
                        }
                        className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white text-xs font-semibold uppercase tracking-wider px-5 py-2.5 shadow-sm transition-all flex items-center gap-2"
                  >
                    <Truck size={14} /> Update Courier Consignment
                  </button>
                </form>
              </div>

              {/* Close Footer */}
              <div className="p-6 border-t border-[#1A1A1A]/10 flex justify-end bg-[#F9F6F0]">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="border border-[#1A1A1A]/20 hover:bg-white text-[#1A1A1A]/70 px-5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all"
                >
                  Close Manager
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: ADD COUPON */}
      <AnimatePresence>
        {couponModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-[#1A1A1A]/15 shadow-2xl w-full max-w-md max-h-[88vh] flex flex-col overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#1A1A1A]/10 flex justify-between items-center bg-[#F9F6F0]">
                <h3 className="font-brand text-xl text-[#1A1A1A] font-normal">
                  Create Promotional Campaign
                </h3>
                <button
                  onClick={() => setCouponModalOpen(false)}
                  className="text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <form
                onSubmit={handleCouponSubmit}
                className="p-6 md:p-8 space-y-4 overflow-y-auto"
                data-lenis-prevent="true"
              >
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                    Promo Code *
                  </label>
                  <input
                    type="text"
                    value={couponForm.code}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, code: e.target.value })
                    }
                    className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] font-mono font-bold uppercase tracking-wider outline-none transition"
                    placeholder="e.g. LUXURY20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                      Discount Type
                    </label>
                    <select
                      value={couponForm.discountType}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          discountType: e.target.value,
                        })
                      }
                      className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                      Discount Value *
                    </label>
                    <input
                      type="number"
                      value={couponForm.discountAmount}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          discountAmount: e.target.value,
                        })
                      }
                      className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] font-semibold outline-none transition"
                      placeholder="e.g. 20"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                      Min Purchase (₹)
                    </label>
                    <input
                      type="number"
                      value={couponForm.minPurchase}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          minPurchase: e.target.value,
                        })
                      }
                      className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                      placeholder="e.g. 999"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      value={couponForm.expiryDate}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          expiryDate: e.target.value,
                        })
                      }
                      className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                      Max Discount (₹)
                    </label>
                    <input
                      type="number"
                      value={couponForm.maxDiscount}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          maxDiscount: e.target.value,
                        })
                      }
                      className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1A1A1A]/60">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      value={couponForm.usageLimit}
                      onChange={(e) =>
                        setCouponForm({
                          ...couponForm,
                          usageLimit: e.target.value,
                        })
                      }
                      className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                      placeholder="e.g. 100"
                    />
                  </div>
                </div>
              </form>

              {/* Actions Footer */}
              <div className="p-6 border-t border-[#1A1A1A]/10 flex justify-end gap-3 bg-[#F9F6F0]">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="border border-[#1A1A1A]/20 hover:bg-white text-[#1A1A1A]/70 px-5 py-2.5 text-xs uppercase tracking-wider font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCouponSubmit}
                  className="bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white px-6 py-2.5 text-xs uppercase tracking-widest font-semibold shadow-sm transition-all"
                >
                  Save Promotion
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
