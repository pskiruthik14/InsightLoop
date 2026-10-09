import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Globe, AlertCircle } from 'lucide-react';

export interface SpeechToTextButtonProps {
  onTranscript: (text: string, isFinal?: boolean) => void;
  className?: string;
  size?: 'sm' | 'md';
  variant?: 'button' | 'icon-only';
  placeholder?: string;
  showLanguageSelector?: boolean;
  defaultLang?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'en-IN', label: 'English (IN)' },
  { code: 'en-US', label: 'English (US)' },
  { code: 'ta-IN', label: 'தமிழ் (Tamil)' },
  { code: 'hi-IN', label: 'हिन्दी (Hindi)' },
];

export const SpeechToTextButton: React.FC<SpeechToTextButtonProps> = ({
  onTranscript,
  className = '',
  size = 'md',
  variant = 'icon-only',
  showLanguageSelector = false,
  defaultLang = 'en-IN',
}) => {
  const [isListening, setIsListening] = useState(false);
  const [selectedLang, setSelectedLang] = useState(defaultLang);
  const [isSupported, setIsSupported] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [interimText, setInterimText] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false);
    }
  }, []);

  const startListening = () => {
    setErrorMessage(null);
    setInterimText('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Speech recognition is not supported in this browser. Try Chrome, Edge, or Safari.');
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedLang;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let finalTrans = '';
        let interimTrans = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            finalTrans += item[0].transcript;
          } else {
            interimTrans += item[0].transcript;
          }
        }

        if (finalTrans) {
          onTranscript(finalTrans.trim(), true);
          setInterimText('');
        } else if (interimTrans) {
          setInterimText(interimTrans);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Microphone access denied. Please allow microphone permissions.');
        } else if (event.error === 'no-speech') {
          // No speech detected, continue or gracefully finish
        } else {
          setErrorMessage(`Audio error: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        setInterimText('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition:', err);
      setErrorMessage(err.message || 'Microphone initialization failed.');
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
    setInterimText('');
  };

  const toggleListening = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setSelectedLang(newLang);
    if (isListening && recognitionRef.current) {
      recognitionRef.current.lang = newLang;
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 relative ${className}`}>
      {/* Optional Language Selector Pill */}
      {showLanguageSelector && (
        <div className="relative inline-flex items-center">
          <select
            value={selectedLang}
            onChange={handleLanguageChange}
            disabled={isListening}
            className="text-[10px] font-sans bg-[#F2EDE6] text-[#2D3A31] border border-[#E6E2DA] rounded-full px-2 py-0.5 pr-4 focus:outline-none focus:ring-1 focus:ring-[#8C9A84] cursor-pointer appearance-none uppercase tracking-wider"
            title="Speech Recognition Language"
          >
            {SUPPORTED_LANGUAGES.map((lang) => (
              <option key={lang.code} value={lang.code}>
                {lang.label}
              </option>
            ))}
          </select>
          <Globe className="w-2.5 h-2.5 text-[#8C9A84] absolute right-1.5 pointer-events-none" />
        </div>
      )}

      {/* Main Mic Button */}
      {variant === 'icon-only' ? (
        <button
          type="button"
          onClick={toggleListening}
          className={`relative p-1.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none ${
            isListening
              ? 'bg-[#C27B66] text-white ring-4 ring-[#C27B66]/30 scale-105 shadow-md'
              : 'text-[#5A695E] hover:text-[#2D3A31] hover:bg-[#F2EDE6]'
          } ${size === 'sm' ? 'w-7 h-7' : 'w-8 h-8'} flex items-center justify-center`}
          title={
            !isSupported
              ? 'Speech recognition not supported in this browser'
              : isListening
              ? 'Click to stop listening'
              : 'Click to dictate feedback with speech-to-text'
          }
          aria-label={isListening ? 'Stop voice dictation' : 'Start voice dictation'}
        >
          {isListening ? (
            <span className="flex items-center justify-center relative">
              <span className="absolute -inset-1 rounded-full bg-white/20 animate-ping" />
              <Mic className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-white`} />
            </span>
          ) : (
            <Mic className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={toggleListening}
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans transition-all duration-300 cursor-pointer border ${
            isListening
              ? 'bg-[#C27B66] text-white border-[#C27B66] ring-4 ring-[#C27B66]/20 shadow-sm animate-pulse'
              : 'bg-[#F9F8F4] text-[#2D3A31] border-[#E6E2DA] hover:bg-[#F2EDE6]'
          }`}
        >
          {isListening ? (
            <>
              <span className="w-2 h-2 rounded-full bg-white animate-ping shrink-0" />
              <span className="font-medium text-[11px]">Listening ({selectedLang})...</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-[#5A695E] shrink-0" />
              <span className="text-[11px]">Voice Dictation</span>
            </>
          )}
        </button>
      )}

      {/* Live Audio / Interim Transcript Overlay */}
      {isListening && interimText && (
        <div className="absolute top-full left-0 mt-1 z-50 bg-[#2D3A31] text-[#F9F8F4] text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg border border-[#8C9A84]/30 max-w-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-1 text-[10px] text-[#DCCFC2] mb-0.5">
            <Volume2 className="w-3 h-3 text-[#C27B66] animate-pulse" />
            <span>Listening...</span>
          </div>
          <p className="italic font-serif">"{interimText}"</p>
        </div>
      )}

      {/* Error Tooltip */}
      {errorMessage && (
        <div className="absolute top-full right-0 mt-1 z-50 bg-rose-50 border border-rose-200 text-rose-800 text-[11px] p-2 rounded-lg shadow-md max-w-xs flex items-start gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p>{errorMessage}</p>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-[10px] underline font-medium text-rose-700 mt-1 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
