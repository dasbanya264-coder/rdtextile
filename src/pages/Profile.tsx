import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, Package, Heart, MapPin, User as UserIcon, Clock, CheckCircle, Truck, XCircle, ShoppingCart, Share2, Download } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { formatPrice } from '../lib/utils';
import type { Order } from '../types';
import { useWishlist } from '../contexts/WishlistContext';
import { useCart } from '../contexts/CartContext';

export default function Profile() {
  const { user, userProfile } = useAuth();
  const { items: wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe: () => void;
    
    const subscribeToMyOrders = () => {
      if (!user) return;
      setLoading(true);
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid)
      );
      unsubscribe = onSnapshot(q, (snapshot) => {
        const fetchedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
        fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(fetchedOrders);
        setLoading(false);
      }, (error) => {
        console.error("Error listening to orders:", error);
        setLoading(false);
      });
    };
    
    if (activeTab === 'orders') {
      subscribeToMyOrders();
    }
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
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
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold tracking-wide uppercase ${activeTab === 'orders' ? 'text-amber-700 bg-amber-50 shadow-sm' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                <Package className="w-4 h-4" /> My Orders
              </button>
              <button 
                onClick={() => setActiveTab('wishlist')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold tracking-wide uppercase ${activeTab === 'wishlist' ? 'text-amber-700 bg-amber-50 shadow-sm' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                <Heart className="w-4 h-4" /> Wishlist
              </button>
              <button 
                onClick={() => setActiveTab('addresses')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold tracking-wide uppercase ${activeTab === 'addresses' ? 'text-amber-700 bg-amber-50 shadow-sm' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                <MapPin className="w-4 h-4" /> Addresses
              </button>
              <button 
                onClick={() => setActiveTab('share')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold tracking-wide uppercase ${activeTab === 'share' ? 'text-amber-700 bg-amber-50 shadow-sm' : 'text-stone-600 hover:bg-stone-50'}`}
              >
                <Share2 className="w-4 h-4" /> Share App
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
                      
                      {/* Real-time Order Status Timeline */}
                      {order.status !== 'cancelled' && (
                        <div className="px-6 pt-6 pb-2">
                          <div className="relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-100 rounded-full"></div>
                            <div 
                              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-500 rounded-full transition-all duration-700"
                              style={{ 
                                width: order.status === 'pending' ? '0%' : 
                                       order.status === 'processing' ? '33.33%' : 
                                       order.status === 'shipped' ? '66.66%' : '100%' 
                              }}
                            ></div>
                            <div className="relative flex justify-between">
                              <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${['pending', 'processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-stone-200 text-stone-300'}`}>
                                  <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                                </div>
                                <span className="text-[10px] sm:text-xs font-semibold mt-2 text-stone-600">Pending</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${['processing', 'shipped', 'delivered'].includes(order.status) ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-stone-200 text-stone-300'}`}>
                                  <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                                </div>
                                <span className="text-[10px] sm:text-xs font-semibold mt-2 text-stone-600">Processing</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${['shipped', 'delivered'].includes(order.status) ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-stone-200 text-stone-300'}`}>
                                  <Truck className="w-3 h-3 sm:w-4 sm:h-4" />
                                </div>
                                <span className="text-[10px] sm:text-xs font-semibold mt-2 text-stone-600">Shipped</span>
                              </div>
                              <div className="flex flex-col items-center">
                                <div className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${order.status === 'delivered' ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-stone-200 text-stone-300'}`}>
                                  <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                                </div>
                                <span className="text-[10px] sm:text-xs font-semibold mt-2 text-stone-600">Delivered</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-6">
                        <div className="space-y-4 mb-6">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center">
                              <a href={item.image} target="_blank" rel="noopener noreferrer" title="Click to enlarge">
                                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md bg-stone-100 hover:scale-110 transition-transform cursor-zoom-in" />
                              </a>
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
            <div className="bg-white p-6 md:p-10 rounded-2xl border border-stone-100 shadow-sm min-h-[500px]">
              {wishlistItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center pt-20">
                  <Heart className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-500 mb-6 font-medium">Your wishlist is currently empty.</p>
                  <button onClick={() => navigate('/shop')} className="px-6 py-2.5 bg-stone-900 text-white hover:bg-amber-600 transition-colors rounded-full text-sm font-semibold uppercase tracking-widest">
                    Explore Collection
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {wishlistItems.map((product) => (
                    <div key={product.id} className="group flex flex-col bg-stone-50 rounded-xl overflow-hidden border border-stone-100 hover:shadow-md transition-all">
                      <Link to={`/product/${product.id}`} className="relative aspect-[3/4] overflow-hidden">
                        <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      </Link>
                      <div className="p-4 flex flex-col flex-1">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="font-serif text-sm md:text-base text-stone-800 mb-1 hover:text-amber-600 line-clamp-1">{product.name}</h3>
                        </Link>
                        <p className="text-amber-600 font-serif font-medium mb-3">{formatPrice(product.discountPrice || product.price)}</p>
                        <div className="mt-auto flex gap-2">
                          <button
                            onClick={() => addToCart(product)}
                            className="flex-1 py-2 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-amber-600 transition-colors"
                          >
                            Add to Cart
                          </button>
                          <button
                            onClick={() => removeFromWishlist(product.id)}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                            title="Remove"
                          >
                            <Heart className="w-4 h-4" fill="currentColor" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

          {activeTab === 'share' && (
            <div className="bg-white p-6 md:p-10 rounded-2xl border border-stone-100 shadow-sm min-h-[500px] flex flex-col items-center justify-center">
              <div className="text-center max-w-md mx-auto">
                <Share2 className="w-12 h-12 text-amber-500 mx-auto mb-4" />
                <h3 className="text-2xl font-serif text-stone-900 mb-2">Share Ripan Saree Center</h3>
                <p className="text-stone-500 mb-8 font-medium">Scan the QR code or share the link with your friends and family to let them explore our premium collection.</p>
                
                <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 inline-block mb-8 shadow-inner">
                  <QRCodeCanvas 
                    id="qr-code-canvas"
                    value="https://rdtextile-321.ai.studio" 
                    size={200}
                    bgColor={"#fafaf9"}
                    fgColor={"#1c1917"}
                    level={"Q"}
                    includeMargin={false}
                  />
                </div>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <button 
                    onClick={() => {
                      const canvas = document.getElementById("qr-code-canvas") as HTMLCanvasElement;
                      if (canvas) {
                        const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                        const downloadLink = document.createElement("a");
                        downloadLink.href = pngUrl;
                        downloadLink.download = "ripan-saree-center-qr.png";
                        document.body.appendChild(downloadLink);
                        downloadLink.click();
                        document.body.removeChild(downloadLink);
                      }
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-stone-900 text-white hover:bg-amber-600 transition-colors rounded-full text-sm font-semibold uppercase tracking-widest shadow-md"
                  >
                    <Download className="w-4 h-4" /> Download QR
                  </button>
                  
                  <button 
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Ripan Saree Center',
                          text: 'Check out the premium collection at Ripan Saree Center!',
                          url: 'https://rdtextile-321.ai.studio'
                        }).catch(console.error);
                      } else {
                        navigator.clipboard.writeText('https://rdtextile-321.ai.studio');
                        alert('Link copied to clipboard!');
                      }
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-amber-100 text-amber-800 hover:bg-amber-200 transition-colors rounded-full text-sm font-semibold uppercase tracking-widest"
                  >
                    <Share2 className="w-4 h-4" /> Share Link
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}