"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowLeft, Search, Bell, FileText, TrendingUp, Users, Shield } from "lucide-react";

export default function FAQ() {
  const faqs = [
    {
      category: "Getting Started",
      icon: Search,
      questions: [
        {
          q: "What is ProTenders?",
          a: "ProTenders is South Africa's premier tender intelligence platform that helps businesses find and track government and private sector tenders. We provide advanced search, real-time alerts, AI-powered insights, and competitive intelligence for procurement opportunities across South Africa. Our platform aggregates tenders from government portals including etenders, making them easily searchable in one centralized location.",
        },
        {
          q: "How do I find etenders in South Africa?",
          a: "Finding etenders on ProTenders is simple: (1) Create a free account or log in, (2) Use our advanced search filters including keywords, categories, provinces, and buyers, (3) Browse through results with complete tender details, (4) Set up alerts to get notified when new matching tenders are published. We aggregate tenders from the official etenders portal and other government sources, making it easy to find all opportunities in one place without visiting multiple websites.",
        },
        {
          q: "Is ProTenders free to use?",
          a: "ProTenders offers both free and premium plans. The free plan includes basic tender search functionality and limited alerts, allowing you to explore the platform and find opportunities. Premium plans provide advanced features including unlimited custom alerts, AI-powered insights, competitive intelligence, document analysis, opportunity scoring, and priority support. You can start with the free plan and upgrade anytime as your needs grow.",
        },
      ],
    },
    {
      category: "Tenders & Search",
      icon: FileText,
      questions: [
        {
          q: "What types of tenders can I find on ProTenders?",
          a: "ProTenders covers all types of procurement opportunities including: (1) Government tenders from national, provincial, and municipal departments, (2) Construction tenders (buildings, roads, infrastructure), (3) IT and technology tenders (software, hardware, services), (4) Consulting tenders (professional services, advisory), (5) Supply tenders (goods, equipment, materials), (6) Service tenders (maintenance, support, operations), (7) RFQs (Request for Quotations), (8) RFPs (Request for Proposals), and (9) RFIs (Request for Information). We cover both government and private sector opportunities across all industries and provinces in South Africa.",
        },
        {
          q: "How often is tender data updated?",
          a: "Our tender database is updated in real-time throughout the day. We continuously monitor government portals including the etenders platform, department websites, and other procurement sources to ensure you have access to the latest tender opportunities as soon as they're published. Most new tenders appear on ProTenders within minutes to hours of being published on official sources. You'll never miss an opportunity with our real-time synchronization.",
        },
        {
          q: "Can I search for tenders in specific provinces or municipalities?",
          a: "Yes! ProTenders allows you to filter tenders by specific provinces including Gauteng, Western Cape, KwaZulu-Natal, Eastern Cape, Free State, Limpopo, Mpumalanga, Northern Cape, and North West. You can also filter by specific municipalities, government departments, or buyers. This makes it easy to find local opportunities relevant to your business location and focus on tenders you're most likely to win based on geographic proximity.",
        },
        {
          q: "What is the difference between RFQ, RFP, and RFI?",
          a: "RFQ (Request for Quotation) is used when buyers know exactly what they need and want price quotes for specific products or services with clearly defined requirements. RFP (Request for Proposal) is for complex projects where buyers want detailed proposals including solutions, methodologies, timelines, and pricing from suppliers. RFI (Request for Information) is used in early procurement stages to gather information from potential suppliers before issuing formal tenders. ProTenders helps you find and respond to all three types with detailed requirements and specifications.",
        },
      ],
    },
    {
      category: "Alerts & Notifications",
      icon: Bell,
      questions: [
        {
          q: "How do tender alerts work?",
          a: "ProTenders allows you to create custom tender alerts based on your specific search criteria. Here's how it works: (1) Perform a search using your desired filters (keywords, categories, provinces, buyers, etc.), (2) Save your search as an alert, (3) When new tenders matching your criteria are published, you'll receive instant notifications via email and in-app alerts, (4) You can create multiple alerts for different tender types or categories, (5) Manage, pause, or delete alerts anytime from your dashboard. This ensures you never miss relevant opportunities and can respond quickly to new tenders.",
        },
        {
          q: "How many alerts can I create?",
          a: "The number of alerts you can create depends on your plan. Free plan users can create a limited number of basic alerts (typically 2-3), which is great for testing the platform. Premium plan users get unlimited custom alerts, allowing you to track as many tender categories, buyers, or keywords as you need. Premium alerts also include advanced filtering options, priority notifications, and AI-powered opportunity matching.",
        },
        {
          q: "Can I customize notification preferences?",
          a: "Yes! You have full control over your notification preferences. You can choose to receive alerts via email, in-app notifications, or both. Set your preferred notification frequency (instant, daily digest, weekly summary), choose which days and times you want to receive alerts, and customize notification settings for each individual alert. This ensures you stay informed without being overwhelmed by notifications.",
        },
      ],
    },
    {
      category: "Features & Tools",
      icon: TrendingUp,
      questions: [
        {
          q: "What is AI-powered intelligence?",
          a: "Our AI-powered intelligence features analyze tenders to provide you with competitive advantages: (1) Opportunity Scoring - AI evaluates your likelihood of winning based on tender requirements, your company profile, and historical data, (2) Competitive Intelligence - Identify who else is likely to bid and analyze competitor strengths, (3) Document Analysis - AI extracts key requirements, deadlines, and evaluation criteria from tender documents, (4) Buyer Insights - Understand buyer patterns, preferences, and historical award data, (5) Smart Recommendations - Get personalized tender suggestions based on your business profile and past activity.",
        },
        {
          q: "Can I download tender documents?",
          a: "Yes! ProTenders provides direct access to all available tender documents including specifications, terms and conditions, briefing documents, drawings, and supporting files. You can view documents online or download them directly from the platform for offline review. We organize documents by type and make them easily accessible from each tender's detail page. Premium users also get AI-powered document analysis that highlights important requirements and deadlines.",
        },
        {
          q: "How do I track tender deadlines?",
          a: "ProTenders makes deadline tracking easy with multiple features: (1) Calendar view showing all closing dates, (2) Dashboard with upcoming deadlines highlighted, (3) Countdown timers on tender cards, (4) Automatic deadline reminders (1 week, 3 days, 1 day before), (5) Workspace where you can save and organize tenders you're working on, (6) Export tender details to your calendar (ICS format). You'll never miss a deadline with our comprehensive tracking tools.",
        },
      ],
    },
    {
      category: "Account & Pricing",
      icon: Users,
      questions: [
        {
          q: "How do I create an account?",
          a: "Creating an account is quick and easy: (1) Click 'Sign Up' on the homepage, (2) Enter your email address and create a password, (3) Provide basic business information (optional but recommended for better matches), (4) Verify your email address, (5) Start searching for tenders immediately! Your free account gives you instant access to our tender database and basic features. You can upgrade to premium anytime to unlock advanced features.",
        },
        {
          q: "What payment methods do you accept?",
          a: "We accept all major payment methods including credit cards (Visa, Mastercard, American Express), debit cards, and EFT (Electronic Funds Transfer) for South African businesses. Premium subscriptions are billed monthly or annually (with a discount for annual payment). All payments are secure and processed through encrypted payment gateways. Invoices are provided for all transactions for your accounting records.",
        },
        {
          q: "Can I cancel my subscription anytime?",
          a: "Yes, you have complete flexibility. Premium subscriptions can be cancelled anytime from your account settings. There are no cancellation fees or penalties. If you cancel, you'll retain access to premium features until the end of your current billing period. You can also pause your subscription temporarily if needed and reactivate it later. Your saved searches, alerts, and data are preserved even if you downgrade to the free plan.",
        },
      ],
    },
    {
      category: "Security & Support",
      icon: Shield,
      questions: [
        {
          q: "Is my data secure?",
          a: "Absolutely. ProTenders takes data security very seriously. We use industry-standard encryption (SSL/TLS) for all data transmission, secure cloud infrastructure with regular backups, strict access controls and authentication, compliance with POPIA (Protection of Personal Information Act), and regular security audits. Your tender searches, saved data, and business information are completely private and never shared with third parties without your explicit consent.",
        },
        {
          q: "Do you offer customer support?",
          a: "Yes! We provide comprehensive customer support through multiple channels: (1) Email support for all users (response within 24 hours), (2) In-app help center with guides and tutorials, (3) Video walkthroughs and documentation, (4) Priority support for premium users (faster response times), (5) Phone support for enterprise customers. Our support team is knowledgeable about both the platform and the tender procurement process, so we can help with technical and procurement-related questions.",
        },
        {
          q: "Do you provide training on how to bid for tenders?",
          a: "Yes! Beyond the platform features, we offer tender bidding education through: (1) Blog articles and guides on tender best practices, (2) Video tutorials on the tender process, (3) Webinars on improving win rates, (4) Templates and checklists for tender preparation, (5) Tips on compliance and requirements, (6) Success stories and case studies. Premium users get access to advanced training materials and consulting services to improve their tender bidding success.",
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-primary">Frequently Asked Questions</h1>
          <p className="text-muted-foreground mt-2">
            Everything you need to know about finding etenders and government tenders in South Africa
          </p>
        </div>
      </header>

      <div className="w-full py-12">
        <div className="content-container max-w-4xl mx-auto">
        {/* Quick Links */}
        <Card className="p-6 mb-8 bg-primary/5 border-primary/20">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/how-it-works">
              <Button variant="outline" className="w-full">
                How It Works
              </Button>
            </Link>
            <Link href="/alerts">
              <Button variant="outline" className="w-full">
                Create Alerts
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Start Searching
              </Button>
            </Link>
          </div>
        </Card>

        {/* FAQ Categories */}
        {faqs.map((category, idx) => {
          const Icon = category.icon;
          return (
            <div key={idx} className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">{category.category}</h2>
              </div>

              <Accordion type="single" collapsible className="space-y-4">
                {category.questions.map((faq, qIdx) => (
                  <AccordionItem
                    key={qIdx}
                    value={`${idx}-${qIdx}`}
                    className="border rounded-lg px-6 bg-card"
                  >
                    <AccordionTrigger className="text-left hover:no-underline">
                      <span className="font-semibold">{faq.q}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pt-4">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          );
        })}

        {/* Still Have Questions */}
        <Card className="p-8 text-center bg-gradient-to-br from-primary/10 to-primary/5">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="text-muted-foreground mb-6">
            Can&apos;t find the answer you&apos;re looking for? Our support team is here to help.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Button size="lg">Contact Support</Button>
            <Link href="/how-it-works">
              <Button variant="outline" size="lg">
                View How It Works
              </Button>
            </Link>
          </div>
        </Card>
        </div>
      </div>
    </div>
  );
}
