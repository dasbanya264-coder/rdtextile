import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, ShieldCheck, Truck, HeartHandshake, Download, Smartphone, Sparkles } from 'lucide-react';
import { collection, getDocs, limit, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Product } from '../types';
import { useStoreSettings } from '../hooks/useStoreSettings';

import premiumSilkImg from '../assets/images/premium_silk_1788152325215.jpg';
import tasarImg from '../assets/images/tasar_saree_cat_1790063305377.jpg';

export default function Home() {
  const { settings } = useStoreSettings();
  const [trending, setTrending] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerUrl, setBannerUrl] = useState<string>(() => {
    return localStorage.getItem('cachedBannerUrl') || '';
  });

  const exploreCategories = [
    {
      id: 'tasar_jamdani',
      name: 'Tasar Jamdani',
      nameBn: 'তসর জামদানি শাড়ি',
      subtitle: 'শান্তিপুরের খাঁটি উইভিং কালেকশন',
      image: settings?.tasarJamdaniImageUrl || tasarImg,
      tag: 'Handloom Classic'
    },
    {
      id: 'silk',
      name: 'Pure Silk',
      nameBn: 'পিওর সিল্ক শাড়ি',
      subtitle: 'অভিজাত ও রাজকীয় জমকালো সাজ',
      image: settings?.silkImageUrl || premiumSilkImg,
      tag: 'Royal Luxury'
    }
  ];

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(8));
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
            const url = doc.data().bannerUrl;
            setBannerUrl(url);
            localStorage.setItem('cachedBannerUrl', url);
          }
        });
      } catch (err) {}
    };
    fetchSettings();
  }, []);

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full bg-[#0a0a0a] flex flex-col items-center justify-center overflow-hidden pt-10 pb-6 md:pt-16 md:pb-10 perspective-[1000px]">
        
        {/* Subtle 3D Rotating Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-100 pointer-events-none mix-blend-screen">
          <div className="absolute w-[150vw] h-[150vw] md:w-[100vw] md:h-[100vw] rounded-full border border-stone-700/50 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.15)_0%,rgba(0,0,0,0)_70%)] animate-[spin_60s_linear_infinite]" style={{ transform: 'rotateX(60deg)' }}>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMS41IiBmaWxsPSJyZ2JhKDI0NSwgMTU4LCAxMSwgMC44KSIvPjwvc3ZnPg==')] opacity-100" />
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />
            <div className="absolute left-1/2 top-0 h-full w-[2px] bg-gradient-to-b from-transparent via-amber-500/60 to-transparent" />
          </div>
          <div className="absolute w-[100vw] h-[100vw] md:w-[70vw] md:h-[70vw] rounded-full border border-amber-600/40 animate-[spin_40s_linear_infinite_reverse]" style={{ transform: 'rotateX(60deg)' }}>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MCIgaGVpZ2h0PSI4MCI+PHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSJub25lIi8+PGNpcmNsZSBjeD0iNDAiIGN5PSI0MCIgcj0iMi41IiBmaWxsPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuNykiLz48L3N2Zz4=')] opacity-100" />
          </div>
          {/* Glowing Center */}
          <div className="absolute w-[20vw] h-[20vw] bg-amber-500/30 blur-[60px] rounded-full" />
        </div>

        {/* Soft Ambient Glow in the background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] max-w-4xl h-[60%] bg-amber-500/20 blur-[100px] pointer-events-none z-0" />

        <div className="relative w-full mx-auto max-w-7xl px-3 sm:px-6 flex flex-col items-center justify-center z-10">
          
          {/* Floating 3D Image Wrapper with Tuni Lights (Fairy Lights) */}
          <div className="relative group rounded-2xl p-[4px] transition-all duration-700 hover:-translate-y-2 shadow-[0_20px_50px_rgba(0,0,0,0.8)] hover:shadow-[0_30px_60px_rgba(245,158,11,0.4)]">
            
            {/* Blinking Tuni Lights Effect */}
            <div className="absolute inset-0 rounded-2xl overflow-hidden z-0">
              <style>
                {`
                  @keyframes tuni-blink {
                    0%, 100% { opacity: 1; filter: drop-shadow(0 0 10px #f59e0b) brightness(1.2); }
                    50% { opacity: 0.4; filter: drop-shadow(0 0 2px #f59e0b) brightness(0.8); }
                  }
                  @keyframes border-spin {
                    100% { transform: rotate(360deg); }
                  }
                `}
              </style>
              <div 
                className="absolute inset-[-150%] w-[400%] h-[400%] left-[-150%] top-[-150%] bg-[repeating-conic-gradient(transparent_0deg,transparent_6deg,#f59e0b_6deg,#f59e0b_9deg,transparent_9deg,transparent_15deg,#fbbf24_15deg,#fbbf24_18deg)]"
                style={{ animation: 'border-spin 15s linear infinite, tuni-blink 1s ease-in-out infinite' }}
              />
              <div className="absolute inset-[4px] bg-[#0a0a0a] rounded-xl" />
            </div>
            
            <div className="relative rounded-xl overflow-hidden bg-black/50 z-10">
              {/* Glass reflection sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[1500ms] ease-in-out pointer-events-none z-10 mix-blend-overlay" />
              
              <img 
                src={bannerUrl || 'https://images.unsplash.com/photo-1613843513180-87747e447545?q=80&w=2000&auto=format&fit=crop'} 
                alt="Hero Banner" 
                fetchPriority="high"
                loading="eager"
                className="w-full h-auto max-h-[50vh] sm:max-h-[60vh] md:max-h-[75vh] object-contain object-center block rounded-xl transform group-hover:scale-[1.01] transition-transform duration-700"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1613843513180-87747e447545?q=80&w=2000&auto=format&fit=crop';
                }}
              />
            </div>
          </div>
          
          <div className="mt-8 md:mt-12 w-full flex justify-center z-20 px-4 relative">
            
            {/* 3D Animated Button Container */}
            <div className="relative group p-[3px] rounded-full inline-flex shadow-[0_0_30px_rgba(245,158,11,0.5)] hover:shadow-[0_0_60px_rgba(245,158,11,0.8)] transition-all duration-500 transform hover:scale-110">
              
              {/* Spinning 3D Animated Border */}
              <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute inset-[-100%] bg-[conic-gradient(from_0deg_at_50%_50%,#f59e0b_0%,#000000_25%,#f59e0b_50%,#000000_75%,#f59e0b_100%)] animate-[spin_3s_linear_infinite]" />
              </div>

              {/* Inner Button Content */}
              <Link 
                to="/shop" 
                className="relative px-8 py-4 bg-gradient-to-b from-stone-900 to-black text-amber-400 font-sans font-bold hover:text-amber-300 transition-colors duration-500 rounded-full flex items-center justify-center gap-3 tracking-widest text-sm uppercase shadow-[inset_0_2px_15px_rgba(245,158,11,0.2)]"
              >
                <span className="relative z-10 drop-shadow-[0_0_10px_rgba(245,158,11,1)]">Discover Collection</span> 
                <ArrowRight className="w-5 h-5 relative z-10 animate-pulse text-amber-500" />
              </Link>
            </div>
            
          </div>
        </div>
      </section>

      {/* Explore Categories - Tasar Jamdani & Silk Side-by-Side */}
      <section className="py-8 md:py-14 px-3 sm:px-6 max-w-7xl mx-auto w-full">
        <div className="text-center mb-6 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 border border-amber-300/60 text-amber-900 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Featured Handloom Catalog</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif text-stone-900 mb-2 tracking-tight">
            Explore Handloom Collections
          </h2>
          <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto">
            খাঁটি তসর জামদানি ও পিওর সিল্ক শাড়ির আকর্ষণীয় ক্যাটালগ
          </p>
          <div className="w-16 h-0.5 bg-amber-500 mx-auto mt-3" />
        </div>
        
        {/* 2 Categories Side-by-Side (পাশাপাশি ২টি ক্যাটালগ কার্ড) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-6 md:gap-8">
          {exploreCategories.map(category => (
            <Link 
              key={category.id} 
              to={`/shop?category=${category.id}`}
              className="group relative h-64 sm:h-80 md:h-[440px] rounded-2xl sm:rounded-3xl overflow-hidden block shadow-md hover:shadow-2xl transition-all duration-500 border border-stone-200/80 bg-stone-900"
            >
              {/* Product Image with smooth hover scale */}
              <img 
                src={category.image} 
                alt={category.name}
                className="w-full h-full object-cover object-center transition-transform duration-1000 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = category.id === 'silk' ? premiumSilkImg : tasarImg;
                }}
              />

              {/* Luxury Gradient Overlays */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/10 transition-opacity duration-500 group-hover:from-black/90" />
              <div className="absolute inset-0 border-2 border-white/0 group-hover:border-amber-400/40 rounded-2xl sm:rounded-3xl transition-colors duration-500 pointer-events-none" />

              {/* Top Tag */}
              <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-10">
                <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-amber-300 text-[10px] sm:text-xs font-semibold border border-amber-400/30 shadow-sm">
                  {category.tag}
                </span>
              </div>

              {/* Content at bottom */}
              <div className="absolute bottom-0 left-0 w-full p-3 sm:p-6 text-left transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300 z-10">
                <h3 className="text-white font-serif text-base sm:text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                  {category.name}
                </h3>
                <p className="text-amber-300 font-sans text-xs sm:text-sm md:text-base font-semibold mt-0.5">
                  {category.nameBn}
                </p>
                <p className="text-stone-300 text-[11px] sm:text-xs mt-1 hidden sm:block font-light line-clamp-1">
                  {category.subtitle}
                </p>

                {/* Explore Pill Button */}
                <div className="mt-2.5 sm:mt-4 inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-amber-500 text-stone-950 font-bold text-[10px] sm:text-xs tracking-wider uppercase shadow-md group-hover:bg-amber-400 transition-colors">
                  <span>Explore</span>
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
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
              <h2 className="text-4xl font-serif text-stone-900 mb-4 tracking-tight">Latest Collection</h2>
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
