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
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      toast.error(error.response?.data?.message || error.message || "Failed to upload images");
    } finally {
      setIsUploadingImages(false);
      e.target.value = "";
    }
  };

  // Remove device uploaded image
  const removeDeviceImage = (index: number) => {
    setUploadedDeviceImages((prev) => prev.filter((_, i) => i !== index));
    const deviceImageIndices = productForm.images
      .map((img, i) => (uploadedDeviceImages.includes(img) ? i : -1))
      .filter((i) => i !== -1);
    if (deviceImageIndices.includes(index)) {
      const newImages = productForm.images.filter((_, i) => i !== index);
      setProductForm({ ...productForm, images: newImages });
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
      // Fetch a large page of orders to ensure we capture all orders
      const ordRes = await orderService.getMyOrders({ limit: 1000 });
      const allOrders = ordRes.data || [];

      if (allOrders.length === 0) {
        toast.error("No orders exist in the system to export", { id: toastId });
        return;
      }

      // Filter orders for the current month
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth(); // 0-indexed

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
        // Fallback: download all orders if no orders match the current month
        targetOrders = allOrders;
        isFallbackAll = true;
      }

      // Dynamically import xlsx to optimize initial bundle size with ESM/CJS compatibility
      const xlsxModule = await import("xlsx");
      const XLSX = xlsxModule.utils ? xlsxModule : (xlsxModule as any).default || xlsxModule;

      // Format the data for Excel sheet
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

      // Create a worksheet and workbook
      const worksheet = XLSX.utils.json_to_sheet(formattedData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, isFallbackAll ? "All Orders" : "Current Month Orders");

      // Auto-fit column widths
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
    <div className="min-h-screen bg-[#1B2D20] text-foreground flex flex-col relative">
      {/* Full Page Fixed Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />
      <Header />

      <main className="flex-grow pt-28 pb-20 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Admin Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-primary/10 pb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                Admin Operations Panel
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Manage product catalog, order fulfillments, tracking, &
                promotions
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs bg-primary/10 text-[#E6C280] border border-primary/20 px-3 py-1.5 rounded-full font-bold uppercase tracking-wider">
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
                className="p-2 bg-secondary/60 hover:bg-secondary/80 disabled:bg-secondary border border-white/10 rounded-lg text-gray-400 hover:text-white disabled:opacity-50 transition-all"
                title="Refresh current data"
              >
                <RefreshCw
                  size={18}
                  className={isRefreshing ? "animate-spin" : ""}
                />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-2 mb-8 bg-secondary/40 p-1.5 rounded-xl border border-white/5">
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
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/10"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
            <button
              onClick={downloadOrdersExcel}
              className="flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-all duration-300 text-[#E6C280] border border-[#E6C280]/20 hover:bg-[#E6C280]/10 hover:text-white ml-auto"
              title="Download orders of the current month as Excel"
            >
              <Download size={16} />
              Export Orders (Excel)
            </button>
          </div>

          {/* Tab Views Content */}
          <div className="min-h-[400px]">
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                {loadingAnalytics ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-gray-400">Loading aggregate stats...</p>
                  </div>
                ) : (
                  <>
                    {/* Stats Widget Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {[
                        {
                          label: "Total Revenue",
                          value: `₹${(analytics?.totalSales || 0).toLocaleString()}`,
                          color: "text-primary",
                          icon: IndianRupee,
                          bg: "bg-primary/5",
                        },
                        {
                          label: "Total Orders",
                          value: String(analytics?.totalOrders || 0),
                          color: "text-blue-400",
                          icon: ShoppingBag,
                          bg: "bg-blue-400/5",
                        },
                        {
                          label: "Live Products",
                          value: String(analytics?.totalProducts || 0),
                          color: "text-purple-400",
                          icon: Package,
                          bg: "bg-purple-400/5",
                        },
                        {
                          label: "Registered Customers",
                          value: String(analytics?.totalUsers || 0),
                          color: "text-emerald-400",
                          icon: Users,
                          bg: "bg-emerald-400/5",
                        },
                      ].map((card, i) => {
                        const Icon = card.icon;
                        return (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className={`bg-[#1B2D20]/80 border border-primary/10 rounded-xl p-6 flex items-center justify-between shadow-xl backdrop-blur-md ${card.bg}`}
                          >
                            <div>
                              <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold mb-1">
                                {card.label}
                              </p>
                              <p
                                className={`text-2xl font-black ${card.color}`}
                              >
                                {card.value}
                              </p>
                            </div>
                            <div
                              className={`w-12 h-12 rounded-xl flex items-center justify-center bg-secondary/60 border border-white/5`}
                            >
                              <Icon className={card.color} size={22} />
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    {/* Chart / Report Visualization & Alert Columns */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* CSS-Based Monthly Revenue Visualization */}
                      <div className="lg:col-span-2 bg-[#1B2D20]/80 border border-primary/10 rounded-xl p-6 shadow-2xl backdrop-blur-md flex flex-col">
                        <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
                          <BarChart3 size={18} className="text-primary" />
                          Monthly Revenue Trend
                        </h3>

                        {analytics?.revenueByMonth?.length > 0 ? (
                          <div className="flex-1 flex items-end justify-between gap-2 pt-10 min-h-[220px]">
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
                                    <div className="absolute bottom-full mb-2 bg-black/95 text-white border border-primary/30 text-xs px-2.5 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 whitespace-nowrap">
                                      <p className="font-bold text-primary">
                                        ₹{item.revenue.toLocaleString()}
                                      </p>
                                      <p className="text-[10px] text-gray-400">
                                        {item.orders} Orders
                                      </p>
                                    </div>

                                    {/* Bar column */}
                                    <div
                                      className="w-full max-w-[28px] rounded-t bg-gradient-to-t from-primary to-accent group-hover:brightness-125 transition-all cursor-pointer shadow-lg shadow-primary/10"
                                      style={{ height: `${heightPct}%` }}
                                    />
                                    <span className="text-[10px] text-gray-500 mt-2 whitespace-nowrap transform -rotate-12 md:rotate-0">
                                      {label}
                                    </span>
                                  </div>
                                );
                              })}
                          </div>
                        ) : (
                          <div className="flex-grow flex items-center justify-center py-10">
                            <p className="text-gray-500 text-sm">
                              No monthly transaction data available yet
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Stock Alerts Widget */}
                      <div className="bg-[#1B2D20]/80 border border-primary/10 rounded-xl p-6 shadow-2xl backdrop-blur-md flex flex-col">
                        <h3 className="font-bold text-lg mb-6 text-white flex items-center gap-2">
                          <AlertCircle size={18} className="text-red-500" />
                          Low Stock Alerts
                        </h3>

                        <div className="flex-grow overflow-y-auto max-h-[220px] space-y-3 pr-1 admin-scrollbar" data-lenis-prevent="true">
                          {lowStock.length > 0 ? (
                            lowStock.map((prod) => (
                              <div
                                key={prod.id || prod._id}
                                className="flex items-center justify-between gap-3 p-3 bg-secondary/60 border border-red-500/10 rounded-lg hover:border-red-500/30 transition-all"
                              >
                                <div className="min-w-0">
                                  <p className="font-semibold text-sm text-gray-200 truncate">
                                    {prod.name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Threshold: {prod.lowStockThreshold || 5}
                                  </p>
                                </div>
                                <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap">
                                  Stock: {prod.stock}
                                </span>
                              </div>
                            ))
                          ) : (
                            <div className="h-full flex items-center justify-center py-10">
                              <p className="text-gray-500 text-sm text-center">
                                All product stocks are within healthy
                                thresholds.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Recent Orders List Table */}
                    <div className="bg-[#1B2D20]/80 border border-primary/10 rounded-xl p-6 shadow-2xl backdrop-blur-md">
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-white">
                          Recent Transactions
                        </h3>
                        <button
                          onClick={() => handleTabChange("orders")}
                          className="text-primary hover:underline text-xs flex items-center gap-1"
                        >
                          View Fulfillments Page
                          <ChevronRight size={14} />
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-primary/10 text-gray-400 text-xs font-bold uppercase tracking-wider">
                              <th className="py-3 px-4">Order ID</th>
                              <th className="py-3 px-4">Customer</th>
                              <th className="py-3 px-4">Total Price</th>
                              <th className="py-3 px-4">Fulfillment Status</th>
                              <th className="py-3 px-4">Payment</th>
                              <th className="py-3 px-4">Date</th>
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
                                  className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm"
                                >
                                  <td className="py-3.5 px-4 font-mono font-bold text-primary">
                                    #{orderIdDisplay}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <p className="font-semibold text-white">
                                      {userName}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {ord.user?.email || "Guest"}
                                    </p>
                                  </td>
                                  <td className="py-3.5 px-4 font-bold text-white">
                                    ₹{(ord.totalPrice || 0).toLocaleString()}
                                  </td>
                                  <td className="py-3.5 px-4">
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                                        ord.orderStatus === "delivered"
                                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                                          : ord.orderStatus === "cancelled"
                                            ? "bg-red-500/10 text-red-500 border-red-500/20"
                                            : ord.orderStatus === "shipped"
                                              ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                              : "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20"
                                      }`}
                                    >
                                      {ord.orderStatus || 'pending'}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 uppercase text-xs font-semibold text-gray-300">
                                    {ord.paymentMethod || 'N/A'} •{" "}
                                    <span
                                      className={
                                        ord.paymentInfo?.paymentStatus ===
                                          "completed" ||
                                        ord.paymentInfo?.paymentStatus ===
                                          "succeeded"
                                          ? "text-green-500"
                                          : "text-yellow-500"
                                      }
                                    >
                                      {ord.paymentInfo?.paymentStatus ||
                                        "pending"}
                                    </span>
                                  </td>
                                  <td className="py-3.5 px-4 text-xs text-gray-400">
                                    {new Date(
                                      ord.created_at || ord.createdAt,
                                    ).toLocaleDateString()}
                                  </td>
                                </tr>
                              );})
                            ) : (
                              <tr>
                                <td
                                  colSpan={6}
                                  className="py-8 text-center text-gray-500"
                                >
                                  No orders logged in system
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

            {/* PRODUCTS TAB */}
            {activeTab === "products" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xl text-white">
                    Active Product Catalog ({products.length})
                  </h3>
                  <button
                    onClick={openAddProductModal}
                    className="bg-primary hover:bg-accent text-primary-foreground px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-primary/10 transition-all duration-300"
                  >
                    <Plus size={16} />
                    Add Product Item
                  </button>
                </div>

                {loadingProducts ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                    <p className="text-gray-400">
                      Fetching live catalog items...
                    </p>
                  </div>
                ) : (
                                  <div className="bg-[#1B2D20]/80 border border-primary/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
                                    <div className="overflow-x-auto">
                                      <table className="w-full text-left border-collapse">
                                        <thead>
                                          <tr className="border-b border-primary/10 text-gray-400 text-xs font-bold uppercase tracking-wider bg-secondary/40">
                                            <th className="py-4 px-6">Product details</th>
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
                                className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm"
                              >
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-4">
                                    <div className="relative w-12 h-12 rounded bg-secondary/60 border border-primary/10 overflow-hidden flex-shrink-0">
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
                                      <p className="font-bold text-white truncate">
                                        {prod.name}
                                      </p>
                                      <div className="flex gap-2.5 mt-0.5">
                                        {prod.featured && (
                                          <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-bold uppercase">
                                            Featured
                                          </span>
                                        )}
                                        {prod.trending && (
                                          <span className="text-[10px] bg-purple-500/10 text-purple-400 px-1.5 py-0.5 rounded font-bold uppercase">
                                            Trending
                                          </span>
                                        )}
                                        {prod.bestSeller && (
                                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">
                                            Bestseller
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-gray-300 font-semibold">
                                  {prod.category?.name || "Uncategorized"}
                                </td>
                                <td className="py-4 px-6">
                                  <p className="font-bold text-primary">
                                    ₹{prod.price.toLocaleString()}
                                  </p>
                                  {prod.compareAtPrice && (
                                    <p className="text-xs text-gray-500 line-through">
                                      ₹{prod.compareAtPrice.toLocaleString()}
                                    </p>
                                  )}
                                </td>
                                <td className="py-4 px-6">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                                      prod.stock <=
                                      (prod.lowStockThreshold || 5)
                                        ? "bg-red-500/10 text-red-500 border-red-500/20"
                                        : "bg-green-500/10 text-green-500 border-green-500/20"
                                    }`}
                                  >
                                    {prod.stock} items
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => openEditProductModal(prod)}
                                      className="p-2 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white rounded border border-blue-500/20 hover:border-transparent transition-all"
                                      title="Edit Product Info"
                                    >
                                      <Edit size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteProduct(prod.id || prod._id, prod.name)
                                      }
                                      className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded border border-red-500/20 hover:border-transparent transition-all"
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
                                className="py-8 text-center text-gray-500"
                              >
                                No products configured in database
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

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xl text-white">
                    Order Fulfillments
                  </h3>
                </div>

                {loadingOrders ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mb-4" />
                    <p className="text-gray-400">Loading order queue...</p>
                  </div>
                ) : (
                  <div className="bg-[#1B2D20]/80 border border-primary/10 rounded-xl overflow-hidden shadow-2xl backdrop-blur-md">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-primary/10 text-gray-400 text-xs font-bold uppercase tracking-wider bg-secondary/40">
                            <th className="py-4 px-6">Order ID</th>
                            <th className="py-4 px-6">Customer</th>
                            <th className="py-4 px-6">Items</th>
                            <th className="py-4 px-6">Grand Total</th>
                            <th className="py-4 px-6">Fulfillment Status</th>
                            <th className="py-4 px-6">Payment</th>
                            <th className="py-4 px-6 text-right">
                              Fulfill / Actions
                            </th>
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
                                className="border-b border-white/5 hover:bg-white/5 transition-colors text-sm"
                              >
                                <td className="py-4 px-6 font-mono font-bold text-primary">
                                  #{orderIdDisplay}
                                </td>
                                <td className="py-4 px-6">
                                  <p className="font-bold text-white">
                                    {userName}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    {ord.shippingAddress?.city},{" "}
                                    {ord.shippingAddress?.state}
                                  </p>
                                </td>
                                <td className="py-4 px-6">
                                  <p className="text-gray-300 font-semibold">
                                    {ord.items?.length || 0} unique items
                                  </p>
                                  <p className="text-xs text-gray-500 truncate max-w-[150px]">
                                    {(ord.items || [])
                                      .map((item: any) => item.name)
                                      .join(", ")}
                                  </p>
                                </td>
                                <td className="py-4 px-6 font-bold text-white">
                                  ₹{(ord.totalPrice || 0).toLocaleString()}
                                </td>
                                <td className="py-4 px-6">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${
                                      ord.orderStatus === "delivered"
                                        ? "bg-green-500/10 text-green-500 border-green-500/20"
                                        : ord.orderStatus === "cancelled"
                                          ? "bg-red-500/10 text-red-500 border-red-500/20"
                                          : ord.orderStatus === "shipped"
                                            ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                            : "bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/20"
                                    }`}
                                  >
                                    {ord.orderStatus || 'pending'}
                                  </span>
                                </td>
                                <td className="py-4 px-6 text-xs">
                                  <p className="uppercase font-semibold text-gray-300">
                                    {ord.paymentMethod || 'N/A'}
                                  </p>
                                  <p
                                    className={
                                      ord.paymentInfo?.paymentStatus ===
                                        "completed" ||
                                      ord.paymentInfo?.paymentStatus ===
                                        "succeeded"
                                        ? "text-green-500"
                                        : "text-yellow-500"
                                    }
                                  >
                                    {ord.paymentInfo?.paymentStatus ||
                                      "pending"}
                                  </p>
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => openOrderActionModal(ord)}
                                      className="p-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black rounded border border-[#D4AF37]/20 hover:border-transparent transition-all"
                                      title="Fulfill and Update Order"
                                    >
                                      <Truck size={14} />
                                    </button>
                                    <Link
                                      href={`/dashboard/orders/${orderId}`}
                                      className="p-2 bg-white/5 hover:bg-white/20 text-gray-300 hover:text-white rounded border border-white/10 transition-all"
                                      title="View Detailed Order Invoice & Tracking"
                                    >
                                      <Eye size={14} />
                                    </Link>
                                    <button
                                      onClick={() => handleDeleteOrder(orderId, ord.orderNumber)}
                                      className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white rounded border border-red-500/20 hover:border-transparent transition-all"
                                      title="Delete Order Permanently"
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
                                className="py-8 text-center text-gray-500"
                              >
                                No orders logged in queue
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

            {/* COUPONS TAB */}
            {activeTab === "coupons" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-xl text-white">
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
                    className="bg-[#D4AF37] hover:bg-[#C29E30] text-black px-4 py-2.5 rounded-lg font-bold text-sm flex items-center gap-1.5 shadow-lg shadow-[#D4AF37]/10 transition-all duration-300"
                  >
                    <Plus size={16} />
                    Create Promo Coupon
                  </button>
                </div>

                {loadingCoupons ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-10 h-10 text-[#D4AF37] animate-spin mb-4" />
                    <p className="text-gray-400">Loading coupons...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.length > 0 ? (
                      coupons.map((coupon) => (
                        <div
                          key={coupon.id || coupon._id}
                          className="bg-[#1B2D20]/80 border border-primary/10 hover:border-primary/30 rounded-xl p-6 shadow-xl backdrop-blur-md flex flex-col justify-between relative group transition-all duration-300"
                        >
                          <button
                            onClick={() =>
                              handleDeleteCoupon(coupon.id || coupon._id, coupon.code)
                            }
                            className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors p-1"
                            title="Remove Promo Coupon"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div>
                            <span className="bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/20 px-3 py-1 rounded font-mono font-bold text-sm tracking-widest">
                              {coupon.code}
                            </span>
                            <div className="mt-4 space-y-2 text-sm text-gray-300">
                              <p className="text-2xl font-black text-white">
                                {coupon.discountType === "percentage"
                                  ? `${coupon.discountAmount}% OFF`
                                  : `₹${coupon.discountAmount} OFF`}
                              </p>
                              <p className="text-xs text-gray-400">
                                Min Purchase Required: ₹
                                {coupon.minPurchase || 0}
                              </p>
                              {coupon.maxDiscount && (
                                <p className="text-xs text-gray-400">
                                  Max Discount Limit: ₹{coupon.maxDiscount}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <Calendar size={12} />
                              Expires:{" "}
                              {coupon.expiryDate
                                ? new Date(
                                    coupon.expiryDate,
                                  ).toLocaleDateString()
                                : "Never"}
                            </span>
                            <span>
                              Uses: {coupon.usedCount || 0} /{" "}
                              {coupon.usageLimit || "∞"}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                                          <div className="md:col-span-2 lg:col-span-3 py-16 text-center bg-[#1B2D20]/60 border border-primary/10 rounded-xl">
                                            <Tag className="mx-auto text-gray-600 mb-3" size={48} />
                        <h4 className="font-bold text-lg text-white mb-1">
                          No coupons available
                        </h4>
                        <p className="text-xs text-gray-400">
                          Create a promotional campaign coupon to incentivize
                          conversion
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1B2D20] border border-primary/30 rounded-xl overflow-hidden shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#D4AF37]/10 flex justify-between items-center bg-black/10">
                <h3 className="font-bold text-lg text-white">
                  {editingProduct
                    ? "Edit Catalog Product"
                    : "Add New Catalog Product"}
                </h3>
                <button
                  onClick={() => {
                    setProductModalOpen(false);
                    setUploadedDeviceImages([]);
                  }}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <form
                onSubmit={handleProductSubmit}
                className="p-6 overflow-y-auto space-y-6 flex-grow"
                data-lenis-prevent="true"
              >
                {/* Product Name */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) =>
                      setProductForm({ ...productForm, name: e.target.value })
                    }
                    className="w-full bg-secondary border border-primary/20 rounded-lg px-4 py-2.5 focus:outline-none focus:border-accent text-foreground"
                    placeholder="Premium MDF Wall Art - Royal Gold"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Product Description *
                  </label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) =>
                      setProductForm({
                        ...productForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full bg-secondary border border-primary/20 rounded-lg px-4 py-2.5 focus:outline-none focus:border-accent text-foreground h-24 resize-none"
                    placeholder="Describe the product material, design, and aesthetic values in detail..."
                    required
                  />
                </div>

                {/* Pricing & Stock Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
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
                      className="w-full bg-secondary border border-primary/20 rounded-lg px-4 py-2.5 focus:outline-none focus:border-accent text-foreground font-bold"
                      placeholder="e.g. 1999"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
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
                      className="w-full bg-secondary border border-primary/20 rounded-lg px-4 py-2.5 focus:outline-none focus:border-accent text-foreground placeholder-gray-500"
                      placeholder="e.g. 2999"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
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
                      className="w-full bg-secondary border border-primary/20 rounded-lg px-4 py-2.5 focus:outline-none focus:border-accent text-foreground"
                      placeholder="e.g. 25"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                      Product Category *
                    </label>
                    <select
                      value={productForm.category}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          category: e.target.value,
                        })
                      }
                      className="w-full bg-secondary border border-primary/20 rounded-lg px-4 py-2.5 focus:outline-none focus:border-accent text-foreground"
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

                {/* Unsplash/Cloudinary Images */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Product Images *
                  </label>
                  {productForm.images.map((url, index) => (
                    <div key={`image-${index}-${url.slice(0, 10)}`} className="flex gap-2 mb-2">
                      {(url.startsWith("data:") ||
                        url.startsWith("http://") ||
                        url.startsWith("https://")) &&
                      url.trim() !== "" ? (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-[#D4AF37]/20">
                          <Image
                            src={url}
                            alt="Uploaded"
                            fill
                            sizes="96px"
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
                        className="flex-1 bg-secondary/80 border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-accent text-white text-xs"
                        placeholder="https://... (Do not paste local D:\ paths here)"
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
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded border border-red-500/20"
                        >
                          <X size={16} />
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
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <button
                      type="button"
                      onClick={() =>
                        setProductForm({
                          ...productForm,
                          images: [...productForm.images, ""],
                        })
                      }
                      className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-bold"
                    >
                      <Plus size={12} /> Add Image URL
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      disabled={isUploadingImages}
                      className="text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Upload size={12} />{" "}
                      {isUploadingImages ? "Uploading..." : "Add from Device"}
                    </button>
                  </div>
                </div>

                {/* Promo Checkboxes */}
                <div className="grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.featured}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          featured: e.target.checked,
                        })
                      }
                      className="accent-[#D4AF37] w-4 h-4"
                    />
                    <span className="text-sm text-gray-300">
                      Featured Home Decor
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.trending}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          trending: e.target.checked,
                        })
                      }
                      className="accent-[#D4AF37] w-4 h-4"
                    />
                    <span className="text-sm text-gray-300">
                      Trending Section
                    </span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={productForm.bestSeller}
                      onChange={(e) =>
                        setProductForm({
                          ...productForm,
                          bestSeller: e.target.checked,
                        })
                      }
                      className="accent-[#D4AF37] w-4 h-4"
                    />
                    <span className="text-sm text-gray-300">
                      Best Seller Decor
                    </span>
                  </label>
                </div>

                {/* Technical Specifications */}
                <div className="border-t border-white/5 pt-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Technical Specifications
                  </label>
                  {productForm.specifications.map((spec, index) => (
                    <div key={`spec-${index}-${spec.key}`} className="flex gap-2 mb-2">
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
                        className="w-1/3 bg-secondary/80 border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-accent text-white text-xs"
                        placeholder="e.g. Dimensions"
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
                        className="w-2/3 bg-secondary/80 border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-accent text-white text-xs"
                        placeholder="e.g. 24 x 24 inches"
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
                          className="p-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded border border-red-500/20"
                        >
                          <X size={16} />
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
                    className="mt-2 text-xs text-[#D4AF37] hover:underline flex items-center gap-1 font-bold"
                  >
                    <Plus size={12} /> Add specification spec
                  </button>
                </div>
              </form>

              {/* Actions Footer */}
              <div className="p-6 border-t border-[#D4AF37]/10 flex justify-end gap-3 bg-black/10">
                <button
                  type="button"
                  onClick={() => {
                    setProductModalOpen(false);
                    setUploadedDeviceImages([]);
                  }}
                  className="bg-transparent hover:bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProductSubmit}
                  className="bg-[#D4AF37] hover:bg-[#C29E30] text-black px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-[#D4AF37]/10 transition-all duration-300"
                >
                  Save Product Item
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ORDER ACTIONS */}
      <AnimatePresence>
        {orderModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1B2D20] border border-primary/30 rounded-xl overflow-hidden shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#D4AF37]/10 flex justify-between items-center bg-black/10">
                <div>
                  <h3 className="font-bold text-lg text-white">
                    Order Fulfillments & Shipping
                  </h3>
                  <p className="text-xs text-[#D4AF37] mt-0.5">
                    Order #
                    {selectedOrder.orderNumber ||
                      (selectedOrder.id || selectedOrder._id || "").substring(0, 8).toUpperCase()}
                  </p>
                </div>
                <button
                  onClick={() => setOrderModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <div className="p-6 overflow-y-auto space-y-8 flex-grow" data-lenis-prevent="true">
                {/* Part 1: Update Status */}
                <form onSubmit={handleUpdateOrderStatus} className="space-y-4">
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#D4AF37] border-b border-white/5 pb-2">
                    1. Update Order Status
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">
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
                        className="w-full bg-secondary/80 border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-accent text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">
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
                        className="w-full bg-secondary/80 border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-accent text-white"
                        placeholder="e.g. Consignment created"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="bg-[#D4AF37] hover:bg-[#C29E30] text-black text-xs font-bold px-4 py-2 rounded shadow transition-all duration-300"
                  >
                    Commit Status Update
                  </button>
                </form>

                {/* Part 2: Shipping AWB Tracking */}
                <form
                  onSubmit={handleUpdateOrderTracking}
                  className="space-y-4 pt-6 border-t border-white/5"
                >
                  <h4 className="text-sm font-extrabold uppercase tracking-wider text-[#D4AF37] border-b border-white/5 pb-2">
                    2. Consignment Courier Tracking Details
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">
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
                        className="w-full bg-secondary/80 border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-accent text-white text-xs"
                      >
                        <option value="Delhivery">Delhivery Express</option>
                        <option value="Shiprocket">Shiprocket Economy</option>
                        <option value="BlueDart">BlueDart Priority</option>
                        <option value="DHL">DHL Express</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">
                        Tracking AWB ID
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
                        className="w-full bg-secondary/80 border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-accent text-white text-xs"
                        placeholder="AWB100234598"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-400 mb-1.5">
                        Est. Delivery Date
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
                        className="w-full bg-secondary/80 border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-accent text-white text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="bg-[#D4AF37] hover:bg-[#C29E30] text-black text-xs font-bold px-4 py-2 rounded shadow transition-all duration-300 flex items-center gap-1"
                  >
                    <Truck size={14} /> Update Shipping Consignment
                  </button>
                </form>
              </div>

              {/* Close Footer */}
              <div className="p-6 border-t border-[#D4AF37]/10 flex justify-end bg-black/10">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="bg-secondary/80 hover:bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#1B2D20] border border-primary/30 rounded-xl overflow-hidden shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col"
            >
              {/* Header */}
              <div className="p-6 border-b border-[#D4AF37]/10 flex justify-between items-center bg-black/10">
                <h3 className="font-bold text-lg text-white">
                  Create Promotion Coupon
                </h3>
                <button
                  onClick={() => setCouponModalOpen(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Form Content */}
              <form
                onSubmit={handleCouponSubmit}
                className="p-6 space-y-4 overflow-y-auto"
                data-lenis-prevent="true"
              >
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Coupon Promo Code *
                  </label>
                  <input
                    type="text"
                    value={couponForm.code}
                    onChange={(e) =>
                      setCouponForm({ ...couponForm, code: e.target.value })
                    }
                    className="w-full bg-secondary/80 border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-accent text-white font-mono font-bold uppercase tracking-wider"
                    placeholder="e.g. LUXURY20"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
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
                      className="w-full bg-secondary/80 border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-accent text-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
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
                      className="w-full bg-secondary/80 border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-accent text-white"
                      placeholder="e.g. 20"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
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
                      className="w-full bg-secondary/80 border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-accent text-white"
                      placeholder="e.g. 999"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
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
                      className="w-full bg-secondary/80 border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-accent text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
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
                      className="w-full bg-secondary/80 border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-accent text-white"
                      placeholder="e.g. 500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
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
                      className="w-full bg-secondary/80 border border-primary/20 rounded-lg px-4 py-2 focus:outline-none focus:border-accent text-white"
                      placeholder="e.g. 100"
                    />
                  </div>
                </div>
              </form>

              {/* Actions Footer */}
              <div className="p-6 border-t border-[#D4AF37]/10 flex justify-end gap-3 bg-black/10">
                <button
                  type="button"
                  onClick={() => setCouponModalOpen(false)}
                  className="bg-transparent hover:bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCouponSubmit}
                  className="bg-[#D4AF37] hover:bg-[#C29E30] text-black px-6 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-[#D4AF37]/10 transition-all duration-300"
                >
                  Save Coupon
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
