import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { uploadProductImage, validateImageFile } from '../../lib/storageService';
import { Save, UploadCloud, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<{banner: boolean, logo: boolean}>({banner: false, logo: false});
  const [uploadProgress, setUploadProgress] = useState<{banner: number, logo: number}>({banner: 0, logo: 0});
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  
  const [settings, setSettings] = useState({
    bannerUrl: '',
    logoUrl: '',
    storeName: 'Ripan Saree Center',
    contactPhone: '917811074014'
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
    setErrorMessage(null);
    try {
      await setDoc(doc(db, 'settings', 'store'), settings, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error("Error saving settings:", error);
      setErrorMessage(error?.message || "Failed to save store settings.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    const validation = validateImageFile(file);
    if (!validation.valid) {
      setErrorMessage(validation.error || 'Invalid image file.');
      if (e.target) e.target.value = '';
      return;
    }

    setUploading(prev => ({ ...prev, [type]: true }));
    setUploadProgress(prev => ({ ...prev, [type]: 10 }));

    try {
      const finalUrl = await uploadProductImage(
        file,
        type === 'banner' ? 'settings/banners' : 'settings/logos',
        (progress) => {
          setUploadProgress(prev => ({ ...prev, [type]: progress }));
        }
      );

      const field = type === 'banner' ? 'bannerUrl' : 'logoUrl';
      const newSettings = { ...settings, [field]: finalUrl };
      setSettings(newSettings);
      
      // Auto-persist immediately
      await setDoc(doc(db, 'settings', 'store'), { [field]: finalUrl }, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      console.error('Settings image upload failed:', err);
      setErrorMessage(err?.message || `Failed to upload ${type}. Please try again.`);
    } finally {
      setUploading(prev => ({ ...prev, [type]: false }));
      setUploadProgress(prev => ({ ...prev, [type]: 0 }));
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
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-serif text-stone-900">Store Settings</h1>
          <p className="text-sm text-stone-500 mt-1">Configure branding, banner images, logo, and contact numbers.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving || uploading.banner || uploading.logo}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-xl hover:bg-stone-800 flex items-center gap-2 font-medium disabled:opacity-50 shadow-sm transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (saved ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />)}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 p-4 mb-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 sm:p-8 space-y-8">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-serif text-stone-900">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">Store Name</label>
              <input 
                type="text" 
                value={settings.storeName}
                onChange={e => setSettings({...settings, storeName: e.target.value})}
                className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-1.5">Contact Phone (WhatsApp)</label>
              <input 
                type="text" 
                value={settings.contactPhone}
                onChange={e => setSettings({...settings, contactPhone: e.target.value})}
                className="w-full border border-stone-300 rounded-xl px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Banner Section */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <h2 className="text-lg font-serif text-stone-900">Homepage Banner</h2>
          <div className="border border-stone-200 rounded-2xl p-4 bg-stone-50/60">
            <div className="aspect-[21/9] w-full bg-stone-200 rounded-xl overflow-hidden relative group mb-4 shadow-inner">
              {settings.bannerUrl ? (
                <img src={settings.bannerUrl} alt="Store Banner" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-stone-400">
                  <UploadCloud className="w-8 h-8 mb-2" />
                  <p className="text-sm">No banner image set</p>
                </div>
              )}

              {uploading.banner && (
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-medium">Uploading Banner ({uploadProgress.banner}%)...</span>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <label className="bg-white text-stone-700 px-4 py-2 rounded-xl font-medium cursor-pointer flex items-center gap-2 hover:bg-stone-100 transition-colors border border-stone-300 shadow-xs text-sm">
                {uploading.banner ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4 text-amber-600" />}
                {uploading.banner ? `Uploading ${uploadProgress.banner}%` : 'Change Banner'}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'banner')} disabled={uploading.banner} />
              </label>
            </div>
          </div>
        </div>

        {/* Logo Section */}
        <div className="space-y-4 pt-4 border-t border-stone-100">
          <h2 className="text-lg font-serif text-stone-900">Store Logo</h2>
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full border-2 border-stone-200 overflow-hidden relative group shrink-0 shadow-sm">
              {settings.logoUrl ? (
                <img src={settings.logoUrl} alt="Store Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-stone-100 flex items-center justify-center text-stone-400 text-xs text-center p-2">
                  No Logo
                </div>
              )}

              {uploading.logo && (
                <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex flex-col items-center justify-center text-white">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-[10px]">{uploadProgress.logo}%</span>
                </div>
              )}
            </div>
            
            <label className="bg-white text-stone-700 px-4 py-2 rounded-xl font-medium cursor-pointer flex items-center gap-2 hover:bg-stone-100 transition-colors border border-stone-300 shadow-xs text-sm">
              {uploading.logo ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4 text-amber-600" />}
              {uploading.logo ? `Uploading ${uploadProgress.logo}%` : 'Upload Logo'}
              <input type="file" accept="image/jpeg,image/png,image/webp,image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'logo')} disabled={uploading.logo} />
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}
