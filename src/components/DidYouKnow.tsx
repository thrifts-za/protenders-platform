'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const facts = [
  "R93.5B flows to suppliers yearly—58% goes to private companies",
  "Black-owned businesses won R36.9B in govt contracts (6 months)",
  "Women entrepreneurs secured R14.0B—24% of tracked spending",
  "Management services lead at R17.4B (20% of procurement)",
  "Track 50,000+ tenders across 9 provinces & 50+ categories",
  "Youth-owned firms captured R7.6B—SA leads in youth empowerment",
  "Healthcare spending hit R9.6B—3rd largest procurement sector",
  "ProTenders: Only platform tracking all 6 PPPFA ownership categories",
  "Procurement doubled from R5.9B to R11.5B in just 6 months",
  "Average govt payment: R523K—from 30,000+ tracked transactions",
];

const colors = [
  "from-blue-500 to-cyan-500",
  "from-emerald-500 to-green-500",
  "from-purple-500 to-pink-500",
  "from-orange-500 to-amber-500",
  "from-indigo-500 to-violet-500",
  "from-rose-500 to-red-500",
  "from-teal-500 to-cyan-500",
  "from-fuchsia-500 to-purple-500",
  "from-sky-500 to-blue-500",
  "from-lime-500 to-green-500",
];

export function DidYouKnow() {
  const [factIndex, setFactIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentFact = facts[factIndex];

    if (!isDeleting) {
      // Typing phase
      if (displayedText.length < currentFact.length) {
        const timeout = setTimeout(() => {
          setDisplayedText(currentFact.slice(0, displayedText.length + 1));
        }, 100); // Typing speed (slower for readability)
        return () => clearTimeout(timeout);
      } else {
        // Wait before starting to delete
        const timeout = setTimeout(() => {
          setIsDeleting(true);
        }, 6000); // Display for 6 seconds
        return () => clearTimeout(timeout);
      }
    } else {
      // Deleting phase
      if (displayedText.length > 0) {
        const timeout = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, 50); // Delete speed
        return () => clearTimeout(timeout);
      } else {
        // Move to next fact
        setIsDeleting(false);
        setFactIndex((prev) => (prev + 1) % facts.length);
      }
    }
  }, [displayedText, factIndex, isDeleting]);

  return (
    <div className="mb-4">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${colors[factIndex]} text-white text-xs font-medium shadow-lg hover:shadow-xl transition-all duration-300`}>
        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
        <span className="inline-flex items-center">
          <span>{displayedText}</span>
          <span className="inline-block w-[2px] h-3 bg-white ml-0.5 animate-pulse"></span>
        </span>
      </div>
    </div>
  );
}
