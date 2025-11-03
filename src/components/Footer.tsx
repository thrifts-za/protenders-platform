import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Bell,
  FileText,
  TrendingUp,
  HelpCircle,
  BookOpen,
  Mail,
  Linkedin,
  Twitter,
  Facebook,
} from "lucide-react";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    features: [
      { label: "Search Tenders", href: "/", icon: Search },
      { label: "Tender Alerts", href: "/alerts", icon: Bell },
      { label: "Opportunities", href: "/opportunities", icon: TrendingUp },
      { label: "Insights & Analytics", href: "/insights", icon: FileText },
    ],
    resources: [
      { label: "How It Works", href: "/how-it-works", icon: BookOpen },
      { label: "FAQ", href: "/faq", icon: HelpCircle },
      { label: "Blog & Resources", href: "/blog", icon: BookOpen },
      { label: "Tender Glossary", href: "/glossary", icon: BookOpen },
    ],
    tenderCategories: [
      { label: "Public Sector Tenders", href: "/public-sector-tenders" },
      { label: "Construction Tenders", href: "/category/construction" },
      { label: "IT & Technology Tenders", href: "/category/it-services" },
      { label: "Consulting Services", href: "/category/consulting" },
      { label: "Security Services", href: "/category/security-services" },
      { label: "Supply & Delivery", href: "/category/supply-and-delivery" },
      { label: "Cleaning Services", href: "/category/cleaning-services" },
      { label: "Catering Services", href: "/category/catering" },
      { label: "Transport & Logistics", href: "/category/transport" },
    ],
    provinces: [
      { label: "Gauteng Tenders", href: "/province/gauteng" },
      { label: "Western Cape Tenders", href: "/province/western-cape" },
      { label: "KwaZulu-Natal Tenders", href: "/province/kwazulu-natal" },
      { label: "Eastern Cape Tenders", href: "/province/eastern-cape" },
      { label: "Limpopo Tenders", href: "/province/limpopo" },
      { label: "Mpumalanga Tenders", href: "/province/mpumalanga" },
      { label: "North West Tenders", href: "/province/north-west" },
      { label: "Free State Tenders", href: "/province/free-state" },
      { label: "Northern Cape Tenders", href: "/province/northern-cape" },
    ],
    blogPosts: [
      { label: "How to Submit eTenders Guide", href: "/blog/how-to-submit-etenders-south-africa-complete-guide-2025" },
      { label: "Tender Documents Checklist", href: "/blog/tender-documents-south-africa-complete-checklist-guide-2025" },
      { label: "How to Find Government Tenders", href: "/blog/how-to-find-government-tenders-south-africa-2025" },
      { label: "eTenders Portal Guide", href: "/blog/understanding-etenders-portal-complete-guide" },
      { label: "CIDB Registration Guide", href: "/blog/cidb-registration-guide-everything-you-need-to-know-2025" },
      { label: "RFQ vs RFP Explained", href: "/blog/rfq-vs-rfp-difference-government-tenders" },
    ],
  };

  const socialLinks = [
    { label: "LinkedIn", href: "#", icon: Linkedin },
    { label: "Twitter", href: "#", icon: Twitter },
    { label: "Facebook", href: "#", icon: Facebook },
  ];

  return (
    <footer className="bg-card border-t mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <h3 className="text-lg font-bold mb-4 text-primary">ProTenders</h3>
            <p className="text-sm text-muted-foreground mb-4">
              South Africa's premier tender intelligence platform. Find government tenders, etenders, and procurement opportunities.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md hover:bg-accent transition-colors"
                    aria-label={social.label}
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Features */}
          <div>
            <h4 className="font-semibold mb-4">Features</h4>
            <ul className="space-y-2">
              {footerLinks.features.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <Icon className="h-3 w-3" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => {
                const Icon = link.icon;
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                    >
                      <Icon className="h-3 w-3" />
                      {link.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Tender Categories */}
          <div>
            <h4 className="font-semibold mb-4">Tender Categories</h4>
            <ul className="space-y-2">
              {footerLinks.tenderCategories.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tenders by Province */}
          <div>
            <h4 className="font-semibold mb-4">Tenders by Province</h4>
            <ul className="space-y-2">
              {footerLinks.provinces.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Bottom Bar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} ProTenders. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
            <a
              href="mailto:support@protenders.co.za"
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <Mail className="h-3 w-3" />
              Contact Us
            </a>
          </div>
        </div>

        {/* SEO Keywords Footer */}
        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Find <strong>etenders</strong>, <strong>government tenders</strong>, <strong>public sector tenders</strong>, and <strong>procurement opportunities</strong> across South Africa.
            ProTenders aggregates tenders from the <strong>etenders portal</strong>, government departments, SOEs, and procurement sources nationwide.
            Search for <strong>construction tenders</strong>, <strong>IT tenders</strong>, <strong>consulting RFPs</strong>, and more.
            Get <strong>tender alerts</strong> for opportunities in Gauteng, Western Cape, KwaZulu-Natal, and all South African provinces.
            Learn <strong>how to submit etenders</strong> and access our complete <strong>tender documents checklist</strong>.
          </p>
        </div>
      </div>
    </footer>
  );
}
