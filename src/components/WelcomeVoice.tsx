import { useEffect, useState } from 'react';
import { Volume2, Sparkles, X } from 'lucide-react';

export default function WelcomeVoice() {
  const [showToast, setShowToast] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    // Check if welcome voice has already played
    const hasPlayed = localStorage.getItem('ripan_welcome_voice_played');
    if (hasPlayed) {
      return;
    }

    const speakWelcome = () => {
      // Re-check in case it triggered concurrently
      if (localStorage.getItem('ripan_welcome_voice_played')) return;

      if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        localStorage.setItem('ripan_welcome_voice_played', 'true');
        return;
      }

      try {
        window.speechSynthesis.cancel();

        // English & Bengali warm greeting
        const text = "Welcome to Ripan Saree Center. রিপন শাড়ি সেন্টারে আপনাকে স্বাগতম।";
        const utterance = new SpeechSynthesisUtterance(text);

        utterance.rate = 0.9; // Calm and pleasant speed
        utterance.pitch = 1.05; // Friendly warm pitch

        const pickVoice = () => {
          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            // Prefer natural Indian English, Bengali, or pleasant English voice
            const pleasantVoice = voices.find(v => 
              v.name.toLowerCase().includes('natural') || 
              v.name.toLowerCase().includes('online') ||
              v.lang.includes('bn') ||
              v.lang.includes('en-IN') ||
              v.lang.includes('en-GB') ||
              v.lang.includes('en-US')
            );
            if (pleasantVoice) utterance.voice = pleasantVoice;
          }
        };

        pickVoice();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = pickVoice;
        }

        utterance.onstart = () => {
          setIsPlaying(true);
          setShowToast(true);
          localStorage.setItem('ripan_welcome_voice_played', 'true');
        };

        utterance.onend = () => {
          setIsPlaying(false);
          setTimeout(() => setShowToast(false), 3500);
        };

        utterance.onerror = () => {
          setIsPlaying(false);
          setShowToast(false);
          localStorage.setItem('ripan_welcome_voice_played', 'true');
        };

        window.speechSynthesis.speak(utterance);

        // Mark as played to ensure it only plays once
        localStorage.setItem('ripan_welcome_voice_played', 'true');
      } catch (err) {
        console.warn('Speech synthesis error:', err);
        localStorage.setItem('ripan_welcome_voice_played', 'true');
      }
    };

    // Attempt to play shortly after opening
    const timer = setTimeout(() => {
      speakWelcome();
    }, 800);

    // If browser blocks autoplay before user gesture, trigger on first tap or click
    const handleFirstInteraction = () => {
      if (!localStorage.getItem('ripan_welcome_voice_played')) {
        speakWelcome();
      }
      removeListeners();
    };

    const removeListeners = () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
    };

    window.addEventListener('click', handleFirstInteraction, { passive: true });
    window.addEventListener('touchstart', handleFirstInteraction, { passive: true });
    window.addEventListener('keydown', handleFirstInteraction, { passive: true });

    return () => {
      clearTimeout(timer);
      removeListeners();
    };
  }, []);

  if (!showToast) return null;

  return (
    <div className="fixed top-20 right-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300 max-w-xs sm:max-w-sm">
      <div className="bg-stone-900/95 text-white p-3.5 rounded-2xl shadow-xl border border-amber-400/50 backdrop-blur-md flex items-center gap-3">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-stone-950 shadow-md">
            <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-bounce text-stone-950' : 'text-stone-950'}`} />
          </div>
          <Sparkles className="w-3.5 h-3.5 text-amber-300 absolute -top-1 -right-1 animate-pulse" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-xs font-serif font-bold text-amber-300 truncate">
            Welcome to Ripan Saree Center
          </p>
          <p className="text-[11px] text-stone-300 truncate">
            রিপন শাড়ি সেন্টারে আপনাকে স্বাগতম!
          </p>
        </div>

        <button 
          onClick={() => setShowToast(false)}
          className="text-stone-400 hover:text-white p-1 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
