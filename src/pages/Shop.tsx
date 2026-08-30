import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Product } from '../types';
import { useCart } from '../contexts/CartContext';
import { Filter, ShoppingCart, Heart } from 'lucide-react';

export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filters
  const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const [priceRange, setPriceRange] = useState(10000);
  const [selectedFabric, setSelectedFabric] = useState('all');
  const [sortBy, setSortBy] = useState('recommended');
  
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let q = query(collection(db, 'products'), where('isActive', '==', true));
        const snapshot = await getDocs(q);
        const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
        setProducts(fetched);
      } catch (err) {
        console.error("Error fetching products", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Client-side filtering and sorting
  useEffect(() => {
    let result = [...products];

    // Filter by Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.fabric?.toLowerCase().includes(q) || 
        p.color?.toLowerCase().includes(q) ||
        p.categoryId?.toLowerCase().includes(q)
      );
    }

    // Filter by Category
    if (categoryFilter) {
      result = result.filter(p => p.categoryId === categoryFilter);
    }

    // Filter by Price
    result = result.filter(p => p.price <= priceRange);

    // Filter by Fabric
    if (selectedFabric !== 'all') {
      result = result.filter(p => p.fabric?.toLowerCase().includes(selectedFabric.toLowerCase()));
    }

    // Sorting
    switch (sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        break;
      default:
        // recommended - could be by rating or featured, we'll leave as is
        break;
    }

    setFilteredProducts(result);
  }, [products, categoryFilter, priceRange, selectedFabric, sortBy]);

  const CATEGORIES = [
    { id: 'all', name: 'All Sarees' },
    { id: 'silk', name: 'Silk' },
    { id: 'cotton', name: 'Cotton' },
    { id: 'wedding', name: 'Wedding' },
    { id: 'party', name: 'Party Wear' }
  ];
  
  const FABRICS = ['all', 'pure silk', 'art silk', 'cotton', 'linen', 'georgette', 'chiffon'];

  const setCategory = (cat: string) => {
    if (cat === 'all') {
      searchParams.delete('category');
    } else {
      searchParams.set('category', cat);
    }
    setSearchParams(searchParams);
  };
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex flex-col md:flex-row gap-10">
      {/* Sidebar Filters */}
      <aside className="w-full md:w-64 shrink-0">
        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-stone-100 md:sticky md:top-24">
          <div className="hidden md:flex items-center gap-2 font-serif text-xl text-stone-900 mb-8 pb-4 border-b border-stone-100">
            <Filter className="w-5 h-5" /> Filters
          </div>
          
          <div className="space-y-4 md:space-y-8">
            {/* Category Filter */}
            <div>
              <h3 className="font-sans tracking-widest text-xs uppercase text-stone-900 font-semibold mb-4 hidden md:block">Categories</h3>
              <ul className="flex overflow-x-auto pb-4 md:pb-0 md:flex-col gap-3 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <li key={cat.id} className="shrink-0">
                    <button
                      onClick={() => setCategory(cat.id)}
                      className={`text-sm px-5 py-2 md:px-0 md:py-1 rounded-full md:rounded-none whitespace-nowrap transition-all duration-300 flex items-center gap-2 ${
                        (categoryFilter === cat.id || (!categoryFilter && cat.id === 'all'))
                          ? 'bg-amber-100 text-amber-800 md:bg-transparent md:text-amber-600 font-semibold md:translate-x-2'
                          : 'bg-stone-50 text-stone-600 md:bg-transparent md:text-stone-500 hover:text-amber-600 md:hover:translate-x-1'
                      }`}
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Price Filter */}
            <div className="hidden md:block">
              <h3 className="font-sans tracking-widest text-xs uppercase text-stone-900 font-semibold mb-4">Max Price: ₹{priceRange}</h3>
              <input 
                type="range" 
                min="500" 
                max="20000" 
                step="500"
                value={priceRange} 
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
              <div className="flex justify-between text-xs text-stone-400 mt-2">
                <span>₹500</span>
                <span>₹20,000+</span>
              </div>
            </div>

            {/* Fabric Filter */}
            <div className="hidden md:block">
              <h3 className="font-sans tracking-widest text-xs uppercase text-stone-900 font-semibold mb-4">Fabric</h3>
              <ul className="space-y-2">
                {FABRICS.map(fabric => (
                  <li key={fabric}>
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <input 
                        type="radio" 
                        name="fabric"
                        value={fabric}
                        checked={selectedFabric === fabric}
                        onChange={(e) => setSelectedFabric(e.target.value)}
                        className="w-4 h-4 text-amber-500 border-stone-300 focus:ring-amber-500 cursor-pointer"
                      />
                      <span className={`text-sm capitalize transition-colors ${selectedFabric === fabric ? 'text-amber-600 font-medium' : 'text-stone-500 group-hover:text-stone-800'}`}>
                        {fabric}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-10 flex justify-between items-end border-b border-stone-100 pb-4">
          <h1 className="text-3xl md:text-4xl font-serif text-stone-900 tracking-tight">
            {searchQuery ? `Search: "${searchQuery}"` : categoryFilter ? CATEGORIES.find(c => c.id === categoryFilter)?.name : 'All Sarees'}
          </h1>
          {searchQuery && (
            <button onClick={() => {
              searchParams.delete('search');
              setSearchParams(searchParams);
            }} className="ml-4 text-xs font-semibold text-amber-600 hover:text-amber-700 tracking-widest uppercase">
              Clear Search
            </button>
          )}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-stone-400 bg-stone-50 px-3 py-1 rounded-full hidden sm:block">{filteredProducts.length} Items</span>
            <select 
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-sm font-medium text-stone-600 bg-white border border-stone-200 px-4 py-2 rounded-full focus:outline-none focus:border-amber-400"
            >
              <option value="recommended">Recommended</option>
              <option value="newest">Newest Arrivals</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="animate-pulse bg-stone-100 h-[26rem] rounded-2xl"></div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-32 bg-stone-50 rounded-2xl border border-stone-100">
            <p className="text-stone-500 mb-6 font-serif text-lg">No products found in this category.</p>
            <button onClick={() => setCategory('all')} className="px-8 py-3 bg-white border border-stone-200 rounded-full text-stone-800 hover:border-amber-500 hover:text-amber-600 transition-colors shadow-sm font-medium">
              View All Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-8">
            {filteredProducts.map(product => (
              <div key={product.id} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden group shadow-sm hover:shadow-xl transition-all duration-500 border border-stone-100 flex flex-col">
                <div className="relative h-56 sm:h-96 overflow-hidden bg-stone-50 group-hover:bg-stone-100 transition-colors">
                  <Link to={`/product/${product.id}`} className="block w-full h-full">
                  <img 
                    src={product.images && product.images[0] ? product.images[0] : 'https://images.unsplash.com/photo-1610189013233-286820bbba61?q=80&w=600&auto=format&fit=crop'} 
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-stone-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {product.discountPrice && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-stone-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm tracking-widest">
                      SALE
                    </div>
                  )}
                                 </Link>
                  <button className="absolute top-4 right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 hover:scale-110 shadow-sm transition-all z-10">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className="p-4 sm:p-6 flex-1 flex flex-col">
                  <Link to={`/product/${product.id}`}>
                    <h3 className="font-serif text-sm sm:text-lg text-stone-800 mb-1 sm:mb-2 hover:text-amber-600 transition-colors line-clamp-2 leading-snug">{product.name}</h3>
                  </Link>
                  <p className="text-[10px] sm:text-xs font-medium text-stone-500 mb-3 uppercase tracking-widest">{product.fabric} • {product.color}</p>
                  
                  <div className="mt-auto w-full">
                    <div className="flex items-center gap-2 sm:gap-3 mb-4">
                      <span className="font-sans font-semibold text-sm sm:text-lg text-amber-600">₹{product.discountPrice || product.price}</span>
                      {product.discountPrice && (
                        <span className="text-stone-400 line-through text-[10px] sm:text-sm">₹{product.price}</span>
                      )}
                    </div>
                    
                    <button 
                      onClick={() => addToCart(product)}
                      className="w-full py-2.5 sm:py-3.5 text-xs sm:text-sm bg-white border border-stone-900 text-stone-900 font-semibold hover:bg-stone-900 hover:text-white transition-all rounded-none flex items-center justify-center gap-2 tracking-widest uppercase"
                    >
                      <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> <span className="hidden sm:inline">Add to Cart</span><span className="sm:hidden">Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
