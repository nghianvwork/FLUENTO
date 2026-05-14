import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

// Type declarations for Web Speech API
interface IWindow extends Window {
  SpeechRecognition?: any;
  webkitSpeechRecognition?: any;
}

export function useSpeechRecognition(onResult?: (text: string) => void) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const { SpeechRecognition, webkitSpeechRecognition } = window as unknown as IWindow;
    const SpeechRec = SpeechRecognition || webkitSpeechRecognition;

    if (!SpeechRec) {
      setError('Trình duyệt của bạn không hỗ trợ tính năng nhận diện giọng nói. Vui lòng dùng Chrome hoặc Edge.');
      return;
    }

    const rec = new SpeechRec();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setIsListening(true);
      setError(null);
    };

    rec.onresult = (event: any) => {
      let currentTranscript = '';
      let isFinal = false;

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          isFinal = true;
          currentTranscript += result[0].transcript;
        } else {
          currentTranscript += result[0].transcript;
        }
      }

      setTranscript(currentTranscript);

      if (isFinal && onResult) {
        onResult(currentTranscript);
        setTranscript(''); // Clear for next utterance if continuous
      }
    };

    rec.onerror = (event: any) => {
      console.error('Speech recognition error', event.error);
      if (event.error === 'not-allowed') {
        setError('Vui lòng cấp quyền sử dụng Microphone.');
        toast.error('Vui lòng cấp quyền sử dụng Microphone.');
      }
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
    };

    setRecognition(rec);

    return () => {
      if (rec) {
        rec.stop();
      }
    };
  }, [onResult]);

  const toggleListening = useCallback(() => {
    if (!recognition) {
      toast.error(error || 'Trình duyệt không hỗ trợ Web Speech API.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      try {
        recognition.start();
      } catch (err) {
        console.error('Recognition start error:', err);
      }
    }
  }, [recognition, isListening, error]);

  const stopListening = useCallback(() => {
    if (recognition && isListening) {
      recognition.stop();
    }
  }, [recognition, isListening]);

  return {
    isListening,
    transcript,
    toggleListening,
    stopListening,
    error,
    isSupported: !!recognition
  };
}
