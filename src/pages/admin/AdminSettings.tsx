import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { compressImageToBase64 } from '../../lib/utils';
import { updateCachedSettings } from '../../hooks/useStoreSettings';
import { Save, UploadCloud, Loader2, CheckCircle2, Image as ImageIcon } from 'lucide-react';

import tasarImg from '../../assets/images/tasar_saree_cat_1790063305377.jpg';
import premiumSilkImg from '../../assets/images/premium_silk_1788152325215.jpg';

type UploadTarget = 'banner' | 'logo' | 'tasarJamdani' | 'silk';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<Record<UploadTarget, boolean>>({
    banner: false,
    logo: false,
    tasarJamdani: false,
    silk: false
  });
  const [saved, setSaved] = useState(false);
  
  const [settings, setSettings] = useState({
    bannerUrl: '',
    logoUrl: '',
    storeName: 'Ripan Saree Center',
    contactPhone: '919064300941',
    tasarJamdaniImageUrl: '',
    silkImageUrl: ''
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'store');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setSettings(prev => ({ ...prev, ...docSnap.data() }));
        }
      } catch (error) {
        console.error("Error fetching settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'store'), settings, { merge: true });
      updateCachedSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: UploadTarget) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const maxWidth = type === 'banner' ? 1920 : type === 'logo' ? 800 : 1200;
      const base64Data = await compressImageToBase64(file, maxWidth);
      
      const keyMap: Record<UploadTarget, keyof typeof settings> = {
        banner: 'bannerUrl',
        logo: 'logoUrl',
        tasarJamdani: 'tasarJamdaniImageUrl',
        silk: 'silkImageUrl'
      };

      const key = keyMap[type];
      const newSettings = { ...settings, [key]: base64Data };
      setSettings(newSettings);
      
      await setDoc(doc(db, 'settings', 'store'), { [key]: base64Data }, { merge: true });
      updateCachedSettings({ [key]: base64Data });
      
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
      alert("Failed to compress and upload image.");
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
      if (e.target) e.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-stone-900" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl pb-16">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-serif text-stone-900">Store Settings & Explore Photos</h1>
          <p className="text-sm text-stone-500 mt-1">দোকানের তথ্য ও হোমপেজের এক্সপ্লোর সেকশনের ছবি এখান থেকে পরিবর্তন করুন</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving || Object.values(uploading).some(Boolean)}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-md hover:bg-stone-800 flex items-center gap-2 font-medium disabled:opacity-50 transition-all shadow-sm"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (saved ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />)}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 space-y-10">
        
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-medium text-stone-900 mb-4 border-b pb-2">Basic Information (প্রাথমিক তথ্য)</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Store Name</label>
              <input 
                type="text" 
                value={settings.storeName}
                onChange={e => setSettings({...settings, storeName: e.target.value})}
                className="w-full border border-stone-300 rounded-md p-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Contact Phone (WhatsApp)</label>
              <input 
                type="text" 
                value={settings.contactPhone}
                onChange={e => setSettings({...settings, contactPhone: e.target.value})}
                className="w-full border border-stone-300 rounded-md p-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Explore Section Photos (Tasar Jamdani & Silk) */}
        <div className="p-5 bg-amber-50/40 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <ImageIcon className="w-5 h-5 text-amber-700" />
            <h2 className="text-lg font-semibold text-stone-900">Explore Categories Photo Settings (এক্সপ্লোর সেকশনের ছবি)</h2>
          </div>
          <p className="text-xs text-stone-600 mb-6">
            হোমপেজের 'Shop by Category' / Explore সেকশনে থাকা <strong>তসর জামদানি</strong> ও <strong>সিল্ক</strong> শাড়ির ছবি এখান থেকে সরাসরি আপলোড বা পরিবর্তন করতে পারবেন।
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Tasar Jamdani Photo */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-stone-900 text-sm">১. তসর জামদানি (Tasar Jamdani)</span>
                  <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-medium">Explore Card 1</span>
                </div>
                
                <div className="aspect-[4/3] w-full bg-stone-100 rounded-lg overflow-hidden relative border border-stone-200 mb-3">
                  <img 
                    src={settings.tasarJamdaniImageUrl || tasarImg} 
                    alt="Tasar Jamdani" 
                    className="w-full h-full object-cover" 
                  />
                  {uploading.tasarJamdani && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-xs gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                      <span>আপলোড হচ্ছে...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="w-full bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-lg font-medium cursor-pointer flex items-center justify-center gap-2 transition text-xs">
                  {uploading.tasarJamdani ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  <span>{uploading.tasarJamdani ? 'Uploading...' : 'তসর জামদানির নতুন ছবি আপলোড করুন'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, 'tasarJamdani')} 
                    disabled={uploading.tasarJamdani} 
                  />
                </label>
                {settings.tasarJamdaniImageUrl && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setSettings(prev => ({ ...prev, tasarJamdaniImageUrl: '' }));
                      setDoc(doc(db, 'settings', 'store'), { tasarJamdaniImageUrl: '' }, { merge: true });
                    }}
                    className="text-[11px] text-stone-500 hover:text-red-600 block text-center w-full"
                  >
                    রিসেট করে ডিফল্ট ছবি রাখুন
                  </button>
                )}
              </div>
            </div>

            {/* 2. Silk Saree Photo */}
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-semibold text-stone-900 text-sm">২. পিওর সিল্ক শাড়ি (Pure Silk)</span>
                  <span className="text-[11px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-medium">Explore Card 2</span>
                </div>
                
                <div className="aspect-[4/3] w-full bg-stone-100 rounded-lg overflow-hidden relative border border-stone-200 mb-3">
                  <img 
                    src={settings.silkImageUrl || premiumSilkImg} 
                    alt="Pure Silk Saree" 
                    className="w-full h-full object-cover" 
                  />
                  {uploading.silk && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white text-xs gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
                      <span>আপলোড হচ্ছে...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="w-full bg-stone-900 hover:bg-stone-800 text-white px-4 py-2 rounded-lg font-medium cursor-pointer flex items-center justify-center gap-2 transition text-xs">
                  {uploading.silk ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                  <span>{uploading.silk ? 'Uploading...' : 'সিল্ক শাড়ির নতুন ছবি আপলোড করুন'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleImageUpload(e, 'silk')} 
                    disabled={uploading.silk} 
                  />
                </label>
                {settings.silkImageUrl && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setSettings(prev => ({ ...prev, silkImageUrl: '' }));
                      setDoc(doc(db, 'settings', 'store'), { silkImageUrl: '' }, { merge: true });
                    }}
                    className="text-[11px] text-stone-500 hover:text-red-600 block text-center w-full"
                  >
                    রিসেট করে ডিফল্ট ছবি রাখুন
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Banner Section */}
        <div>
          <h2 className="text-lg font-medium text-stone-900 mb-4 border-b pb-2">Homepage Hero Banner (মূল হোম ব্যানার)</h2>
          <div className="border border-stone-200 rounded-lg p-4 bg-stone-50">
            <div className="aspect-[21/9] w-full bg-stone-200 rounded-md overflow-hidden relative group mb-4">
              {settings.bannerUrl ? (
                <img src={settings.bannerUrl} alt="Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <p>No banner image set</p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <label className="bg-white text-stone-700 px-4 py-2 rounded-md font-medium cursor-pointer flex items-center gap-2 hover:bg-stone-50 transition-colors border border-stone-300">
                {uploading.banner ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                {uploading.banner ? 'Uploading...' : 'Change Banner'}
                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'banner')} disabled={uploading.banner} />
              </label>
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <div>
          <h2 className="text-lg font-medium text-stone-900 mb-4 border-b pb-2">Store Logo (লোগো)</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border border-stone-200 overflow-hidden relative group shrink-0">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400 text-xs text-center p-2">
                  No Logo
                </div>
              )}
            </div>
            
            <label className="bg-stone-100 text-stone-700 px-4 py-2 rounded-md font-medium cursor-pointer flex items-center gap-2 hover:bg-stone-200 transition-colors border border-stone-300">
              {uploading.logo ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
              {uploading.logo ? 'Uploading...' : 'Upload Logo'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} disabled={uploading.logo} />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
