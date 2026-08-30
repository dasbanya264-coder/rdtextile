import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface StoreSettings {
  logoUrl: string;
  bannerUrl: string;
  storeName: string;
  contactPhone: string;
}

let cachedSettings: StoreSettings | null = null;
let fetchPromise: Promise<StoreSettings | null> | null = null;

export function useStoreSettings() {
  const [settings, setSettings] = useState<StoreSettings | null>(cachedSettings);
  const [loading, setLoading] = useState(!cachedSettings);

  useEffect(() => {
    if (cachedSettings) {
      setSettings(cachedSettings);
      setLoading(false);
      return;
    }

    if (!fetchPromise) {
      fetchPromise = getDoc(doc(db, 'settings', 'store')).then(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data() as StoreSettings;
          cachedSettings = data;
          return data;
        }
        return null;
      }).catch(err => {
        console.error("Failed to fetch store settings", err);
        return null;
      });
    }

    fetchPromise.then(data => {
      if (data) setSettings(data);
      setLoading(false);
    });
  }, []);

  return { settings, loading };
}
