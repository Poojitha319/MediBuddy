import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader } from 'lucide-react';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser.');
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = 'en-US'; // Set user language dynamically if needed
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
    };

    recognition.onresult = (event) => {
      const result = Array.from(event.results)
        .map((res) => res[0].transcript)
        .join('');
      setTranscript(result);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onerror = (e) => {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleToggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <div>
      {/* Floating mic button */}
      <button
        onClick={handleToggleListening}
        className={`fixed bottom-6 right-6 z-50 rounded-full p-4 shadow-xl transition-colors ${
          isListening ? 'bg-red-500' : 'bg-blue-600'
        } hover:scale-105 focus:outline-none`}
        aria-label={isListening ? 'Stop listening' : 'Start voice assistant'}
      >
        {isListening ? <MicOff size={28} color="white" /> : <Mic size={28} color="white" />}
      </button>

      {/* Voice transcription bubble */}
      {transcript && (
        <div className="fixed bottom-24 right-6 max-w-xs rounded-lg bg-white p-4 shadow-lg text-sm text-gray-800 animate-fade-in">
          <p className="font-semibold text-gray-600 mb-1">You said:</p>
          <p>{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceAssistant;
