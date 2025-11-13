'use client';

import Link from "next/link";
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Search,
  Bell,
  FileText,
  TrendingUp,
  HelpCircle,
  BookOpen,
  Mail,
  Building2,
  MapPin,
  ChevronDown,
  DollarSign,
} from "lucide-react";
import { getAllMunicipalitySlugs } from "@/data/municipalities";
import { getAllDepartmentSlugs } from "@/data/departments";
import { getMunicipalityBySlug } from "@/data/municipalities";
import { getDepartmentBySlug } from "@/data/departments";

export default function Footer() {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const currentYear = new Date().getFullYear();

  // Get municipality and department data
  const municipalitySlugs = getAllMunicipalitySlugs();
  const departmentSlugs = getAllDepartmentSlugs();

  const footerLinks = {
    features: [
      { label: "Search Tenders", href: "/search", icon: Search },
      { label: "Tender Alerts", href: "/alerts", icon: Bell },
      { label: "Opportunities", href: "/opportunities", icon: TrendingUp },
      { label: "Latest Tenders", href: "/latest", icon: TrendingUp },
      { label: "Closing Soon", href: "/closing-soon", icon: Bell },
    ],
    resources: [
      { label: "How It Works", href: "/how-it-works", icon: BookOpen },
      { label: "FAQ", href: "/faq", icon: HelpCircle },
      { label: "Blog & Resources", href: "/blog", icon: BookOpen },
      { label: "Tender Glossary", href: "/glossary", icon: BookOpen },
      { label: "About Us", href: "/about", icon: FileText },
    ],
    tenderCategories: [
      { label: "Public Sector Tenders", href: "/public-sector-tenders" },
      { label: "Construction Tenders", href: "/category/construction" },
      { label: "IT & Technology Tenders", href: "/category/it-services" },
      { label: "Consulting Services", href: "/category/consulting" },
      { label: "Security Services", href: "/category/security-services" },
      { label: "Supply & Delivery", href: "/category/supply-and-delivery" },
    ],
    municipalities: municipalitySlugs.map((slug) => {
      const municipality = getMunicipalityBySlug(slug);
      return {
        label: municipality?.name || slug,
        href: `/municipality/${slug}`,
      };
    }),
    departments: departmentSlugs.map((slug) => {
      const department = getDepartmentBySlug(slug);
      return {
        label: department?.name || slug,
        href: `/department/${slug}`,
      };
    }),
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
    etenders: {
      hub: { label: "eTenders Portal", href: "/etenders" },
      provinces: [
        { label: "Gauteng eTenders", href: "/etenders/gauteng" },
        { label: "Western Cape eTenders", href: "/etenders/western-cape" },
        { label: "KwaZulu-Natal eTenders", href: "/etenders/kwazulu-natal" },
        { label: "Eastern Cape eTenders", href: "/etenders/eastern-cape" },
        { label: "Free State eTenders", href: "/etenders/free-state" },
        { label: "Limpopo eTenders", href: "/etenders/limpopo" },
      ],
      categories: [
        { label: "Security eTenders", href: "/etenders/category/security-services" },
        { label: "Cleaning eTenders", href: "/etenders/category/cleaning-services" },
        { label: "Construction eTenders", href: "/etenders/category/construction" },
        { label: "IT Services eTenders", href: "/etenders/category/it-services" },
        { label: "Consulting eTenders", href: "/etenders/category/consulting" },
        { label: "Supply & Delivery eTenders", href: "/etenders/category/supply-and-delivery" },
      ],
    },
  };

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Essential links for mobile
  const mobileEssentialLinks = [
    { label: "Search Tenders", href: "/search", icon: Search },
    { label: "eTenders Portal", href: "/etenders", icon: FileText },
    { label: "Funding Opportunities", href: "/funding", icon: DollarSign },
    { label: "Latest Tenders", href: "/latest", icon: TrendingUp },
    { label: "Tender Alerts", href: "/alerts", icon: Bell },
    { label: "FAQ & Help", href: "/faq", icon: HelpCircle },
    { label: "Contact Us", href: "/contact", icon: Mail },
  ];

  return (
    <footer className="w-full bg-card border-t mt-auto">
      <div className="content-container py-8 md:py-12">
        {/* MOBILE FOOTER - Simple & Compact */}
        <div className="lg:hidden">
          {/* Mobile Essential Links Grid */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {mobileEssentialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 p-3 rounded-lg hover:bg-accent transition-colors active:scale-[0.98] min-h-[48px]"
                >
                  <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                  <span className="text-sm font-medium">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Mobile Accordion Sections */}
          <div className="space-y-2 mb-6">
            {/* Provinces Section */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('provinces')}
                className="flex items-center justify-between w-full p-4 text-left hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Browse by Province</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedSection === 'provinces' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'provinces' && (
                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  {footerLinks.provinces.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary py-1 active:scale-[0.98]"
                    >
                      {link.label.replace(' Tenders', '')}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Categories Section */}
            <div className="border rounded-lg">
              <button
                onClick={() => toggleSection('categories')}
                className="flex items-center justify-between w-full p-4 text-left hover:bg-accent transition-colors"
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-semibold text-sm">Browse by Category</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    expandedSection === 'categories' ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {expandedSection === 'categories' && (
                <div className="p-4 pt-0 space-y-2">
                  {footerLinks.tenderCategories.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block text-sm text-muted-foreground hover:text-primary py-1 active:scale-[0.98]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Bottom */}
          <Separator className="my-6" />
          <div className="text-center space-y-4">
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link href="/privacy-policy" className="text-muted-foreground hover:text-primary">
                Privacy
              </Link>
              <Link href="/terms-of-service" className="text-muted-foreground hover:text-primary">
                Terms
              </Link>
              <Link href="/about" className="text-muted-foreground hover:text-primary">
                About
              </Link>
            </div>
            <div className="text-xs text-muted-foreground">
              © {currentYear} ProTenders. All rights reserved.
            </div>
          </div>
        </div>

        {/* DESKTOP FOOTER - Full Layout */}
        <div className="hidden lg:block">
          {/* eTenders Section - Prominent Placement */}
          <div className="mb-12 p-6 bg-primary/5 rounded-lg border border-primary/20">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              eTenders Portal - Find Government Tenders by Province & Category
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Hub Link */}
              <div>
                <Link
                  href={footerLinks.etenders.hub.href}
                  className="text-sm font-semibold text-primary hover:underline mb-3 block"
                >
                  🏛️ {footerLinks.etenders.hub.label} →
                </Link>
                <p className="text-xs text-muted-foreground">
                  Browse all government eTenders across South Africa
                </p>
              </div>

              {/* Provincial eTenders */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Provincial eTenders</h4>
                <ul className="space-y-1">
                  {footerLinks.etenders.provinces.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Category eTenders */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Category eTenders</h4>
                <ul className="space-y-1">
                  {footerLinks.etenders.categories.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Features */}
            <div className="lg:col-span-1">
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
            <div className="lg:col-span-1">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Resources
              </h4>
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
            <div className="lg:col-span-1">
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

            {/* Municipalities */}
            <div className="lg:col-span-1">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Municipalities
              </h4>
              <ul className="space-y-2">
                {footerLinks.municipalities.map((link) => (
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

            {/* Departments */}
            <div className="lg:col-span-1">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Departments
              </h4>
              <ul className="space-y-2">
                {footerLinks.departments.map((link) => (
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

            {/* Provinces */}
            <div className="lg:col-span-1">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Provinces
              </h4>
              <ul className="space-y-2">
                {footerLinks.provinces.slice(0, 6).map((link) => (
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
              <Link
                href="/provinces"
                className="text-sm text-primary hover:underline mt-2 inline-block"
              >
                View all provinces →
              </Link>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} ProTenders. All rights reserved.
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="hover:text-primary transition-colors flex items-center gap-1"
              >
                <Mail className="h-3 w-3" />
                Contact Us
              </Link>
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
      </div>
    </footer>
  );
}
