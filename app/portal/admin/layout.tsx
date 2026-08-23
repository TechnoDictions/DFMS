import Link from 'next/link';
import { Home, Users, Settings, Activity, LayoutDashboard, LogOut, LineChart, BadgeDollarSign, UserSquare2, Syringe, Wheat, ReceiptText } from 'lucide-react';
import SyncAndInstallHeader from '@/components/SyncAndInstallHeader';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen bg-[var(--bg-main)]">
      {/* Sidebar */}
      <aside className="w-64 bg-[var(--bg-card)] border-r border-[var(--border)] flex flex-col hidden md:flex">
        <div className="h-20 flex items-center px-6 border-b border-[var(--border)] gap-3">
          <div className="w-8 h-8 flex items-center justify-center bg-[var(--accent-light)] rounded-lg text-xl luxury-shadow">
            🐄
          </div>
          <span className="text-lg font-black tracking-tight text-[var(--text-main)]">
            Al-Rehmat <span className="text-[var(--text-gold)]">ERP</span>
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <Link href="/portal/admin/dashboard" className="flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl text-[var(--text-main)] bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10 transition-colors">
            <LayoutDashboard className="w-5 h-5 text-[var(--primary)]" />
            Dashboard & P&L
          </Link>
          <Link href="/portal/admin/analytics" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-gray-50 transition-colors">
            <LineChart className="w-5 h-5" />
            Analytics Hub
          </Link>
          
          <div className="pt-4 pb-2 px-4 text-xs font-bold text-[var(--text-gold)] uppercase tracking-wider">
            Herd Operations
          </div>
          <Link href="/portal/admin/milking" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-gray-50 transition-colors">
            <Activity className="w-5 h-5" />
            Milking
          </Link>
          <Link href="/portal/admin/cows" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-gray-50 transition-colors">
            <Activity className="w-5 h-5" />
            Livestock Directory
          </Link>
          <Link href="/portal/admin/tasks" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-gray-50 transition-colors">
            <Syringe className="w-5 h-5" />
            Medical & Tasks
          </Link>

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-[var(--text-gold)] uppercase tracking-wider">
            Feed & Expenses
          </div>
          <Link href="/portal/admin/feed" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-gray-50 transition-colors">
            <Wheat className="w-5 h-5 text-amber-600" />
            Feed Management
          </Link>
          <Link href="/portal/admin/expenses" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-gray-50 transition-colors">
            <ReceiptText className="w-5 h-5 text-rose-600" />
            Farm Expenses
          </Link>

          <div className="pt-4 pb-2 px-4 text-xs font-bold text-[var(--text-gold)] uppercase tracking-wider">
            Commerce & Staff
          </div>
          <Link href="/portal/admin/customers" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-gray-50 transition-colors">
            <UserSquare2 className="w-5 h-5" />
            Customers & Khata
          </Link>
          <Link href="/portal/admin/sales" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-gray-50 transition-colors">
            <BadgeDollarSign className="w-5 h-5" />
            Sales Dispatch
          </Link>
          <Link href="/portal/admin/employee" className="flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-gray-50 transition-colors">
            <Users className="w-5 h-5" />
            Staff & Payroll
          </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-20 flex items-center justify-between px-8 bg-[var(--bg-card)]/80 backdrop-blur-md border-b border-[var(--border)] sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-bold uppercase tracking-widest text-white bg-[var(--primary)] rounded-full">Admin</span>
            <h2 className="text-lg font-bold text-[var(--text-main)] ml-2">Command Center</h2>
          </div>
          
          <SyncAndInstallHeader />
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
