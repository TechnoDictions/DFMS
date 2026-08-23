'use client';

import { useState, useEffect } from 'react';
import { useSync } from '../hooks/useSync';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { 
  Cloud, CloudOff, RefreshCw, Download, Monitor, Smartphone, 
  X, CheckCircle2, ShieldCheck, LogOut, Sparkles, AlertCircle 
} from 'lucide-react';

export default function SyncAndInstallHeader() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const { isOnline, isSyncing, lastSyncedAt, syncData, syncError } = useSync();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    setMounted(true);

    // Capture PWA install prompt event
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    } else {
      setShowInstallModal(true);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    document.cookie = "employee_session=; max-age=0; path=/";
    router.push('/login');
  };

  // Prevent SSR Hydration mismatch by rendering a stable placeholder before mounting
  if (!mounted) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border border-[var(--border)] bg-[var(--bg-main)] text-[var(--text-muted)]">
          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
          <span className="hidden sm:inline">Connecting...</span>
        </div>

        <button
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 shadow-2xs"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Install App</span>
        </button>

        <div className="p-2 text-gray-400">
          <LogOut className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center gap-3">
        {/* Sync Status Button */}
        <button
          onClick={() => syncData()}
          disabled={isSyncing || !isOnline}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            !isOnline 
              ? 'bg-amber-50 text-amber-800 border-amber-200 cursor-not-allowed'
              : isSyncing 
              ? 'bg-blue-50 text-blue-800 border-blue-200' 
              : 'bg-[var(--bg-main)] text-[var(--text-main)] border-[var(--border)] hover:border-[var(--primary)]'
          }`}
          title={isOnline ? 'Tap to trigger instant cloud sync' : 'Currently offline'}
        >
          {isSyncing ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-blue-600" />
          ) : isOnline ? (
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          ) : (
            <CloudOff className="w-3.5 h-3.5 text-amber-600" />
          )}

          <span className="hidden sm:inline">
            {isSyncing ? 'Syncing...' : isOnline ? 'Cloud Synced' : 'Offline Mode'}
          </span>
        </button>

        {/* Install App Button */}
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20 border border-[var(--primary)]/20 transition-colors shadow-2xs"
          title="Install as Android APK or Windows Desktop App"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Install App</span>
        </button>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          title="Sign Out"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* App Install Modal (Windows & Android Guide) */}
      {showInstallModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--bg-card)] rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-[var(--border)] luxury-shadow relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setShowInstallModal(false)} className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors">
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-[var(--accent-light)] text-[var(--primary)] rounded-2xl flex items-center justify-center text-3xl mx-auto mb-3 shadow-md border-2 border-white">
                📲
              </div>
              <h2 className="text-2xl font-black text-[var(--text-main)]">Install Dairy Farm App</h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Install as a standalone software on Windows PC or native App on Android devices.
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {/* Android Card */}
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <Smartphone className="w-5 h-5 text-emerald-700" />
                  <h3 className="font-bold text-sm text-emerald-900">Android Phone / Tablet (APK / PWA)</h3>
                </div>
                <ol className="text-xs text-emerald-800 space-y-1.5 list-decimal list-inside font-medium">
                  <li>Open this web address in <strong>Google Chrome</strong> or <strong>Samsung Internet</strong>.</li>
                  <li>Tap the <strong>3 dots (⋮)</strong> menu icon at the top right of your browser.</li>
                  <li>Tap <strong>&quot;Install App&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                  <li>The app will install directly with full offline database and camera support!</li>
                </ol>
              </div>

              {/* Windows PC Card */}
              <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                <div className="flex items-center gap-2 mb-1.5">
                  <Monitor className="w-5 h-5 text-blue-700" />
                  <h3 className="font-bold text-sm text-blue-900">Windows PC / Desktop Software</h3>
                </div>
                <ol className="text-xs text-blue-800 space-y-1.5 list-decimal list-inside font-medium">
                  <li>In <strong>Microsoft Edge</strong> or <strong>Chrome</strong>, look at the URL address bar.</li>
                  <li>Click the <strong>Install App icon (⊕ or 💻)</strong> on the right side of the address bar.</li>
                  <li>Click <strong>&quot;Install&quot;</strong>. It launches in its own dedicated window and creates a Desktop shortcut!</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold py-3 rounded-xl transition-all shadow-md text-sm"
            >
              Got it, Done!
            </button>
          </div>
        </div>
      )}
    </>
  );
}
