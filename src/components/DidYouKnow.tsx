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

  useEffect(() => {
    // Get day of year to rotate facts daily
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
    setFactIndex(dayOfYear % facts.length);
  }, []);

  return (
    <div className="mb-4">
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${colors[factIndex]} text-white text-xs font-medium shadow-lg hover:shadow-xl transition-shadow`}>
        <Sparkles className="h-3.5 w-3.5" />
        <span>{facts[factIndex]}</span>
      </div>
    </div>
  );
}
