import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, User, Download } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';

export default function BottomNav() {
  const location = useLocation();
  const { totalItems } = useCart();
  const { user } = useAuth();
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    setIsStandalone(standalone);
  }, []);

  return (
    <div className="md:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-stone-200 z-50 safe-area-pb shadow-lg">
      <div className="flex justify-around items-center h-16 px-1">
        {/* Home */}
        <Link
          to="/"
          className={`relative flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
            location.pathname === '/' ? 'text-amber-600 font-bold' : 'text-stone-500 hover:text-amber-600'
          }`}
        >
          <Home className={`w-5 h-5 ${location.pathname === '/' ? 'fill-amber-100' : ''}`} />
          <span className="text-[10px]">Home</span>
        </Link>

        {/* Shop */}
        <Link
          to="/shop"
          className={`relative flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
            location.pathname === '/shop' ? 'text-amber-600 font-bold' : 'text-stone-500 hover:text-amber-600'
          }`}
        >
          <ShoppingBag className={`w-5 h-5 ${location.pathname === '/shop' ? 'fill-amber-100' : ''}`} />
          <span className="text-[10px]">Shop</span>
        </Link>

        {/* Install App Button if not standalone */}
        {!isStandalone && (
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent('open-pwa-install'))}
            className="relative flex flex-col items-center justify-center flex-1 h-full space-y-1 text-amber-700 hover:text-amber-800 transition-colors group"
            title="Download App"
          >
            <div className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center shadow-md shadow-amber-500/30 group-active:scale-95 transition-transform -mt-2 border-2 border-white">
              <Download className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-amber-800">ডাউনলোড</span>
          </button>
        )}

        {/* Cart */}
        <Link
          to="/cart"
          className={`relative flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
            location.pathname === '/cart' ? 'text-amber-600 font-bold' : 'text-stone-500 hover:text-amber-600'
          }`}
        >
          <div className="relative">
            <ShoppingCart id="cart-icon-mobile" className={`w-5 h-5 ${location.pathname === '/cart' ? 'fill-amber-100' : ''}`} />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px]">Cart</span>
        </Link>

        {/* Profile */}
        <Link
          to={(user && !user.isAnonymous) ? '/profile' : '/login'}
          className={`relative flex flex-col items-center justify-center flex-1 h-full space-y-1 transition-colors ${
            location.pathname === '/profile' || location.pathname === '/login' ? 'text-amber-600 font-bold' : 'text-stone-500 hover:text-amber-600'
          }`}
        >
          <User className={`w-5 h-5 ${location.pathname === '/profile' ? 'fill-amber-100' : ''}`} />
          <span className="text-[10px]">Profile</span>
        </Link>
      </div>
    </div>
  );
}
