import fs from 'fs';

let content = fs.readFileSync('src/pages/Cart.tsx', 'utf-8');

// Add ShoppingCart import
content = content.replace(
  /import \{ Trash2, ArrowRight, Minus, Plus \} from 'lucide-react';/,
  `import { Trash2, ArrowRight, Minus, Plus, ShoppingCart, ShieldCheck } from 'lucide-react';`
);

// Upgrade empty cart
content = content.replace(
  /className="px-8 py-3 bg-amber-500 text-white font-medium hover:bg-amber-600 transition-colors rounded-sm"/,
  `className="px-8 py-3 bg-stone-900 text-white font-sans font-semibold hover:bg-amber-600 transition-colors rounded-none uppercase tracking-widest text-sm shadow-md"`
);

// Upgrade layout
content = content.replace(
  /bg-white rounded-lg border border-stone-200 shadow-sm overflow-hidden/g,
  `bg-white border-y border-stone-100 sm:border sm:rounded-xl sm:shadow-sm overflow-hidden`
);

content = content.replace(
  /className="p-6 flex flex-col sm:flex-row gap-6"/g,
  `className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 group"`
);

content = content.replace(
  /className="w-full sm:w-32 h-32 object-cover rounded-md"/g,
  `className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg bg-stone-50"`
);

// Upgrade checkout button
content = content.replace(
  /className="w-full py-4 bg-stone-900 text-white font-medium hover:bg-amber-600 transition-colors rounded-lg flex items-center justify-center gap-2"/g,
  `className="w-full py-4 bg-stone-900 text-white font-sans font-semibold hover:bg-amber-600 transition-all rounded-none flex items-center justify-center gap-2 uppercase tracking-widest text-sm shadow-md hover:shadow-lg mt-6"`
);

fs.writeFileSync('src/pages/Cart.tsx', content);
