"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { generateBreadcrumbSchema, renderStructuredData } from "@/lib/structured-data";
import { cn } from "@/lib/utils";

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
  showHome?: boolean; // Option to show home icon for first item
  maxItems?: number; // Collapse breadcrumbs if too many items
}

export default function Breadcrumbs({
  items,
  className,
  showHome = true,
  maxItems = 0
}: BreadcrumbsProps) {
  // Convert items to match schema format
  const schemaItems = items.map(item => ({
    name: item.label,
    url: item.href
  }));
  const breadcrumbSchema = generateBreadcrumbSchema(schemaItems);

  // Truncate breadcrumbs if maxItems is set and exceeded
  let displayItems = items;
  let hasCollapsed = false;

  if (maxItems > 0 && items.length > maxItems) {
    hasCollapsed = true;
    // Show first item, ellipsis, and last 2 items
    displayItems = [
      items[0],
      { label: "...", href: undefined },
      ...items.slice(-2),
    ];
  }

  return (
    <>
      {/* JSON-LD Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderStructuredData(breadcrumbSchema) }}
        suppressHydrationWarning
      />

      {/* Visual Breadcrumbs with Microdata */}
      <nav
        aria-label="Breadcrumb"
        className={cn("w-full border-b bg-background/50 backdrop-blur-sm", className)}
        itemScope
        itemType="https://schema.org/BreadcrumbList"
      >
        <div className="content-container py-3 sm:py-4">
          <ol className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground overflow-x-auto scrollbar-hide">
            {displayItems.map((item, index) => {
              const isLast = index === displayItems.length - 1;
              const isFirst = index === 0;
              const isEllipsis = item.label === "...";
              const originalIndex = hasCollapsed && !isFirst && !isEllipsis
                ? items.length - (displayItems.length - index)
                : index;

              return (
                <li
                  key={index}
                  className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0"
                  itemProp="itemListElement"
                  itemScope
                  itemType="https://schema.org/ListItem"
                >
                  {index > 0 && <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" aria-hidden="true" />}

                  {isEllipsis ? (
                    <span className="text-muted-foreground/50" aria-hidden="true">…</span>
                  ) : isLast ? (
                    <span
                      className="text-foreground font-medium max-w-[200px] sm:max-w-none truncate"
                      itemProp="name"
                      aria-current="page"
                    >
                      {item.icon && <span className="inline-block mr-1.5">{item.icon}</span>}
                      {item.label}
                    </span>
                  ) : (
                    <>
                      <Link
                        href={item.href || "#"}
                        className="hover:text-primary transition-colors flex items-center gap-1.5 max-w-[150px] sm:max-w-none truncate"
                        itemProp="item"
                      >
                        {isFirst && showHome ? (
                          <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-label="Home" />
                        ) : item.icon ? (
                          <span className="inline-block">{item.icon}</span>
                        ) : null}
                        <span itemProp="name">{item.label}</span>
                      </Link>
                      <meta itemProp="position" content={String(originalIndex + 1)} />
                    </>
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      </nav>
    </>
  );
}
