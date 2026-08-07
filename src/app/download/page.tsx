"use client";

import { useEffect, useState } from "react";
import { 
  Download, 
  Smartphone, 
  Laptop, 
  Share2, 
  PlusSquare, 
  ArrowLeft, 
  CheckCircle2, 
  Info, 
  Monitor,
  ExternalLink
} from "lucide-react";
import Link from "next/link";

export default function DownloadPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState<"desktop" | "ios" | "android">("desktop");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Detect platform for default tab selection
    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent.toLowerCase() : "";
    if (userAgent.includes("iphone") || userAgent.includes("ipad") || userAgent.includes("ipod")) {
      setActiveTab("ios");
    } else if (userAgent.includes("android")) {
      setActiveTab("android");
    } else {
      setActiveTab("desktop");
    }

    // Check if already running in standalone mode (installed PWA)
    const isStandalone = 
      window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt) {
      alert("Installation shortcut is not available. Please install manually using your browser menu.");
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  if (!isClient) {
    return (
      <div className="min-h-screen bg-[#f8f5ee] flex items-center justify-center">
        <div className="text-dark-400 font-bold uppercase tracking-widest text-xs">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f5ee] text-dark-900 flex flex-col p-6 md:p-12 selection:bg-brand-gold/20">
      
      {/* Header Navigation */}
      <div className="max-w-4xl w-full mx-auto mb-8 flex justify-between items-center">
        <Link 
          href="/" 
          className="flex items-center gap-2 px-4 py-2 rounded-full border border-gold-200 bg-white/50 backdrop-blur-sm text-xs font-bold uppercase tracking-widest text-dark-600 transition-all hover:bg-gold-50 hover:-translate-x-0.5"
        >
          <ArrowLeft size={14} /> Back to POS
        </Link>
        <div className="text-[10px] font-bold text-dark-400 uppercase tracking-widest">
          Version 1.0.0 (PWA)
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto bg-white border border-gold-100 rounded-3xl p-8 md:p-12 shadow-xl flex flex-col md:flex-row gap-12 items-center">
        
        {/* Left Side: App Branding & Action */}
        <div className="flex-1 text-center md:text-left flex flex-col items-center md:items-start">
          <div className="w-24 h-24 rounded-2xl bg-brand-gold flex items-center justify-center font-bold text-white text-4xl tracking-tighter shadow-lg mb-8 relative overflow-hidden group">
            GR
            <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent pointer-events-none" />
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold tracking-widest uppercase text-dark-900 mb-4 text-center md:text-left">
            NMG PhotoShop
          </h1>
          
          <p className="text-sm text-dark-500 font-medium leading-relaxed mb-8 max-w-md text-center md:text-left">
            Install the point-of-sale system on your home screen for rapid access, full screen operation, and improved performance.
          </p>

          {/* Dynamic Install Button State */}
          {isInstalled ? (
            <div className="flex items-center gap-3 px-6 py-4 bg-emerald-50 text-emerald-800 rounded-2xl border border-emerald-100 w-full max-w-sm">
              <CheckCircle2 className="text-emerald-500 shrink-0" size={24} />
              <div className="text-left">
                <p className="text-sm font-bold tracking-wide uppercase">App Installed</p>
                <p className="text-[10px] text-emerald-600 font-bold uppercase">Running as Standalone App</p>
              </div>
            </div>
          ) : isInstallable ? (
            <button
              onClick={triggerInstall}
              className="flex items-center justify-center gap-3 px-8 py-5 bg-brand-gold hover:bg-gold-600 text-white rounded-2xl font-bold uppercase tracking-widest text-xs shadow-lg transition-all w-full max-w-sm hover:-translate-y-0.5"
            >
              <Download size={18} /> Install Application
            </button>
          ) : (
            <div className="flex flex-col gap-2 w-full max-w-sm">
              <button
                disabled
                className="flex items-center justify-center gap-3 px-8 py-5 bg-gold-100 text-dark-400 rounded-2xl font-bold uppercase tracking-widest text-xs cursor-not-allowed w-full"
              >
                <Download size={18} /> Install from Browser Bar
              </button>
              <div className="flex items-start gap-2 text-[10px] font-bold text-dark-400 uppercase tracking-widest text-left mt-2">
                <Info size={12} className="shrink-0 mt-0.5" />
                <span>Use the browser's install option or follow the instructions below.</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Install Instructions */}
        <div className="flex-1 w-full bg-gold-50/50 border border-gold-100 rounded-2xl p-6 md:p-8 flex flex-col">
          <h2 className="text-xs font-bold uppercase tracking-widest text-dark-500 mb-6">
            Installation Guides
          </h2>

          {/* Tab Selector */}
          <div className="flex border-b border-gold-200 mb-6">
            <button
              onClick={() => setActiveTab("desktop")}
              className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
                activeTab === "desktop"
                  ? "border-brand-gold text-brand-gold"
                  : "border-transparent text-dark-400 hover:text-dark-600"
              }`}
            >
              <Laptop size={14} /> Desktop
            </button>
            <button
              onClick={() => setActiveTab("android")}
              className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
                activeTab === "android"
                  ? "border-brand-gold text-brand-gold"
                  : "border-transparent text-dark-400 hover:text-dark-600"
              }`}
            >
              <Smartphone size={14} /> Android
            </button>
            <button
              onClick={() => setActiveTab("ios")}
              className={`flex items-center gap-2 pb-3 px-1 text-xs font-bold uppercase tracking-widest border-b-2 transition-all ${
                activeTab === "ios"
                  ? "border-brand-gold text-brand-gold"
                  : "border-transparent text-dark-400 hover:text-dark-600"
              }`}
            >
              <Smartphone size={14} /> iOS / Apple
            </button>
          </div>

          {/* Guide Content */}
          <div className="flex-1">
            {activeTab === "desktop" && (
              <div className="flex flex-col gap-6 text-sm text-dark-600">
                <p className="font-medium text-dark-500">To install on macOS, Windows, or Linux:</p>
                <ol className="flex flex-col gap-4 list-decimal pl-4">
                  <li>
                    Open this page in <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.
                  </li>
                  <li>
                    Look at the right side of the address bar for the install icon <Download size={14} className="inline mx-1 text-brand-gold" />.
                  </li>
                  <li>
                    Click the install icon and choose <strong>Install</strong> when prompted.
                  </li>
                  <li>
                    A desktop shortcut will be created automatically.
                  </li>
                </ol>
              </div>
            )}

            {activeTab === "android" && (
              <div className="flex flex-col gap-6 text-sm text-dark-600">
                <p className="font-medium text-dark-500">To install on an Android tablet or phone:</p>
                <ol className="flex flex-col gap-4 list-decimal pl-4">
                  <li>
                    Open this page in <strong>Google Chrome</strong>.
                  </li>
                  <li>
                    Tap the <strong>three dots menu</strong> in the top right corner of Chrome.
                  </li>
                  <li>
                    Tap <strong>Install app</strong> (or <strong>Add to Home screen</strong>).
                  </li>
                  <li>
                    Confirm by tapping <strong>Install</strong> in the dialog.
                  </li>
                </ol>
              </div>
            )}

            {activeTab === "ios" && (
              <div className="flex flex-col gap-6 text-sm text-dark-600">
                <p className="font-medium text-dark-500">To install on an iPad or iPhone (Safari required):</p>
                <ol className="flex flex-col gap-4 list-decimal pl-4">
                  <li>
                    Open this page in the native <strong>Safari</strong> browser.
                  </li>
                  <li>
                    Tap the <strong>Share</strong> button <Share2 size={14} className="inline mx-1 text-brand-gold" /> in the bottom navigation toolbar (iPad top bar).
                  </li>
                  <li>
                    Scroll down and tap <strong>Add to Home Screen</strong> <PlusSquare size={14} className="inline mx-1 text-brand-gold" />.
                  </li>
                  <li>
                    Verify the name <strong>NMG PhotoShop</strong> and tap <strong>Add</strong> in the top-right corner.
                  </li>
                </ol>
              </div>
            )}
          </div>
        </div>

      </main>

      {/* Footer Info */}
      <div className="max-w-4xl w-full mx-auto mt-12 text-center text-[10px] font-bold text-dark-400 uppercase tracking-widest">
        NMG PhotoShop is built with secure offline-first caching via Serwist.
      </div>
    </div>
  );
}
