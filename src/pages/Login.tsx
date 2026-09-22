import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Volume2, VolumeX } from 'lucide-react';

export default function Login() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // Speech synthesis helper
  const speakText = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.0;

      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        const preferred = voices.find(v => v.lang.includes('bn') || v.lang.includes('en-IN') || v.lang.includes('en-US'));
        if (preferred) utterance.voice = preferred;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis error:', err);
      setIsSpeaking(false);
    }
  };

  // Trigger voice guidance when isSignUp changes or on mount
  useEffect(() => {
    const text = isSignUp 
      ? 'Please enter your email and password to sign up. ইমেইল দিয়ে সাইন আপ করুন।'
      : 'Enter your email and password, then enter. সাইন ইন করতে আপনার ইমেইল এবং পাসওয়ার্ড দিন।';

    // Auto-play voice instructions
    const timer = setTimeout(() => {
      speakText(text);
    }, 450);

    // If browser requires user interaction for speech synthesis, fallback to first touch/click
    const handleFirstGesture = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window && !window.speechSynthesis.speaking) {
        speakText(text);
      }
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });

    return () => {
      clearTimeout(timer);
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSignUp, voiceEnabled]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Ensure user document exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          name: result.user.displayName,
          role: 'customer',
          createdAt: new Date().toISOString()
        });
      }
      
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (name) {
          await updateProfile(userCredential.user, { displayName: name });
        }
        
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userCredential.user.email,
          name: name || email.split('@')[0],
          role: 'customer',
          createdAt: new Date().toISOString()
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      
      navigate(from, { replace: true });
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already in use. Please sign in instead.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password should be at least 6 characters.');
      } else {
        setError(isSignUp ? 'Failed to create an account' : 'Invalid email or password');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center bg-stone-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl border border-stone-200 shadow-sm">
        
        {/* Header with Circular RD Logo */}
        <div className="flex flex-col items-center">
          <div className="relative mb-3 group">
            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-amber-500 via-amber-300 to-amber-600 shadow-lg">
              <img 
                src="/rd_logo.jpg" 
                alt="RD Ripan Das Textile Logo" 
                className="w-full h-full object-cover rounded-full bg-stone-900 border-2 border-white shadow-inner"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png";
                }}
              />
            </div>
          </div>
          <h2 className="text-center text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            {isSignUp ? 'Create an Account' : 'Welcome to Ripan Saree Center'}
          </h2>
          <p className="mt-1 text-center text-xs sm:text-sm text-stone-600">
            {isSignUp ? 'Join us for exclusive collections' : 'Sign in to access your account and wishlist'}
          </p>
        </div>

        {/* Voice Guidance Bar */}
        <div className="flex items-center justify-between bg-amber-50/90 border border-amber-200 rounded-xl px-3.5 py-2.5 shadow-xs">
          <button 
            type="button"
            onClick={() => {
              const text = isSignUp 
                ? 'Please enter your email and password to sign up. ইমেইল দিয়ে সাইন আপ করুন।'
                : 'Enter your email and password, then enter. সাইন ইন করতে আপনার ইমেইল এবং পাসওয়ার্ড দিন।';
              speakText(text);
            }}
            className="flex items-center gap-2 text-xs font-semibold text-amber-900 hover:text-amber-700 transition"
          >
            <Volume2 className={`w-4 h-4 text-amber-600 ${isSpeaking ? 'animate-bounce' : ''}`} />
            <span>{isSpeaking ? 'ভয়েস বলা হচ্ছে...' : 'ভয়েস নির্দেশিকা শুনুন (Voice Guide)'}</span>
          </button>
          
          <button
            type="button"
            onClick={() => {
              if (voiceEnabled) {
                if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                  window.speechSynthesis.cancel();
                }
                setIsSpeaking(false);
              }
              setVoiceEnabled(!voiceEnabled);
            }}
            className="text-stone-500 hover:text-stone-700 p-1 rounded-md"
            title={voiceEnabled ? "ভয়েস বন্ধ করুন" : "ভয়েস চালু করুন"}
          >
            {voiceEnabled ? <Volume2 className="w-4 h-4 text-amber-600" /> : <VolumeX className="w-4 h-4 text-stone-400" />}
          </button>
        </div>
        
        {error && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm text-center border border-red-200">
            {error}
          </div>
        )}

        <form className="mt-4 space-y-5" onSubmit={handleEmailAuth}>
          <div className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onFocus={() => speakText('Enter your full name. আপনার পুরো নাম লিখুন।')}
                  onChange={e => setName(e.target.value)}
                  placeholder="আপনার নাম লিখুন"
                  className="appearance-none rounded-xl relative block w-full px-3.5 py-2.5 border border-stone-300 placeholder-stone-400 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Email address</label>
              <input
                type="email"
                required
                value={email}
                onFocus={() => speakText('Enter your email. আপনার ইমেইল লিখুন।')}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@gmail.com"
                className="appearance-none rounded-xl relative block w-full px-3.5 py-2.5 border border-stone-300 placeholder-stone-400 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onFocus={() => speakText('Enter your password. আপনার পাসওয়ার্ড লিখুন।')}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="appearance-none rounded-xl relative block w-full px-3.5 py-2.5 border border-stone-300 placeholder-stone-400 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-xl text-white bg-stone-900 hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-stone-900 disabled:opacity-70 transition-all shadow-md active:scale-98"
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
          
          <div className="text-center text-sm">
            <button 
              type="button"
              onClick={() => {
                const nextState = !isSignUp;
                setIsSignUp(nextState);
                setError('');
              }}
              className="text-amber-600 hover:text-amber-500 font-semibold"
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-wider">
              <span className="px-3 bg-white text-stone-400 font-medium">Or continue with</span>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-stone-300 rounded-xl shadow-xs bg-white text-sm font-semibold text-stone-700 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-all"
            >
              <svg className="h-5 w-5 mr-2" aria-hidden="true" viewBox="0 0 24 24">
                <path d="M12.0003 4.75C13.7703 4.75 15.3553 5.36002 16.6053 6.54998L20.0303 3.125C17.9502 1.19 15.2353 0 12.0003 0C7.31028 0 3.25527 2.69 1.28027 6.60998L5.27028 9.70498C6.21525 6.86002 8.87028 4.75 12.0003 4.75Z" fill="#EA4335" />
                <path d="M23.49 12.275C23.49 11.49 23.415 10.73 23.3 10H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.945 21.1C22.2 19.01 23.49 15.92 23.49 12.275Z" fill="#4285F4" />
                <path d="M5.26498 14.2949C5.02498 13.5699 4.88501 12.7999 4.88501 11.9999C4.88501 11.1999 5.01998 10.4299 5.26498 9.7049L1.275 6.60986C0.46 8.22986 0 10.0599 0 11.9999C0 13.9399 0.46 15.7699 1.28 17.3899L5.26498 14.2949Z" fill="#FBBC05" />
                <path d="M12.0004 24.0001C15.2404 24.0001 17.9654 22.935 19.9454 21.095L16.0804 18.095C15.0054 18.82 13.6204 19.245 12.0004 19.245C8.8704 19.245 6.21537 17.135 5.26537 14.29L1.27539 17.385C3.25539 21.31 7.3104 24.0001 12.0004 24.0001Z" fill="#34A853" />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
