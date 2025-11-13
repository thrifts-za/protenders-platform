'use client';

import { useEffect, useState } from 'react';
import { Lightbulb } from 'lucide-react';

const facts = [
  {
    id: 1,
    fact: "South Africa's government spends R93.5B+ annually with private suppliers, with 58% going to CIPC-registered companies.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: 2,
    fact: "Black-owned businesses received R36.9B in government procurement over 6 months (FY 2025/26), leading all PPPFA categories.",
    color: "from-emerald-500 to-green-500"
  },
  {
    id: 3,
    fact: "Women-owned businesses captured R14.0B in government spending, representing 24% of demographic procurement tracked.",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: 4,
    fact: "Management & Business Services is the #1 procurement category, receiving R17.4B (20.3% of total commodity spend).",
    color: "from-orange-500 to-amber-500"
  },
  {
    id: 5,
    fact: "The government tracks 50,000+ tenders across 50+ commodity categories and 9 provinces annually.",
    color: "from-indigo-500 to-violet-500"
  },
  {
    id: 6,
    fact: "Youth-owned businesses secured R7.6B in government contracts, making South Africa a leader in youth economic participation.",
    color: "from-rose-500 to-red-500"
  },
  {
    id: 7,
    fact: "Healthcare Services procurement reached R9.6B, making it the 3rd largest spending category in South Africa.",
    color: "from-teal-500 to-cyan-500"
  },
  {
    id: 8,
    fact: "ProTenders is the ONLY platform tracking all 6 PPPFA categories: Black, Women, Youth, Disabled, Military Veteran, and Rural Township ownership.",
    color: "from-fuchsia-500 to-purple-500"
  },
  {
    id: 9,
    fact: "Government spending increased from R5.9B in April to R11.5B in September 2025, showing strong economic activity.",
    color: "from-sky-500 to-blue-500"
  },
  {
    id: 10,
    fact: "The average government transaction is R523K, with over 29,999 payments tracked in our database.",
    color: "from-lime-500 to-green-500"
  },
];

export function DidYouKnow() {
  const [todaysFact, setTodaysFact] = useState(facts[0]);

  useEffect(() => {
    // Get day of year to rotate facts daily
    const today = new Date();
    const start = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - start.getTime();
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    // Select fact based on day of year
    const factIndex = dayOfYear % facts.length;
    setTodaysFact(facts[factIndex]);
  }, []);

  return (
    <div className="mb-6 mx-auto max-w-3xl">
      <div className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${todaysFact.color} p-[2px] shadow-lg`}>
        <div className="bg-background rounded-lg p-4">
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 p-2 rounded-lg bg-gradient-to-br ${todaysFact.color}`}>
              <Lightbulb className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r {todaysFact.color}">
                  Did You Know?
                </h3>
                <span className="text-xs text-muted-foreground">• Daily Insight</span>
              </div>
              <p className="text-sm leading-relaxed">
                {todaysFact.fact}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
