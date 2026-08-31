
import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { compressImageToBase64 } from '../../lib/utils';
import { Save, UploadCloud, Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminSettings() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<{banner: boolean, logo: boolean}>({banner: false, logo: false});
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
    try {
      await setDoc(doc(db, 'settings', 'store'), settings, { merge: true });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'banner' | 'logo') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(prev => ({ ...prev, [type]: true }));
    try {
      const base64Data = await compressImageToBase64(file, type === 'banner' ? 1200 : 512);
      setSettings(prev => {
        const newSettings = { ...prev, [type === 'banner' ? 'bannerUrl' : 'logoUrl']: base64Data };
        setDoc(doc(db, 'settings', 'store'), newSettings, { merge: true })
          .then(() => {
             setSaved(true);
             setTimeout(() => setSaved(false), 3000);
          })
          .catch(console.error);
        return newSettings;
      });
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
    <div className="max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-serif text-stone-900">Store Settings</h1>
        <button 
          onClick={handleSave}
          disabled={saving || uploading.banner || uploading.logo}
          className="bg-stone-900 text-white px-6 py-2.5 rounded-md hover:bg-stone-800 flex items-center gap-2 font-medium disabled:opacity-50 transition-all"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (saved ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Save className="w-4 h-4" />)}
          {saved ? 'Saved!' : 'Save Settings'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 space-y-8">
        
        {/* Basic Info */}
        <div>
          <h2 className="text-lg font-medium text-stone-900 mb-4">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Store Name</label>
              <input 
                type="text" 
                value={settings.storeName}
                onChange={e => setSettings({...settings, storeName: e.target.value})}
                className="w-full border border-stone-300 rounded-md p-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Contact Phone (WhatsApp)</label>
              <input 
                type="text" 
                value={settings.contactPhone}
                onChange={e => setSettings({...settings, contactPhone: e.target.value})}
                className="w-full border border-stone-300 rounded-md p-2"
              />
            </div>
          </div>
        </div>

        {/* Banner Section */}
        <div>
          <h2 className="text-lg font-medium text-stone-900 mb-4">Homepage Banner</h2>
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
          <h2 className="text-lg font-medium text-stone-900 mb-4">Store Logo</h2>
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
