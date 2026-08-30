import fs from 'fs';

let content = fs.readFileSync('src/pages/Checkout.tsx', 'utf-8');

// Replace local storage key
content = content.replace(
  /localStorage\.getItem\('rd_textile_checkout_data'\)/g,
  `localStorage.getItem('ripan_saree_checkout_data')`
);
content = content.replace(
  /localStorage\.setItem\('rd_textile_checkout_data'/g,
  `localStorage.setItem('ripan_saree_checkout_data'`
);

// Upgrade checkout styling
content = content.replace(
  /className="bg-white p-6 md:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6 relative overflow-hidden"/g,
  `className="bg-white p-6 md:p-8 border border-stone-100 shadow-sm space-y-6 relative overflow-hidden"`
);

content = content.replace(
  /className="w-full bg-stone-900 text-white font-medium py-3\.5 rounded-lg hover:bg-stone-800 transition-colors"/g,
  `className="w-full bg-stone-900 text-white font-semibold py-4 rounded-none hover:bg-amber-600 transition-colors uppercase tracking-widest text-sm shadow-md mt-6"`
);

content = content.replace(
  /className="w-full bg-stone-900 text-white font-medium py-3\.5 rounded-lg hover:bg-stone-800 transition-colors mt-8 flex items-center justify-center gap-2"/g,
  `className="w-full bg-stone-900 text-white font-semibold py-4 rounded-none hover:bg-amber-600 transition-colors mt-8 flex items-center justify-center gap-2 uppercase tracking-widest text-sm shadow-md"`
);

content = content.replace(
  /className="px-6 py-2 border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors font-medium"/g,
  `className="px-6 py-3 border border-stone-300 rounded-none hover:bg-stone-50 transition-colors font-semibold uppercase tracking-widest text-xs"`
);

content = content.replace(
  /className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium"/g,
  `className="px-8 py-3 bg-stone-900 text-white rounded-none hover:bg-amber-600 transition-colors font-semibold uppercase tracking-widest text-xs shadow-sm"`
);

content = content.replace(
  /className="text-xs sm:text-sm flex items-center gap-1 text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1\.5 rounded-full font-medium transition-colors"/g,
  `className="text-xs flex items-center gap-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-none font-semibold transition-colors uppercase tracking-widest"`
);

content = content.replace(
  /className="w-full border border-stone-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors"/g,
  `className="w-full border border-stone-300 rounded-none p-3.5 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors text-sm"`
);

content = content.replace(
  /className="w-full border border-stone-300 rounded-lg p-3 focus:ring-amber-500 focus:border-amber-500 outline-none transition-colors bg-stone-50"/g,
  `className="w-full border border-stone-300 rounded-none p-3.5 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors bg-stone-50 text-sm"`
);

fs.writeFileSync('src/pages/Checkout.tsx', content);
