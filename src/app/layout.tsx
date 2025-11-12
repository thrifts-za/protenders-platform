import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  renderStructuredData,
} from "@/lib/structured-data";
import ConditionalFooter from "@/components/ConditionalFooter";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import SessionProvider from "@/components/SessionProvider";
import { Providers } from "@/components/providers";
import Link from "next/link";
import Script from "next/script";
import VisitorModal from "@/components/VisitorModal";
import { CLARITY_PROJECT_ID } from "@/config/analytics";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import ConditionalNotificationBar from "@/components/ConditionalNotificationBar";
import NavigationMenu from "@/components/NavigationMenu";
import MobileNavigation from "@/components/MobileNavigation";
import FloatingContributeButton from "@/components/FloatingContributeButton";
import AmbientGradient from "@/components/AmbientGradient";
import MixpanelProvider from "@/components/MixpanelProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://protenders.co.za"),
  title: {
    default: "ProTenders | South Africa's Premier Government Tender Portal",
    template: "%s | ProTenders",
  },
  description:
    "Search 10,000+ government tenders, RFQs & RFPs across South Africa. AI-powered tender alerts, BEE opportunities & real-time procurement intelligence.",
  keywords: [
    "etenders",
    "etenders south africa",
    "etender portal",
    "government etenders",
    "etenders gov za",
    "government tenders South Africa",
    "south africa tenders",
    "sa tenders",
    "tenders in south africa",
    "RFQ",
    "RFP",
    "procurement opportunities",
    "BEE tenders",
    "government contracts",
    "tender alerts",
    "South African tenders",
    "government procurement",
    "tender portal",
    "public sector tenders",
    "tender opportunities south africa",
  ],
  authors: [{ name: "ProTenders" }],
  creator: "ProTenders",
  publisher: "ProTenders",
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://protenders.co.za",
    title: "ProTenders | Find Government Tenders in South Africa",
    description:
      "Access 10,000+ government tenders, RFQs & RFPs. AI-powered alerts for procurement opportunities across all provinces.",
    siteName: "ProTenders",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "ProTenders - South Africa's Premier Government Tender Portal",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ProTenders | Find Government Tenders in South Africa",
    description:
      "Access 10,000+ government tenders, RFQs & RFPs. AI-powered alerts for procurement opportunities.",
    creator: "@protenders",
    images: ["/images/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icons/favicon.ico", sizes: "any" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "mask-icon", url: "/icons/safari-pinned-tab.svg", color: "#000000" },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://protenders.co.za",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    other: {
      'msvalidate.01': '2967B207EBA69D1C4A0549D73AF773E7',
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebSiteSchema();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: renderStructuredData(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: renderStructuredData(websiteSchema),
          }}
        />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {/* Mixpanel Analytics */}
        <MixpanelProvider />

        {/* Microsoft Clarity (env or fallback in config/analytics.ts) */}
        {(() => {
          const id = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || CLARITY_PROJECT_ID;
          return id && id !== 'REPLACE_WITH_CLARITY_ID';
        })() ? (
          <Script id="ms-clarity" strategy="afterInteractive">
            {(() => {
              const id = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID || CLARITY_PROJECT_ID;
              return `
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, "clarity", "script", "${id}");
            `;
            })()}
          </Script>
        ) : null}

        {/* Google Analytics */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-JS1J9SDY13"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-JS1J9SDY13');
          `}
        </Script>
        <Providers>
          <SessionProvider>
            <TooltipProvider>
            {/* Ambient Background Gradient */}
            <AmbientGradient />

            <div className="min-h-screen flex flex-col relative z-10">
            {/* Notification Bar */}
            <ConditionalNotificationBar />

            {/* Header/Navigation */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <nav className="content-container h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    ProTenders
                  </span>
                </Link>
                <NavigationMenu />
                <MobileNavigation />
              </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1">
              {children}
              <VisitorModal />
              <FloatingContributeButton />
            </main>

            {/* Footer */}
            <ConditionalFooter />
          </div>
              <Toaster />
              <SonnerToaster position="top-right" />
            </TooltipProvider>
          </SessionProvider>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
