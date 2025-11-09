'use client';

import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FloatingContributeButton() {
  return (
    <div className="fixed bottom-6 right-6 z-40 animate-bounce-gentle">
      {/* Floating Button with Peel Effect */}
      <Link href="/feedback">
        <Button
          size="lg"
          className="rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 text-white border-2 border-white pr-6 pl-5 group relative overflow-hidden animate-pulse-subtle"
        >
          {/* Ambient gradient background */}
          <div className="absolute inset-0 rounded-full bg-gradient-radial-button animate-ambient-button"></div>

          {/* Shine effect */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out z-10"></div>

          <Heart className="h-5 w-5 mr-2 group-hover:scale-125 transition-transform duration-300 animate-heartbeat relative z-20" />
          <span className="font-semibold relative z-20">Help Build ProTenders</span>

          {/* Glow effect */}
          <div className="absolute inset-0 rounded-full bg-blue-400/20 blur-xl group-hover:bg-blue-400/40 transition-all duration-300"></div>
        </Button>
      </Link>

      <style jsx>{`
        @keyframes bounce-gentle {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes pulse-subtle {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.02);
          }
        }

        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          10%, 30% {
            transform: scale(1.1);
          }
          20%, 40% {
            transform: scale(0.95);
          }
        }

        @keyframes ambient-button {
          0% {
            background-position: 0% 50%;
            filter: hue-rotate(0deg);
          }
          25% {
            background-position: 50% 100%;
            filter: hue-rotate(15deg);
          }
          50% {
            background-position: 100% 50%;
            filter: hue-rotate(0deg);
          }
          75% {
            background-position: 50% 0%;
            filter: hue-rotate(-15deg);
          }
          100% {
            background-position: 0% 50%;
            filter: hue-rotate(0deg);
          }
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 3s ease-in-out infinite;
        }

        .animate-pulse-subtle {
          animation: pulse-subtle 2s ease-in-out infinite;
        }

        .animate-heartbeat {
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        .animate-ambient-button {
          animation: ambient-button 18s ease-in-out infinite;
        }

        .bg-gradient-radial-button {
          background: linear-gradient(
            135deg,
            #3b82f6 0%,
            #2563eb 20%,
            #1d4ed8 40%,
            #1e40af 60%,
            #1d4ed8 80%,
            #2563eb 100%
          );
          background-size: 200% 200%;
        }
      `}</style>
    </div>
  );
}
