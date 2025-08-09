"use client";

import { useEffect, useState, useRef } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { playPronunciation } from "@/lib/audio-player";

type Props = {
  word: string;
  lang: 'en-US' | 'en-GB';
  label: string;
  url?: string | null; // Optional URL for sound
};

export function PronunciationButton({ word, lang, label, url }: Props) {
  const [canUseSpeechSynthesis, setCanUseSpeechSynthesis] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
        const checkVoices = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
                setCanUseSpeechSynthesis(true);
            }
        };
        checkVoices();
        window.speechSynthesis.onvoiceschanged = checkVoices;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }
  }, []);

  const handlePronounce = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); 
    event.stopPropagation();
    playPronunciation(word, url, lang, audioRef);
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
            disabled={!url && !canUseSpeechSynthesis}
          >
            <Volume2 className="h-5 w-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Pronounce ({label})</p>
        </TooltipContent>
      </Tooltip>
      {/* The audio element is managed via ref by the playPronunciation function */}
    </TooltipProvider>
  );
}
