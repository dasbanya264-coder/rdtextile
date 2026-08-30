import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, ArrowRight, Minus, Plus, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../lib/utils';

export default function Cart() {
  const { items, removeFromCart, updateQuantity, subtotal } = useCart();
  const deliveryCharge = items.length > 0 ? (subtotal > 2000 ? 0 : 150) : 0;
  const total = subtotal + deliveryCharge;

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center mb-6">
          <ShoppingCart className="w-10 h-10 text-stone-400" />
        </div>
        <h1 className="text-3xl font-serif text-stone-900 mb-4">Your Cart is Empty</h1>
        <p className="text-stone-500 mb-8 max-w-md text-center">
          Looks like you haven't added any premium sarees to your cart yet.
        </p>
        <Link 
          to="/shop" 
          className="px-8 py-3 bg-stone-900 text-white font-sans font-semibold hover:bg-amber-600 transition-colors rounded-none uppercase tracking-widest text-sm shadow-md"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-serif text-stone-900 mb-8">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white border-y border-stone-100 sm:border sm:rounded-xl sm:shadow-sm overflow-hidden">
            <ul className="divide-y divide-stone-200">
              {items.map((item) => (
                <li key={item.product.id} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6 group">
                  <div className="sm:w-32 sm:h-40 shrink-0 overflow-hidden rounded-md border border-stone-100">
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex flex-col sm:flex-row justify-between sm:items-start mb-2 gap-1 sm:gap-4">
                        <h3 className="font-serif text-lg text-stone-900">{item.product.name}</h3>
                        <p className="font-semibold text-stone-900 whitespace-nowrap">
                          {formatPrice((item.product.discountPrice || item.product.price) * item.quantity)}
                        </p>
                      </div>
                      <p className="text-sm text-stone-500 mb-1">SKU: {item.product.sku}</p>
                      <p className="text-sm text-stone-500 mb-4">Fabric: {item.product.fabric} | Color: {item.product.color}</p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between mt-4 sm:mt-0 gap-4">
                      <div className="flex items-center border border-stone-200 rounded-md bg-stone-50">
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          className="p-2 text-stone-500 hover:text-stone-900 transition-colors"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-10 text-center font-medium text-sm">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          className="p-2 text-stone-500 hover:text-stone-900 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-stone-400 hover:text-red-500 transition-colors flex items-center gap-1 text-sm font-medium"
                      >
                        <Trash2 className="w-4 h-4" /> Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg border border-stone-200 shadow-sm p-6 sticky top-24">
            <h2 className="text-lg font-serif text-stone-900 mb-6">Order Summary</h2>
            
            <div className="space-y-4 text-sm text-stone-600 border-b border-stone-200 pb-6 mb-6">
              <div className="flex justify-between">
                <span>Subtotal ({items.length} items)</span>
                <span className="font-medium text-stone-900">{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Charge</span>
                <span className="font-medium text-stone-900">
                  {deliveryCharge === 0 ? <span className="text-green-600">Free</span> : formatPrice(deliveryCharge)}
                </span>
              </div>
              {deliveryCharge > 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
                  Add {formatPrice(2000 - subtotal)} more to get free delivery!
                </p>
              )}
            </div>

            <div className="flex justify-between items-center mb-8">
              <span className="text-lg font-semibold text-stone-900">Total</span>
              <span className="text-2xl font-serif text-amber-600">{formatPrice(total)}</span>
            </div>

            <Link 
              to="/checkout"
              className="w-full py-4 bg-stone-900 text-white font-medium hover:bg-amber-600 transition-colors rounded-sm flex items-center justify-center gap-2"
            >
              Proceed to Checkout <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-xs text-stone-500 justify-center">
                <span className="w-full h-px bg-stone-200 flex-1"></span>
                <span className="px-2">We Accept</span>
                <span className="w-full h-px bg-stone-200 flex-1"></span>
              </div>
              <p className="text-center text-xs text-stone-400 font-medium tracking-wider">
                UPI • Google Pay • PhonePe • COD
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
