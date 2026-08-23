import Link from 'next/link';
import { Milk, Activity, LogOut } from 'lucide-react';
import SyncAndInstallHeader from '@/components/SyncAndInstallHeader';

export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col">
      {/* Top Navbar */}
      <header className="h-20 bg-[var(--bg-card)] border-b border-[var(--border)] flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center bg-[var(--primary)]/10 text-[var(--primary)] rounded-xl text-xl">
            👨‍🌾
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-[var(--text-main)] block leading-tight">
              Farm Station
            </span>
            <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Data Entry Kiosk
            </span>
          </div>
        </div>
        
        <SyncAndInstallHeader />
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        <div className="max-w-4xl mx-auto space-y-8">
          {children}
        </div>
      </main>

      {/* Bottom Navigation for Mobile / Tablet Kiosk */}
      <nav className="bg-[var(--bg-card)] border-t border-[var(--border)] p-4 flex gap-4 sm:hidden pb-safe">
        <Link href="/portal/employee/milking" className="flex-1 bg-[var(--bg-main)] border border-[var(--border)] rounded-xl p-3 flex flex-col items-center gap-1 text-[var(--primary)]">
          <Milk className="w-6 h-6" />
          <span className="text-xs font-bold">Milking</span>
        </Link>
        <Link href="/portal/employee/medical" className="flex-1 bg-[var(--bg-main)] border border-[var(--border)] rounded-xl p-3 flex flex-col items-center gap-1 text-[var(--accent)]">
          <Activity className="w-6 h-6" />
          <span className="text-xs font-bold">Medical</span>
        </Link>
      </nav>
    </div>
  )
}
