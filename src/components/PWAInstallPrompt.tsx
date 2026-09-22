import { useState, useEffect } from 'react';
import { Download, Share, PlusSquare, X, Smartphone, CheckCircle } from 'lucide-react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showTopBar, setShowTopBar] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed as PWA)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if device is iOS
    const isIosDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    if (isIosDevice) {
      setIsIOS(true);
    }

    // Check if user already skipped the top bar in this session
    const skipped = sessionStorage.getItem('pwa-topbar-skipped');
    if (!skipped) {
      // Show the top bar when the link/app opens
      setShowTopBar(true);
    }

    const handler = (e: any) => {
      // Prevent automatic browser mini-bar
      e.preventDefault();
      // Stash the event for user action
      setDeferredPrompt(e);
      if (!sessionStorage.getItem('pwa-topbar-skipped')) {
        setShowTopBar(true);
      }
    };

    const handleOpenInstall = () => {
      if (isIOS) {
        setShowIOSModal(true);
      } else if (deferredPrompt) {
        deferredPrompt.prompt();
      } else {
        setShowTopBar(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('open-pwa-install', handleOpenInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
      window.removeEventListener('open-pwa-install', handleOpenInstall);
    };
  }, [isIOS, deferredPrompt]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowTopBar(false);
        sessionStorage.setItem('pwa-topbar-skipped', 'true');
      }
      setDeferredPrompt(null);
    } else {
      // Fallback alert / info for desktop or browsers without prompt event
      alert("অ্যাপটি ইনস্টল করতে আপনার ব্রাউজারের মেন্যু (৩ ডট) থেকে 'Install App' বা 'Add to Home Screen' এ ক্লিক করুন।");
    }
  };

  const handleSkip = () => {
    setShowTopBar(false);
    sessionStorage.setItem('pwa-topbar-skipped', 'true');
  };

  if (isInstalled) return null;

  return (
    <>
      {/* Top Browser Download / Install Bar */}
      {showTopBar && (
        <div className="w-full bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950 text-white border-b border-amber-500/60 shadow-lg px-3 sm:px-4 py-2 relative z-50 animate-in slide-in-from-top-3 duration-300">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2.5 sm:gap-4">
            
            {/* Left: RD Logo & Brand Details */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-amber-300 to-amber-600 shadow-sm">
                  <img 
                    src="/rd_logo.jpg" 
                    alt="RD Ripan Das Logo" 
                    className="w-full h-full object-cover rounded-full bg-stone-900 border border-white/20"
                    onError={(e) => {
                      e.currentTarget.src = "/logo.png";
                    }}
                  />
                </div>
              </div>
              <div className="min-w-0 truncate">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-serif font-bold text-xs sm:text-sm text-stone-100 tracking-wide truncate">
                    Ripan Saree Center (RD)
                  </h4>
                  <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-[10px] font-semibold">
                    <CheckCircle className="w-3 h-3 text-amber-400" />
                    Official App
                  </span>
                </div>
                <p className="text-[11px] sm:text-xs text-amber-200/85 truncate font-sans">
                  ব্রাউজারে সরাসরি অ্যাপ ইনস্টল করুন ও সহজে কেনাকাটা করুন
                </p>
              </div>
            </div>

            {/* Right: Download and Skip Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs shadow-md shadow-amber-500/20 active:scale-95 transition-all whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                <span>ডাউনলোড / Install</span>
              </button>

              <button
                type="button"
                onClick={handleSkip}
                className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 rounded-full bg-stone-800/90 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-medium border border-stone-700/60 transition-colors"
                title="Skip this prompt"
              >
                <span>স্কিপ</span>
                <X className="w-3.5 h-3.5 text-stone-400" />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* iOS Installation Instruction Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-300 p-6 flex flex-col items-center text-center animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 rounded-full p-1 bg-gradient-to-tr from-amber-500 to-amber-300 shadow-md my-2">
              <img 
                src="/rd_logo.jpg" 
                alt="RD Logo" 
                className="w-full h-full object-cover rounded-full bg-stone-900 border border-white"
                onError={(e) => { e.currentTarget.src = "/logo.png"; }}
              />
            </div>

            <h3 className="text-lg font-serif font-bold text-stone-900 mt-2">
              আইফোনে (iPhone) অ্যাপ ইনস্টল করুন
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              সাফারি (Safari) ব্রাউজার থেকে খুব সহজেই হোম স্ক্রিনে যুক্ত করুন:
            </p>

            <div className="bg-stone-50 rounded-2xl p-4 text-xs text-stone-700 border border-stone-200 text-left w-full space-y-3 mt-4">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">1</span>
                <span>সাফারি ব্রাউজারের নিচে বা উপরে <Share className="w-4 h-4 inline text-blue-600 mx-1 align-text-bottom" /> <strong>Share</strong> বাটনে চাপ দিন।</span>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-900 font-bold flex items-center justify-center text-[11px] shrink-0 mt-0.5">2</span>
                <span>মেন্যুটি স্ক্রোল করে <PlusSquare className="w-4 h-4 inline text-stone-800 mx-1 align-text-bottom" /> <strong>Add to Home Screen</strong> এ ক্লিক করুন।</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition"
            >
              বুঝেছি (Close)
            </button>
          </div>
        </div>
      )}
    </>
  );
}
