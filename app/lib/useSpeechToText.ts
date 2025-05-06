'use client';

import { useState, useEffect } from 'react';

type SpeechRecognitionType = {
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
};

export function useSpeechToText() {
  const [transcript, setTranscript] = useState('');
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognitionType | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0])
            .map((result: any) => result.transcript)
            .join('');

          setTranscript(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setListening(false);
        };

        recognition.onend = () => {
          setListening(false);
        };

        setRecognition(recognition);
      }
    }
  }, []);

  const startListening = () => {
    if (recognition) {
      recognition.start();
      setListening(true);
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
      setListening(false);
    }
  };

  return {
    transcript,
    listening,
    startListening,
    stopListening,
  };
} 