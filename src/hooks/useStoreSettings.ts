import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface StoreSettings {
  logoUrl: string;
  bannerUrl: string;
  storeName: string;
  contactPhone: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Ripan Saree Center',
  logoUrl: '/rd_logo.jpg',
  bannerUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&q=80&w=1920',
  contactPhone: '+91 90643 00941'
};

let cachedSettings: StoreSettings | null = null;
let fetchPromise: Promise<StoreSettings | null> | null = null;

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings>(cachedSettings || DEFAULT_STORE_SETTINGS);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    let isMounted = true;

    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    const fetchSettings = async () => {
      try {
        if (!fetchPromise) {
          fetchPromise = getDoc(doc(db, 'settings', 'store'))
            .then(docSnap => {
              if (docSnap.exists()) {
                const data = docSnap.data() as StoreSettings;
                cachedSettings = {
                  storeName: data.storeName || DEFAULT_STORE_SETTINGS.storeName,
                  logoUrl: data.logoUrl || DEFAULT_STORE_SETTINGS.logoUrl,
                  bannerUrl: data.bannerUrl || DEFAULT_STORE_SETTINGS.bannerUrl,
                  contactPhone: data.contactPhone || DEFAULT_STORE_SETTINGS.contactPhone
                };
                return cachedSettings;
              }
              return DEFAULT_STORE_SETTINGS;
            })
            .catch(err => {
              // Reset fetchPromise on error so next attempt can retry
              fetchPromise = null;
              console.warn("Could not fetch store settings from Firestore, using defaults:", err?.message || err);
              return DEFAULT_STORE_SETTINGS;
            });
        }

        const data = await fetchPromise;
        if (isMounted && data) {
          setSettings(data);
          setLoading(false);
        }
      } catch (err) {
        fetchPromise = null;
        if (isMounted) {
          setSettings(DEFAULT_STORE_SETTINGS);
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  return { settings, loading };
}
