import { useState, useRef, useEffect, useCallback } from 'react';

export function useVoiceSearch(onCommand: (text: string) => void, onError?: (error: string) => void, lang: string = 'bn-BD') {
  const [isListening, setIsListening] = useState(false);
  const [voiceFeedback, setVoiceFeedback] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition && !recognitionRef.current) {
       recognitionRef.current = new SpeechRecognition();
       recognitionRef.current.lang = lang;
       recognitionRef.current.continuous = true;
       recognitionRef.current.interimResults = false;
       recognitionRef.current.maxAlternatives = 1;
    }

    if (recognitionRef.current) {
       recognitionRef.current.lang = lang;
    }
  }, [lang]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        try { recognitionRef.current.stop(); } catch(e) {}
      }
    };
  }, []);

  const onCommandRef = useRef(onCommand);
  const onErrorRef = useRef(onError);
  
  useEffect(() => {
    onCommandRef.current = onCommand;
  }, [onCommand]);

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const isListeningRef = useRef(isListening);
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);

  useEffect(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.onresult = (event: any) => {
      const currentResultPattern = event.results[event.results.length - 1];
      if (currentResultPattern.isFinal) {
          const transcript = currentResultPattern[0].transcript;
          setVoiceFeedback(transcript);
          onCommandRef.current(transcript);
          setTimeout(() => setVoiceFeedback(null), 3000);
      }
    };

    recognitionRef.current.onend = () => {
      if (isListeningRef.current) {
          try { recognitionRef.current.start(); } catch(e) {}
      }
    };

    recognitionRef.current.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
          console.error("Speech recognition error:", e.error);
          if (onErrorRef.current) {
            onErrorRef.current(e.error);
          }
      }
      setIsListening(false);
    };
    
    return () => {
        // We do not nullify here to preserve across renders,
        // unless we want to rebuild them on every render.
        // It's safe leaving them as is. Cleanup on unmount does the nullifying.
    };
  }, []); // Remove isListening dependency because we use isListeningRef.current

  const toggleVoiceSearch = useCallback(() => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    if (isListening) {
      setIsListening(false);
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      try {
        recognitionRef.current.start();
      } catch(e) {}
    }
  }, [isListening]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setIsListening(true);
    try { recognitionRef.current.start(); } catch(e) {}
  }, [isListening]);

  return {
    isListening,
    voiceFeedback,
    toggleVoiceSearch,
    startListening,
  };
}
