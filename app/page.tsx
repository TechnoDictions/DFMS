'use client';

import Link from 'next/link';
import { useState } from 'react';
import { 
  Milk, Wheat, ReceiptText, Users, ShieldCheck, Zap, 
  CheckCircle2, ArrowRight, Smartphone, Monitor, Cloud, 
  Download, Sparkles, TrendingUp, ChevronRight, Activity, 
  Calendar, Award, Star, Check 
} from 'lucide-react';

export default function SaaSMarketingLandingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const pricing = {
    Starter: { monthly: 3500, yearly: 35000 },
    'Farm Pro': { monthly: 7500, yearly: 75000 },
    Enterprise: { monthly: 18000, yearly: 180000 },
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)] font-sans selection:bg-[var(--primary)] selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--accent-light)] text-[var(--primary)] rounded-xl flex items-center justify-center text-2xl shadow-sm border border-[var(--primary)]/20">
              🐄
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-[var(--text-main)] block leading-tight">
                Al-Rehmat <span className="text-[var(--text-gold)]">ERP</span>
              </span>
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                Dairy Farm Cloud OS
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-[var(--text-muted)]">
            <a href="#features" className="hover:text-[var(--text-main)] transition-colors">Features</a>
            <a href="#pnl-engine" className="hover:text-[var(--text-main)] transition-colors">P&L Engine</a>
            <a href="#offline-sync" className="hover:text-[var(--text-main)] transition-colors">Offline Sync</a>
            <a href="#pricing" className="hover:text-[var(--text-main)] transition-colors">Pricing</a>
            <a href="#download" className="hover:text-[var(--text-main)] transition-colors">Android & PC App</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2.5 text-xs font-bold text-[var(--text-main)] hover:bg-gray-100 rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login?signup=true"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
            >
              Start Free Trial <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-full max-w-5xl h-96 bg-gradient-to-tr from-[#1E3A2B]/15 via-[#B4975A]/10 to-transparent pointer-events-none rounded-full blur-3xl"></div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[var(--primary)] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Version 2.0 • Offline-First Dairy ERP & Cloud SaaS</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-[1.1] text-[var(--text-main)]">
              The Complete Operating System for <span className="text-[var(--primary)]">Modern Dairy Farms</span>
            </h1>

            <p className="text-base sm:text-lg text-[var(--text-muted)] font-medium leading-relaxed">
              Track milk yields, automate multi-month feed costs, manage customer credit khatas, and calculate real cash profit & loss — even without an internet connection.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/login?signup=true&plan=pro"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Start 14-Day Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[var(--bg-card)] hover:bg-gray-50 text-[var(--text-main)] border border-[var(--border)] font-bold text-sm shadow-sm transition-all"
              >
                Live Interactive Demo →
              </Link>
            </div>

            <p className="text-xs text-[var(--text-muted)] font-medium">
              ✨ No credit card required • Instant setup in 2 minutes • Works on any phone, tablet, or Windows PC
            </p>
          </div>

          {/* Interactive Live Dashboard Mockup */}
          <div className="mt-16 bg-[var(--bg-card)] rounded-3xl border border-[var(--border)] luxury-shadow p-6 sm:p-8 max-w-5xl mx-auto relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400"></div>
                <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
                <span className="text-xs font-bold text-[var(--text-muted)] ml-2">Al-Rehmat Command Center & Live P&L</span>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                Live Cloud Synced
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)]">
                <span className="text-xs font-bold text-[var(--text-gold)] uppercase tracking-wider block">Today Yield</span>
                <span className="text-2xl font-black text-[var(--text-main)] mt-1 block">840 Liters</span>
                <span className="text-[11px] text-emerald-600 font-bold">↑ 8.4% vs last week</span>
              </div>
              <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)]">
                <span className="text-xs font-bold text-[var(--text-gold)] uppercase tracking-wider block">Cash Collected</span>
                <span className="text-2xl font-black text-emerald-700 mt-1 block">₨ 142,500</span>
                <span className="text-[11px] text-[var(--text-muted)]">From Customer Khata</span>
              </div>
              <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)]">
                <span className="text-xs font-bold text-[var(--text-gold)] uppercase tracking-wider block">Active Silage Stock</span>
                <span className="text-2xl font-black text-amber-700 mt-1 block">120 Days</span>
                <span className="text-[11px] text-amber-800 font-bold">₨ 1,500/day amortized</span>
              </div>
              <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200">
                <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block">Farm Net Margin</span>
                <span className="text-2xl font-black text-emerald-800 mt-1 block">+₨ 87,200</span>
                <span className="text-[11px] text-emerald-700 font-bold">61.2% Real Margin</span>
              </div>
            </div>

            <div className="bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-4 text-xs font-bold">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                  ✓
                </span>
                <span>Active Milking Herd: <strong>48 / 62 Head</strong> • Colostrum Alerts: <strong>2 Due</strong></span>
              </div>
              <span className="text-[var(--primary)] flex items-center gap-1">
                Explore Full Interactive Software →
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Core Features Grid */}
      <section id="features" className="py-20 bg-[var(--bg-card)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-16">
            <h2 className="text-xs font-bold text-[var(--text-gold)] uppercase tracking-widest">
              Engineered For Dairy Farmers
            </h2>
            <h3 className="text-3xl sm:text-4xl font-black tracking-tight text-[var(--text-main)]">
              Everything Needed to Run a Profitable Dairy Operation
            </h3>
            <p className="text-sm text-[var(--text-muted)] font-medium">
              Eliminate paper registers, missing milk logs, untracked feed expenses, and customer credit confusion.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] space-y-4 hover:border-[var(--primary)] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[var(--primary)] flex items-center justify-center text-2xl font-black">
                🥛
              </div>
              <h4 className="text-xl font-black text-[var(--text-main)]">Milk Production & Yield Leaderboards</h4>
              <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                Log morning and evening yields in seconds. Auto-rank highest producing cows and identify sudden yield drops before disease spreads.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] space-y-4 hover:border-[var(--primary)] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-2xl font-black">
                🌾
              </div>
              <h4 className="text-xl font-black text-[var(--text-main)]">Multi-Month Silage & Feed Amortization</h4>
              <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                Prepared a 4-month silage pit or bought seasonal sorghum? The system automatically amortizes the cost daily instead of falsely showing a huge 1-day loss.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] space-y-4 hover:border-[var(--primary)] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center text-2xl font-black">
                📒
              </div>
              <h4 className="text-xl font-black text-[var(--text-main)]">Customer Khata & Credit Accounts</h4>
              <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                Customers buy daily and pay weekly/monthly. Keep full ledger of dispatched liters, record cash receipts, and track remaining debt balances effortlessly.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] space-y-4 hover:border-[var(--primary)] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center text-2xl font-black">
                💉
              </div>
              <h4 className="text-xl font-black text-[var(--text-main)]">Medical, Calving & Vaccine Tasks</h4>
              <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                Schedule FMD, Anthrax, and Deworming tasks. Get automated alerts 30 days before calving to transition cows to dry and colostrum stages.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] space-y-4 hover:border-[var(--primary)] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center text-2xl font-black">
                👥
              </div>
              <h4 className="text-xl font-black text-[var(--text-main)]">Staff Payroll, Advances & Facilities</h4>
              <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                Manage milkers, feeders, and security staff. Track salary disbursals, monthly advance loans, and non-cash perks (wheat/milk ration).
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-8 rounded-3xl bg-[var(--bg-main)] border border-[var(--border)] space-y-4 hover:border-[var(--primary)] transition-all">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center text-2xl font-black">
                ⚡
              </div>
              <h4 className="text-xl font-black text-[var(--text-main)]">100% Offline-First Cloud Sync</h4>
              <p className="text-xs text-[var(--text-muted)] font-medium leading-relaxed">
                Works seamlessly in remote barns with zero cellular signal. All data is saved on device and auto-syncs securely to Supabase PostgreSQL when connected.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SaaS Pricing Section */}
      <section id="pricing" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center space-y-4 max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-[var(--text-gold)] uppercase tracking-widest">
            Affordable Farm SaaS
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[var(--text-main)]">
            Simple Monthly Pricing for Any Farm Size
          </h2>
          <p className="text-sm text-[var(--text-muted)] font-medium">
            Start with our 14-day full feature free trial. No credit card required.
          </p>

          <div className="inline-flex items-center bg-[var(--bg-card)] p-1.5 rounded-2xl border border-[var(--border)] shadow-sm mt-4">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                billingCycle === 'monthly' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)]'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-[var(--text-muted)]'
              }`}
            >
              Annual Billing
              <span className="bg-amber-400 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-md">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
          {/* Starter */}
          <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border)] flex flex-col justify-between hover:border-gray-300 transition-all">
            <div>
              <h3 className="text-xl font-black text-[var(--text-main)]">Starter Farm</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">For small local sheds and family farms.</p>
              
              <div className="my-6">
                <span className="text-4xl font-black text-[var(--text-main)]">
                  ₨ {billingCycle === 'monthly' ? pricing.Starter.monthly.toLocaleString() : Math.round(pricing.Starter.yearly/12).toLocaleString()}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium"> / month</span>
              </div>

              <ul className="space-y-3.5 text-xs font-medium text-[var(--text-main)] mb-8">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Up to 25 Head of Cattle</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Milking Yield Recording</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Customer Khata & Billing</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> PWA Mobile App Support</li>
              </ul>
            </div>

            <Link
              href="/login?signup=true&plan=starter"
              className="w-full py-3.5 rounded-xl border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white font-bold text-xs text-center transition-all"
            >
              Start Free Trial →
            </Link>
          </div>

          {/* Farm Pro */}
          <div className="bg-[var(--bg-card)] rounded-3xl p-8 border-2 border-[var(--primary)] shadow-2xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl">
              Most Popular
            </div>

            <div>
              <h3 className="text-xl font-black text-[var(--text-main)]">Farm Pro</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">Complete commercial automation & P&L intelligence.</p>
              
              <div className="my-6">
                <span className="text-4xl font-black text-emerald-800">
                  ₨ {billingCycle === 'monthly' ? pricing['Farm Pro'].monthly.toLocaleString() : Math.round(pricing['Farm Pro'].yearly/12).toLocaleString()}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium"> / month</span>
              </div>

              <ul className="space-y-3.5 text-xs font-medium text-[var(--text-main)] mb-8">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> <strong>Unlimited Herd & Livestock</strong></li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Feed Amortization Engine</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Real Cash P&L Accounting</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Staff Payroll & Advances</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Multi-Device Cloud Backup</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Medical & Vaccination Reminders</li>
              </ul>
            </div>

            <Link
              href="/login?signup=true&plan=pro"
              className="w-full py-4 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-black text-xs text-center shadow-md transition-all active:scale-95"
            >
              Start 14-Day Free Pro Trial →
            </Link>
          </div>

          {/* Enterprise */}
          <div className="bg-[var(--bg-card)] rounded-3xl p-8 border border-[var(--border)] flex flex-col justify-between hover:border-gray-300 transition-all">
            <div>
              <h3 className="text-xl font-black text-[var(--text-main)]">Commercial Enterprise</h3>
              <p className="text-xs text-[var(--text-muted)] mt-1">For multi-farm operations and dairy conglomerates.</p>
              
              <div className="my-6">
                <span className="text-4xl font-black text-[var(--text-main)]">
                  ₨ {billingCycle === 'monthly' ? pricing.Enterprise.monthly.toLocaleString() : Math.round(pricing.Enterprise.yearly/12).toLocaleString()}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-medium"> / month</span>
              </div>

              <ul className="space-y-3.5 text-xs font-medium text-[var(--text-main)] mb-8">
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Everything in Farm Pro</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Multiple Farm Sheds & Locations</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Dedicated PostgreSQL Database</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> Custom Financial & Tax Exports</li>
                <li className="flex items-center gap-2"><Check className="w-4 h-4 text-emerald-600" /> 24/7 Priority Phone/WhatsApp Support</li>
              </ul>
            </div>

            <Link
              href="/login?signup=true&plan=enterprise"
              className="w-full py-3.5 rounded-xl border border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white font-bold text-xs text-center transition-all"
            >
              Contact Enterprise Sales →
            </Link>
          </div>
        </div>
      </section>

      {/* Download Software / Mobile App Section */}
      <section id="download" className="py-16 bg-[var(--bg-card)] border-t border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <span className="text-xs font-bold text-[var(--text-gold)] uppercase tracking-wider">Install Anywhere</span>
            <h2 className="text-3xl font-black text-[var(--text-main)]">Install as Desktop Software or Android App</h2>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] font-medium">
              No need to rely on app stores. Install directly to your Windows desktop with 1-click or add to your Android home screen as an offline APK.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)]">
              <Monitor className="w-8 h-8 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[var(--text-main)]">Windows PC Software</p>
                <p className="text-[11px] text-[var(--text-muted)]">Edge & Chrome 1-Click Install</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-[var(--bg-main)] p-4 rounded-2xl border border-[var(--border)]">
              <Smartphone className="w-8 h-8 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[var(--text-main)]">Android Phone & Tablet</p>
                <p className="text-[11px] text-[var(--text-muted)]">Instant Offline APK / PWA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span>🐄</span>
            <strong className="text-[var(--text-main)]">Al-Rehmat Dairy Technologies</strong> • Cloud Dairy OS
          </div>
          <div className="flex gap-6 font-bold">
            <Link href="/login" className="hover:text-[var(--text-main)]">Admin Login</Link>
            <Link href="/login" className="hover:text-[var(--text-main)]">Employee Kiosk</Link>
            <a href="#pricing" className="hover:text-[var(--text-main)]">SaaS Subscriptions</a>
          </div>
          <p>© 2026 Al-Rehmat ERP. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
