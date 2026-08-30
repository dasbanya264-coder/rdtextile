import fs from 'fs';

let content = fs.readFileSync('src/components/layout/Navbar.tsx', 'utf-8');

// Replace standard input with a form
content = content.replace(
  /<input\s+type="text"\s+placeholder="Search\.\.\."\s+className=".*?"\s*\/>/s,
  `<form onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.target as typeof e.target & { search: { value: string } };
                  if (target.search.value.trim()) navigate(\`/shop?search=\${encodeURIComponent(target.search.value.trim())}\`);
                }}>
                  <input
                    type="text"
                    name="search"
                    placeholder="Search..."
                    className="w-48 pl-10 pr-4 py-1.5 rounded-full border border-stone-200 bg-stone-50 focus:outline-none focus:border-amber-400 focus:bg-white focus:w-64 transition-all duration-300 text-sm"
                  />
                </form>`
);

fs.writeFileSync('src/components/layout/Navbar.tsx', content);
