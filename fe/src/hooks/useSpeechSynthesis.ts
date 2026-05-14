import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  // Initialize and load voices
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      console.warn('Trình duyệt không hỗ trợ Web Speech Synthesis API');
      return;
    }

    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
        
        // Try to find a good English voice by default
        const englishVoices = availableVoices.filter(v => v.lang.startsWith('en'));
        const preferredVoice = 
          englishVoices.find(v => v.name.includes('Google US English')) ||
          englishVoices.find(v => v.name.includes('Samantha')) || // Mac OS good default
          englishVoices.find(v => v.name.includes('Microsoft Aria')) || // Edge good default
          englishVoices[0] || 
          availableVoices[0];
          
        setSelectedVoice(preferredVoice);
      }
    };

    loadVoices();
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Trình duyệt không hỗ trợ đọc văn bản.');
      return;
    }

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    if (!text.trim()) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Good default parameters for AI voice
    utterance.rate = 1.0; 
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    
    utterance.onerror = (e) => {
      console.error('Speech synthesis error:', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [selectedVoice]);

  const stop = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  const changeVoice = useCallback((voiceName: string) => {
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
    }
  }, [voices]);

  return {
    speak,
    stop,
    isSpeaking,
    voices,
    selectedVoice,
    changeVoice,
    isSupported: 'speechSynthesis' in window
  };
}
