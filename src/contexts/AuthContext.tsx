import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            
            const profileData = docSnap.data();
            if (firebaseUser.email === 'dasbanya264@gmail.com' && profileData.role !== 'admin') {
              try {
                await setDoc(docRef, { role: 'admin' }, { merge: true });
                profileData.role = 'admin';
              } catch (e) {
                console.error('Failed to auto-upgrade to admin', e);
              }
            }
            setUserProfile({ id: docSnap.id, ...profileData } as UserProfile);

          } else {
            // Setup default profile if not exists in DB (could happen on first google login)
            const newProfile = {
              email: firebaseUser.email || '',
              name: firebaseUser.displayName || '',
              role: firebaseUser.email === 'dasbanya264@gmail.com' ? 'admin' : 'customer',
              createdAt: new Date().toISOString()
            };
            setDoc(docRef, newProfile).catch(console.error);
            setUserProfile({ id: firebaseUser.uid, ...newProfile } as UserProfile);
          }
        } catch (error) {
          console.error("Error fetching user profile", error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
