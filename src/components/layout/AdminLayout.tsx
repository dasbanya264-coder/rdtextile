import { useState, useEffect } from 'react';
import { collection, getDocs, query } from 'firebase/firestore';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Tags, Users, LogOut, Package, Menu, X, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { auth, db } from '../../lib/firebase';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';
import { signOut } from 'firebase/auth';

export default function AdminLayout() {
  const isOnline = useNetworkStatus();
  const { userProfile, loading } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [logoUrl, setLogoUrl] = useState<string>('');
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = await getDocs(query(collection(db, 'settings')));
        docRef.docs.forEach(doc => {
          if (doc.id === 'store' && doc.data().logoUrl) {
            setLogoUrl(doc.data().logoUrl);
          }
        });
      } catch (err) {}
    };
    fetchSettings();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  // Simple protection check (in a real app, use a protected route wrapper)
  if (userProfile?.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="text-center">
          <h1 className="text-2xl font-serif text-stone-900 mb-2">Access Denied</h1>
          <p className="text-stone-500 mb-4">You do not have permission to view this page.</p>
          <Link to="/" className="text-amber-600 hover:underline">Return to Store</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-stone-100 relative">
      {!isOnline && (
        <div className="absolute top-0 left-0 right-0 z-[60] bg-red-500 text-white px-4 py-2 text-center text-sm font-medium shadow-md flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          You are offline. Please check your internet connection.
        </div>
      )}
      {/* Mobile Header (visible only on small screens) */}
      <div className="md:hidden fixed top-0 w-full h-16 bg-stone-900 text-white flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-2">
          <img 
            src={logoUrl || '/logo.png'} 
            alt="Ripan Saree Center Logo" 
            className="w-8 h-8 object-contain rounded-full shadow-sm bg-white"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="hidden font-serif font-bold tracking-widest text-lg">RSC ADMIN</span>
          <span className="font-serif font-bold tracking-widest text-lg">RSC ADMIN</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 w-64 bg-stone-900 text-stone-300 flex flex-col h-full z-40 transform transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0 pt-16 md:pt-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="hidden md:flex h-16 items-center gap-2 px-6 border-b border-stone-800 bg-stone-950 shrink-0">
          <img 
            src={logoUrl || '/logo.png'} 
            alt="Ripan Saree Center Logo" 
            className="w-8 h-8 object-contain rounded-full shadow-sm bg-white"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="hidden font-serif font-bold tracking-widest text-white text-lg">RSC ADMIN</span>
          <span className="font-serif font-bold tracking-widest text-white text-lg">RSC ADMIN</span>
        </div>
        <nav className="flex-1 py-6 space-y-1 px-3 overflow-y-auto">
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/admin" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-stone-800 hover:text-white transition-colors">
            <LayoutDashboard className="w-5 h-5" /> Dashboard
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/admin/products" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-stone-800 hover:text-white transition-colors">
            <ShoppingBag className="w-5 h-5" /> Products
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/admin/orders" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-stone-800 hover:text-white transition-colors">
            <Package className="w-5 h-5" /> Orders
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-stone-800 hover:text-white transition-colors">
            <Settings className="w-5 h-5" /> Store Settings
          </Link>
          <Link onClick={() => setIsMobileMenuOpen(false)} to="/admin/customers" className="flex items-center gap-3 px-3 py-2.5 rounded-md hover:bg-stone-800 hover:text-white transition-colors">
            <Users className="w-5 h-5" /> Customers
          </Link>
        </nav>
        <div className="p-4 border-t border-stone-800 shrink-0">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-md hover:bg-stone-800 hover:text-red-400 text-stone-400 transition-colors"
          >
            <LogOut className="w-5 h-5" /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 w-full md:w-auto">
        <Outlet />
      </main>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
