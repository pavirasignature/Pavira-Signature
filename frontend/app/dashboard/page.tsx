'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  ShoppingBag, 
  Heart, 
  MapPin, 
  LogOut, 
  Lock, 
  Trash2, 
  Plus, 
  Edit, 
  Check, 
  AlertCircle, 
  Compass, 
  Truck, 
  Calendar, 
  ArrowRight,
  ShieldAlert,
  Phone,
  Mail,
  Home
} from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '@/components/navigation/Header';
import Footer from '@/components/navigation/Footer';
import { useStore } from '@/store/useStore';
import { authService, orderService, userService } from '@/lib/services';

export default function DashboardPage() {
  const router = useRouter();
  const { user, logout, cart, wishlist, setUser } = useStore();

  // Route & Tab States
  const [activeTab, setActiveTab] = useState('overview');
  const [isMounted, setIsMounted] = useState(false);
  
  // Orders Tracking States
  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [trackingOrder, setTrackingOrder] = useState<any | null>(null);

  // Address Management States
  const [addresses, setAddresses] = useState<any[]>([]);
  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressModalMode, setAddressModalMode] = useState<'add' | 'edit'>('add');
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    isDefault: false
  });

  // Password Update States
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Profile Update States
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Account Deletion States
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Active User Resolution (Hydration-safe)
  const storedUserStr = typeof window !== "undefined" ? sessionStorage.getItem("user") : null;
  let activeUser = user;
  if (!activeUser && storedUserStr) {
    try {
      activeUser = JSON.parse(storedUserStr);
    } catch (e) {}
  }

  // Prevent body scrolling when any modal is open
  useEffect(() => {
    if (addressModalOpen || deleteModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [addressModalOpen, deleteModalOpen]);

  // Auth Verification & Initial Loading
  useEffect(() => {
    setIsMounted(true);
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    if (!token) {
      router.push('/login');
      return;
    }

    // Parse URL tab query
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab);
      }
    }

    if (activeUser) {
      if (!user) {
        setUser(activeUser as any);
      }
      setAddresses(activeUser.addresses || []);
      setProfileForm({
        name: activeUser.name || `${activeUser.firstName || ''} ${activeUser.lastName || ''}`.trim() || 'Valued Customer',
        phone: activeUser.phone || '',
        email: activeUser.email || ''
      });
    }

    fetchOrders();
  }, [user, router]);

  // Fetch customer orders
  const fetchOrders = async () => {
    try {
      setLoadingOrders(true);
      const res = await orderService.getMyOrders();
      if (res && res.success) {
        setOrders(res.data || []);
      } else {
        setOrders(res || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Sign out customer
  const handleLogout = () => {
    logout();
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    toast.success('Logged out successfully');
    router.push('/');
  };

  // Profile Edit Submission
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm.name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }

    try {
      setProfileLoading(true);
      // Split name safely
      const nameParts = profileForm.name.trim().split(' ');
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '.';

      const res = await authService.updateProfile({
        firstName,
        lastName,
        name: profileForm.name,
        phone: profileForm.phone,
        email: profileForm.email
      });

      const updatedUser = res.user || res.data?.user || res.data || res;
      // Merge values
      const mergedUser = { ...activeUser, ...updatedUser };
      setUser(mergedUser as any);
      sessionStorage.setItem('user', JSON.stringify(mergedUser));
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Password Change Submission
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    try {
      setPasswordLoading(true);
      await authService.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
        confirmPassword: passwordForm.confirmPassword
      });
      toast.success('Password changed successfully!');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password. Please check your current password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Address Book operations
  const openAddAddress = () => {
    setAddressModalMode('add');
    setSelectedAddressId(null);
    setAddressForm({
      fullName: activeUser?.name || '',
      phone: activeUser?.phone || '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: false
    });
    setAddressModalOpen(true);
  };

  const openEditAddress = (addr: any) => {
    setAddressModalMode('edit');
    setSelectedAddressId(addr._id);
    setAddressForm({
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      state: addr.state || '',
      postalCode: addr.postalCode || '',
      country: addr.country || 'India',
      isDefault: addr.isDefault || false
    });
    setAddressModalOpen(true);
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.fullName || !addressForm.phone || !addressForm.addressLine1 || !addressForm.city || !addressForm.state || !addressForm.postalCode) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      let res;
      if (addressModalMode === 'add') {
        res = await userService.addAddress(addressForm);
        toast.success('New delivery address added!');
      } else {
        res = await userService.updateAddress(selectedAddressId!, addressForm);
        toast.success('Address updated successfully!');
      }

      const freshAddresses = res.addresses || res.data?.addresses || [];
      const updatedUser = { ...activeUser, addresses: freshAddresses };
      setUser(updatedUser as any);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setAddresses(freshAddresses);
      setAddressModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save address');
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!confirm('Are you sure you want to remove this delivery address?')) return;
    try {
      const res = await userService.deleteAddress(addressId);
      const freshAddresses = res.addresses || res.data?.addresses || [];
      const updatedUser = { ...activeUser, addresses: freshAddresses };
      setUser(updatedUser as any);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setAddresses(freshAddresses);
      toast.success('Address removed successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete address');
    }
  };

  const handleSetDefaultAddress = async (addr: any) => {
    try {
      const res = await userService.updateAddress(addr._id, { ...addr, isDefault: true });
      const freshAddresses = res.addresses || res.data?.addresses || [];
      const updatedUser = { ...activeUser, addresses: freshAddresses };
      setUser(updatedUser as any);
      sessionStorage.setItem('user', JSON.stringify(updatedUser));
      setAddresses(freshAddresses);
      toast.success('Default delivery address updated!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to set default address');
    }
  };

  // Permanent Account Deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== 'DELETE PERMANENTLY') {
      toast.error('Please type the phrase exactly to confirm deletion');
      return;
    }

    try {
      setDeleteLoading(true);
      await authService.deleteAccount();
      toast.success('Your account has been deleted permanently. We are sorry to see you go!');
      
      // Complete log out
      logout();
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
      setDeleteModalOpen(false);
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!isMounted || !activeUser) {
    return null;
  }

  const userDisplayName = activeUser.name || `${activeUser.firstName || ''} ${activeUser.lastName || ''}`.trim() || 'Valued Customer';

  const menuItems = [
    { id: 'overview', icon: Compass, label: 'Overview' },
    { id: 'orders', icon: ShoppingBag, label: 'Orders & Tracking' },
    { id: 'profile', icon: User, label: 'Profile & Security' },
    { id: 'addresses', icon: MapPin, label: 'Saved Locations' },
    { id: 'delete-account', icon: ShieldAlert, label: 'Danger Zone', danger: true },
  ];

  return (
    <div className="min-h-screen bg-[#F9F6F0] text-[#F9F6F0] flex flex-col font-sans relative overflow-hidden">
      {/* Full Page Fixed Background Gradient */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />

      <Header />
      
      <main className="flex-grow pt-32 pb-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left Sidebar Navigation */}
            <div className="w-full lg:w-1/4 bg-white border border-[#1A1A1A]/10 rounded-none p-6 space-y-6">
              <div className="flex items-center gap-4 pb-6 border-b border-[#1A1A1A]/10">
                <div className="w-14 h-14 bg-[#D4AF37] rounded-none flex items-center justify-center text-black font-brand font-bold text-2xl shadow-lg">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="font-brand font-semibold text-lg text-[#1A1A1A] truncate">{userDisplayName}</h2>
                  <p className="text-xs text-[#D4AF37] truncate">{activeUser.email}</p>
                </div>
              </div>

              <nav className="space-y-1.5">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setTrackingOrder(null);
                    }}
                    className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-none transition-all duration-300 font-medium text-sm text-left ${
                      activeTab === item.id
                        ? item.danger
                          ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                          : 'bg-[#D4AF37] text-black shadow-lg font-semibold'
                        : item.danger
                        ? 'text-[#1A1A1A]/60 hover:bg-red-500/5 hover:text-red-400 border border-transparent'
                        : 'text-[#1A1A1A]/60 hover:bg-[#F9F6F0] hover:text-[#D4AF37] border border-transparent'
                    }`}
                  >
                    <item.icon size={18} className={activeTab === item.id && !item.danger ? 'text-black' : ''} />
                    <span>{item.label}</span>
                  </button>
                ))}
                


                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-none text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 font-medium text-sm text-left border border-transparent"
                >
                  <LogOut size={18} />
                  <span>Logout Account</span>
                </button>
              </nav>
            </div>

            {/* Right Main Dashboard Panel */}
            <div className="w-full lg:w-3/4 bg-white border border-[#1A1A1A]/10 rounded-none p-8 min-h-[550px] relative">
              <AnimatePresence mode="wait">
                
                {/* 1. OVERVIEW TAB */}
                {activeTab === 'overview' && (
                  <motion.div
                    key="overview"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="font-brand text-3xl text-[#1A1A1A] mb-2 font-semibold">Welcome to <span className="font-brand">Pavira Signature</span></h2>
                      <p className="text-[#1A1A1A]/60 text-sm">Experience tailored Indian luxury. Manage your orders, delivery points, and security details from your central cabinet.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 rounded-none p-6 shadow-sm hover:border-[#0C3A2E]/50 transition">
                        <ShoppingBag className="text-[#D4AF37] mb-3" size={26} />
                        <h4 className="text-2xl font-bold text-[#1A1A1A] mb-1">{orders.length}</h4>
                        <p className="text-[#1A1A1A]/60 text-xs uppercase tracking-wider font-semibold">Total Orders placed</p>
                      </div>

                      <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 rounded-none p-6 shadow-sm hover:border-[#0C3A2E]/50 transition">
                        <Heart className="text-[#D4AF37] mb-3" size={26} />
                        <h4 className="text-2xl font-bold text-[#1A1A1A] mb-1">{wishlist.length}</h4>
                        <p className="text-[#1A1A1A]/60 text-xs uppercase tracking-wider font-semibold">Wishlisted Pieces</p>
                      </div>

                      <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 rounded-none p-6 shadow-sm hover:border-[#0C3A2E]/50 transition">
                        <MapPin className="text-[#D4AF37] mb-3" size={26} />
                        <h4 className="text-2xl font-bold text-[#1A1A1A] mb-1">{addresses.length}</h4>
                        <p className="text-[#1A1A1A]/60 text-xs uppercase tracking-wider font-semibold">Saved Locations</p>
                      </div>
                    </div>

                    {/* Quick Profile Summary Card */}
                    <div className="bg-[#0C3A2E] border border-[#1A1A1A]/10 rounded-none p-6">
                      <h3 className="font-brand text-xl text-[#1A1A1A] mb-4 font-semibold">Customer Card</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-[#1A1A1A]/70">
                        <div className="flex items-center gap-3 bg-white p-3.5 rounded-none">
                          <User size={16} className="text-[#D4AF37]" />
                          <div>
                            <span className="block text-[10px] text-[#1A1A1A]/40 uppercase font-bold">Account Name</span>
                            <span className="font-medium text-[#1A1A1A]">{userDisplayName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3.5 rounded-none">
                          <Mail size={16} className="text-[#D4AF37]" />
                          <div>
                            <span className="block text-[10px] text-[#1A1A1A]/40 uppercase font-bold">Email Address</span>
                            <span className="font-medium text-[#1A1A1A]">{activeUser.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3.5 rounded-none">
                          <Phone size={16} className="text-[#D4AF37]" />
                          <div>
                            <span className="block text-[10px] text-[#1A1A1A]/40 uppercase font-bold">Contact Number</span>
                            <span className="font-medium text-[#1A1A1A]">{activeUser.phone || 'Not added'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 bg-white p-3.5 rounded-none">
                          <Home size={16} className="text-[#D4AF37]" />
                          <div>
                            <span className="block text-[10px] text-[#1A1A1A]/40 uppercase font-bold">Default Location</span>
                            <span className="font-medium text-[#1A1A1A] truncate">
                              {addresses.find(a => a.isDefault)?.addressLine1 || 'No default location set'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 2. ORDERS & TRACKING TAB */}
                {activeTab === 'orders' && (
                  <motion.div
                    key="orders"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center pb-4 border-b border-[#1A1A1A]/10">
                      <div>
                        <h2 className="font-brand text-2xl text-[#1A1A1A] font-semibold">Orders & tracking</h2>
                        <p className="text-[#1A1A1A]/60 text-xs">Track shipment status and view details of your Indian handicraft purchases.</p>
                      </div>
                      {trackingOrder && (
                        <button 
                          onClick={() => setTrackingOrder(null)}
                          className="px-3.5 py-1.5 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#1A1A1A]/20 text-[#D4AF37] rounded-none text-xs transition font-semibold"
                        >
                          Back to List
                        </button>
                      )}
                    </div>

                    {loadingOrders ? (
                      <div className="flex flex-col items-center justify-center py-20 space-y-3">
                        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-none animate-spin"></div>
                        <p className="text-xs text-[#1A1A1A]/60 font-semibold">Retrieving your orders...</p>
                      </div>
                    ) : trackingOrder ? (
                      /* Live Shipment Consignment Tracker view */
                      <div className="space-y-6">
                        <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 rounded-none p-6">
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-6 border-b border-[#1A1A1A]/10">
                            <div>
                              <span className="block text-[10px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider mb-0.5">Order Serial</span>
                              <span className="font-brand text-lg text-[#1A1A1A] font-semibold">#{trackingOrder._id}</span>
                            </div>
                            <div className="flex flex-wrap gap-4 text-xs">
                              <div className="bg-white px-4 py-2 rounded-none border border-[#1A1A1A]/10">
                                <span className="block text-[9px] text-[#1A1A1A]/40 uppercase font-bold mb-0.5">Date Ordered</span>
                                <span className="text-[#1A1A1A] font-medium">{new Date(trackingOrder.createdAt).toLocaleDateString('en-IN')}</span>
                              </div>
                              <div className="bg-white px-4 py-2 rounded-none border border-[#1A1A1A]/10">
                                <span className="block text-[9px] text-[#1A1A1A]/40 uppercase font-bold mb-0.5">Order Total</span>
                                <span className="text-[#D4AF37] font-semibold">₹{trackingOrder.totalPrice?.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Shipment Delivery details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-3">
                              <h4 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                                <Truck size={16} className="text-[#D4AF37]" />
                                <span>Shipping Carrier details</span>
                              </h4>
                              {trackingOrder.tracking && trackingOrder.tracking.trackingNumber ? (
                                <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none space-y-2">
                                  <p className="text-xs"><span className="text-[#1A1A1A]/60">Carrier:</span> <span className="text-[#1A1A1A] font-semibold uppercase">{trackingOrder.tracking.carrier}</span></p>
                                  <p className="text-xs"><span className="text-[#1A1A1A]/60">Tracking Code:</span> <span className="text-[#D4AF37] font-mono font-semibold select-all">{trackingOrder.tracking.trackingNumber}</span></p>
                                  <p className="text-xs"><span className="text-[#1A1A1A]/60">Estimated Delivery:</span> <span className="text-[#1A1A1A] font-semibold">{trackingOrder.tracking.estimatedDelivery ? new Date(trackingOrder.tracking.estimatedDelivery).toLocaleDateString('en-IN') : 'TBD'}</span></p>
                                </div>
                              ) : (
                                <div className="bg-white border border-[#D4AF37]/5 p-4 rounded-none text-center py-6 text-[#1A1A1A]/60 text-xs">
                                  <Calendar className="mx-auto mb-2 text-gray-650" size={24} />
                                  <span>Shipment is currently being packaged. Carrier details will populate here shortly.</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                                <MapPin size={16} className="text-[#D4AF37]" />
                                <span>Delivery Destination</span>
                              </h4>
                              <div className="bg-white border border-[#1A1A1A]/10 p-4 rounded-none text-xs space-y-1 text-[#1A1A1A]/70">
                                <p className="font-semibold text-[#1A1A1A]">{trackingOrder.shippingAddress?.fullName}</p>
                                <p>{trackingOrder.shippingAddress?.addressLine1}</p>
                                {trackingOrder.shippingAddress?.addressLine2 && <p>{trackingOrder.shippingAddress?.addressLine2}</p>}
                                <p>{trackingOrder.shippingAddress?.city}, {trackingOrder.shippingAddress?.state} - {trackingOrder.shippingAddress?.postalCode}</p>
                                <p className="text-[#1A1A1A]/60 mt-1">Phone: {trackingOrder.shippingAddress?.phone}</p>
                              </div>
                            </div>
                          </div>

                          {/* Consignment Status Progress Timeline */}
                          <div className="space-y-3">
                            <h4 className="text-sm font-bold text-[#1A1A1A]">Consignment Tracker Timeline</h4>
                            <div className="relative pl-8 border-l border-[#1A1A1A]/10 space-y-6 py-2 ml-4 text-sm">
                              {/* Order Placed */}
                              <div className="relative">
                                <span className="absolute -left-[25px] top-0 w-4 h-4 rounded-none border-2 bg-[#D4AF37] border-[#D4AF37]"></span>
                                <p className="font-semibold text-[#1A1A1A]">Order Placed</p>
                                <p className="text-xs text-[#1A1A1A]/40">We have successfully received your order.</p>
                              </div>

                              {/* Order Confirmed */}
                              <div className="relative">
                                <span className={`absolute -left-[25px] top-0 w-4 h-4 rounded-none border-2 ${
                                  ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(trackingOrder.orderStatus)
                                    ? 'bg-[#D4AF37] border-[#D4AF37]'
                                    : 'bg-white border-[#1A1A1A]/10'
                                }`}></span>
                                <p className={`font-semibold ${
                                  ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(trackingOrder.orderStatus)
                                    ? 'text-[#1A1A1A]'
                                    : 'text-[#1A1A1A]/60'
                                }`}>Order Confirmed</p>
                                <p className="text-xs text-[#1A1A1A]/40">Your order has been verified and is ready for preparation.</p>
                              </div>

                              {/* Processing */}
                              <div className="relative">
                                <span className={`absolute -left-[25px] top-0 w-4 h-4 rounded-none border-2 ${
                                  ['processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(trackingOrder.orderStatus)
                                    ? 'bg-[#D4AF37] border-[#D4AF37]'
                                    : 'bg-white border-[#1A1A1A]/10'
                                }`}></span>
                                <p className={`font-semibold ${
                                  ['processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(trackingOrder.orderStatus)
                                    ? 'text-[#1A1A1A]'
                                    : 'text-[#1A1A1A]/60'
                                }`}>Processing & Packaging</p>
                                <p className="text-xs text-[#1A1A1A]/40">Our artisans are preparing and quality-checking your signature items.</p>
                              </div>

                              {/* Shipped */}
                              <div className="relative">
                                <span className={`absolute -left-[25px] top-0 w-4 h-4 rounded-none border-2 ${
                                  ['shipped', 'out_for_delivery', 'delivered'].includes(trackingOrder.orderStatus)
                                    ? 'bg-[#D4AF37] border-[#D4AF37]'
                                    : 'bg-white border-[#1A1A1A]/10'
                                }`}></span>
                                <p className={`font-semibold ${
                                  ['shipped', 'out_for_delivery', 'delivered'].includes(trackingOrder.orderStatus)
                                    ? 'text-[#1A1A1A]'
                                    : 'text-[#1A1A1A]/60'
                                }`}>In Transit / Shipped</p>
                                <p className="text-xs text-[#1A1A1A]/40">Handed over to carrier consignment partner.</p>
                              </div>

                              {/* Delivered */}
                              <div className="relative">
                                <span className={`absolute -left-[25px] top-0 w-4 h-4 rounded-none border-2 ${
                                  trackingOrder.orderStatus === 'delivered' ? 'bg-[#D4AF37] border-[#D4AF37]' : 'bg-white border-[#1A1A1A]/10'
                                }`}></span>
                                <p className={`font-semibold ${trackingOrder.orderStatus === 'delivered' ? 'text-[#D4AF37]' : 'text-[#1A1A1A]/60'}`}>Delivered</p>
                                <p className="text-xs text-[#1A1A1A]/40">Package has reached your doorstep successfully.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 rounded-none p-12 text-center text-[#1A1A1A]/60 space-y-4">
                        <ShoppingBag size={48} className="mx-auto text-gray-650" />
                        <div>
                          <h4 className="text-[#1A1A1A] font-brand text-lg font-semibold mb-1">No orders yet</h4>
                          <p className="text-xs max-w-sm mx-auto">Explore our collection of luxurious, handcrafted Indian home decor artwork pieces.</p>
                        </div>
                        <Link 
                          href="/products" 
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] hover:bg-[#C9A52C] text-black font-semibold rounded-none text-xs transition"
                        >
                          <span>Explore Products</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    ) : (
                      /* Orders List */
                      <div className="space-y-4">
                        {orders.map((ord: any) => (
                          <div 
                            key={ord.id || ord._id} 
                            className="bg-[#F9F6F0] border border-[#1A1A1A]/10 hover:border-[#0C3A2E]/30 transition rounded-none p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-3">
                                <span className="font-brand font-semibold text-[#1A1A1A] text-sm">#{(ord.id || ord._id || "").slice(-8).toUpperCase()}</span>
                                <span className={`px-2.5 py-0.5 rounded-none text-[10px] font-bold uppercase tracking-wider ${
                                  ord.orderStatus === 'delivered'
                                    ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                                    : ord.orderStatus === 'shipped'
                                    ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400'
                                    : 'bg-[#D4AF37]/10 border border-[#1A1A1A]/20 text-[#D4AF37]'
                                }`}>
                                  {ord.orderStatus}
                                </span>
                              </div>
                              <p className="text-xs text-[#1A1A1A]/60">Ordered: {new Date(ord.createdAt).toLocaleDateString('en-IN')}</p>
                              <p className="text-xs text-[#D4AF37] font-semibold mt-1">₹{ord.totalPrice?.toLocaleString('en-IN')}</p>
                            </div>

                            <div className="flex gap-2.5 w-full md:w-auto">
                              <button 
                                onClick={() => setTrackingOrder(ord)}
                                className="flex-grow md:flex-grow-0 px-4 py-2 border border-[#1A1A1A]/20 text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-none text-xs transition font-semibold"
                              >
                                Track Package
                              </button>
                              <Link 
                                href={`/dashboard/orders/${ord.id || ord._id}`}
                                className="flex-grow md:flex-grow-0 px-4 py-2 bg-[#D4AF37] hover:bg-[#C9A52C] text-black rounded-none text-xs transition font-semibold text-center"
                              >
                                Order Details
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 3. PROFILE & SECURITY TAB */}
                {activeTab === 'profile' && (
                  <motion.div
                    key="profile"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-8"
                  >
                    <div>
                      <h2 className="font-brand text-2xl text-[#1A1A1A] font-semibold mb-1">Profile & security</h2>
                      <p className="text-[#1A1A1A]/60 text-xs font-light">Update your personal contact details or modify your account authorization credentials.</p>
                    </div>

                    {/* Customer Info Form */}
                    <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 rounded-none p-6 space-y-4">
                      <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                        <User size={16} className="text-[#D4AF37]" />
                        <span>Personal Details</span>
                      </h3>
                      
                      <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Account Name</label>
                          <input 
                            type="text" 
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full bg-white border border-[#1A1A1A]/10 focus:border-[#D4AF37] rounded-none px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                            placeholder="John Doe"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[10px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Contact Phone</label>
                          <input 
                            type="tel" 
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full bg-white border border-[#1A1A1A]/10 focus:border-[#D4AF37] rounded-none px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                            placeholder="Add phone number"
                          />
                        </div>

                        <div className="space-y-1 md:col-span-2">
                          <label className="block text-[10px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Email Address</label>
                          <input 
                            type="email" 
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full bg-white border border-[#1A1A1A]/10 focus:border-[#D4AF37] rounded-none px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                            placeholder="Email address"
                          />
                        </div>

                        <div className="md:col-span-2 pt-2">
                          <button
                            type="submit"
                            disabled={profileLoading}
                            className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#C9A52C] text-black font-semibold rounded-none text-xs transition"
                          >
                            {profileLoading ? 'Updating Profile...' : 'Save Profile Changes'}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 rounded-none p-6 space-y-4">
                      <h3 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
                        <Lock size={16} className="text-[#D4AF37]" />
                        <span>Change Password</span>
                      </h3>

                      <form onSubmit={handleChangePassword} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Current Password</label>
                            <input 
                              type="password" 
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                              className="w-full bg-white border border-[#1A1A1A]/10 focus:border-[#D4AF37] rounded-none px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                              placeholder="••••••••"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">New Password</label>
                            <input 
                              type="password" 
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              className="w-full bg-white border border-[#1A1A1A]/10 focus:border-[#D4AF37] rounded-none px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                              placeholder="At least 6 chars"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="block text-[10px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Confirm New Password</label>
                            <input 
                              type="password" 
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              className="w-full bg-white border border-[#1A1A1A]/10 focus:border-[#D4AF37] rounded-none px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                              placeholder="Match password"
                            />
                          </div>
                        </div>

                        <div>
                          <button
                            type="submit"
                            disabled={passwordLoading}
                            className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#C9A52C] text-black font-semibold rounded-none text-xs transition"
                          >
                            {passwordLoading ? 'Updating Password...' : 'Change Password'}
                          </button>
                        </div>
                      </form>
                    </div>
                  </motion.div>
                )}

                {/* 4. SAVED LOCATIONS TAB */}
                {activeTab === 'addresses' && (
                  <motion.div
                    key="addresses"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="flex justify-between items-center pb-4 border-b border-[#1A1A1A]/10">
                      <div>
                        <h2 className="font-brand text-2xl text-[#1A1A1A] font-semibold">Saved Locations</h2>
                        <p className="text-[#1A1A1A]/60 text-xs">Manage your default shipping addresses for fast Indian checkout.</p>
                      </div>
                      <button 
                        onClick={openAddAddress}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#D4AF37] hover:bg-[#C9A52C] text-black font-semibold rounded-none text-xs transition"
                      >
                        <Plus size={14} />
                        <span>Add Address</span>
                      </button>
                    </div>

                    {addresses.length === 0 ? (
                      <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 rounded-none p-12 text-center text-[#1A1A1A]/60 space-y-4">
                        <MapPin size={48} className="mx-auto text-gray-650" />
                        <div>
                          <h4 className="text-[#1A1A1A] font-brand text-lg font-semibold mb-1">No addresses saved</h4>
                          <p className="text-xs max-w-sm mx-auto">Set up your delivery addresses to streamline checkout flows and track shipments.</p>
                        </div>
                        <button 
                          onClick={openAddAddress}
                          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#D4AF37] hover:bg-[#C9A52C] text-black font-semibold rounded-none text-xs transition"
                        >
                          <Plus size={14} />
                          <span>Add Your First Location</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {addresses.map((addr: any) => (
                          <div 
                            key={addr._id} 
                            className={`bg-[#F9F6F0] border rounded-none p-5 space-y-4 transition flex flex-col justify-between ${
                              addr.isDefault ? 'border-[#D4AF37] ring-1 ring-[#D4AF37]/25 shadow-md' : 'border-[#1A1A1A]/10 hover:border-[#385C42]'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-semibold text-[#1A1A1A] text-sm truncate">{addr.fullName}</h4>
                                {addr.isDefault && (
                                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#D4AF37]/15 border border-[#D4AF37]/35 text-[#D4AF37] text-[9px] font-bold rounded-none uppercase tracking-wider">
                                    <Check size={8} />
                                    <span>Default</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-light">
                                {addr.addressLine1}
                                {addr.addressLine2 && <span className="block mt-0.5">{addr.addressLine2}</span>}
                                <span className="block mt-0.5">{addr.city}, {addr.state} - <span className="font-semibold">{addr.postalCode}</span></span>
                                <span className="block mt-0.5 text-[#1A1A1A]/60">{addr.country}</span>
                              </p>
                              <p className="text-xs text-[#1A1A1A]/60 flex items-center gap-1 pt-1.5">
                                <Phone size={12} className="text-[#D4AF37]" />
                                <span>Phone: {addr.phone}</span>
                              </p>
                            </div>

                            <div className="flex items-center justify-between border-t border-[#1A1A1A]/10 pt-3.5 mt-2 gap-2">
                              {!addr.isDefault ? (
                                <button 
                                  onClick={() => handleSetDefaultAddress(addr)}
                                  className="text-[10px] text-[#1A1A1A]/60 hover:text-[#D4AF37] transition font-semibold"
                                >
                                  Make Default
                                </button>
                              ) : (
                                <span className="text-[10px] text-green-400 font-bold">Active Delivery Location</span>
                              )}
                              
                              <div className="flex gap-3">
                                <button 
                                  onClick={() => openEditAddress(addr)}
                                  className="text-[#1A1A1A]/60 hover:text-[#1A1A1A] p-1 rounded transition"
                                  title="Edit Address"
                                >
                                  <Edit size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteAddress(addr._id)}
                                  className="text-red-500/60 hover:text-red-400 p-1 rounded transition"
                                  title="Delete Address"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* 5. DANGER ZONE / ACCOUNT DELETION */}
                {activeTab === 'delete-account' && (
                  <motion.div
                    key="delete-account"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-6"
                  >
                    <div className="pb-4 border-b border-red-500/20">
                      <h2 className="font-brand text-2xl text-red-500 font-semibold">Danger Zone</h2>
                      <p className="text-[#1A1A1A]/60 text-xs font-light">Critical settings. Actions taken here are permanent and cannot be undone.</p>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/25 rounded-none p-6 space-y-4">
                      <div className="flex gap-4 items-start">
                        <ShieldAlert className="text-red-500 shrink-0 mt-0.5" size={28} />
                        <div className="space-y-1">
                          <h4 className="font-brand text-lg text-[#1A1A1A] font-semibold">Delete Account Permanently</h4>
                          <p className="text-xs text-[#1A1A1A]/60 leading-relaxed max-w-xl font-light">
                            Deleting your account completely deletes all saved credentials, wishlist history, and address details. Your pending orders will continue shipping, but you will lose online tracking access permanently.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setDeleteConfirmText('');
                            setDeleteModalOpen(true);
                          }}
                          className="px-5 py-2.5 bg-red-600 hover:bg-[#A85751] text-white font-bold rounded-none text-xs transition shadow-md shadow-red-900/20"
                        >
                          Delete My Account
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
            
          </div>
        </div>
      </main>

      {/* Address modal form */}
      {addressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#F9F6F0] border border-[#1A1A1A]/20 rounded-none w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="bg-white px-6 py-4 border-b border-[#1A1A1A]/10 flex justify-between items-center">
              <h3 className="font-brand text-lg text-[#1A1A1A] font-semibold">
                {addressModalMode === 'add' ? 'Add New Delivery Address' : 'Edit Delivery Address'}
              </h3>
              <button 
                onClick={() => setAddressModalOpen(false)}
                className="text-[#1A1A1A]/60 hover:text-[#1A1A1A] text-sm font-semibold transition"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Receiver Full Name *</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.fullName}
                    onChange={(e) => setAddressForm({ ...addressForm, fullName: e.target.value })}
                    className="w-full bg-white border border-[#1A1A1A]/10 focus:border-[#D4AF37] rounded-none px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="Recipient Name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Receiver Phone Number *</label>
                  <input 
                    type="tel" 
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full bg-white border border-[#1A1A1A]/10 focus:border-[#D4AF37] rounded-none px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="10-digit Mobile"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Address Line 1 (Flat, House, Building) *</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.addressLine1}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine1: e.target.value })}
                    className="w-full bg-white border border-[#1A1A1A]/10 focus:border-[#D4AF37] rounded-none px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="Street, apartment details"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Address Line 2 (Area, Colony, Landmark)</label>
                  <input 
                    type="text" 
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    className="w-full bg-white border border-[#1A1A1A]/10 focus:border-[#D4AF37] rounded-none px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="Sector, landmark details"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">City *</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full bg-white border border-[#1A1A1A]/10 focus:border-[#D4AF37] rounded-none px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="Mumbai / Delhi"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">State *</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full bg-white border border-[#1A1A1A]/10 focus:border-[#D4AF37] rounded-none px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="Maharashtra"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">PIN Code *</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full bg-white border border-[#1A1A1A]/10 focus:border-[#D4AF37] rounded-none px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="6-digit ZIP"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Country *</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full bg-white border border-[#1A1A1A]/10 focus:border-[#D4AF37] rounded-none px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="India"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input 
                  type="checkbox" 
                  id="isDefault" 
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="rounded border-[#1A1A1A]/10 text-[#D4AF37] bg-white focus:ring-0"
                />
                <label htmlFor="isDefault" className="text-xs text-[#1A1A1A]/70 select-none cursor-pointer">Designate as my default shipping address</label>
              </div>

              <div className="border-t border-[#1A1A1A]/10 pt-4 flex justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-4.5 py-2.5 border border-[#1A1A1A]/10 text-[#1A1A1A]/60 hover:text-[#1A1A1A] rounded-none text-xs transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#D4AF37] hover:bg-[#C9A52C] text-black font-semibold rounded-none text-xs transition"
                >
                  {addressModalMode === 'add' ? 'Add Location' : 'Save Changes'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#F9F6F0] border border-red-500/30 rounded-none w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="bg-red-500/10 px-6 py-4 border-b border-red-500/20 flex justify-between items-center">
              <h3 className="font-brand text-lg text-red-500 font-semibold flex items-center gap-2">
                <ShieldAlert size={20} />
                <span>Permanent Account Deletion</span>
              </h3>
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="text-[#1A1A1A]/60 hover:text-[#1A1A1A] text-sm font-semibold transition"
              >
                Cancel
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-light">
                This action is irreversible and deletes all details. Please type the confirmation phrase <span className="font-bold text-red-400 select-none">DELETE PERMANENTLY</span> below to acknowledge risk.
              </p>
              
              <div className="space-y-1">
                <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Confirmation Phrase</label>
                <input 
                  type="text" 
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full bg-white border border-red-500/20 focus:border-red-500 rounded-none px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition font-semibold"
                  placeholder="Type: DELETE PERMANENTLY"
                />
              </div>

              <div className="border-t border-[#1A1A1A]/10 pt-4 flex justify-end gap-2.5 mt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-4.5 py-2.5 border border-[#1A1A1A]/10 text-[#1A1A1A]/60 hover:text-[#1A1A1A] rounded-none text-xs transition font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE PERMANENTLY' || deleteLoading}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed text-[#1A1A1A] font-bold rounded-none text-xs transition"
                >
                  {deleteLoading ? 'Deleting Account...' : 'Confirm Permanent Deletion'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
