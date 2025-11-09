import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import {
  generateOrganizationSchema,
  generateWebSiteSchema,
  renderStructuredData,
} from "@/lib/structured-data";
import Footer from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import SessionProvider from "@/components/SessionProvider";
import { Providers } from "@/components/providers";
import Link from "next/link";
import Script from "next/script";
import VisitorModal from "@/components/VisitorModal";
import { MIXPANEL_TOKEN, CLARITY_PROJECT_ID } from "@/config/analytics";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import NotificationBar from "@/components/NotificationBar";

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
  // Note: Add your Google Search Console verification code here
  // Get it from: https://search.google.com/search-console
  // verification: {
  //   google: "your-verification-code-here",
  // },
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
        {/* Mixpanel (env or fallback in config/analytics.ts) */}
        {(() => {
          const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || MIXPANEL_TOKEN;
          return token && token !== 'REPLACE_WITH_MIXPANEL_TOKEN';
        })() ? (
          <>
            <Script id="mixpanel-init" strategy="afterInteractive">
              {(() => {
                const token = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || MIXPANEL_TOKEN;
                return `
              (function(f,b){if(!b.__SV){var a,e,i,g;window.mixpanel=b;b._i=[];b.init=function(a,e,d){function f(b,h){var a=h.split(".");2==a.length&&(b=b[a[0]],h=a[1]);b[h]=function(){b.push([h].concat(Array.prototype.slice.call(arguments,0)))}}
              var c=b;"undefined"!==typeof d?c=b[d]=[]:d="mixpanel";c.people=c.people||[];c.toString=function(b){var a="mixpanel";"mixpanel"!==d&&(a+="."+d);b||(a+=" (stub)");return a};c.people.toString=function(){return c.toString(1)+".people (stub)"};i="disable time_event track track_pageview track_links track_forms track_with_groups add_group set_group remove_group register register_once alias unregister identify name_tag set set_once union unset toString opt_in_tracking opt_out_tracking has_opted_in_tracking has_opted_out_tracking clear_opt_in_out_tracking people.set people.set_once people.unset people.increment people.append people.union people.track_charge people.clear_charges people.delete_user".split(" ");for(g=0;g<i.length;g++)f(c,i[g]);b._i.push([a,e,d])};b.__SV=1.2;a=f.createElement("script");a.type="text/javascript";a.async=!0;a.src="https://cdn.mxpnl.com/libs/mixpanel-2-latest.min.js";e=f.getElementsByTagName("script")[0];e.parentNode.insertBefore(a,e)}})(document,window.mixpanel||[]);
              mixpanel.init('${token}', { debug: false });
              `;
              })()}
            </Script>
            <Script id="mixpanel-page" strategy="afterInteractive">
              {`try { window.mixpanel && window.mixpanel.track('Page View', { path: location.pathname }); } catch(e) {}`}
            </Script>
          </>
        ) : null}

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
        <Providers>
          <SessionProvider>
            <TooltipProvider>
            <div className="min-h-screen flex flex-col">
            {/* Notification Bar */}
            <NotificationBar />

            {/* Header/Navigation */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <nav className="content-container h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2">
                  <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
                    ProTenders
                  </span>
                </Link>
                <div className="flex items-center gap-6">
                  <Link href="/search" className="text-sm font-medium hover:text-primary transition-colors">Search</Link>
                  <Link href="/provinces" className="text-sm font-medium hover:text-primary transition-colors">Provinces</Link>
                  <Link href="/alerts" className="text-sm font-medium hover:text-primary transition-colors">Alerts</Link>
                  <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">About</Link>
                  <Link href="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
                </div>
              </nav>
            </header>

            {/* Main Content */}
            <main className="flex-1">
              {children}
              <VisitorModal />
            </main>

            {/* Footer */}
            <Footer />
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
