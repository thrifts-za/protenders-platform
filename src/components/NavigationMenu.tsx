'use client';

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, LogOut, User } from "lucide-react";
import { trackNavigation } from "@/lib/analytics";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";

export default function NavigationMenu() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const navigation = [
    {
      name: "Browse",
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
    },
    {
      name: "eTenders",
      href: "/etenders",
    },
    {
      name: "Funding",
      href: "/funding",
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
    },
    {
      name: "Resources",
      items: [
        { name: "Procurement Insights", href: "/insights" },
        { name: "How It Works", href: "/how-it-works" },
        { name: "Blog", href: "/blog" },
        { name: "FAQ", href: "/faq" },
        { name: "Glossary", href: "/glossary" },
        { name: "All Resources", href: "/resources" },
      ],
    },
    {
      name: "About",
      href: "/about",
    },
    {
      name: "Demo",
      href: "/demo",
    },
  ];

  // Add authentication-aware navigation
  if (isAuthenticated) {
    navigation.push({
      name: user?.name || user?.email || "Account",
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
    });
  }

  return (
    <div className="hidden md:flex items-center gap-6">
      {navigation.map((item) => {
        if (item.items) {
          return (
            <div
              key={item.name}
              className="relative group"
              onMouseEnter={() => setActiveDropdown(item.name)}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              {item.href ? (
                <Link
                  href={item.href}
                  className={`text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 ${
                    isAuthenticated && item.items.some(i => i.name === "Logout")
                      ? "bg-primary/10 px-3 py-1.5 rounded-full text-primary font-semibold"
                      : item.name === "Funding"
                      ? "bg-green-50 px-3 py-1.5 rounded-full text-green-700 font-semibold hover:bg-green-100"
                      : ""
                  }`}
                  onClick={() => trackNavigation(item.href!, 'main_menu')}
                >
                  {isAuthenticated && item.items.some(i => i.name === "Logout") && (
                    <User className="h-4 w-4" />
                  )}
                  {item.name}
                  {item.name === "Funding" && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-green-600 text-white rounded">NEW</span>
                  )}
                  <ChevronDown className="h-3 w-3" />
                </Link>
              ) : (
                <button className={`text-sm font-medium hover:text-primary transition-colors flex items-center gap-1 ${
                  isAuthenticated && item.items.some(i => i.name === "Logout")
                    ? "bg-primary/10 px-3 py-1.5 rounded-full text-primary font-semibold"
                    : item.name === "Funding"
                    ? "bg-green-50 px-3 py-1.5 rounded-full text-green-700 font-semibold hover:bg-green-100"
                    : ""
                }`}>
                  {isAuthenticated && item.items.some(i => i.name === "Logout") && (
                    <User className="h-4 w-4" />
                  )}
                  {item.name}
                  {item.name === "Funding" && (
                    <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-green-600 text-white rounded">NEW</span>
                  )}
                  <ChevronDown className="h-3 w-3" />
                </button>
              )}

              {/* Dropdown */}
              <div
                className={`absolute top-full left-0 mt-2 w-48 bg-background border rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
                  activeDropdown === item.name
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2"
                }`}
              >
                {item.items.map((subItem) => {
                  // Handle logout specially
                  if (subItem.name === "Logout") {
                    return (
                      <button
                        key={subItem.name}
                        onClick={() => {
                          trackNavigation('/logout', 'dropdown_menu');
                          signOut({ callbackUrl: '/' });
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-2"
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
                      className="block px-4 py-2.5 text-sm hover:bg-primary/5 hover:text-primary transition-colors"
                      onClick={() => trackNavigation(subItem.href, 'dropdown_menu')}
                    >
                      {subItem.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href!}
            className="text-sm font-medium hover:text-primary transition-colors"
            onClick={() => trackNavigation(item.href!, 'main_menu')}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
