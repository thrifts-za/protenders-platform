/**
 * GuidesListClient Component
 * Phase 3: ProTender Fund Finder - Guides Listing
 *
 * Interactive client component for funding guides listing with filtering
 */

"use client";

import { useState, useMemo } from "react";
import { fundingGuides } from "@/data/fundingGuides";
import { GuideCard } from "@/components/funding/GuideCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Breadcrumbs from "@/components/Breadcrumbs";
import { Search, BookOpen, TrendingUp, Filter } from "lucide-react";

export default function GuidesListClient() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);

  // Get unique categories and difficulties
  const categories = useMemo(() => {
    return Array.from(new Set(fundingGuides.map((guide) => guide.category)));
  }, []);

  const difficulties = useMemo(() => {
    return Array.from(new Set(fundingGuides.map((guide) => guide.difficulty)));
  }, []);

  // Filter guides
  const filteredGuides = useMemo(() => {
    return fundingGuides.filter((guide) => {
      // Search filter
      const matchesSearch =
        !searchQuery ||
        guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesCategory = !selectedCategory || guide.category === selectedCategory;

      // Difficulty filter
      const matchesDifficulty = !selectedDifficulty || guide.difficulty === selectedDifficulty;

      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  }, [searchQuery, selectedCategory, selectedDifficulty]);

  // Featured guides
  const featuredGuides = useMemo(() => {
    return fundingGuides.filter((guide) => guide.featured);
  }, []);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory(null);
    setSelectedDifficulty(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Funding", href: "/funding" },
            { label: "Guides", href: "/funding/guides" },
          ]}
        />

        {/* Header */}
        <div className="mt-8 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-100 rounded-full text-indigo-700 text-sm font-medium mb-4">
            <BookOpen className="h-4 w-4" />
            <span>Complete Funding Resource Library</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            SMME Funding Guides
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive, step-by-step guides to accessing R1,000 to R75 million in funding
            from DFIs, government programs, and specialized funds for South African entrepreneurs.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search guides by keyword, topic, or funding program..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-6 text-lg"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
              <Filter className="h-4 w-4" />
              <span>Filter by:</span>
            </div>

            {/* Category filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Badge
                  key={category}
                  variant="outline"
                  className={`cursor-pointer transition-colors ${
                    selectedCategory === category
                      ? "bg-indigo-100 text-indigo-700 border-indigo-300"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    setSelectedCategory(selectedCategory === category ? null : category)
                  }
                >
                  {category}
                </Badge>
              ))}
            </div>

            <span className="text-gray-300">|</span>

            {/* Difficulty filters */}
            <div className="flex flex-wrap gap-2">
              {difficulties.map((difficulty) => (
                <Badge
                  key={difficulty}
                  variant="outline"
                  className={`cursor-pointer transition-colors ${
                    selectedDifficulty === difficulty
                      ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                      : "hover:bg-gray-100"
                  }`}
                  onClick={() =>
                    setSelectedDifficulty(selectedDifficulty === difficulty ? null : difficulty)
                  }
                >
                  {difficulty}
                </Badge>
              ))}
            </div>

            {/* Clear filters */}
            {(selectedCategory || selectedDifficulty || searchQuery) && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-6 text-sm text-gray-600">
          Showing <span className="font-semibold">{filteredGuides.length}</span> guide
          {filteredGuides.length !== 1 ? "s" : ""}
        </div>

        {/* Featured Guides Section */}
        {featuredGuides.length > 0 && !searchQuery && !selectedCategory && !selectedDifficulty && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-gray-900">Featured Guides</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredGuides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} featured />
              ))}
            </div>
          </div>
        )}

        {/* All Guides Grid */}
        {filteredGuides.length > 0 ? (
          <div>
            {featuredGuides.length > 0 && !searchQuery && !selectedCategory && !selectedDifficulty && (
              <h2 className="text-2xl font-bold text-gray-900 mb-6 mt-12">All Guides</h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGuides.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No guides found</h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or filters to find what you're looking for.
            </p>
            <Button onClick={clearFilters} variant="outline">
              Clear all filters
            </Button>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 p-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Perfect Funding Match?</h2>
          <p className="text-lg mb-6 text-indigo-100">
            Answer 5 quick questions and get personalized funding recommendations in 60 seconds.
          </p>
          <Button
            size="lg"
            className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-8"
            onClick={() => (window.location.href = "/funding/match")}
          >
            Start Fund Finder Tool →
          </Button>
        </div>
      </div>
    </div>
  );
}
