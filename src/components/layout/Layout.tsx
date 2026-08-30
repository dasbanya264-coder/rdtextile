import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNav from './BottomNav';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import { WifiOff } from 'lucide-react';

export default function Layout() {
  const isOnline = useNetworkStatus();
  return (
    <div className="min-h-screen flex flex-col bg-stone-50 relative pb-16 md:pb-0">
      <Navbar />
      {!isOnline && (
        <div className="fixed top-16 left-0 right-0 z-50 bg-red-500 text-white px-4 py-2 text-center text-sm font-medium shadow-md flex items-center justify-center gap-2">
          <WifiOff className="w-4 h-4" />
          You are offline. Please check your internet connection.
        </div>
      )}
      <main className="flex-grow pt-16 safe-area-pb">
        <Outlet />
      </main>
      <Footer />
      
      {/* Floating Action Buttons */}
      <div className="fixed bottom-20 md:bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* Google Maps Button */}
        <a
          href="https://www.google.com/maps/search/?api=1&query=234,+Soumendra+Nath+Thakur+Rd,+Santipur,+West+Bengal+741404"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-white text-blue-600 p-2.5 md:p-3 rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center group border border-stone-200"
          aria-label="Find us on Google Maps"
        >
          <svg 
            viewBox="0 0 24 24" 
            width="24" 
            height="24" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-6 h-6"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          <span className="absolute right-full mr-4 bg-white text-stone-800 text-sm font-medium px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 hidden md:block border border-stone-100">
            Find us on Maps
          </span>
        </a>

        {/* WhatsApp Button */}
        <a
          href="https://wa.me/917811074014?text=Hello%20Ripan%20Saree%20Center,%20I%20have%20a%20query."
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-lg hover:bg-[#128C7E] hover:scale-110 transition-all duration-300 flex items-center justify-center group"
          aria-label="Chat on WhatsApp"
        >
          <svg 
            viewBox="0 0 24 24" 
            width="28" 
            height="28" 
            stroke="currentColor" 
            strokeWidth="2" 
            fill="none" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className="w-7 h-7"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
          </svg>
          <span className="absolute right-full mr-4 bg-white text-stone-800 text-sm font-medium px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 hidden md:block">
            Chat with us!
          </span>
        </a>
      </div>
      
      <BottomNav />
    </div>
  );
}
