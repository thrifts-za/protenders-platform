'use client';

import Link from "next/link";
import { useState } from "react";
import { Menu, X, ChevronRight, LogOut, User, Home, Search as SearchIcon, DollarSign, Bookmark, MapPin, BookOpen, Bell, Info, Play } from "lucide-react";
import { trackNavigation } from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const navigation = [
    {
      name: "Browse",
      icon: Home,
      items: [
        { name: "Latest Tenders", href: "/latest" },
        { name: "Closing Soon", href: "/closing-soon" },
        { name: "Opportunities", href: "/opportunities" },
        { name: "All Categories", href: "/categories" },
        { name: "Browse All", href: "/tenders" },
      ],
    },
    {
      name: "Search",
      href: "/search",
      icon: SearchIcon,
    },
    {
      name: "eTenders",
      href: "/etenders",
      icon: Bookmark,
    },
    {
      name: "Funding",
      href: "/funding",
      icon: DollarSign,
      highlight: true,
      items: [
        { name: "Find Your Match", href: "/funding/match" },
        { name: "Browse All Funding", href: "/funding/search" },
        { name: "Funding Guides", href: "/funding/guides" },
        { name: "Agriculture", href: "/funding/search?categories=Agriculture" },
        { name: "Manufacturing", href: "/funding/search?categories=Manufacturing" },
        { name: "Technology", href: "/funding/search?categories=Technology" },
        { name: "Tourism", href: "/funding/search?categories=Tourism" },
        { name: "Energy", href: "/funding/search?categories=Energy" },
      ],
    },
    {
      name: "Provinces",
      href: "/provinces",
      icon: MapPin,
    },
    {
      name: "Resources",
      icon: BookOpen,
      items: [
        { name: "How It Works", href: "/how-it-works" },
        { name: "Blog", href: "/blog" },
        { name: "FAQ", href: "/faq" },
        { name: "Glossary", href: "/glossary" },
        { name: "All Resources", href: "/resources" },
      ],
    },
    {
      name: "Alerts",
      href: "/alerts",
      icon: Bell,
    },
    {
      name: "About",
      href: "/about",
      icon: Info,
    },
    {
      name: "Demo",
      href: "/demo",
      icon: Play,
    },
  ];

  // Add authentication-aware navigation
  if (isAuthenticated) {
    navigation.push({
      name: user?.name || user?.email || "Account",
      icon: User,
      items: [
        { name: "Dashboard", href: "/dashboard" },
        { name: "Profile", href: "/profile" },
        { name: "Logout", href: "/api/auth/signout" },
      ],
    });
  } else {
    navigation.push({
      name: "Login",
      href: "/login",
      icon: User,
    });
  }

  const handleNavClick = (href: string) => {
    trackNavigation(href, 'mobile_menu');
    setIsOpen(false);
  };

  const toggleSection = (name: string) => {
    setExpandedSection(expandedSection === name ? null : name);
  };

  return (
    <>
      {/* Hamburger Button - Only visible on mobile */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden flex items-center justify-center h-11 w-11 rounded-lg hover:bg-accent transition-colors active:scale-95"
        aria-label="Toggle navigation menu"
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-[280px] bg-background border-l shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <Link
            href="/"
            className="text-xl font-bold text-primary"
            onClick={() => handleNavClick('/')}
          >
            ProTenders
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center h-11 w-11 rounded-lg hover:bg-accent transition-colors active:scale-95"
            aria-label="Close menu"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="overflow-y-auto h-[calc(100%-73px)] overscroll-contain">
          <div className="p-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const hasItems = item.items && item.items.length > 0;
              const isExpanded = expandedSection === item.name;
              const isHighlight = item.highlight;

              if (hasItems) {
                return (
                  <div key={item.name} className="mb-1">
                    {/* Parent Item */}
                    {item.href ? (
                      <Link
                        href={item.href}
                        onClick={() => handleNavClick(item.href!)}
                        className={`flex items-center justify-between w-full h-11 px-4 rounded-lg transition-colors ${
                          isHighlight
                            ? 'bg-green-50 text-green-700 hover:bg-green-100 font-semibold'
                            : 'hover:bg-accent text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                          <span className="font-medium">{item.name}</span>
                          {isHighlight && (
                            <span className="px-1.5 py-0.5 text-[10px] font-bold bg-green-600 text-white rounded">NEW</span>
                          )}
                        </div>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleSection(item.name);
                          }}
                          className="p-1 hover:bg-accent/50 rounded transition-transform active:scale-95"
                          aria-label={`Toggle ${item.name} submenu`}
                        >
                          <ChevronRight
                            className={`h-5 w-5 transition-transform ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                      </Link>
                    ) : (
                      <button
                        onClick={() => toggleSection(item.name)}
                        className={`flex items-center justify-between w-full h-11 px-4 rounded-lg transition-colors ${
                          isHighlight
                            ? 'bg-green-50 text-green-700 hover:bg-green-100 font-semibold'
                            : 'hover:bg-accent text-foreground'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                          <span className="font-medium">{item.name}</span>
                        </div>
                        <ChevronRight
                          className={`h-5 w-5 transition-transform ${
                            isExpanded ? 'rotate-90' : ''
                          }`}
                        />
                      </button>
                    )}

                    {/* Sub Items */}
                    {isExpanded && (
                      <div className="mt-1 ml-4 border-l-2 border-border pl-4 space-y-1">
                        {item.items.map((subItem) => {
                          // Handle logout specially
                          if (subItem.name === "Logout") {
                            return (
                              <button
                                key={subItem.name}
                                onClick={() => {
                                  trackNavigation('/logout', 'mobile_menu');
                                  signOut({ callbackUrl: '/' });
                                  setIsOpen(false);
                                }}
                                className="flex items-center gap-2 w-full h-11 px-3 rounded-lg hover:bg-accent text-foreground text-sm transition-colors active:scale-[0.98]"
                              >
                                <LogOut className="h-4 w-4" />
                                {subItem.name}
                              </button>
                            );
                          }

                          return (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              onClick={() => handleNavClick(subItem.href)}
                              className="block h-11 px-3 rounded-lg hover:bg-accent text-foreground text-sm flex items-center transition-colors active:scale-[0.98]"
                            >
                              {subItem.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }

              // Simple link without sub-items
              return (
                <Link
                  key={item.name}
                  href={item.href!}
                  onClick={() => handleNavClick(item.href!)}
                  className={`flex items-center gap-3 h-11 px-4 rounded-lg mb-1 transition-colors ${
                    isHighlight
                      ? 'bg-green-50 text-green-700 hover:bg-green-100 font-semibold'
                      : isAuthenticated && item.name === user?.name
                      ? 'bg-primary/10 text-primary hover:bg-primary/20 font-semibold'
                      : 'hover:bg-accent text-foreground'
                  } active:scale-[0.98]`}
                >
                  {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </>
  );
}
