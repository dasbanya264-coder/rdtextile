import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, ArrowLeft, ZoomIn, X, Video } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState<{type: 'image'|'video', url: string}>({type: 'image', url: ''});
  const [showZoom, setShowZoom] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const prod = { id: docSnap.id, ...docSnap.data() } as Product;
          setProduct(prod);
          if (prod.images && prod.images.length > 0) {
            setActiveMedia({type: 'image', url: prod.images[0]});
          }
        }
      } catch (err) {
        console.error("Error fetching product", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div></div>;
  }

  if (!product) {
    return <div className="min-h-[60vh] flex flex-col items-center justify-center"><p className="text-xl text-stone-500 mb-4">Product not found</p><button onClick={() => navigate('/shop')} className="text-amber-600 hover:underline">Back to Shop</button></div>;
  }

  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-400 hover:text-amber-600 mb-8 transition-colors text-sm uppercase tracking-widest font-sans font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Shop
      </button>

      <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-shadow duration-500 border border-stone-100 overflow-hidden flex flex-col md:flex-row">
        {/* Media Gallery */}
        <div className="md:w-1/2 p-6 md:p-10 flex flex-col gap-6 bg-stone-50">
          <div 
            className="relative bg-white rounded-2xl overflow-hidden aspect-[4/5] cursor-zoom-in group shadow-sm border border-stone-100"
            onClick={() => activeMedia.type === 'image' && setShowZoom(true)}
          >
            {activeMedia.type === 'video' ? (
              getYoutubeId(activeMedia.url) ? (
                <iframe 
                  className="w-full h-full object-cover" 
                  src={`https://www.youtube.com/embed/${getYoutubeId(activeMedia.url)}`} 
                  title="YouTube video player" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <video src={activeMedia.url} controls controlsList="nodownload" autoPlay loop muted playsInline className="w-full h-full object-contain bg-black" />
              )
            ) : (
              <>
                <img src={activeMedia.url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm p-4 rounded-full shadow-xl text-stone-800 flex items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <ZoomIn className="w-5 h-5 sm:w-6 sm:h-6" />
                    <span className="text-sm font-semibold pr-2 md:hidden">Tap to Zoom</span>
                  </div>
                </div>
                {/* Mobile tap indicator */}
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-3 rounded-full shadow-md md:hidden">
                   <ZoomIn className="w-5 h-5 text-stone-700" />
                </div>
              </>
            )}
          </div>
          
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {product.images?.map((img, idx) => (
              <button 
                key={`img-${idx}`}
                onClick={() => setActiveMedia({type: 'image', url: img})}
                className={`w-24 h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-300 ${activeMedia.url === img ? 'border-amber-500 shadow-md transform -translate-y-1' : 'border-transparent opacity-60 hover:opacity-100 hover:shadow-sm bg-white'}`}
              >
                <img src={img} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
            {product.videos?.map((vid, idx) => (
              <button 
                key={`vid-${idx}`}
                onClick={() => setActiveMedia({type: 'video', url: vid})}
                className={`w-24 h-24 rounded-xl overflow-hidden shrink-0 border-2 transition-all duration-300 relative ${activeMedia.url === vid ? 'border-amber-500 shadow-md transform -translate-y-1' : 'border-transparent opacity-60 hover:opacity-100 bg-stone-200'}`}
              >
                <div className="absolute inset-0 flex items-center justify-center bg-stone-900/40">
                  <Video className="w-6 h-6 text-white" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Product Info */}
        <div className="md:w-1/2 p-8 md:p-14 flex flex-col bg-white">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-serif text-stone-900 mb-4 leading-tight tracking-tight">{product.name}</h1>
            <p className="text-stone-400 font-sans tracking-widest text-sm uppercase">SKU: {product.sku}</p>
          </div>

          <div className="flex items-center gap-6 mb-10 pb-10 border-b border-stone-100">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-sans font-bold text-amber-600 tracking-tight">₹{product.price}</span>
            </div>
            <span className={`text-xs font-bold px-4 py-2 rounded-full uppercase tracking-widest ${product.stockQuantity > 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
              {product.stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          <div className="space-y-6 mb-10 text-stone-600 text-lg font-light leading-relaxed">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-sans tracking-widest uppercase text-stone-400 mb-1">Fabric</p>
                <p className="font-medium text-stone-800">{product.fabric}</p>
              </div>
              <div>
                <p className="text-sm font-sans tracking-widest uppercase text-stone-400 mb-1">Color</p>
                <p className="font-medium text-stone-800">{product.color}</p>
              </div>
            </div>
            <div className="pt-6 border-t border-stone-100">
              <p className="text-sm font-sans tracking-widest uppercase text-stone-400 mb-3">Description</p>
              <p className="whitespace-pre-line text-stone-600">{product.description}</p>
            </div>
          </div>

          <div className="mt-auto pt-8">
            <button 
              onClick={() => {
                addToCart(product);
                navigate('/cart');
              }}
              disabled={product.stockQuantity === 0}
              className="w-full py-5 bg-stone-900 text-white font-sans font-semibold hover:bg-amber-600 transition-all rounded-none flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed text-sm uppercase tracking-widest shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="w-5 h-5" /> 
              {product.stockQuantity > 0 ? 'Add to Cart — Buy Now' : 'Out of Stock'}
            </button>
            
            <div className="mt-10 pt-8 border-t border-stone-100 grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-stone-900">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className="text-sm font-semibold tracking-wide">100% Original</span>
                </div>
                <p className="text-xs text-stone-500 ml-10">Authentic handloom</p>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-stone-900">
                  <div className="w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <span className="text-sm font-semibold tracking-wide">Secure Payment</span>
                </div>
                <p className="text-xs text-stone-500 ml-10">Safe encrypted checkout</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Zoom Modal */}
      {showZoom && activeMedia.type === 'image' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 md:p-10 backdrop-blur-sm" onClick={() => setShowZoom(false)}>
          <button 
            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors"
            onClick={() => setShowZoom(false)}
          >
            <X className="w-8 h-8" />
          </button>
          <img 
            src={activeMedia.url} 
            alt={product.name} 
            className="max-w-full max-h-full object-contain cursor-zoom-out"
            onClick={(e) => e.stopPropagation()} // Let them click image without closing if we wanted pan, but close on image click is fine too
          />
        </div>
      )}
    </div>
  );
}
