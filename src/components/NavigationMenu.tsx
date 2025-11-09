'use client';

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function NavigationMenu() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

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
      name: "Provinces",
      href: "/provinces",
    },
    {
      name: "Resources",
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
    },
    {
      name: "About",
      href: "/about",
    },
    {
      name: "Demo",
      href: "/demo",
    },
    {
      name: "Login",
      href: "/login",
    },
  ];

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
              <button className="text-sm font-medium hover:text-primary transition-colors flex items-center gap-1">
                {item.name}
                <ChevronDown className="h-3 w-3" />
              </button>

              {/* Dropdown */}
              <div
                className={`absolute top-full left-0 mt-2 w-48 bg-background border rounded-lg shadow-lg overflow-hidden transition-all duration-200 ${
                  activeDropdown === item.name
                    ? "opacity-100 visible translate-y-0"
                    : "opacity-0 invisible -translate-y-2"
                }`}
              >
                {item.items.map((subItem) => (
                  <Link
                    key={subItem.href}
                    href={subItem.href}
                    className="block px-4 py-2.5 text-sm hover:bg-primary/5 hover:text-primary transition-colors"
                  >
                    {subItem.name}
                  </Link>
                ))}
              </div>
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href!}
            className="text-sm font-medium hover:text-primary transition-colors"
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
