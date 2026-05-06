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
       recognitionRef.current.interimResults = true;
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

    let accumulatedText = "";
    let timeoutId: any = null;

    recognitionRef.current.onresult = (event: any) => {
      let isFinalResult = false;
      let finalBatch = "";
      let interimBatch = "";
      
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          isFinalResult = true;
          finalBatch += transcript + " ";
        } else {
          interimBatch += transcript;
        }
      }

      const displayFeedback = (accumulatedText + (accumulatedText ? " " : "") + finalBatch + interimBatch).trim();
      setVoiceFeedback(displayFeedback || (isListeningRef.current ? "Listening..." : null));

      if (isFinalResult && finalBatch.trim()) {
          accumulatedText += (accumulatedText ? " " : "") + finalBatch.trim();
          
          if (timeoutId) clearTimeout(timeoutId);
          timeoutId = setTimeout(() => {
             if (accumulatedText.trim()) {
               onCommandRef.current(accumulatedText.trim());
               accumulatedText = "";
             }
             setVoiceFeedback(null);
          }, 1200); 
      }
    };

    recognitionRef.current.onend = () => {
      if (timeoutId) {
         clearTimeout(timeoutId);
         if (accumulatedText.trim()) {
            onCommandRef.current(accumulatedText.trim());
            accumulatedText = "";
         }
         setVoiceFeedback(null);
      }
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
      isListeningRef.current = false;
      try {
        recognitionRef.current.stop();
      } catch(e) {}
    } else {
      setIsListening(true);
      isListeningRef.current = true;
      try {
        recognitionRef.current.start();
      } catch(e) {}
    }
  }, [isListening]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setIsListening(true);
    isListeningRef.current = true;
    try { recognitionRef.current.start(); } catch(e) {}
  }, [isListening]);

  return {
    isListening,
    voiceFeedback,
    toggleVoiceSearch,
    startListening,
  };
}
