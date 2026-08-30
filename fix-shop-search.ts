import fs from 'fs';

let content = fs.readFileSync('src/pages/Shop.tsx', 'utf-8');

// Add searchParam extraction
content = content.replace(
  /const categoryFilter = searchParams\.get\('category'\);/,
  `const categoryFilter = searchParams.get('category');
  const searchQuery = searchParams.get('search');`
);

// Apply search filtering
content = content.replace(
  /\/\/ Filter by Category\s+if \(categoryFilter\) \{/,
  `// Filter by Search Query
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
    if (categoryFilter) {`
);

// Add clear search if active
content = content.replace(
  /<h1 className="text-4xl font-serif text-stone-900 tracking-tight">[\s\S]*?<\/h1>/,
  `<h1 className="text-3xl md:text-4xl font-serif text-stone-900 tracking-tight">
            {searchQuery ? \`Search: "\${searchQuery}"\` : categoryFilter ? CATEGORIES.find(c => c.id === categoryFilter)?.name : 'All Sarees'}
          </h1>
          {searchQuery && (
            <button onClick={() => {
              searchParams.delete('search');
              setSearchParams(searchParams);
            }} className="ml-4 text-xs font-semibold text-amber-600 hover:text-amber-700 tracking-widest uppercase">
              Clear Search
            </button>
          )}`
);

fs.writeFileSync('src/pages/Shop.tsx', content);
