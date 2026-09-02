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
  Home,
  X,
  Package,
  Clock
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
    <div className="min-h-screen bg-[#F9F6F0] text-[#1A1A1A] flex flex-col font-sans selection:bg-[#0C3A2E] selection:text-white">
      <Header />
      
      <main className="flex-grow pt-32 pb-24 relative z-10">
        <div className="container mx-auto px-4 max-w-7xl">
          
          {/* Top Page Header */}
          <div className="mb-10 border-b border-[#1A1A1A]/10 pb-6">
            <h1 className="text-3xl md:text-4xl font-brand text-[#1A1A1A] mb-2 font-normal">
              My Cabinet
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-[#1A1A1A]/60 font-light">
              Manage your orders, saved locations, and personal profile
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* Left Sidebar Navigation */}
            <div className="w-full lg:w-1/4 bg-white border border-[#1A1A1A]/10 p-6 space-y-6 shadow-sm">
              <div className="flex items-center gap-4 pb-6 border-b border-[#1A1A1A]/10">
                <div className="w-14 h-14 bg-[#0C3A2E] text-[#D4AF37] border border-[#D4AF37]/30 flex items-center justify-center font-brand font-bold text-2xl shadow-sm">
                  {userDisplayName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <h2 className="font-brand font-semibold text-base text-[#1A1A1A] truncate">{userDisplayName}</h2>
                  <p className="text-xs text-[#1A1A1A]/60 truncate mt-0.5">{activeUser.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setTrackingOrder(null);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-xs tracking-wider uppercase font-semibold transition-all text-left ${
                      activeTab === item.id
                        ? item.danger
                          ? 'bg-[#A85751] text-white shadow-sm'
                          : 'bg-[#0C3A2E] text-white shadow-sm'
                        : item.danger
                        ? 'text-[#A85751] hover:bg-[#A85751]/10'
                        : 'text-[#1A1A1A]/70 hover:bg-[#F9F6F0] hover:text-[#0C3A2E]'
                    }`}
                  >
                    <item.icon size={16} className={activeTab === item.id ? 'text-[#D4AF37]' : ''} />
                    <span>{item.label}</span>
                  </button>
                ))}

                <div className="pt-4 border-t border-[#1A1A1A]/10 mt-3">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs tracking-wider uppercase font-semibold text-[#A85751] hover:bg-[#A85751]/10 transition-all text-left"
                  >
                    <LogOut size={16} />
                    <span>Logout Account</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Right Main Dashboard Panel */}
            <div className="w-full lg:w-3/4 bg-white border border-[#1A1A1A]/10 p-8 min-h-[580px] shadow-sm relative">
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
                    <div className="border-b border-[#1A1A1A]/10 pb-5">
                      <h2 className="font-brand text-2xl md:text-3xl text-[#1A1A1A] mb-1 font-normal">
                        Welcome, {userDisplayName}
                      </h2>
                      <p className="text-[#1A1A1A]/60 text-xs font-light tracking-wide">
                        Experience bespoke Indian craftsmanship. Oversee your orders and account security with ease.
                      </p>
                    </div>

                    {/* Quick Metrics */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 p-6 flex flex-col justify-between">
                        <ShoppingBag className="text-[#0C3A2E] mb-4" size={24} />
                        <div>
                          <h4 className="font-brand text-3xl font-semibold text-[#1A1A1A] mb-1">{orders.length}</h4>
                          <p className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-[0.2em] font-semibold">Orders Placed</p>
                        </div>
                      </div>

                      <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 p-6 flex flex-col justify-between">
                        <Heart className="text-[#0C3A2E] mb-4" size={24} />
                        <div>
                          <h4 className="font-brand text-3xl font-semibold text-[#1A1A1A] mb-1">{wishlist.length}</h4>
                          <p className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-[0.2em] font-semibold">Wishlisted Pieces</p>
                        </div>
                      </div>

                      <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 p-6 flex flex-col justify-between">
                        <MapPin className="text-[#0C3A2E] mb-4" size={24} />
                        <div>
                          <h4 className="font-brand text-3xl font-semibold text-[#1A1A1A] mb-1">{addresses.length}</h4>
                          <p className="text-[#1A1A1A]/50 text-[10px] uppercase tracking-[0.2em] font-semibold">Saved Locations</p>
                        </div>
                      </div>
                    </div>

                    {/* Editorial Customer Card */}
                    <div className="bg-[#0C3A2E] text-white p-8 border border-[#D4AF37]/20 shadow-md">
                      <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
                        <h3 className="font-brand text-xl text-white font-normal">Patron Profile</h3>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] border border-[#D4AF37]/40 px-3 py-1 font-semibold">
                          Verified Member
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-3.5 bg-white/5 border border-white/10 p-4">
                          <User size={18} className="text-[#D4AF37] shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-[9px] text-white/50 uppercase tracking-widest font-semibold">Account Name</span>
                            <span className="font-medium text-white text-xs truncate block">{userDisplayName}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3.5 bg-white/5 border border-white/10 p-4">
                          <Mail size={18} className="text-[#D4AF37] shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-[9px] text-white/50 uppercase tracking-widest font-semibold">Email Address</span>
                            <span className="font-medium text-white text-xs truncate block">{activeUser.email}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3.5 bg-white/5 border border-white/10 p-4">
                          <Phone size={18} className="text-[#D4AF37] shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-[9px] text-white/50 uppercase tracking-widest font-semibold">Contact Phone</span>
                            <span className="font-medium text-white text-xs truncate block">{activeUser.phone || 'Not provided'}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3.5 bg-white/5 border border-white/10 p-4">
                          <Home size={18} className="text-[#D4AF37] shrink-0" />
                          <div className="min-w-0">
                            <span className="block text-[9px] text-white/50 uppercase tracking-widest font-semibold">Primary Address</span>
                            <span className="font-medium text-white text-xs truncate block">
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
                        <h2 className="font-brand text-2xl text-[#1A1A1A] font-normal">Order History & Tracking</h2>
                        <p className="text-[#1A1A1A]/60 text-xs mt-0.5">Track shipment progress and review your past acquisitions.</p>
                      </div>
                      {trackingOrder && (
                        <button 
                          onClick={() => setTrackingOrder(null)}
                          className="px-4 py-2 bg-[#F9F6F0] hover:bg-[#0C3A2E] hover:text-white border border-[#1A1A1A]/15 text-[#1A1A1A] text-xs font-semibold uppercase tracking-widest transition"
                        >
                          Back to List
                        </button>
                      )}
                    </div>

                    {loadingOrders ? (
                      <div className="flex flex-col items-center justify-center py-24 space-y-4">
                        <div className="w-8 h-8 border-2 border-[#0C3A2E] border-t-transparent animate-spin"></div>
                        <p className="text-xs uppercase tracking-widest text-[#1A1A1A]/60 font-semibold">Retrieving your orders...</p>
                      </div>
                    ) : trackingOrder ? (
                      /* Live Shipment Consignment Tracker view */
                      <div className="space-y-6">
                        <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 p-6 md:p-8">
                          <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 mb-6 pb-6 border-b border-[#1A1A1A]/10">
                            <div>
                              <span className="block text-[10px] text-[#1A1A1A]/50 uppercase font-bold tracking-[0.2em] mb-1">Consignment Serial</span>
                              <span className="font-brand text-xl text-[#0C3A2E] font-semibold">#{trackingOrder._id || trackingOrder.id}</span>
                            </div>
                            <div className="flex flex-wrap gap-3 text-xs">
                              <div className="bg-white px-4 py-2 border border-[#1A1A1A]/10">
                                <span className="block text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider font-semibold">Date Ordered</span>
                                <span className="text-[#1A1A1A] font-medium">{new Date(trackingOrder.createdAt).toLocaleDateString('en-IN')}</span>
                              </div>
                              <div className="bg-white px-4 py-2 border border-[#1A1A1A]/10">
                                <span className="block text-[9px] text-[#1A1A1A]/50 uppercase tracking-wider font-semibold">Total Price</span>
                                <span className="text-[#0C3A2E] font-semibold">₹{trackingOrder.totalPrice?.toLocaleString('en-IN')}</span>
                              </div>
                            </div>
                          </div>

                          {/* Shipment Delivery details */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                                <Truck size={16} className="text-[#0C3A2E]" />
                                <span>Carrier Dispatch Details</span>
                              </h4>
                              {trackingOrder.tracking && trackingOrder.tracking.trackingNumber ? (
                                <div className="bg-white border border-[#1A1A1A]/10 p-5 space-y-2 text-xs">
                                  <p><span className="text-[#1A1A1A]/50 uppercase tracking-wider text-[10px] block">Carrier</span> <span className="text-[#1A1A1A] font-semibold">{trackingOrder.tracking.carrier}</span></p>
                                  <p><span className="text-[#1A1A1A]/50 uppercase tracking-wider text-[10px] block">Tracking Code</span> <span className="text-[#0C3A2E] font-mono font-semibold select-all">{trackingOrder.tracking.trackingNumber}</span></p>
                                  <p><span className="text-[#1A1A1A]/50 uppercase tracking-wider text-[10px] block">Estimated Delivery</span> <span className="text-[#1A1A1A] font-semibold">{trackingOrder.tracking.estimatedDelivery ? new Date(trackingOrder.tracking.estimatedDelivery).toLocaleDateString('en-IN') : 'In Transit'}</span></p>
                                </div>
                              ) : (
                                <div className="bg-white border border-[#1A1A1A]/10 p-6 text-center text-[#1A1A1A]/60 text-xs">
                                  <Calendar className="mx-auto mb-2 text-[#1A1A1A]/30" size={24} />
                                  <span>Package is undergoing quality curation. Carrier details will update shortly.</span>
                                </div>
                              )}
                            </div>

                            <div className="space-y-3">
                              <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                                <MapPin size={16} className="text-[#0C3A2E]" />
                                <span>Destination Address</span>
                              </h4>
                              <div className="bg-white border border-[#1A1A1A]/10 p-5 text-xs space-y-1 text-[#1A1A1A]/70">
                                <p className="font-semibold text-[#1A1A1A]">{trackingOrder.shippingAddress?.fullName}</p>
                                <p>{trackingOrder.shippingAddress?.addressLine1}</p>
                                {trackingOrder.shippingAddress?.addressLine2 && <p>{trackingOrder.shippingAddress?.addressLine2}</p>}
                                <p>{trackingOrder.shippingAddress?.city}, {trackingOrder.shippingAddress?.state} - {trackingOrder.shippingAddress?.postalCode}</p>
                                <p className="text-[#1A1A1A]/50 text-[11px] pt-1">Phone: {trackingOrder.shippingAddress?.phone}</p>
                              </div>
                            </div>
                          </div>

                          {/* Consignment Status Progress Timeline */}
                          <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A]">Consignment Status Flow</h4>
                            <div className="relative pl-6 border-l-2 border-[#0C3A2E]/20 space-y-6 py-2 ml-3 text-sm">
                              {/* Order Placed */}
                              <div className="relative">
                                <span className="absolute -left-[31px] top-0.5 w-3.5 h-3.5 bg-[#0C3A2E] border-2 border-white shadow-sm"></span>
                                <p className="font-semibold text-xs uppercase tracking-wider text-[#1A1A1A]">Order Placed</p>
                                <p className="text-[11px] text-[#1A1A1A]/50">Order received and logged into crafting schedule.</p>
                              </div>

                              {/* Order Confirmed */}
                              <div className="relative">
                                <span className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 border-2 border-white shadow-sm ${
                                  ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(trackingOrder.orderStatus)
                                    ? 'bg-[#0C3A2E]'
                                    : 'bg-[#E5E0D8]'
                                }`}></span>
                                <p className={`font-semibold text-xs uppercase tracking-wider ${
                                  ['confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(trackingOrder.orderStatus)
                                    ? 'text-[#1A1A1A]'
                                    : 'text-[#1A1A1A]/40'
                                }`}>Order Verified</p>
                                <p className="text-[11px] text-[#1A1A1A]/50">Payment confirmed and items reserved.</p>
                              </div>

                              {/* Processing */}
                              <div className="relative">
                                <span className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 border-2 border-white shadow-sm ${
                                  ['processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(trackingOrder.orderStatus)
                                    ? 'bg-[#0C3A2E]'
                                    : 'bg-[#E5E0D8]'
                                }`}></span>
                                <p className={`font-semibold text-xs uppercase tracking-wider ${
                                  ['processing', 'packed', 'shipped', 'out_for_delivery', 'delivered'].includes(trackingOrder.orderStatus)
                                    ? 'text-[#1A1A1A]'
                                    : 'text-[#1A1A1A]/40'
                                }`}>Handcrafting & Quality Verification</p>
                                <p className="text-[11px] text-[#1A1A1A]/50">Artisans performing final inspection and protective boxing.</p>
                              </div>

                              {/* Shipped */}
                              <div className="relative">
                                <span className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 border-2 border-white shadow-sm ${
                                  ['shipped', 'out_for_delivery', 'delivered'].includes(trackingOrder.orderStatus)
                                    ? 'bg-[#0C3A2E]'
                                    : 'bg-[#E5E0D8]'
                                }`}></span>
                                <p className={`font-semibold text-xs uppercase tracking-wider ${
                                  ['shipped', 'out_for_delivery', 'delivered'].includes(trackingOrder.orderStatus)
                                    ? 'text-[#1A1A1A]'
                                    : 'text-[#1A1A1A]/40'
                                }`}>In Transit</p>
                                <p className="text-[11px] text-[#1A1A1A]/50">Handed to carrier for direct delivery.</p>
                              </div>

                              {/* Delivered */}
                              <div className="relative">
                                <span className={`absolute -left-[31px] top-0.5 w-3.5 h-3.5 border-2 border-white shadow-sm ${
                                  trackingOrder.orderStatus === 'delivered' ? 'bg-[#2A7D6B]' : 'bg-[#E5E0D8]'
                                }`}></span>
                                <p className={`font-semibold text-xs uppercase tracking-wider ${trackingOrder.orderStatus === 'delivered' ? 'text-[#2A7D6B]' : 'text-[#1A1A1A]/40'}`}>Delivered</p>
                                <p className="text-[11px] text-[#1A1A1A]/50">Piece successfully received at your sanctuary.</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : orders.length === 0 ? (
                      <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 p-16 text-center text-[#1A1A1A]/60 space-y-4">
                        <ShoppingBag size={40} className="mx-auto text-[#1A1A1A]/30" />
                        <div>
                          <h4 className="text-[#1A1A1A] font-brand text-lg font-normal mb-1">No Orders Recorded</h4>
                          <p className="text-xs max-w-sm mx-auto font-light">Explore our curated collection of signature Indian decor pieces to begin.</p>
                        </div>
                        <Link 
                          href="/products" 
                          className="inline-flex items-center gap-2 px-6 py-3 bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white font-semibold text-xs uppercase tracking-[0.2em] transition"
                        >
                          <span>Explore Gallery</span>
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    ) : (
                      /* Orders List */
                      <div className="space-y-4">
                        {orders.map((ord: any) => (
                          <div 
                            key={ord.id || ord._id} 
                            className="bg-[#F9F6F0] border border-[#1A1A1A]/10 hover:border-[#0C3A2E] transition p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                          >
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-3">
                                <span className="font-brand font-semibold text-[#1A1A1A] text-base">
                                  #{(ord.id || ord._id || "").slice(-8).toUpperCase()}
                                </span>
                                <span className={`px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider border ${
                                  ord.orderStatus === 'delivered'
                                    ? 'bg-[#2A7D6B]/10 border-[#2A7D6B]/30 text-[#2A7D6B]'
                                    : ord.orderStatus === 'shipped'
                                    ? 'bg-[#0C3A2E]/10 border-[#0C3A2E]/30 text-[#0C3A2E]'
                                    : 'bg-[#D4AF37]/15 border-[#D4AF37]/40 text-[#8F6F12]'
                                }`}>
                                  {ord.orderStatus}
                                </span>
                              </div>
                              <p className="text-xs text-[#1A1A1A]/60">Ordered on: {new Date(ord.createdAt).toLocaleDateString('en-IN')}</p>
                              <p className="text-sm font-semibold text-[#1A1A1A] mt-1">₹{ord.totalPrice?.toLocaleString('en-IN')}</p>
                            </div>

                            <div className="flex gap-2.5 w-full md:w-auto">
                              <button 
                                onClick={() => setTrackingOrder(ord)}
                                className="flex-grow md:flex-grow-0 px-4 py-2.5 border border-[#0C3A2E] text-[#0C3A2E] hover:bg-[#0C3A2E] hover:text-white text-xs font-semibold uppercase tracking-wider transition"
                              >
                                Track
                              </button>
                              <Link 
                                href={`/dashboard/orders/${ord.id || ord._id}`}
                                className="flex-grow md:flex-grow-0 px-4 py-2.5 bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white text-xs font-semibold uppercase tracking-wider transition text-center"
                              >
                                View Details
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
                    <div className="border-b border-[#1A1A1A]/10 pb-4">
                      <h2 className="font-brand text-2xl text-[#1A1A1A] font-normal mb-1">Profile & Security Credentials</h2>
                      <p className="text-[#1A1A1A]/60 text-xs font-light">Update your personal contact details or modify your sign-in password.</p>
                    </div>

                    {/* Customer Info Form */}
                    <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 p-6 md:p-8 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                        <User size={16} className="text-[#0C3A2E]" />
                        <span>Personal Details</span>
                      </h3>
                      
                      <form onSubmit={handleUpdateProfile} className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Full Name</label>
                          <input 
                            type="text" 
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full bg-white border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                            placeholder="John Doe"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Contact Phone</label>
                          <input 
                            type="tel" 
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full bg-white border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                            placeholder="+91-9876543210"
                          />
                        </div>

                        <div className="space-y-1.5 md:col-span-2">
                          <label className="block text-[10px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Email Address</label>
                          <input 
                            type="email" 
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full bg-white border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                            placeholder="name@domain.com"
                          />
                        </div>

                        <div className="md:col-span-2 pt-2">
                          <button
                            type="submit"
                            disabled={profileLoading}
                            className="px-6 py-3 bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white font-semibold text-xs uppercase tracking-[0.15em] transition"
                          >
                            {profileLoading ? 'Updating...' : 'Save Profile Changes'}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Change Password Form */}
                    <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 p-6 md:p-8 space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-[#1A1A1A] flex items-center gap-2">
                        <Lock size={16} className="text-[#0C3A2E]" />
                        <span>Security & Password</span>
                      </h3>

                      <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Current Password</label>
                            <input 
                              type="password" 
                              value={passwordForm.currentPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                              className="w-full bg-white border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                              placeholder="••••••••"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">New Password</label>
                            <input 
                              type="password" 
                              value={passwordForm.newPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                              className="w-full bg-white border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                              placeholder="Min. 6 characters"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Confirm New Password</label>
                            <input 
                              type="password" 
                              value={passwordForm.confirmPassword}
                              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                              className="w-full bg-white border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                              placeholder="••••••••"
                            />
                          </div>
                        </div>

                        <div>
                          <button
                            type="submit"
                            disabled={passwordLoading}
                            className="px-6 py-3 bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white font-semibold text-xs uppercase tracking-[0.15em] transition"
                          >
                            {passwordLoading ? 'Updating...' : 'Update Password'}
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
                        <h2 className="font-brand text-2xl text-[#1A1A1A] font-normal">Saved Delivery Locations</h2>
                        <p className="text-[#1A1A1A]/60 text-xs mt-0.5">Manage your residential and business delivery destinations.</p>
                      </div>
                      <button 
                        onClick={openAddAddress}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white font-semibold text-xs uppercase tracking-wider transition"
                      >
                        <Plus size={14} />
                        <span>Add Location</span>
                      </button>
                    </div>

                    {addresses.length === 0 ? (
                      <div className="bg-[#F9F6F0] border border-[#1A1A1A]/10 p-16 text-center text-[#1A1A1A]/60 space-y-4">
                        <MapPin size={40} className="mx-auto text-[#1A1A1A]/30" />
                        <div>
                          <h4 className="text-[#1A1A1A] font-brand text-lg font-normal mb-1">No Locations Saved</h4>
                          <p className="text-xs max-w-sm mx-auto font-light">Add a delivery address to expedite your checkout experience.</p>
                        </div>
                        <button 
                          onClick={openAddAddress}
                          className="inline-flex items-center gap-1.5 px-6 py-3 bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white font-semibold text-xs uppercase tracking-[0.15em] transition"
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
                            className={`p-6 space-y-4 transition flex flex-col justify-between ${
                              addr.isDefault 
                                ? 'bg-white border-2 border-[#0C3A2E] shadow-sm' 
                                : 'bg-[#F9F6F0] border border-[#1A1A1A]/10 hover:border-[#0C3A2E]'
                            }`}
                          >
                            <div className="space-y-2">
                              <div className="flex justify-between items-start gap-2">
                                <h4 className="font-brand font-semibold text-[#1A1A1A] text-sm truncate">{addr.fullName}</h4>
                                {addr.isDefault && (
                                  <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#0C3A2E] text-[#D4AF37] text-[9px] font-bold uppercase tracking-wider">
                                    <Check size={9} />
                                    <span>Default</span>
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-light">
                                {addr.addressLine1}
                                {addr.addressLine2 && <span className="block mt-0.5">{addr.addressLine2}</span>}
                                <span className="block mt-0.5">{addr.city}, {addr.state} - <span className="font-semibold text-[#1A1A1A]">{addr.postalCode}</span></span>
                                <span className="block mt-0.5 text-[#1A1A1A]/50">{addr.country}</span>
                              </p>
                              <p className="text-xs text-[#1A1A1A]/70 flex items-center gap-1.5 pt-1.5">
                                <Phone size={12} className="text-[#0C3A2E]" />
                                <span>{addr.phone}</span>
                              </p>
                            </div>

                            <div className="flex items-center justify-between border-t border-[#1A1A1A]/10 pt-4 mt-2 gap-2">
                              {!addr.isDefault ? (
                                <button 
                                  onClick={() => handleSetDefaultAddress(addr)}
                                  className="text-[11px] text-[#0C3A2E] hover:underline transition font-semibold uppercase tracking-wider"
                                >
                                  Make Default
                                </button>
                              ) : (
                                <span className="text-[10px] text-[#2A7D6B] font-bold uppercase tracking-wider">Primary Location</span>
                              )}
                              
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => openEditAddress(addr)}
                                  className="text-[#1A1A1A]/60 hover:text-[#0C3A2E] p-1.5 transition"
                                  title="Edit Address"
                                >
                                  <Edit size={14} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteAddress(addr._id)}
                                  className="text-[#A85751]/70 hover:text-[#A85751] p-1.5 transition"
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
                    <div className="pb-4 border-b border-[#A85751]/20">
                      <h2 className="font-brand text-2xl text-[#A85751] font-normal">Danger Zone</h2>
                      <p className="text-[#1A1A1A]/60 text-xs font-light mt-0.5">Permanent account modifications. Actions taken here are irreversible.</p>
                    </div>

                    <div className="bg-[#A85751]/5 border border-[#A85751]/20 p-8 space-y-4">
                      <div className="flex gap-4 items-start">
                        <ShieldAlert className="text-[#A85751] shrink-0 mt-0.5" size={24} />
                        <div className="space-y-1">
                          <h4 className="font-brand text-lg text-[#1A1A1A] font-semibold">Delete Account Permanently</h4>
                          <p className="text-xs text-[#1A1A1A]/60 leading-relaxed max-w-xl font-light">
                            Deleting your account completely purges all saved shipping addresses, order histories, and personal credentials.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={() => {
                            setDeleteConfirmText('');
                            setDeleteModalOpen(true);
                          }}
                          className="px-6 py-3 bg-[#A85751] hover:bg-[#A85751]/90 text-white font-semibold text-xs uppercase tracking-[0.15em] transition shadow-sm"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#1A1A1A]/20 w-full max-w-lg overflow-hidden shadow-2xl"
          >
            <div className="bg-[#F9F6F0] px-6 py-4 border-b border-[#1A1A1A]/10 flex justify-between items-center">
              <h3 className="font-brand text-lg text-[#1A1A1A] font-normal">
                {addressModalMode === 'add' ? 'Add Delivery Destination' : 'Edit Delivery Destination'}
              </h3>
              <button 
                onClick={() => setAddressModalOpen(false)}
                className="text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition"
              >
                <X size={18} />
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
                    className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="Recipient Name"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Phone Number *</label>
                  <input 
                    type="tel" 
                    required
                    value={addressForm.phone}
                    onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                    className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
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
                    className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="Street, building name"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Address Line 2 (Area, Landmark)</label>
                  <input 
                    type="text" 
                    value={addressForm.addressLine2}
                    onChange={(e) => setAddressForm({ ...addressForm, addressLine2: e.target.value })}
                    className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="Area, landmark"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">City *</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.city}
                    onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                    className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="City"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">State *</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.state}
                    onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                    className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="State"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Postal Code (PIN) *</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.postalCode}
                    onChange={(e) => setAddressForm({ ...addressForm, postalCode: e.target.value })}
                    className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="PIN Code"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Country *</label>
                  <input 
                    type="text" 
                    required
                    value={addressForm.country}
                    onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                    className="w-full bg-[#F9F6F0] border border-[#1A1A1A]/15 focus:border-[#0C3A2E] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition"
                    placeholder="India"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <input 
                  type="checkbox" 
                  id="isDefault" 
                  checked={addressForm.isDefault}
                  onChange={(e) => setAddressForm({ ...addressForm, isDefault: e.target.checked })}
                  className="w-4 h-4 accent-[#0C3A2E] border-[#1A1A1A]/20"
                />
                <label htmlFor="isDefault" className="text-xs text-[#1A1A1A]/80 select-none cursor-pointer">
                  Designate as primary default delivery location
                </label>
              </div>

              <div className="border-t border-[#1A1A1A]/10 pt-4 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setAddressModalOpen(false)}
                  className="px-5 py-2.5 border border-[#1A1A1A]/20 text-[#1A1A1A]/70 hover:text-[#1A1A1A] text-xs font-semibold uppercase tracking-wider transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#0C3A2E] hover:bg-[#0C3A2E]/90 text-white font-semibold text-xs uppercase tracking-wider transition"
                >
                  {addressModalMode === 'add' ? 'Save Location' : 'Update Location'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border border-[#A85751]/30 w-full max-w-md overflow-hidden shadow-2xl"
          >
            <div className="bg-[#A85751]/10 px-6 py-4 border-b border-[#A85751]/20 flex justify-between items-center">
              <h3 className="font-brand text-lg text-[#A85751] font-normal flex items-center gap-2">
                <ShieldAlert size={18} />
                <span>Permanent Account Deletion</span>
              </h3>
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="text-[#1A1A1A]/60 hover:text-[#1A1A1A] transition"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-[#1A1A1A]/70 leading-relaxed font-light">
                This action is irreversible. Please type the exact confirmation phrase <span className="font-bold text-[#A85751] select-none">DELETE PERMANENTLY</span> below to proceed.
              </p>
              
              <div className="space-y-1.5">
                <label className="block text-[9px] text-[#1A1A1A]/60 uppercase font-bold tracking-wider">Confirmation Input</label>
                <input 
                  type="text" 
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full bg-[#F9F6F0] border border-[#A85751]/30 focus:border-[#A85751] px-4 py-2.5 text-xs text-[#1A1A1A] outline-none transition font-semibold"
                  placeholder="DELETE PERMANENTLY"
                />
              </div>

              <div className="border-t border-[#1A1A1A]/10 pt-4 flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="px-5 py-2.5 border border-[#1A1A1A]/20 text-[#1A1A1A]/70 hover:text-[#1A1A1A] text-xs font-semibold uppercase tracking-wider transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmText !== 'DELETE PERMANENTLY' || deleteLoading}
                  className="px-6 py-2.5 bg-[#A85751] hover:bg-[#A85751]/90 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs uppercase tracking-wider transition"
                >
                  {deleteLoading ? 'Deleting...' : 'Confirm Deletion'}
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
