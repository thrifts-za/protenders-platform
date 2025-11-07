"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { generateBreadcrumbSchema, renderStructuredData } from "@/lib/structured-data";

interface BreadcrumbItem {
  name: string;
  url?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  const breadcrumbSchema = generateBreadcrumbSchema(items);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: renderStructuredData(breadcrumbSchema) }}
      />
      
      {/* Visual Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="w-full border-b bg-background/50">
        <div className="content-container py-4">
          <ol className="flex items-center gap-2 text-sm text-muted-foreground">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              return (
                <li key={index} className="flex items-center gap-2">
                  {index > 0 && <ChevronRight className="h-4 w-4" />}
                  {isLast ? (
                    <span className="text-foreground font-medium">{item.name}</span>
                  ) : (
                    <Link
                      href={item.url || "#"}
                      className="hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
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
