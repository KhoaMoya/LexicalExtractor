"use client";

import { useEffect, useState, useRef } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type Props = {
  word: string;
  lang: 'en-US' | 'en-GB';
  label: string;
  url?: string | null; // Optional URL for sound
};

export function PronunciationButton({ word, lang, label, url }: Props) {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };

    if (typeof window !== 'undefined' && window.speechSynthesis) {
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  const handlePronounce = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent form submission
    event.stopPropagation(); // Stop event propagation

    if (url) {
      // Play audio from URL
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      } else {
        audioRef.current = new Audio(url);
      }

      audioRef.current.src = url;
      audioRef.current.play();


    } else if (typeof window !== "undefined" && window.speechSynthesis) {
      // Use Speech Synthesis API
      const utterance = new SpeechSynthesisUtterance(word);
      const selectedVoice = voices.find((voice) => voice.lang === lang);

      if (selectedVoice) {
        utterance.voice = selectedVoice;
      } else {
        utterance.lang = lang; // Fallback if specific voice not found
      }

      window.speechSynthesis.cancel(); // Cancel any previous speech
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePronounce}
            aria-label={`Pronounce ${word} in ${label} English`}
            disabled={voices.length === 0 && !url}
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Pronounce ({label})</p>
        </TooltipContent>
      </Tooltip>
      {url && <audio ref={audioRef} src={url} preload="auto" />}
    </TooltipProvider>
  );
}