'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/navigation/Header';
import Footer from '@/components/navigation/Footer';
import { paymentService, orderService } from '@/lib/services';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import toast from 'react-hot-toast';

// ─── Card brand detection ───
function detectCardBrand(num: string): string {
  const n = num.replace(/\s/g, '');
  if (/^4/.test(n)) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  if (/^6(?:011|5)/.test(n)) return 'discover';
  if (/^35(?:2[89]|[3-8])/.test(n)) return 'jcb';
  if (/^3(?:0[0-5]|[68])/.test(n)) return 'diners';
  if (/^62/.test(n)) return 'unionpay';
  return 'card';
}

function getCardBrandLabel(brand: string): string {
  const labels: Record<string, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    jcb: 'JCB',
    diners: 'Diners Club',
    unionpay: 'UnionPay',
    card: 'Card',
  };
  return labels[brand] || 'Card';
}

function getCardBrandColor(brand: string): string {
  const colors: Record<string, string> = {
    visa: '#1A1F71',
    mastercard: '#EB001B',
    amex: '#006FCF',
    discover: '#FF6600',
    card: '#D4AF37',
  };
  return colors[brand] || '#D4AF37';
}

// ─── Format helpers ───
function formatCardNumber(value: string): string {
  const v = value.replace(/\D/g, '').substring(0, 16);
  const parts = [];
  for (let i = 0; i < v.length; i += 4) {
    parts.push(v.substring(i, i + 4));
  }
  return parts.join(' ');
}

function formatExpiry(value: string): string {
  const v = value.replace(/\D/g, '').substring(0, 4);
  if (v.length >= 3) return v.substring(0, 2) + ' / ' + v.substring(2);
  return v;
}

// ─── Validation ───
function luhnCheck(num: string): boolean {
  const digits = num.replace(/\D/g, '');
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = parseInt(digits[i], 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

// ─── Main content ───
function CardPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useStore();

  const orderId = searchParams?.get('orderId') || null;
  const amount = searchParams?.get('amount') || null;

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [transactionId, setTransactionId] = useState('');

  const rawNum = cardNumber.replace(/\s/g, '');
  const brand = detectCardBrand(rawNum);
  const brandLabel = getCardBrandLabel(brand);

  // Redirect if no orderId
  useEffect(() => {
    if (!orderId) {
      toast.error('No order found');
      router.push('/checkout');
    }
  }, [orderId, router]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    const raw = cardNumber.replace(/\s/g, '');
    if (!raw || raw.length < 13) {
      errs.cardNumber = 'Card number must be at least 13 digits';
    }
    if (!cardName.trim()) errs.cardName = 'Cardholder name is required';
    const expRaw = expiry.replace(/\D/g, '');
    if (expRaw.length < 4) {
      errs.expiry = 'Enter valid expiry (MM/YY)';
    } else {
      const month = parseInt(expRaw.substring(0, 2), 10);
      if (month < 1 || month > 12) errs.expiry = 'Invalid month';
    }
    if (!cvv || cvv.length < 3) errs.cvv = 'Enter valid CVV';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePay = async () => {
    if (!validate()) return;
    if (!orderId) return;

    setProcessing(true);
    try {
      // Simulate a brief processing delay for realistic UX
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const response = await paymentService.processCardPayment({
        orderId,
        cardLast4: rawNum.slice(-4),
        cardBrand: brand,
      });

      const txnId = response?.data?.transactionId || response?.transactionId || 'TXN_SUCCESS';
      setTransactionId(txnId);
      clearCart();
      setSuccess(true);

      // Redirect to success page after animation
      setTimeout(() => {
        router.push('/payment/success');
      }, 3000);
    } catch (err: any) {
      console.error('Card payment failed:', err);
      toast.error(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  // ─── Success state ───
  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto mt-12"
      >
        <div className="bg-[#1A2E20]/90 border border-[#D4AF37]/30 rounded-2xl p-10 text-center shadow-2xl backdrop-blur-md">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 mb-6"
          >
            <CheckCircle2 className="text-green-400" size={40} />
          </motion.div>
          <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
          <p className="text-gray-400 mb-4">
            Your payment of{' '}
            <span className="text-[#D4AF37] font-semibold">
              ₹{amount ? Number(amount).toLocaleString('en-IN') : '—'}
            </span>{' '}
            has been processed.
          </p>
          <div className="bg-[#111E16] border border-[#2A4734] rounded-xl p-4 text-xs text-gray-400 mb-6">
            <span className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Transaction ID</span>
            <span className="text-[#D4AF37] font-mono font-semibold text-sm select-all">{transactionId}</span>
          </div>
          <p className="text-xs text-gray-500">Redirecting to order confirmation...</p>
          <Loader2 className="animate-spin text-[#D4AF37] mx-auto mt-3" size={20} />
        </div>
      </motion.div>
    );
  }

  // ─── Card Payment Form ───
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-xl mx-auto"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center text-gray-400 hover:text-[#D4AF37] transition-colors text-sm group"
        >
          <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to checkout
        </button>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Lock size={12} className="text-green-400" />
          <span>256-bit SSL Encrypted</span>
        </div>
      </div>

      {/* Card Form */}
      <div className="bg-[#1A2E20]/90 border border-[#D4AF37]/15 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
        {/* Top banner */}
        <div className="bg-gradient-to-r from-[#243F2C] to-[#1A2E20] px-8 py-6 border-b border-[#D4AF37]/10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <CreditCard size={22} className="text-[#D4AF37]" />
                Card Payment
              </h1>
              <p className="text-xs text-gray-400 mt-1">Complete your secure payment</p>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-gray-500 uppercase font-bold">Amount</span>
              <span className="text-2xl font-extrabold text-[#D4AF37]">
                ₹{amount ? Number(amount).toLocaleString('en-IN') : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Visual Card Preview */}
        <div className="px-8 pt-8 pb-4">
          <div
            className="relative h-48 rounded-xl p-6 overflow-hidden transition-all duration-500"
            style={{
              background: `linear-gradient(135deg, ${getCardBrandColor(brand)}22, #111E16 60%, ${getCardBrandColor(brand)}11)`,
              border: `1px solid ${getCardBrandColor(brand)}33`,
            }}
          >
            {/* Decorative circles */}
            <div className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.05]"
              style={{ background: getCardBrandColor(brand), transform: 'translate(30%, -30%)' }}
            />
            <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full opacity-[0.03]"
              style={{ background: getCardBrandColor(brand), transform: 'translate(-20%, 20%)' }}
            />

            <div className="relative z-10 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="w-12 h-8 bg-gradient-to-br from-yellow-300/80 to-yellow-600/80 rounded-md" />
                <span className="text-sm font-bold uppercase tracking-wider text-gray-300">
                  {brandLabel}
                </span>
              </div>
              <div>
                <p className="text-xl font-mono tracking-[0.2em] text-white/90 mb-4">
                  {cardNumber || '•••• •••• •••• ••••'}
                </p>
                <div className="flex justify-between items-end">
                  <div>
                    <span className="block text-[9px] text-gray-500 uppercase font-bold">Card Holder</span>
                    <span className="text-sm font-semibold text-white/80 uppercase">
                      {cardName || 'YOUR NAME'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[9px] text-gray-500 uppercase font-bold">Expires</span>
                    <span className="text-sm font-semibold text-white/80">
                      {expiry || 'MM / YY'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="px-8 pb-8 space-y-5">
          {/* Card Number */}
          <div>
            <label className="block text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2">
              Card Number
            </label>
            <div className="relative">
              <input
                type="text"
                inputMode="numeric"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className={`w-full bg-[#111E16] border ${errors.cardNumber ? 'border-red-500/50' : 'border-[#2A4734]'} focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white text-sm outline-none transition font-mono tracking-wider pr-12`}
              />
              <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            </div>
            {errors.cardNumber && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.cardNumber}
              </p>
            )}
          </div>

          {/* Card Holder Name */}
          <div>
            <label className="block text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2">
              Cardholder Name
            </label>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="John Doe"
              className={`w-full bg-[#111E16] border ${errors.cardName ? 'border-red-500/50' : 'border-[#2A4734]'} focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white text-sm outline-none transition uppercase`}
            />
            {errors.cardName && (
              <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                <AlertCircle size={12} /> {errors.cardName}
              </p>
            )}
          </div>

          {/* Expiry + CVV */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2">
                Expiry Date
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM / YY"
                maxLength={7}
                className={`w-full bg-[#111E16] border ${errors.expiry ? 'border-red-500/50' : 'border-[#2A4734]'} focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white text-sm outline-none transition font-mono`}
              />
              {errors.expiry && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.expiry}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[11px] text-gray-400 uppercase font-bold tracking-wider mb-2">
                CVV
              </label>
              <input
                type="password"
                inputMode="numeric"
                value={cvv}
                onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').substring(0, 4))}
                placeholder="•••"
                maxLength={4}
                className={`w-full bg-[#111E16] border ${errors.cvv ? 'border-red-500/50' : 'border-[#2A4734]'} focus:border-[#D4AF37] rounded-xl px-4 py-3 text-white text-sm outline-none transition font-mono tracking-widest`}
              />
              {errors.cvv && (
                <p className="text-red-400 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {errors.cvv}
                </p>
              )}
            </div>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={processing}
            className="w-full bg-[#D4AF37] hover:bg-[#C9A52C] text-black py-4 rounded-xl font-bold text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-[#D4AF37]/10 mt-2"
          >
            {processing ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing Payment...
              </>
            ) : (
              <>
                <Lock size={18} />
                Pay ₹{amount ? Number(amount).toLocaleString('en-IN') : '—'}
              </>
            )}
          </button>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-6 pt-2">
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <ShieldCheck size={14} className="text-green-500/70" />
              <span>Secure Payment</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <Lock size={14} className="text-green-500/70" />
              <span>PCI Compliant</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
              <CheckCircle2 size={14} className="text-green-500/70" />
              <span>Verified</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page wrapper ───
export default function CardPaymentPage() {
  return (
    <div className="min-h-screen bg-[#1B2D20] text-[#F5F0E6] relative overflow-hidden">
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_center,rgba(37,61,44,0.4)_0%,rgba(27,45,32,1)_100%)] z-0 pointer-events-none" />
      <Header />
      <main className="pt-28 pb-20 px-4 relative z-10">
        <Suspense
          fallback={
            <div className="flex flex-col items-center justify-center min-h-[60vh]">
              <Loader2 className="animate-spin text-[#D4AF37] mb-4" size={40} />
              <p className="text-gray-400">Loading payment form...</p>
            </div>
          }
        >
          <CardPaymentContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
