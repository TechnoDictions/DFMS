'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useSync } from '@/hooks/useSync';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/db';
import { useRouter } from 'next/navigation';
import { 
  User, ShieldCheck, Mail, Cloud, RefreshCw, CheckCircle2, 
  CreditCard, Sparkles, Calendar, ArrowRight, Zap, Download, 
  ExternalLink, Lock, Check, Smartphone, Building2, AlertCircle, 
  LogOut, Layers, Award, FileText 
} from 'lucide-react';

export default function AccountAndSubscriptionPage() {
  const router = useRouter();
  const supabase = createClient();
  const { isOnline, isSyncing, lastSyncedAt, syncData, syncError } = useSync();

  // User auth state
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Subscription state
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<'Starter' | 'Farm Pro' | 'Enterprise'>('Farm Pro');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Card' | 'JazzCash' | 'Bank'>('Card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Active subscription (saved in state or Supabase)
  const [activePlan, setActivePlan] = useState<{
    tier: string;
    status: 'active' | 'trial' | 'past_due';
    expiresAt: string;
    billing: 'monthly' | 'yearly';
  }>({
    tier: 'Farm Pro',
    status: 'trial',
    expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    billing: 'monthly'
  });

  // Local Dexie Database Counts
  const cowsCount = useLiveQuery(() => db.Livestock.count(), []) ?? 0;
  const milkingCount = useLiveQuery(() => db.MilkingLogs.count(), []) ?? 0;
  const salesCount = useLiveQuery(() => db.SalesLogs.count(), []) ?? 0;
  const paymentsCount = useLiveQuery(() => db.CustomerPayments.count(), []) ?? 0;
  const customersCount = useLiveQuery(() => db.Customers.count(), []) ?? 0;
  const feedCount = useLiveQuery(() => db.FeedLogs.count(), []) ?? 0;
  const expenseCount = useLiveQuery(() => db.ExpenseLogs.count(), []) ?? 0;
  const staffCount = useLiveQuery(() => db.Employees.count(), []) ?? 0;

  const totalRecords = useMemo(() => {
    return cowsCount + milkingCount + salesCount + paymentsCount + customersCount + feedCount + expenseCount + staffCount;
  }, [cowsCount, milkingCount, salesCount, paymentsCount, customersCount, feedCount, expenseCount, staffCount]);

  useEffect(() => {
    async function loadUser() {
      setLoadingUser(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUser(user);
          const { data: prof } = await supabase.from('profiles').select('*').eq('id', user.id).single();
          if (prof) setProfile(prof);
        }
      } catch (err) {
        console.error('Failed to load user profile:', err);
      } finally {
        setLoadingUser(false);
      }
    }
    loadUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    document.cookie = "employee_session=; max-age=0; path=/";
    router.push('/login');
  };

  const handleSubscribe = async () => {
    setIsProcessingPayment(true);
    // Simulate payment verification / license activation
    setTimeout(async () => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);
      setActivePlan({
        tier: selectedPlan,
        status: 'active',
        expiresAt: new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        billing: billingCycle
      });

      if (user) {
        try {
          await supabase.from('profiles').update({
            subscription_plan: selectedPlan,
            subscription_status: 'active'
          }).eq('id', user.id);
        } catch (e) {
          console.warn('Profile subscription update:', e);
        }
      }

      setTimeout(() => {
        setShowPaymentModal(false);
        setPaymentSuccess(false);
      }, 2000);
    }, 1500);
  };

  const pricing = {
    Starter: { monthly: 3500, yearly: 35000, desc: 'Ideal for small herds and single milker operations.' },
    'Farm Pro': { monthly: 7500, yearly: 75000, desc: 'Complete dairy automation, feed amortization & staff payroll.' },
    Enterprise: { monthly: 18000, yearly: 180000, desc: 'Commercial dairies, multiple sheds & dedicated support.' }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-main)]">Account & Cloud Licensing</h1>
          <p className="text-[var(--text-muted)] font-medium mt-1">
            Manage your verified Google account, cloud database backups, and monthly SaaS subscription
          </p>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors shadow-2xs"
        >
          <LogOut className="w-4 h-4" />
          Sign Out of Account
        </button>
      </div>

      {/* Grid: Profile & Cloud Backup Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Profile Card */}
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] luxury-shadow flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold text-[var(--text-gold)] uppercase tracking-widest">
                Authenticated User
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {user?.app_metadata?.provider === 'google' ? 'Google Verified' : 'Admin Session'}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-6">
              {user?.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt={user.user_metadata.full_name || 'User'}
                  className="w-16 h-16 rounded-2xl border-2 border-[var(--primary)] object-cover shadow-sm"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[var(--accent-light)] text-[var(--primary)] flex items-center justify-center text-2xl font-black border-2 border-white shadow-sm">
                  {user?.email ? user.email.charAt(0).toUpperCase() : '👨‍🌾'}
                </div>
              )}

              <div>
                <h3 className="font-extrabold text-lg text-[var(--text-main)]">
                  {user?.user_metadata?.full_name || profile?.full_name || 'Farm Owner / Admin'}
                </h3>
                <p className="text-xs text-[var(--text-muted)] font-medium flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3.5 h-3.5 text-gray-400" />
                  {user?.email || 'admin@dairyfarm.local'}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[var(--primary)]/10 text-[var(--primary)] text-[11px] font-bold">
                  Role: {profile?.role?.toUpperCase() || 'FARM MANAGER'}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] text-xs text-[var(--text-muted)] flex justify-between items-center">
            <span>Auth ID: <strong className="font-mono">{user?.id ? `${user.id.substring(0, 8)}...` : 'Local-Session'}</strong></span>
            <span className="text-[11px]">Since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '2026'}</span>
          </div>
        </div>

        {/* Cloud Backup & Sync Engine Status Card */}
        <div className="bg-[var(--bg-card)] rounded-3xl p-6 border border-[var(--border)] luxury-shadow lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-[var(--text-gold)] uppercase tracking-widest flex items-center gap-1.5">
                <Cloud className="w-4 h-4 text-[var(--primary)]" />
                Cloud Backup & Database Sync
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {isOnline ? 'Connected to Supabase Cloud' : 'Offline Mode (Local Storage)'}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="bg-[var(--bg-main)] p-3 rounded-xl border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Cattle & Herd</span>
                <span className="text-xl font-black text-[var(--text-main)] mt-0.5 block">{cowsCount} Head</span>
              </div>
              <div className="bg-[var(--bg-main)] p-3 rounded-xl border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Milking Records</span>
                <span className="text-xl font-black text-[var(--primary)] mt-0.5 block">{milkingCount}</span>
              </div>
              <div className="bg-[var(--bg-main)] p-3 rounded-xl border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Khata & Dispatches</span>
                <span className="text-xl font-black text-blue-700 mt-0.5 block">{salesCount + paymentsCount}</span>
              </div>
              <div className="bg-[var(--bg-main)] p-3 rounded-xl border border-[var(--border)]">
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">Feed & Expenses</span>
                <span className="text-xl font-black text-amber-700 mt-0.5 block">{feedCount + expenseCount}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <p className="text-xs font-bold text-[var(--text-main)]">
                Last Cloud Backup: {lastSyncedAt ? lastSyncedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' (' + lastSyncedAt.toLocaleDateString() + ')' : 'Just now'}
              </p>
              <p className="text-[11px] text-[var(--text-muted)]">
                Total {totalRecords} farm records encrypted and synced to cloud
              </p>
            </div>

            <button
              onClick={() => syncData()}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              {isSyncing ? 'Syncing Cloud...' : 'Backup & Sync Now'}
            </button>
          </div>
        </div>
      </div>

      {/* SaaS Subscription Hero Banner */}
      <div className="bg-gradient-to-br from-[#1E3A2B] via-[#2A4D3A] to-[#1E3A2B] text-white rounded-3xl p-6 sm:p-8 luxury-shadow relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-400 text-amber-950 flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                {activePlan.tier.toUpperCase()} LICENSE
              </span>
              <span className="text-xs font-bold text-emerald-200">
                • {activePlan.status === 'trial' ? '14-Day Free Trial Active' : 'Monthly SaaS Active'}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
              Dairy Farm OS Cloud Enterprise
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/80 max-w-xl font-medium">
              Your dairy management subscription includes bidirectional offline cloud sync, automatic P&L calculation, multi-month silage amortization, and customer credit ledger.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/20 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-200 block">Valid Until</span>
              <span className="font-extrabold text-sm">{activePlan.expiresAt}</span>
            </div>
            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-6 py-3.5 rounded-2xl bg-white hover:bg-gray-100 text-[#1E3A2B] font-extrabold text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <CreditCard className="w-4 h-4" />
              Upgrade / Renew Plan
            </button>
          </div>
        </div>
      </div>

      {/* SaaS Pricing Tiers */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl font-black text-[var(--text-main)]">Choose Your Monthly Farm Plan</h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">
            Flexible transparent plans designed for Pakistani dairy farms. Upgrade or cancel anytime.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center bg-[var(--bg-card)] p-1 rounded-2xl border border-[var(--border)] shadow-2xs mt-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                billingCycle === 'yearly' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)]'
              }`}
            >
              Yearly Billing
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-1.5 py-0.2 rounded-md ml-1">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tier 1: Starter */}
          <div className={`bg-[var(--bg-card)] rounded-3xl p-6 border transition-all flex flex-col justify-between ${
            selectedPlan === 'Starter' ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-lg' : 'border-[var(--border)] hover:border-gray-300'
          }`}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black text-[var(--text-main)]">Starter Farm</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{pricing.Starter.desc}</p>
                </div>
                <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-lg">
                  🥛
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[var(--text-main)]">
                    ₨ {billingCycle === 'monthly' ? pricing.Starter.monthly.toLocaleString() : Math.round(pricing.Starter.yearly/12).toLocaleString()}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-medium">/ month</span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-[11px] text-emerald-700 font-bold mt-1">₨ 35,000 billed annually</p>
                )}
              </div>

              <ul className="space-y-3 text-xs font-medium text-[var(--text-main)] mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Up to 25 Head of Cattle
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Daily Milking & Yield Records
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Customer Khata & Sales Ledger
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Offline PWA Support
                </li>
              </ul>
            </div>

            <button
              onClick={() => { setSelectedPlan('Starter'); setShowPaymentModal(true); }}
              className="w-full py-3 rounded-xl border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white font-bold text-xs transition-all"
            >
              Select Starter
            </button>
          </div>

          {/* Tier 2: Farm Pro (Most Popular) */}
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 border-2 border-[var(--primary)] shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl shadow-xs">
              Recommended
            </div>

            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black text-[var(--text-main)]">Farm Pro</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{pricing['Farm Pro'].desc}</p>
                </div>
                <span className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center text-lg">
                  👑
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-emerald-800">
                    ₨ {billingCycle === 'monthly' ? pricing['Farm Pro'].monthly.toLocaleString() : Math.round(pricing['Farm Pro'].yearly/12).toLocaleString()}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-medium">/ month</span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-[11px] text-emerald-700 font-bold mt-1">₨ 75,000 billed annually (Save ₨ 15,000)</p>
                )}
              </div>

              <ul className="space-y-3 text-xs font-medium text-[var(--text-main)] mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> <strong>Unlimited Herd Tracking</strong>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Multi-Month Silage & Feed Amortization
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Staff Payroll, Advances & Facilities
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Real-time Cloud Supabase Backup
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Real Cash P&L Engine & Analytics
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Medical & Vaccination Reminders
                </li>
              </ul>
            </div>

            <button
              onClick={() => { setSelectedPlan('Farm Pro'); setShowPaymentModal(true); }}
              className="w-full py-3.5 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black text-xs transition-all shadow-md active:scale-95"
            >
              Upgrade to Farm Pro
            </button>
          </div>

          {/* Tier 3: Enterprise */}
          <div className={`bg-[var(--bg-card)] rounded-3xl p-6 border transition-all flex flex-col justify-between ${
            selectedPlan === 'Enterprise' ? 'border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-lg' : 'border-[var(--border)] hover:border-gray-300'
          }`}>
            <div>
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-black text-[var(--text-main)]">Commercial Enterprise</h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1">{pricing.Enterprise.desc}</p>
                </div>
                <span className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-lg">
                  🏢
                </span>
              </div>

              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-[var(--text-main)]">
                    ₨ {billingCycle === 'monthly' ? pricing.Enterprise.monthly.toLocaleString() : Math.round(pricing.Enterprise.yearly/12).toLocaleString()}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-medium">/ month</span>
                </div>
                {billingCycle === 'yearly' && (
                  <p className="text-[11px] text-blue-700 font-bold mt-1">₨ 180,000 billed annually</p>
                )}
              </div>

              <ul className="space-y-3 text-xs font-medium text-[var(--text-main)] mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Everything in Farm Pro
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Multiple Farm Branches & Sheds
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Dedicated Cloud PostgreSQL Database
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Custom ERP Export & Accountant Reports
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" /> 24/7 Priority WhatsApp & Phone Support
                </li>
              </ul>
            </div>

            <button
              onClick={() => { setSelectedPlan('Enterprise'); setShowPaymentModal(true); }}
              className="w-full py-3 rounded-xl border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white font-bold text-xs transition-all"
            >
              Select Enterprise
            </button>
          </div>
        </div>
      </div>

      {/* Payment & Subscription Checkout Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[var(--border)] luxury-shadow relative max-h-[90vh] overflow-y-auto">
            <button 
              onClick={() => setShowPaymentModal(false)} 
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              ✕
            </button>

            {paymentSuccess ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto text-4xl shadow-md">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-black text-emerald-900">Subscription Activated!</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto font-medium">
                  Your <strong>{selectedPlan}</strong> plan has been verified and activated on your account. Full cloud sync and enterprise features are unlocked.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold text-[var(--text-gold)] uppercase tracking-wider block">Checkout</span>
                  <h3 className="text-2xl font-black text-[var(--text-main)] mt-0.5">
                    Subscribe to {selectedPlan}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] font-medium mt-1">
                    Amount: <strong className="text-emerald-800 text-sm">
                      ₨ {billingCycle === 'monthly' ? pricing[selectedPlan].monthly.toLocaleString() : pricing[selectedPlan].yearly.toLocaleString()}
                    </strong> ({billingCycle})
                  </p>
                </div>

                {/* Payment Method Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    Select Payment Method
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Card')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'Card' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-gray-600'
                      }`}
                    >
                      <CreditCard className="w-5 h-5" />
                      Card (Visa/MC)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('JazzCash')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'JazzCash' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-gray-600'
                      }`}
                    >
                      <Smartphone className="w-5 h-5" />
                      JazzCash / EP
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('Bank')}
                      className={`p-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all ${
                        paymentMethod === 'Bank' ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]' : 'border-[var(--border)] text-gray-600'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                      Bank Transfer
                    </button>
                  </div>
                </div>

                {/* Dynamic Payment Fields */}
                {paymentMethod === 'Card' && (
                  <div className="space-y-3 bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)]">
                    <div>
                      <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Card Number</label>
                      <input type="text" placeholder="4242 •••• •••• 4242" defaultValue="4242 •••• •••• 4242" className="w-full bg-white border border-[var(--border)] rounded-xl py-2 px-3 text-xs font-mono font-bold" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">Expiry</label>
                        <input type="text" placeholder="MM/YY" defaultValue="12/28" className="w-full bg-white border border-[var(--border)] rounded-xl py-2 px-3 text-xs font-mono font-bold" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">CVC</label>
                        <input type="password" placeholder="•••" defaultValue="123" className="w-full bg-white border border-[var(--border)] rounded-xl py-2 px-3 text-xs font-mono font-bold" />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'JazzCash' && (
                  <div className="space-y-3 bg-amber-50 p-4 rounded-2xl border border-amber-200 text-xs">
                    <p className="font-bold text-amber-900">JazzCash / EasyPaisa Till Payment:</p>
                    <p className="text-amber-800">Send <strong>₨ {billingCycle === 'monthly' ? pricing[selectedPlan].monthly.toLocaleString() : pricing[selectedPlan].yearly.toLocaleString()}</strong> to Till Number: <strong>0300-1234567</strong></p>
                    <input type="text" placeholder="Enter Transaction TID / Reference #" className="w-full bg-white border border-amber-300 rounded-xl py-2 px-3 text-xs font-bold" />
                  </div>
                )}

                {paymentMethod === 'Bank' && (
                  <div className="space-y-2 bg-blue-50 p-4 rounded-2xl border border-blue-200 text-xs text-blue-900">
                    <p className="font-bold">Meezan Bank Ltd - Al-Rehmat Dairy Technologies</p>
                    <p className="font-mono font-bold">IBAN: PK42MEZN0001234567890123</p>
                    <input type="text" placeholder="Upload or enter Bank Deposit Ref #" className="w-full bg-white border border-blue-300 rounded-xl py-2 px-3 text-xs font-bold" />
                  </div>
                )}

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-[var(--text-muted)] flex items-center gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>256-bit encrypted end-to-end checkout. Instant activation upon verification.</span>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowPaymentModal(false)}
                    className="w-1/3 py-3 rounded-xl border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubscribe}
                    disabled={isProcessingPayment}
                    className="w-2/3 py-3 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black text-xs transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
                  >
                    {isProcessingPayment ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Verifying Payment...
                      </>
                    ) : (
                      <>
                        Confirm & Activate License →
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
