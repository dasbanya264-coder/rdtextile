import fs from 'fs';

let content = `import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { LogOut, Package, Heart, MapPin, User as UserIcon, Clock, CheckCircle, Truck, XCircle } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import type { Order } from '../types';

export default function Profile() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const q = query(
          collection(db, 'orders'),
          where('userId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    
    if (activeTab === 'orders') {
      fetchMyOrders();
    }
  }, [user, activeTab]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (!user) {
    navigate('/login');
    return null;
  }
  
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'processing': return <Package className="w-5 h-5 text-blue-500" />;
      case 'shipped': return <Truck className="w-5 h-5 text-purple-500" />;
      case 'delivered': return <CheckCircle className="w-5 h-5 text-emerald-500" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-stone-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Placed';
      case 'processing': return 'Processing';
      case 'shipped': return 'Shipped';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-20">
      <h1 className="text-3xl md:text-4xl font-serif text-stone-900 mb-8 md:mb-12 tracking-wide">My Account</h1>
      
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
        {/* Sidebar */}
        <aside className="w-full md:w-64 lg:w-72 shrink-0">
          <div className="bg-white p-6 md:p-8 rounded-2xl border border-stone-100 shadow-sm">
            <div className="flex flex-col items-center mb-8 border-b border-stone-100 pb-8">
              <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center text-stone-400 mb-4 border border-stone-200">
                <UserIcon className="w-10 h-10" />
              </div>
              <h2 className="font-serif text-xl text-stone-900 mb-1">{userProfile?.name || user.displayName}</h2>
              <p className="text-sm text-stone-500 font-medium">{user.email}</p>
            </div>
            
            <nav className="space-y-2">
              <button 
                onClick={() => setActiveTab('orders')}
                className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold tracking-wide uppercase \${activeTab === 'orders' ? 'text-amber-700 bg-amber-50 shadow-sm' : 'text-stone-600 hover:bg-stone-50'}\`}
              >
                <Package className="w-4 h-4" /> My Orders
              </button>
              <button 
                onClick={() => setActiveTab('wishlist')}
                className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold tracking-wide uppercase \${activeTab === 'wishlist' ? 'text-amber-700 bg-amber-50 shadow-sm' : 'text-stone-600 hover:bg-stone-50'}\`}
              >
                <Heart className="w-4 h-4" /> Wishlist
              </button>
              <button 
                onClick={() => setActiveTab('addresses')}
                className={\`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold tracking-wide uppercase \${activeTab === 'addresses' ? 'text-amber-700 bg-amber-50 shadow-sm' : 'text-stone-600 hover:bg-stone-50'}\`}
              >
                <MapPin className="w-4 h-4" /> Addresses
              </button>
              {userProfile?.role === 'admin' && (
                <button onClick={() => navigate('/admin')} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 hover:bg-stone-50 transition-colors text-sm font-semibold tracking-wide uppercase mt-4">
                  <UserIcon className="w-4 h-4" /> Admin Panel
                </button>
              )}
              <div className="h-px bg-stone-100 my-4"></div>
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm font-semibold tracking-wide uppercase">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1">
          {activeTab === 'orders' && (
            <div className="bg-white p-6 md:p-10 rounded-2xl border border-stone-100 shadow-sm min-h-[500px]">
              <h2 className="text-2xl font-serif text-stone-900 mb-8">Order History</h2>
              
              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-900"></div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20 bg-stone-50 rounded-xl border border-stone-100 border-dashed">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-500 mb-6 font-medium">You haven't placed any orders yet.</p>
                  <button onClick={() => navigate('/shop')} className="px-6 py-2.5 bg-stone-900 text-white hover:bg-amber-600 transition-colors rounded-full text-sm font-semibold uppercase tracking-widest">
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-stone-200 rounded-xl overflow-hidden hover:border-amber-300 transition-colors">
                      <div className="bg-stone-50 px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200">
                        <div>
                          <p className="text-xs text-stone-500 font-medium uppercase tracking-widest mb-1">Order #{order.id.slice(-8).toUpperCase()}</p>
                          <p className="text-sm font-medium text-stone-900">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-stone-200 shadow-sm w-fit">
                          {getStatusIcon(order.status)}
                          <span className="text-sm font-bold text-stone-700">{getStatusText(order.status)}</span>
                        </div>
                      </div>
                      
                      <div className="p-6">
                        <div className="space-y-4 mb-6">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center">
                              <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md bg-stone-100" />
                              <div className="flex-1">
                                <h4 className="font-medium text-stone-900 line-clamp-1">{item.name}</h4>
                                <p className="text-sm text-stone-500">Qty: {item.quantity}</p>
                              </div>
                              <div className="text-right font-semibold text-stone-900">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                        
                        <div className="flex justify-between items-center pt-4 border-t border-stone-100">
                          <p className="text-sm text-stone-500 font-medium">Total Amount</p>
                          <p className="text-xl font-serif text-amber-600">{formatPrice(order.total)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="bg-white p-6 md:p-10 rounded-2xl border border-stone-100 shadow-sm min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <Heart className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500 mb-6 font-medium">Your wishlist is currently empty.</p>
                <button onClick={() => navigate('/shop')} className="px-6 py-2.5 bg-stone-900 text-white hover:bg-amber-600 transition-colors rounded-full text-sm font-semibold uppercase tracking-widest">
                  Explore Collection
                </button>
              </div>
            </div>
          )}

          {activeTab === 'addresses' && (
            <div className="bg-white p-6 md:p-10 rounded-2xl border border-stone-100 shadow-sm min-h-[500px] flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-stone-500 mb-6 font-medium">No saved addresses found.</p>
                <p className="text-sm text-stone-400">Addresses are saved automatically during checkout.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}`;
fs.writeFileSync('src/pages/Profile.tsx', content);
