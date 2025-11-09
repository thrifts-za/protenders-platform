'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WaitingListModal } from '@/components/WaitingListModal';
import {
  CheckCircle,
  Crown,
  Zap,
  TrendingUp,
  Users,
  Award,
  DollarSign,
  Target,
  BarChart3,
  Activity,
  Shield,
  Rocket,
  Star,
  Lightbulb,
} from 'lucide-react';

const premiumFeatures = [
  {
    title: 'Financial Intelligence',
    description: 'AI-powered budget analysis and pricing strategy recommendations',
    icon: DollarSign,
    benefits: [
      'Total estimated value calculations',
      'Recommended bid range analysis',
      'Cost breakdown by category',
      'Payment schedule predictions',
      'Financial risk assessment',
      'Cash flow projections',
    ],
  },
  {
    title: 'Competitive Analysis',
    description: 'Market positioning and competitor intelligence',
    icon: Target,
    benefits: [
      'Competitor identification & tracking',
      'Market concentration analysis',
      'Historical win rates by company',
      'Competitive positioning matrix',
      'BBBEE impact analysis',
      'Winning strategy recommendations',
    ],
  },
  {
    title: 'Award History',
    description: 'Historical procurement patterns and success factors',
    icon: Award,
    benefits: [
      'Buyer procurement history',
      'Past award values & timelines',
      'Category trend analysis',
      'Success factor identification',
      'Winning bidder profiles',
      'Average award timeframes',
    ],
  },
  {
    title: 'Action Center',
    description: 'Bid preparation management and team collaboration',
    icon: Rocket,
    benefits: [
      'Task checklist & deadlines',
      'Document preparation tracker',
      'Team member assignment',
      'Progress monitoring',
      'Priority action alerts',
      'Compliance verification',
    ],
  },
  {
    title: 'Real-Time Updates',
    description: 'Live tender changes and Q&A monitoring',
    icon: Activity,
    benefits: [
      'Amendment notifications',
      'Q&A monitoring',
      'Document update alerts',
      'Timeline tracking',
      'Competitor activity insights',
      'Deadline reminders',
    ],
  },
  {
    title: 'Strategic Assistant',
    description: 'AI-powered tender strategy recommendations',
    icon: Lightbulb,
    benefits: [
      'Win probability calculation',
      'Strategic positioning advice',
      'Key differentiators',
      'Risk identification',
      'Proposal focus areas',
      'Tactical recommendations',
    ],
  },
];

const stats = [
  { label: 'Higher Win Rate', value: '40%', icon: TrendingUp },
  { label: 'Active Businesses', value: '500+', icon: Users },
  { label: 'Tenders Tracked', value: '10,000+', icon: BarChart3 },
  { label: 'Value Won', value: 'R2.4B', icon: DollarSign },
];

const testimonials = [
  {
    quote: 'ProTenders Premium increased our tender win rate from 15% to 28% in just 6 months. The competitive intelligence is game-changing.',
    author: 'Sarah Naidoo',
    role: 'Procurement Director',
    company: 'BuildTech Solutions',
  },
  {
    quote: 'The financial intelligence features helped us price our bids more competitively while maintaining profitability. Best investment we made.',
    author: 'Michael Chen',
    role: 'Business Development Manager',
    company: 'InfoSys Africa',
  },
  {
    quote: 'Real-time updates and award history data give us a massive advantage. We know exactly who we are competing against.',
    author: 'Thabo Mokoena',
    role: 'CEO',
    company: 'Urban Infrastructure Ltd',
  },
];

export default function DemoPageClient() {
  const [showWaitingList, setShowWaitingList] = useState(false);

  return (
    <>
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-primary/10 via-background to-background py-20 border-b">
          <div className="content-container">
            <div className="max-w-4xl mx-auto text-center">
              <Badge className="mb-6 bg-green-500 hover:bg-green-600 text-white px-4 py-2">
                <CheckCircle className="h-4 w-4 mr-2" />
                Demo Access Granted - Full Features Unlocked
              </Badge>

              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Welcome to ProTenders Premium
              </h1>

              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Explore the complete platform with all premium features unlocked.
                This is exactly what you'll experience with your subscription.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button size="lg" className="text-lg px-8 shadow-lg hover:shadow-xl transition-shadow" asChild>
                  <Link href="/demo/tender">
                    <Zap className="h-5 w-5 mr-2" />
                    Browse Tenders with Full Access
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8"
                  onClick={() => setShowWaitingList(true)}
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Reserve Your Premium Spot
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mt-6 flex items-center justify-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Early-bird pricing: 50% off for waiting list members
                <Star className="h-4 w-4 text-yellow-500" />
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-muted/50">
          <div className="content-container">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <Card key={index} className="text-center">
                    <CardContent className="p-6">
                      <Icon className="h-8 w-8 mx-auto mb-3 text-primary" />
                      <p className="text-3xl font-bold mb-1">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <div className="content-container">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">
                Premium Features You're Experiencing
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Everything you see and use in this demo is available with premium access
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {premiumFeatures.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-muted/50">
          <div className="content-container">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Trusted by Winning Businesses</h2>
              <p className="text-xl text-muted-foreground">
                See what our premium users are saying
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <Card key={index}>
                  <CardContent className="p-6">
                    <div className="flex gap-1 mb-4">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                      ))}
                    </div>
                    <p className="text-sm mb-4 italic">&ldquo;{testimonial.quote}&rdquo;</p>
                    <div className="border-t pt-4">
                      <p className="font-semibold text-sm">{testimonial.author}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.company}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="content-container">
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
              <CardContent className="p-12 text-center">
                <Crown className="h-20 w-20 text-yellow-500 mx-auto mb-6" />

                <h2 className="text-4xl font-bold mb-4">
                  Ready to Win More Tenders?
                </h2>

                <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join 500+ businesses using ProTenders Premium to gain competitive
                  advantage and increase their tender win rate by 40%.
                </p>

                <div className="grid md:grid-cols-3 gap-6 mb-10 max-w-3xl mx-auto">
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-semibold">Higher Win Rate</p>
                    <p className="text-sm text-muted-foreground">Average 40% improvement</p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Zap className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-semibold">Faster Bidding</p>
                    <p className="text-sm text-muted-foreground">Save 10+ hours per tender</p>
                  </div>
                  <div className="text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <Target className="h-6 w-6 text-primary" />
                    </div>
                    <p className="font-semibold">Better Pricing</p>
                    <p className="text-sm text-muted-foreground">Optimize bid competitiveness</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Button
                    size="lg"
                    className="text-lg px-8 shadow-lg"
                    onClick={() => setShowWaitingList(true)}
                  >
                    <Rocket className="h-5 w-5 mr-2" />
                    Secure Early Access Pricing
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8">
                    Schedule a Demo Call
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground mt-6">
                  <span className="font-semibold text-primary">Limited time offer:</span>{' '}
                  50% off for the first 100 waiting list members
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How to Access */}
        <section className="py-16 bg-muted/50 border-t">
          <div className="content-container max-w-3xl">
            <h2 className="text-3xl font-bold text-center mb-8">
              How to Use This Demo
            </h2>

            <div className="space-y-4">
              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    1
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Browse Tenders</h3>
                    <p className="text-sm text-muted-foreground">
                      Navigate to any tender page and explore all premium intelligence features -
                      everything is unlocked for you on this demo session.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    2
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Explore All Tabs</h3>
                    <p className="text-sm text-muted-foreground">
                      Click through Overview, Financial Intelligence, Competitive Analysis,
                      Award History, and more - all fully accessible with no restrictions.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 font-bold">
                    3
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Experience the Value</h3>
                    <p className="text-sm text-muted-foreground">
                      See how premium insights can help you win more tenders, price strategically,
                      and outperform competitors. This is the exact experience you'll get.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-8">
              <Button size="lg" asChild>
                <Link href="/demo/tender">
                  Start Exploring Tenders
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </div>

      <WaitingListModal
        isOpen={showWaitingList}
        onClose={() => setShowWaitingList(false)}
        source="demo-page"
      />
    </>
  );
}
