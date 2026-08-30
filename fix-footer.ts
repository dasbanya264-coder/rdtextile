import fs from 'fs';

let content = `import { Link } from 'react-router-dom';
import { MapPin, Instagram, Facebook, Mail, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-stone-950 text-stone-300">
      <div className="border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
            <div className="col-span-1 lg:col-span-1">
              <Link to="/" className="flex flex-col gap-3 mb-6">
                <img 
                  src="/logo.png?v=4" 
                  alt="Ripan Saree Center Logo" 
                  className="w-16 h-16 object-contain rounded-full bg-white p-1"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-16 h-16 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center text-white font-serif font-bold text-3xl">
                  R
                </div>
                <div>
                  <span className="font-serif font-bold text-xl md:text-2xl tracking-wide text-white block">
                    Ripan Saree Center
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-amber-500 font-semibold mt-1 block">
                    Luxury Handloom Boutique
                  </span>
                </div>
              </Link>
              <p className="text-sm text-stone-400 mb-6 leading-relaxed">
                Discover the finest collection of authentic handloom sarees, blending traditional artistry with modern elegance. Curated specially for the woman of today.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-amber-500 hover:border-amber-500 transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center text-stone-400 hover:text-amber-500 hover:border-amber-500 transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-serif font-medium mb-6 tracking-wide text-lg">Shop Collection</h3>
              <ul className="space-y-3 text-sm text-stone-400">
                <li><Link to="/shop?category=silk" className="hover:text-amber-400 transition-colors">Pure Silk Sarees</Link></li>
                <li><Link to="/shop?category=cotton" className="hover:text-amber-400 transition-colors">Handloom Cotton</Link></li>
                <li><Link to="/shop?category=wedding" className="hover:text-amber-400 transition-colors">Bridal & Wedding</Link></li>
                <li><Link to="/shop?category=party" className="hover:text-amber-400 transition-colors">Designer Party Wear</Link></li>
                <li><Link to="/shop" className="hover:text-amber-400 transition-colors">View All Sarees</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-serif font-medium mb-6 tracking-wide text-lg">Customer Care</h3>
              <ul className="space-y-3 text-sm text-stone-400">
                <li><Link to="/profile" className="hover:text-amber-400 transition-colors">My Account</Link></li>
                <li><Link to="/profile" className="hover:text-amber-400 transition-colors">Track Order</Link></li>
                <li><Link to="/shipping" className="hover:text-amber-400 transition-colors">Shipping & Delivery</Link></li>
                <li><Link to="/returns" className="hover:text-amber-400 transition-colors">Returns & Exchanges</Link></li>
                <li><Link to="/faq" className="hover:text-amber-400 transition-colors">FAQs</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-white font-serif font-medium mb-6 tracking-wide text-lg">Visit Us</h3>
              <ul className="space-y-4 text-sm text-stone-400">
                <li className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col gap-2">
                    <span>234, Soumendra Nath Thakur Rd<br/>Santipur, West Bengal – 741404</span>
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=234,+Soumendra+Nath+Thakur+Rd,+Santipur,+West+Bengal+741404" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-amber-500 hover:text-amber-400 uppercase tracking-widest font-semibold transition-colors w-fit"
                    >
                      Get Directions &rarr;
                    </a>
                  </div>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>+91 7811074014</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-amber-500 shrink-0" />
                  <span>rd919665@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-stone-500 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Ripan Saree Center. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-xs text-stone-500 uppercase tracking-widest">
          <Link to="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
          <span className="w-1 h-1 bg-stone-700 rounded-full"></span>
          <Link to="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
`;

fs.writeFileSync('src/components/layout/Footer.tsx', content);
