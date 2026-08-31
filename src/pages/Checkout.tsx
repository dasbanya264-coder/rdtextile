import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { signInAnonymously } from 'firebase/auth';
import { formatPrice, compressImage, compressImageToBase64, createThumbnailFromBase64 } from '../lib/utils';
import type { Order } from '../types';

import QRCode from 'react-qr-code';
import { QrCode, Smartphone, MapPin, UploadCloud, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoProgress, setPhotoProgress] = useState<number>(0);


  const [step, setStep] = useState(1);

  // Ensure user is at least authenticated anonymously for uploads and order creation
  useEffect(() => {
    if (!user) {
      signInAnonymously(auth).catch(console.error);
    }
  }, [user]);


  const formRef = useRef<HTMLFormElement>(null);

  const [formData, setFormData] = useState(() => {
    const savedData = localStorage.getItem('ripan_saree_checkout_data');
    const defaultData = {
      fullName: user?.displayName || '',
      phone: '',
      street: '',
      village: '',
      district: '',
      pinCode: '',
      state: 'West Bengal',
      paymentMethod: 'cod' as 'cod' | 'upi',
      transactionId: ''
    };

    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        return {
          ...defaultData,
          ...parsed,
          fullName: user?.displayName || parsed.fullName || '',
          paymentMethod: 'cod' as 'cod' | 'upi', // Always reset to COD by default
          transactionId: '' // Always clear transaction ID
        };
      } catch (e) {
        return defaultData;
      }
    }
    return defaultData;
  });

  // Save address data to localStorage whenever it changes
  useEffect(() => {
    const dataToSave = {
      fullName: formData.fullName,
      phone: formData.phone,
      street: formData.street,
      village: formData.village,
      district: formData.district,
      pinCode: formData.pinCode,
      state: formData.state,
    };
    localStorage.setItem('ripan_saree_checkout_data', JSON.stringify(dataToSave));
  }, [formData.fullName, formData.phone, formData.street, formData.village, formData.district, formData.pinCode, formData.state]);

  const isValidUTR = (utr: string) => {
    if (!utr || utr.length !== 12) return false;
    // Check if it's all same digits (e.g., 000000000000, 111111111111)
    if (/^(\d)\1{11}$/.test(utr)) return false;
    // Check for sequential fake digits
    const sequential = ['123456789012', '012345678901', '987654321098'];
    if (sequential.includes(utr)) return false;
    return true;
  };

  useEffect(() => {
    if (step === 3 && formData.paymentMethod === 'upi' && isValidUTR(formData.transactionId) && !loading) {
      const timer = setTimeout(() => {
        if (formRef.current) {
          formRef.current.requestSubmit();
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [formData.transactionId, step, formData.paymentMethod, loading]);

  const deliveryCharge = items.length > 0 ? (subtotal > 2000 ? 0 : 150) : 0;
  const total = subtotal + deliveryCharge;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length <= 10) {
      setFormData({...formData, phone: value});
    }
  };

  const validateAddressAndNext = () => {
    if (!formData.fullName || !formData.phone || !formData.street || !formData.village || !formData.district || !formData.pinCode) {
      alert("Please fill out all address fields.");
      return;
    }
    if (formData.phone.length !== 10 || !/^[6-9]\d{9}$/.test(formData.phone)) {
      alert("Please enter a valid 10-digit Indian phone number.");
      return;
    }
    setStep(2);
  };

  const validateSummaryAndNext = () => {
    setStep(3);
  };

  
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    setPhotoError(null);
    setPhotoProgress(0);

    try {
      const urls: string[] = [];
      const fileArray = Array.from(files).slice(0, 2);
      if (files.length > 2) alert("Only the first 2 images will be uploaded.");
      const totalFiles = fileArray.length;
      
      for (let i = 0; i < totalFiles; i++) {
        const file = fileArray[i] as File;
        const fileId = `customer_photo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}_${i}`;
        
        const options = {
          maxSizeMB: 1.5,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp',
          initialQuality: 0.8
        };
        const compressedFile = await compressImage(file);

        const storageRef = ref(storage, `orders/photos/${fileId}.webp`);
        const uploadTask = uploadBytesResumable(storageRef, compressedFile);

        const url = await new Promise<string>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const baseProgress = (i / totalFiles) * 100;
              const currentFileProgress = (snapshot.bytesTransferred / snapshot.totalBytes) * (100 / totalFiles);
              setPhotoProgress(Math.round(baseProgress + currentFileProgress));
            },
            (error) => {
              console.error("Upload failed:", error);
              reject(error);
            },
            async () => {
              const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadUrl);
            }
          );
        });
        urls.push(url);
      }

      setUploadedPhotos(prev => [...prev, ...urls]);
    } catch (err) {
      console.error("Error uploading photo:", err);
      setPhotoError("Photo upload failed. Please try again.");
    } finally {
      setUploadingPhoto(false);
      setPhotoProgress(0);
      if (e.target) e.target.value = ''; 
    }
  };

  const removePhoto = (urlToRemove: string) => {
    setUploadedPhotos(prev => prev.filter(url => url !== urlToRemove));
  };

  const getLiveLocation = () => {
    if (!navigator.geolocation) {
      alert("Your browser does not support geolocation.");
      return;
    }
    
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        
        // Try to reverse geocode using free Nominatim API to get human readable address
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data && data.address) {
            setFormData(prev => ({
              ...prev,
              village: data.address.village || data.address.city || data.address.town || '',
              district: data.address.state_district || data.address.county || '',
              pinCode: data.address.postcode || '',
              state: data.address.state || prev.state,
              // Append the Google Maps link to the street so admin gets the exact pin
              street: `[Live Pin: ${mapsUrl}] ${data.address.road || data.address.suburb || data.display_name?.split(',')[0] || ''}`
            }));
          } else {
            setFormData(prev => ({ ...prev, street: `[Live Pin: ${mapsUrl}]` }));
          }
        } catch (error) {
          // Fallback to just the URL if reverse geocoding fails
          setFormData(prev => ({ ...prev, street: `[Live Pin: ${mapsUrl}]` }));
        }
        
        setLocationLoading(false);
      },
      (error) => {
        console.error(error);
        alert("Failed to get location. Please allow location access in your browser settings.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    // Extra validation for phone
    if (formData.phone.length !== 10 || !/^[6-9]\d{9}$/.test(formData.phone)) {
      alert("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    if (formData.paymentMethod === 'upi' && !isValidUTR(formData.transactionId.trim())) {
      alert("Please enter a valid 12-digit UPI Transaction ID / UTR. Fake or repeating numbers are not allowed.");
      return;
    }

    if (items.length === 0) return;
    setLoading(true);

    try {
      // Generate thumbnails for order history to avoid 1MB limit for legacy large images
      const orderItems = await Promise.all(items.map(async (item) => {
        let thumb = item.product.images[0] || '';
        try {
          thumb = await createThumbnailFromBase64(thumb);
        } catch (e) { console.error(e); }
        
        return {
          productId: item.product.id,
          name: item.product.name,
          price: item.product.discountPrice || item.product.price,
          quantity: item.quantity,
          image: thumb
        };
      }));

      const orderData: Omit<Order, 'id'> = {
        userId: user?.uid || 'guest',
        items: orderItems,
        subtotal,
        deliveryCharge,
        total,
        status: 'pending',
        paymentMethod: formData.paymentMethod,
        uploadedPhotos: uploadedPhotos,
        paymentStatus: 'pending',
        transactionId: formData.paymentMethod === 'upi' ? formData.transactionId : null,
        shippingAddress: {
          id: Date.now().toString(),
          fullName: formData.fullName,
          phone: formData.phone,
          street: formData.street,
          village: formData.village,
          district: formData.district,
          pinCode: formData.pinCode,
          state: formData.state,
          isDefault: true
        },
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'orders'), orderData);
      clearCart();
      alert('Order placed successfully!');
      navigate('/');
    } catch (err) {
      console.error('Error placing order:', err);
      alert('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart');
    }
  }, [items.length, navigate]);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-serif text-stone-900 mb-8">Checkout</h1>
      
      {/* Steps Indicator */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-stone-200 -z-10 rounded-full"></div>
        <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-amber-500 -z-10 rounded-full transition-all duration-500`} style={{ width: `${((step - 1) / 2) * 100}%` }}></div>
        
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${step >= 1 ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-stone-300 text-stone-400'}`}>1</div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-500 ${step >= 2 ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-stone-300 text-stone-400'}`}>2</div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-colors duration-500 ${step >= 3 ? 'bg-amber-500 border-amber-500 text-white' : 'bg-white border-stone-300 text-stone-400'}`}>3</div>
      </div>
      <div className="flex justify-between text-xs font-medium text-stone-500 mb-8 px-2 uppercase tracking-widest">
        <span>Address</span>
        <span>Summary</span>
        <span>Payment</span>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <form id="checkout-form" ref={formRef} onSubmit={handleSubmit} className="bg-white p-6 md:p-8 border border-stone-100 shadow-sm space-y-6 relative overflow-hidden">
            
            {/* Step 1: Address */}
            {step === 1 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex justify-between items-center mb-6 border-b border-stone-100 pb-4">
                  <h2 className="text-2xl font-serif text-stone-900">Shipping Address</h2>
                  <button 
                    type="button" 
                    onClick={getLiveLocation}
                    disabled={locationLoading}
                    className="text-xs flex items-center gap-1.5 text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 px-4 py-2 rounded-none font-semibold transition-colors uppercase tracking-widest"
                  >
                    <MapPin className="w-4 h-4" />
                    {locationLoading ? 'Locating...' : 'Use Live Location'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Full Name</label>
                    <input required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full border border-stone-300 rounded-none p-3.5 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Phone Number</label>
                    <input 
                      required 
                      type="tel"
                      value={formData.phone} 
                      onChange={handlePhoneChange}
                      placeholder="10-digit mobile number"
                      pattern="[6-9][0-9]{9}"
                      title="Please enter a valid 10-digit Indian phone number starting with 6, 7, 8, or 9"
                      className="w-full border border-stone-300 rounded-none p-3.5 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors text-sm" 
                    />
                    {formData.phone && formData.phone.length > 0 && formData.phone.length < 10 && (
                      <p className="text-xs text-red-500 mt-1.5">Please enter 10 digits.</p>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">House / Street / Map Link</label>
                    <input required value={formData.street} onChange={e => setFormData({...formData, street: e.target.value})} className="w-full border border-stone-300 rounded-none p-3.5 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors text-sm" placeholder="Enter address or use live location" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">Village / Town</label>
                    <input required value={formData.village} onChange={e => setFormData({...formData, village: e.target.value})} className="w-full border border-stone-300 rounded-none p-3.5 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">District</label>
                    <input required value={formData.district} onChange={e => setFormData({...formData, district: e.target.value})} className="w-full border border-stone-300 rounded-none p-3.5 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">PIN Code</label>
                    <input required value={formData.pinCode} onChange={e => setFormData({...formData, pinCode: e.target.value})} className="w-full border border-stone-300 rounded-none p-3.5 focus:ring-1 focus:ring-stone-900 focus:border-stone-900 outline-none transition-colors text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1.5">State</label>
                    <input required disabled value={formData.state} className="w-full border border-stone-200 rounded-lg p-3 bg-stone-50 text-stone-500" />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button type="button" onClick={validateAddressAndNext} className="px-8 py-3.5 bg-stone-900 text-white font-medium hover:bg-amber-600 transition-colors rounded-full flex items-center gap-2">
                    Next: Order Summary <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Summary */}
            {step === 2 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="mb-6 border-b border-stone-100 pb-4">
                  <h2 className="text-2xl font-serif text-stone-900">Order Summary</h2>
                </div>
                
                <div className="bg-stone-50 p-6 rounded-xl border border-stone-100 mb-8">
                  <div className="space-y-4 mb-6">
                    {items.map(item => (
                      <div key={item.product.id} className="flex gap-4 items-center bg-white p-3 rounded-lg border border-stone-100 shadow-sm">
                        <img src={item.product.images?.[0]} alt={item.product.name} className="w-16 h-16 object-cover rounded-md" />
                        <div className="flex-1">
                          <h4 className="font-serif text-stone-900">{item.product.name}</h4>
                          <p className="text-xs text-stone-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="font-medium text-amber-600">
                          {formatPrice((item.product.discountPrice || item.product.price) * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 text-sm text-stone-600 border-t border-stone-200 pt-6 mb-6">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-medium text-stone-900">{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Delivery Charge</span>
                      <span className="font-medium text-stone-900">
                        {deliveryCharge === 0 ? <span className="text-green-600">Free</span> : formatPrice(deliveryCharge)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-stone-200">
                    <span className="font-semibold text-lg text-stone-900">Total Amount</span>
                    <span className="text-2xl font-bold font-sans text-amber-600">{formatPrice(total)}</span>
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <button type="button" onClick={() => setStep(1)} className="px-6 py-3.5 bg-white text-stone-600 border border-stone-300 font-medium hover:bg-stone-50 hover:text-stone-900 transition-colors rounded-full flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Back
                  </button>
                  <button type="button" onClick={validateSummaryAndNext} className="px-8 py-3.5 bg-stone-900 text-white font-medium hover:bg-amber-600 transition-colors rounded-full flex items-center gap-2">
                    
                {/* Photo Upload Section */}
                <div className="mt-8 bg-stone-50 p-6 rounded-xl border border-stone-200">
                  <h3 className="text-lg font-serif text-stone-900 mb-2">Upload Reference Photos (Optional)</h3>
                  <p className="text-sm text-stone-500 mb-4">Attach any screenshots, payment receipts, or custom design references for your order.</p>
                  
                  {photoError && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-md border border-red-200">
                      {photoError}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 mb-4">
                    {uploadedPhotos.map((url, idx) => (
                      <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-stone-200 shadow-sm group">
                        <img src={url} alt="Uploaded preview" className="w-full h-full object-cover" />
                        <button 
                          type="button" 
                          onClick={() => removePhoto(url)} 
                          className="absolute top-1 right-1 bg-white/90 text-red-600 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    
                    <label className={`w-24 h-24 rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-colors ${uploadingPhoto ? 'border-stone-300 bg-stone-100' : 'border-amber-300 hover:border-amber-500 bg-white hover:bg-amber-50 text-amber-700'}`}>
                      {uploadingPhoto ? (
                        <>
                          <Loader2 className="w-6 h-6 animate-spin text-stone-400 mb-1" />
                          <span className="text-[10px] font-medium text-stone-500">{photoProgress}%</span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-6 h-6 mb-1" />
                          <span className="text-[10px] font-medium">Add Photo</span>
                        </>
                      )}
                      <input 
                        type="file" 
                        accept="image/*" 
                        multiple 
                        className="hidden" 
                        onChange={handlePhotoUpload} 
                        disabled={uploadingPhoto} 
                      />
                    </label>
                  </div>
                </div>

                    Next: Payment <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Payment */}
            {step === 3 && (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="flex items-center justify-between mb-6 border-b border-stone-100 pb-4">
                  <h2 className="text-2xl font-serif text-stone-900">Payment Method</h2>
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full text-xs font-medium border border-emerald-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    100% Secure
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <label className={`flex flex-col p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${formData.paymentMethod === 'upi' ? 'border-amber-500 bg-amber-50 shadow-md transform -translate-y-1' : 'border-stone-200 hover:border-amber-300 hover:bg-stone-50'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-amber-600">
                        <QrCode className="w-6 h-6" />
                      </div>
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={formData.paymentMethod === 'upi'}
                        onChange={() => setFormData({...formData, paymentMethod: 'upi'})}
                        className="w-5 h-5 text-amber-600 focus:ring-amber-500 border-stone-300" 
                      />
                    </div>
                    <span className="font-serif text-lg text-stone-900 mb-1">Pay Online (UPI)</span>
                    <span className="text-sm text-stone-500">GPay, PhonePe, Paytm & more</span>
                  </label>

                  <label className={`flex flex-col p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 ${formData.paymentMethod === 'cod' ? 'border-amber-500 bg-amber-50 shadow-md transform -translate-y-1' : 'border-stone-200 hover:border-amber-300 hover:bg-stone-50'}`}>
                    <div className="flex justify-between items-center mb-3">
                      <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center text-stone-700">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      </div>
                      <input 
                        type="radio" 
                        name="payment" 
                        checked={formData.paymentMethod === 'cod'}
                        onChange={() => setFormData({...formData, paymentMethod: 'cod'})}
                        className="w-5 h-5 text-amber-600 focus:ring-amber-500 border-stone-300" 
                      />
                    </div>
                    <span className="font-serif text-lg text-stone-900 mb-1">Cash on Delivery</span>
                    <span className="text-sm text-stone-500">Pay when your order arrives</span>
                  </label>
                </div>
                
                {formData.paymentMethod === 'upi' && (
                  <div className="mt-6 p-6 sm:p-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 flex flex-col items-center text-center shadow-inner">
                    <div className="bg-white p-5 rounded-2xl shadow-lg mb-6 ring-4 ring-amber-100">
                      <QRCode 
                        value={`upi://pay?pa=9064300941@ybl&pn=Banya&am=${total}&cu=INR`} 
                        size={180} 
                      />
                    </div>
                    <h3 className="text-xl font-serif text-amber-900 mb-2">Scan QR Code to Pay <span className="font-bold text-2xl">{formatPrice(total)}</span></h3>
                    <p className="text-sm font-medium text-amber-700 bg-amber-100/50 px-4 py-2 rounded-full mb-8 border border-amber-200">
                      UPI ID: <span className="tracking-wide">9064300941@ybl</span>
                    </p>
                    
                    <div className="w-full bg-white p-6 rounded-xl shadow-sm border border-amber-100">
                      <p className="text-sm text-amber-800 font-medium mb-4 flex items-center justify-center gap-2 uppercase tracking-wider">
                        <Smartphone className="w-5 h-5" /> Tap below to pay directly
                      </p>
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                        <a 
                          href={`upi://pay?pa=9064300941@ybl&pn=Banya&am=${total}&cu=INR`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center py-4 px-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-700 hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1"
                        >
                          <img src="https://upload.wikimedia.org/wikipedia/commons/e/e1/UPI-Logo-vector.svg" alt="UPI" className="h-6 mb-2" />
                          Any UPI
                        </a>
                        <a 
                          href={`gpay://upi/pay?pa=9064300941@ybl&pn=Banya&am=${total}&cu=INR`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center py-4 px-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-700 hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1"
                        >
                          <img src="https://upload.wikimedia.org/wikipedia/commons/c/c7/Google_Pay_Logo_%282020%29.svg" alt="GPay" className="h-6 mb-2" />
                          GPay
                        </a>
                        <a 
                          href={`phonepe://pay?pa=9064300941@ybl&pn=Banya&am=${total}&cu=INR`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center py-4 px-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-700 hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1"
                        >
                          <img src="https://cdn.iconscout.com/icon/free/png-256/free-phonepe-logo-icon-download-in-svg-png-gif-file-formats--technology-social-media-company-brand-vol-5-pack-logos-icons-2945273.png" alt="PhonePe" className="h-6 mb-2 object-contain" />
                          PhonePe
                        </a>
                        <a 
                          href={`paytmmp://pay?pa=9064300941@ybl&pn=Banya&am=${total}&cu=INR`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex flex-col items-center justify-center py-4 px-2 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-700 hover:bg-amber-50 hover:border-amber-300 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-1"
                        >
                          <img src="https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg" alt="Paytm" className="h-5 mb-3" />
                          Paytm
                        </a>
                      </div>
                    </div>
                    
                    <div className="mt-8 text-left w-full bg-white p-6 rounded-xl shadow-sm border border-amber-200 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-2 h-full bg-amber-500"></div>
                      <label className="block text-base font-semibold text-amber-900 mb-2">
                        Enter UPI Transaction ID (12 Digits) <span className="text-red-500">*</span>
                      </label>
                      <p className="text-sm text-amber-700 mb-4">After paying, paste the 12-digit UTR/Transaction ID to confirm.</p>
                      <input 
                        type="text" 
                        required={formData.paymentMethod === 'upi'}
                        value={formData.transactionId || ''}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 12);
                          setFormData({...formData, transactionId: val});
                        }}
                        maxLength={12}
                        minLength={12}
                        pattern="\d{12}"
                        placeholder="e.g. 312345678901"
                        className={`w-full border-2 rounded-lg p-4 text-lg tracking-widest font-mono focus:ring-2 outline-none transition-all shadow-inner placeholder:tracking-normal placeholder:text-stone-400 ${formData.transactionId.length === 12 && !isValidUTR(formData.transactionId) ? 'border-red-400 bg-red-50 focus:ring-red-500 focus:border-red-500 text-red-900' : 'border-amber-300 bg-stone-50 focus:ring-amber-500 focus:border-amber-500 text-stone-900'}`}
                      />
                      {formData.transactionId.length === 12 && !isValidUTR(formData.transactionId) && (
                        <p className="text-red-500 text-sm mt-2 font-medium animate-in fade-in slide-in-from-top-1">
                          Invalid Transaction ID. Please enter the correct UTR number.
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-4 text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-2 rounded border border-emerald-100">
                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        Payment is manually verified by our team.
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <button type="button" onClick={() => setStep(2)} className="px-6 py-3.5 bg-white text-stone-600 border border-stone-300 font-medium hover:bg-stone-50 hover:text-stone-900 transition-colors rounded-full flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg> Back
                  </button>
                  <button 
                    type="submit" 
                    form="checkout-form"
                    disabled={loading}
                    className="px-8 py-3.5 bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors rounded-full flex items-center gap-2 shadow-lg disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Place Order'} <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
