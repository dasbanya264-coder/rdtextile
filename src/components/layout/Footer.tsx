import { Link } from 'react-router-dom';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { MapPin, Instagram, Facebook, Mail, Phone, Download } from 'lucide-react';

export default function Footer() {
  const { settings } = useStoreSettings();
  return (
    <footer className="bg-stone-950 text-stone-300">
      <div className="border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <div className="col-span-1 lg:col-span-1">
              <Link to="/" className="flex flex-col gap-3 mb-6">
                <div className="w-16 h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-500 to-amber-300 shadow-md">
                  <img 
                    src="/rd_logo.jpg" 
                    alt="Ripan Saree Center Logo" 
                    className="w-full h-full object-cover rounded-full bg-stone-900 border border-white/20"
                    onError={(e) => {
                      e.currentTarget.src = settings?.logoUrl || "/logo.png";
                    }}
                  />
                </div>
                <div>
                  <span className="font-serif font-bold text-xl md:text-2xl tracking-wide text-white block">
                    Ripan Saree Center
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold mt-1 block">
                    Luxury Handloom Boutique
                  </span>
                </div>
              </Link>
              <p className="text-sm text-stone-400 mb-6 leading-relaxed">
                Discover the finest collection of authentic handloom sarees, blending traditional artistry with modern elegance. Curated specially for the woman of today.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-amber-500 hover:border-amber-500 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://www.facebook.com/61593564872730/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-amber-500 hover:border-amber-500 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-serif font-medium mb-6 tracking-wide text-lg">Shop Collection</h3>
              <ul className="space-y-3 text-sm text-stone-400">
                <li><Link to="/shop?category=tasar_jamdani" className="hover:text-amber-400 transition-colors">Tasar Jamdani (তসর জামদানি শাড়ি)</Link></li>
                <li><Link to="/shop?category=silk" className="hover:text-amber-400 transition-colors">Pure Silk Sarees (সিল্ক শাড়ি)</Link></li>
                <li><Link to="/shop" className="hover:text-amber-400 transition-colors">View All Sarees (সকল শাড়ি)</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-serif font-medium mb-6 tracking-wide text-lg">Customer Care</h3>
              <ul className="space-y-3 text-sm text-stone-400">
                <li><Link to="/profile" className="hover:text-amber-400 transition-colors">My Account</Link></li>
                <li><Link to="/profile" className="hover:text-amber-400 transition-colors">Track Order</Link></li>
                <li><Link to="/shipping" className="hover:text-amber-400 transition-colors">Shipping & Delivery</Link></li>
                <li><Link to="/returns" className="hover:text-amber-400 transition-colors">Returns & Exchanges</Link></li>
                <li><Link to="/faq" className="hover:text-amber-400 transition-colors">FAQs</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-serif font-medium mb-6 tracking-wide text-lg">Visit Us</h3>
              <ul className="space-y-4 text-sm text-stone-400">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-2">
                    <span>234, Soumendra Nath Thakur Rd<br/>Santipur, West Bengal – 741404</span>
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=234,+Soumendra+Nath+Thakur+Rd,+Santipur,+West+Bengal+741404" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 uppercase tracking-widest font-semibold transition-colors w-fit"
                    >
                      Get Directions &rarr;
                    </a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>+91 9064300941</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>rd919665@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Install App Banner in Footer */}
          <div className="mt-12 pt-8 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 bg-stone-900/50 p-5 rounded-2xl border border-stone-800">
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-11 h-11 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-amber-600 shrink-0">
                <img 
                  src="/rd_logo.jpg" 
                  alt="RD App" 
                  className="w-full h-full rounded-full object-cover border border-stone-900" 
                  onError={(e) => { e.currentTarget.src = "/logo.png"; }}
                />
              </div>
              <div>
                <h4 className="text-stone-100 font-serif font-bold text-sm sm:text-base">আমাদের অফিশিয়াল মোবাইল অ্যাপ ইনস্টল করুন</h4>
                <p className="text-xs text-stone-400 mt-0.5">সহজে শাড়ি দেখতে ও সরাসরি অর্ডার করতে আপনার ফোনে অ্যাপ ডাউনলোড করুন</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install'))}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2 whitespace-nowrap"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>ডাউনলোড অ্যাপ / Install</span>
            </button>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-stone-500 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Ripan Saree Center. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs text-stone-500 uppercase tracking-widest">
          <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
          <span className="w-1 h-1 bg-stone-700 rounded-full"></span>
          <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
