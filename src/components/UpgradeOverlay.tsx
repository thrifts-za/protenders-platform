'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useContentAccess } from '@/hooks/useContentAccess';
import { Crown, CheckCircle, Zap, TrendingUp, Users, Award, Activity } from 'lucide-react';

interface UpgradeOverlayProps {
  /**
   * Callback when upgrade button is clicked
   */
  onUpgradeClick: () => void;
}

/**
 * Overlay shown on top of blurred premium content
 *
 * Displays value proposition and upgrade CTA
 */
export function UpgradeOverlay({ onUpgradeClick }: UpgradeOverlayProps) {
  const { plan } = useContentAccess();

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-background/90 backdrop-blur-sm z-20">
      <Card className="p-8 text-center max-w-lg shadow-2xl border-primary/20">
        <CardContent className="p-0">
          <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4 animate-pulse" />

          <h3 className="text-2xl font-bold mb-3">
            Unlock Premium Intelligence
          </h3>

          <p className="text-muted-foreground mb-6">
            Get instant access to AI-powered insights, competitor analysis,
            financial intelligence, and award history to win more tenders.
          </p>

          {/* Feature Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6 text-left">
            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Financial Intelligence</p>
                <p className="text-xs text-muted-foreground">
                  Budget analysis & pricing
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Competitor Insights</p>
                <p className="text-xs text-muted-foreground">
                  Market positioning
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Award History</p>
                <p className="text-xs text-muted-foreground">
                  Historical data & trends
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold text-sm">Real-time Updates</p>
                <p className="text-xs text-muted-foreground">
                  Live tender changes
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6 p-4 bg-primary/5 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">40%</p>
              <p className="text-xs text-muted-foreground">Higher Win Rate</p>
            </div>
            <div className="text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">500+</p>
              <p className="text-xs text-muted-foreground">Active Businesses</p>
            </div>
            <div className="text-center">
              <Award className="h-5 w-5 mx-auto mb-1 text-primary" />
              <p className="text-2xl font-bold">R2.4B</p>
              <p className="text-xs text-muted-foreground">Tenders Won</p>
            </div>
          </div>

          {/* CTA Button */}
          <Button
            onClick={onUpgradeClick}
            size="lg"
            className="w-full text-lg shadow-lg hover:shadow-xl transition-shadow"
          >
            <Zap className="h-5 w-5 mr-2" />
            Join Waiting List for Early Access
          </Button>

          {/* Value Props */}
          <div className="mt-4 space-y-1">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <Activity className="h-3 w-3" />
              Limited spots available • Get demo access immediately
            </p>
            {plan === 'free' && (
              <p className="text-xs font-semibold text-primary">
                Early-bird pricing: 50% off for waiting list members
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
