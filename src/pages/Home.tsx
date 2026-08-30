import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Truck, HeartHandshake } from 'lucide-react';
import { collection, getDocs, limit, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Product } from '../types';

const CATEGORIES = [
  { id: 'silk', name: 'Premium Silk', image: 'https://images.unsplash.com/photo-1610189013233-286820bbba61?q=80&w=600&auto=format&fit=crop' },
  { id: 'cotton', name: 'Daily Cotton', image: 'https://images.unsplash.com/photo-1583391733958-69279b986e7a?q=80&w=600&auto=format&fit=crop' },
  { id: 'wedding', name: 'Wedding Collection', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=600&auto=format&fit=crop' },
  { id: 'party', name: 'Party Wear', image: 'https://images.unsplash.com/photo-1605658117957-c8612140e703?q=80&w=600&auto=format&fit=crop' }
];

export default function Home() {
  const [trending, setTrending] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState<string>('');

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const q = query(collection(db, 'products'), limit(4));
        const querySnapshot = await getDocs(q);
        const productsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Product[];
        setTrending(productsData);
      } catch (error) {
        console.error("Error fetching trending products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
    
    const fetchSettings = async () => {
      try {
        const docRef = await getDocs(query(collection(db, 'settings')));
        docRef.docs.forEach(doc => {
          if (doc.id === 'store' && doc.data().bannerUrl) {
            setBannerUrl(doc.data().bannerUrl);
          }
        });
      } catch (err) {}
    };
    fetchSettings();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full bg-black flex flex-col items-center justify-center border-b border-stone-800">
        <div className="relative w-full mx-auto flex flex-col items-center">
          <img 
            src={bannerUrl || 'https://images.unsplash.com/photo-1613843513180-87747e447545?q=80&w=2000&auto=format&fit=crop'} 
            alt="Hero Banner" 
            className="w-full h-auto max-h-[80vh] object-cover block"
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1613843513180-87747e447545?q=80&w=2000&auto=format&fit=crop';
              e.currentTarget.className = "w-full h-[60vh] object-cover";
            }}
          />
        <div className="absolute bottom-[6%] sm:bottom-[8%] md:bottom-[10%] w-full flex justify-center z-10 px-4">
          <Link 
            to="/shop" 
            className="px-8 py-3 sm:px-10 sm:py-4 bg-white/95 backdrop-blur-sm text-stone-900 font-sans font-semibold hover:bg-white hover:text-amber-600 transition-all rounded-none flex items-center justify-center gap-3 shadow-xl transform hover:-translate-y-1 duration-300 tracking-widest text-xs sm:text-sm uppercase"
          >
            Shop Collection <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5" />
          </Link>
        </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 px-4 max-w-7xl mx-auto w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-serif text-stone-900 mb-4 tracking-tight">Shop by Category</h2>
          <div className="w-12 h-0.5 bg-amber-500 mx-auto" />
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {CATEGORIES.map(category => (
            <Link 
              key={category.id} 
              to={`/shop?category=${category.id}`}
              className="group relative h-72 md:h-96 rounded-2xl overflow-hidden block shadow-md hover:shadow-2xl transition-all duration-500"
            >
              <img 
                src={category.image} 
                alt={category.name}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity duration-500" />
              <div className="absolute bottom-8 left-0 w-full text-center px-4 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                <h3 className="text-white font-serif text-2xl tracking-wide mb-2">{category.name}</h3>
                <span className="text-amber-300 font-sans tracking-widest text-xs uppercase opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100">Explore</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About Us Preview */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-serif text-stone-900 tracking-wide">The Epitome of Elegance</h2>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto" />
          <p className="text-stone-600 font-light leading-relaxed md:text-lg">
            Welcome to Ripan Saree Center, your ultimate destination for authentic, premium sarees. We bring you hand-picked collections directly from the master weavers, ensuring every drape tells a story of tradition, luxury, and unparalleled craftsmanship.
          </p>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-24 bg-stone-50 px-4 w-full">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-serif text-stone-900 mb-4 tracking-tight">Trending Now</h2>
              <div className="w-12 h-0.5 bg-amber-500" />
            </div>
            <Link to="/shop" className="text-amber-600 hover:text-amber-500 font-sans tracking-wide text-sm uppercase flex items-center gap-2 hidden sm:flex transition-colors">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
          ) : trending.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8">
              {trending.map(product => (
                <Link key={product.id} to={`/product/${product.id}`} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500 border border-stone-100/50 block">
                  <div className="relative h-48 sm:h-[22rem] overflow-hidden bg-stone-100">
                    <img 
                      src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1610189013233-286820bbba61?q=80&w=600&auto=format&fit=crop'} 
                      alt={product.name}
                      className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 bg-gradient-to-t from-stone-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0 flex justify-center">
                      <span className="bg-white/95 backdrop-blur-sm text-stone-900 px-4 sm:px-8 py-2 sm:py-3 rounded-full font-medium w-full text-center shadow-lg text-sm sm:text-base hidden sm:block">
                        View Details
                      </span>
                    </div>
                  </div>
                  <div className="p-3 sm:p-6 text-center">
                    <h3 className="font-serif text-sm sm:text-xl text-stone-800 mb-1 sm:mb-2 truncate">{product.name}</h3>
                    <div className="flex justify-center items-center gap-3">
                      <span className="font-sans font-semibold text-amber-600 text-sm sm:text-lg tracking-wide">₹{product.price}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-stone-500 py-20 font-serif italic text-lg">New collection arriving soon.</p>
          )}
        </div>
      </section>

      {/* Features */}
      <section className="py-24 px-4 bg-stone-900 text-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <div className="p-8 group">
            <div className="w-16 h-16 border border-stone-700 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 group-hover:bg-amber-500 group-hover:text-stone-900 transition-all duration-500">
              <ShieldCheck className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl mb-4 tracking-wide text-stone-100">Premium Quality</h3>
            <p className="text-stone-400 font-light leading-relaxed">Authentic handloom sarees sourced directly from master weavers.</p>
          </div>
          <div className="p-8 group">
            <div className="w-16 h-16 border border-stone-700 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 group-hover:bg-amber-500 group-hover:text-stone-900 transition-all duration-500">
              <HeartHandshake className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl mb-4 tracking-wide text-stone-100">Secure Payments</h3>
            <p className="text-stone-400 font-light leading-relaxed">100% secure payment processing via UPI and leading gateways.</p>
          </div>
          <div className="p-8 group">
            <div className="w-16 h-16 border border-stone-700 rounded-full flex items-center justify-center mx-auto mb-6 text-amber-500 group-hover:bg-amber-500 group-hover:text-stone-900 transition-all duration-500">
              <Truck className="w-8 h-8" strokeWidth={1.5} />
            </div>
            <h3 className="font-serif text-2xl mb-4 tracking-wide text-stone-100">Fast Delivery</h3>
            <p className="text-stone-400 font-light leading-relaxed">Reliable and insured delivery service across all districts.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
