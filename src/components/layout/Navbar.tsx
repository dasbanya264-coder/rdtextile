import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, User, Heart, Download } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useStoreSettings } from '../../hooks/useStoreSettings';
import { useState } from 'react';

export default function Navbar() {
  const { totalItems } = useCart();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { settings } = useStoreSettings();

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-stone-900 text-stone-100 py-1.5 text-center text-xs font-sans tracking-widest uppercase relative z-50">
        Premium Saree Collection
      </div>
      <nav className="bg-white/90 backdrop-blur-xl border-b border-stone-200 sticky w-full z-50 top-0 transition-all duration-300 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[72px]">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden text-stone-600 hover:text-amber-600 transition-colors p-2 -ml-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/rd_logo.jpg" 
                alt="Ripan Saree Center Logo" 
                className="w-12 h-12 object-cover rounded-full shadow-sm border-2 border-amber-500/50 ring-2 ring-amber-100"
                onError={(e) => {
                  e.currentTarget.src = settings?.logoUrl || "/logo.png";
                }}
              />
              <div className="hidden w-12 h-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm">
                RD
              </div>
              <div className="flex flex-col">
                <span className="font-serif font-bold text-xl md:text-2xl tracking-wide text-stone-900 leading-none">
                  Ripan Saree Center
                </span>
                <span className="text-[10px] uppercase tracking-widest text-amber-700 font-semibold mt-1 hidden sm:block">
                  Luxury Handloom Boutique
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8 ml-8">
              <Link to="/" className="text-sm font-medium text-stone-600 hover:text-amber-600 transition-colors tracking-wide uppercase">Home</Link>
              <Link to="/shop" className="text-sm font-medium text-stone-600 hover:text-amber-600 transition-colors tracking-wide uppercase">Shop All</Link>
              <Link to="/shop?category=silk" className="text-sm font-medium text-stone-600 hover:text-amber-600 transition-colors tracking-wide uppercase">Silk</Link>
              <Link to="/shop?category=wedding" className="text-sm font-medium text-stone-600 hover:text-amber-600 transition-colors tracking-wide uppercase">Wedding</Link>
            </div>

            <div className="flex-1"></div>

            {/* Icons */}
            <div className="flex items-center gap-3 sm:gap-5">
              <div className="hidden md:flex relative group mr-2">
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as typeof e.target & { search: { value: string } };
                  if (target.search.value.trim()) navigate(`/shop?search=${encodeURIComponent(target.search.value.trim())}`);
                }}>
                  <input
                    type="text"
                    name="search"
                    placeholder="Search..."
                    className="w-48 pl-10 pr-4 py-1.5 rounded-full border border-stone-200 bg-stone-50 focus:outline-none focus:border-amber-400 focus:bg-white focus:w-64 transition-all duration-300 text-sm"
                  />
                </form>
                <Search className="absolute left-3 top-2 w-4 h-4 text-stone-400 group-focus-within:text-amber-500" />
              </div>

              {/* Download App Button (Desktop) */}
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install'))}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold transition-all shadow-xs hover:scale-105 active:scale-95"
                title="Download Official App"
              >
                <img 
                  src="/rd_logo.jpg" 
                  alt="RD" 
                  className="w-4 h-4 rounded-full object-cover border border-amber-500" 
                  onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                />
                <span className="hidden md:inline">Download App</span>
                <Download className="w-3.5 h-3.5 text-amber-700" />
              </button>

              <button className="md:hidden text-stone-600 hover:text-amber-600 transition-colors p-2">
                <Search className="w-5 h-5" />
              </button>
              
              <Link to="/wishlist" className="text-stone-600 hover:text-amber-600 transition-colors hidden sm:block p-2">
                <Heart className="w-5 h-5" />
              </Link>
              
              <Link to="/cart" className="text-stone-600 hover:text-amber-600 transition-colors relative p-2 group">
                <ShoppingCart id="cart-icon-desktop" className="w-5 h-5 group-hover:scale-110 transition-transform" />
                {totalItems > 0 && (
                  <span className="absolute 1 top-0 right-0 bg-amber-500 text-white text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-full shadow-sm ring-2 ring-white">
                    {totalItems}
                  </span>
                )}
              </Link>
              
              <button 
                onClick={() => (user && !user.isAnonymous) ? navigate('/profile') : navigate('/login')}
                className="text-stone-600 hover:text-amber-600 transition-colors p-2"
              >
                <User className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-stone-100 bg-white absolute w-full pb-6 shadow-xl animate-in slide-in-from-top-2">
            <div className="px-4 py-4 space-y-2">
              {/* Mobile App Download Button */}
              <button 
                onClick={() => { 
                  setIsMobileMenuOpen(false); 
                  window.dispatchEvent(new CustomEvent('open-pwa-install')); 
                }}
                className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-amber-950 bg-gradient-to-r from-amber-100 via-amber-50 to-amber-100 border border-amber-300 shadow-xs mb-2 transition-all active:scale-95"
              >
                <div className="flex items-center gap-3">
                  <img 
                    src="/rd_logo.jpg" 
                    alt="RD Logo" 
                    className="w-8 h-8 rounded-full object-cover border-2 border-amber-500 shadow-sm"
                    onError={(e) => { e.currentTarget.src = '/logo.png'; }}
                  />
                  <div className="text-left">
                    <span className="block leading-tight font-serif font-bold text-stone-900">Download Official App</span>
                    <span className="text-[10px] text-amber-700 font-medium">RD Ripan Saree Center</span>
                  </div>
                </div>
                <div className="bg-amber-500 text-stone-950 p-1.5 rounded-full shadow-sm">
                  <Download className="w-4 h-4" />
                </div>
              </button>

              <Link onClick={() => setIsMobileMenuOpen(false)} to="/" className="block px-4 py-3 rounded-lg text-sm font-medium text-stone-800 hover:text-amber-600 hover:bg-amber-50 tracking-wide uppercase transition-colors">Home</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/shop" className="block px-4 py-3 rounded-lg text-sm font-medium text-stone-800 hover:text-amber-600 hover:bg-amber-50 tracking-wide uppercase transition-colors">Shop All</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/shop?category=silk" className="block px-4 py-3 rounded-lg text-sm font-medium text-stone-800 hover:text-amber-600 hover:bg-amber-50 tracking-wide uppercase transition-colors">Silk Collection</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/shop?category=wedding" className="block px-4 py-3 rounded-lg text-sm font-medium text-stone-800 hover:text-amber-600 hover:bg-amber-50 tracking-wide uppercase transition-colors">Wedding Special</Link>
              <Link onClick={() => setIsMobileMenuOpen(false)} to="/wishlist" className="block px-4 py-3 rounded-lg text-sm font-medium text-stone-800 hover:text-amber-600 hover:bg-amber-50 tracking-wide uppercase transition-colors">My Wishlist</Link>
              <div className="h-px bg-stone-100 my-2"></div>
              <button 
                onClick={() => { setIsMobileMenuOpen(false); (user && !user.isAnonymous) ? navigate('/profile') : navigate('/login'); }}
                className="w-full text-left px-4 py-3 rounded-lg text-sm font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 tracking-wide uppercase transition-colors"
              >
                {(user && !user.isAnonymous) ? 'My Profile / Dashboard' : 'Login / Register'}
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}