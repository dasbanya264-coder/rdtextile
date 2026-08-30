import fs from 'fs';

let content = fs.readFileSync('src/pages/Shop.tsx', 'utf-8');

// Replace everything above return statement to add state and filtering logic
content = content.replace(
  /export default function Shop\(\) \{.*?(?=  return \()/s,
  `export default function Shop() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Filters
  const categoryFilter = searchParams.get('category');
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
`
);

// Replace mapping to use filteredProducts instead of products
content = content.replace(
  /products\.length === 0/g,
  `filteredProducts.length === 0`
);
content = content.replace(
  /products\.map/g,
  `filteredProducts.map`
);
content = content.replace(
  /\{products\.length\} Items/g,
  `{filteredProducts.length} Items`
);

// Replace Sidebar Filters block
content = content.replace(
  /<div className="space-y-4 md:space-y-6">.*?<\/div>\s*<\/div>\s*<\/aside>/s,
  `<div className="space-y-4 md:space-y-8">
            {/* Category Filter */}
            <div>
              <h3 className="font-sans tracking-widest text-xs uppercase text-stone-900 font-semibold mb-4 hidden md:block">Categories</h3>
              <ul className="flex overflow-x-auto pb-4 md:pb-0 md:flex-col gap-3 scrollbar-hide">
                {CATEGORIES.map(cat => (
                  <li key={cat.id} className="shrink-0">
                    <button
                      onClick={() => setCategory(cat.id)}
                      className={\`text-sm px-5 py-2 md:px-0 md:py-1 rounded-full md:rounded-none whitespace-nowrap transition-all duration-300 flex items-center gap-2 \${
                        (categoryFilter === cat.id || (!categoryFilter && cat.id === 'all'))
                          ? 'bg-amber-100 text-amber-800 md:bg-transparent md:text-amber-600 font-semibold md:translate-x-2'
                          : 'bg-stone-50 text-stone-600 md:bg-transparent md:text-stone-500 hover:text-amber-600 md:hover:translate-x-1'
                      }\`}
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
                      <span className={\`text-sm capitalize transition-colors \${selectedFabric === fabric ? 'text-amber-600 font-medium' : 'text-stone-500 group-hover:text-stone-800'}\`}>
                        {fabric}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
            
          </div>
        </div>
      </aside>`
);

// Add Sort dropdown next to Items count
content = content.replace(
  /<span className="text-sm font-medium text-stone-400 bg-stone-50 px-3 py-1 rounded-full">\{filteredProducts\.length\} Items<\/span>/,
  `<div className="flex items-center gap-4">
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
          </div>`
);

// Update product card design to luxury
content = content.replace(
  /<Link to=\{`\/product\/\$\{product\.id\}`\} className="relative h-48 sm:h-\[22rem\] overflow-hidden block bg-stone-50">/g,
  `<div className="relative h-56 sm:h-96 overflow-hidden bg-stone-50 group-hover:bg-stone-100 transition-colors">
                  <Link to={\`/product/\${product.id}\`} className="block w-full h-full">`
);
content = content.replace(
  /<\/Link>\s*<div className="p-3 sm:p-6 flex-1 flex flex-col items-center text-center">/g,
  `                 </Link>
                  <button className="absolute top-4 right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-stone-400 hover:text-red-500 hover:scale-110 shadow-sm transition-all z-10">
                    <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
                <div className="p-4 sm:p-6 flex-1 flex flex-col">`
);
content = content.replace(
  /<Link to=\{`\/product\/\$\{product\.id\}`\}>\s*<h3 className="font-serif text-sm sm:text-xl text-stone-800 mb-1 sm:mb-1\.5 hover:text-amber-600 transition-colors line-clamp-1">\{product\.name\}<\/h3>\s*<\/Link>\s*<p className="text-\[10px\] sm:text-xs font-medium text-stone-400 mb-2 sm:mb-4 uppercase tracking-wider">\{product\.fabric\} • \{product\.color\}<\/p>/g,
  `<Link to={\`/product/\${product.id}\`}>
                    <h3 className="font-serif text-sm sm:text-lg text-stone-800 mb-1 sm:mb-2 hover:text-amber-600 transition-colors line-clamp-2 leading-snug">{product.name}</h3>
                  </Link>
                  <p className="text-[10px] sm:text-xs font-medium text-stone-500 mb-3 uppercase tracking-widest">{product.fabric} • {product.color}</p>`
);
content = content.replace(
  /<div className="flex justify-center items-center gap-2 sm:gap-3 mb-3 sm:mb-6 flex-wrap">/g,
  `<div className="flex items-center gap-2 sm:gap-3 mb-4">`
);
content = content.replace(
  /<button\s*onClick=\{.*?addToCart\(product\)\}\s*className=".*?bg-stone-900.*?"\s*>/g,
  `<button 
                      onClick={() => addToCart(product)}
                      className="w-full py-2.5 sm:py-3.5 text-xs sm:text-sm bg-white border border-stone-900 text-stone-900 font-semibold hover:bg-stone-900 hover:text-white transition-all rounded-none flex items-center justify-center gap-2 tracking-widest uppercase"
                    >`
);

fs.writeFileSync('src/pages/Shop.tsx', content);
