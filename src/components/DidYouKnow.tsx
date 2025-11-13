'use client';

import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const facts = [
  "R93.5B spent with suppliers yearly",
  "Black-owned: R36.9B in 6 months",
  "Women-owned: R14.0B captured",
  "Top category: R17.4B (Management)",
  "50,000+ tenders tracked",
  "Youth-owned: R7.6B secured",
  "Healthcare: R9.6B (3rd largest)",
  "Only platform with 6 PPPFA categories",
  "Growth: R5.9B→R11.5B (6 months)",
  "Avg transaction: R523K",
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
  const [isTyping, setIsTyping] = useState(true);

  useEffect(() => {
    // Rotate through facts every 8 seconds
    const rotateInterval = setInterval(() => {
      setIsTyping(false);
      setTimeout(() => {
        setFactIndex((prev) => (prev + 1) % facts.length);
        setDisplayedText('');
        setIsTyping(true);
      }, 500); // Wait for fade out
    }, 8000);

    return () => clearInterval(rotateInterval);
  }, []);

  useEffect(() => {
    if (!isTyping) return;

    const currentFact = facts[factIndex];
    let currentIndex = 0;

    const typingInterval = setInterval(() => {
      if (currentIndex <= currentFact.length) {
        setDisplayedText(currentFact.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 50); // Typing speed

    return () => clearInterval(typingInterval);
  }, [factIndex, isTyping]);

  return (
    <div className="mb-4">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${colors[factIndex]} text-white text-xs font-medium shadow-lg hover:shadow-xl transition-all duration-500`}>
        <Sparkles className="h-3.5 w-3.5 animate-pulse" />
        <span className="min-w-[200px]">
          {displayedText}
          <span className="inline-block w-[2px] h-3 bg-white ml-0.5 animate-pulse"></span>
        </span>
      </div>
    </div>
  );
}
