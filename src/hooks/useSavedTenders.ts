"use client";

import { useState, useEffect } from "react";
import { SavedTender, NormalizedTender } from "@/types/tender";
import { useAuth } from "./useAuth";

const STORAGE_KEY = "tender-finder-saved-tenders";

export const useSavedTenders = () => {
  const [savedTenders, setSavedTenders] = useState<SavedTender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Load saved tenders on mount
  useEffect(() => {
    const loadSavedTenders = async () => {
      if (authLoading) {
        return; // Wait for auth to load
      }

      if (isAuthenticated) {
        // Fetch from database for authenticated users
        try {
          const response = await fetch("/api/user/saved");
          if (response.ok) {
            const apiData = await response.json();
            // API returns { data: [...], total, page }
            // Convert to SavedTender format expected by the hook
            const savedTendersData = (apiData.data || []).map((item: any) => ({
              tenderId: item.tenderId,
              savedAt: item.savedAt,
              notes: item.notes || "",
              tags: [],
              isSubmitted: false,
              tender: {
                id: item.tender.id,
                ocid: item.tender.ocid,
                title: item.tender.title || "Untitled Tender",
                description: item.tender.description,
                mainProcurementCategory: item.tender.mainProcurementCategory,
                closingDate: item.tender.endDate,
                publishedDate: item.tender.startDate,
                status: item.tender.status,
                value: item.tender.valueAmount
                  ? {
                      amount: item.tender.valueAmount,
                      currency: item.tender.valueCurrency || "ZAR",
                    }
                  : undefined,
                dataQualityScore: 0.8,
              },
            }));
            setSavedTenders(savedTendersData);
            // Sync to localStorage as backup
            localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTendersData));
          } else {
            console.error("Failed to fetch saved tenders from API");
            // Fallback to localStorage
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
              try {
                setSavedTenders(JSON.parse(stored));
              } catch (e) {
                console.error("Failed to parse saved tenders:", e);
              }
            }
          }
        } catch (error) {
          console.error("Error fetching saved tenders:", error);
          // Fallback to localStorage
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            try {
              setSavedTenders(JSON.parse(stored));
            } catch (e) {
              console.error("Failed to parse saved tenders:", e);
            }
          }
        }
      } else {
        // Use localStorage for unauthenticated users
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            setSavedTenders(JSON.parse(stored));
          } catch (e) {
            console.error("Failed to parse saved tenders:", e);
          }
        }
      }

      setIsLoading(false);
    };

    loadSavedTenders();
  }, [isAuthenticated, authLoading]);

  const saveTender = async (tender: NormalizedTender) => {
    const newSaved: SavedTender = {
      tenderId: tender.id,
      tender,
      savedAt: new Date().toISOString(),
      tags: [],
      notes: "",
      isSubmitted: false,
    };

    const updated = [...savedTenders, newSaved];
    setSavedTenders(updated);

    // Always update localStorage immediately for optimistic UI
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // If authenticated, also save to database
    if (isAuthenticated) {
      try {
        const response = await fetch(`/api/user/saved/${tender.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notes: "",
            tenderData: tender, // Pass full tender data so API can create it if needed
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("Failed to save tender to database:", errorData);
          // localStorage still has it, so user won't lose data
        }
      } catch (error) {
        console.error("Error saving tender to database:", error);
        // localStorage still has it, so user won't lose data
      }
    }
  };

  const removeTender = async (tenderId: string) => {
    const updated = savedTenders.filter((st) => st.tenderId !== tenderId);
    setSavedTenders(updated);

    // Always update localStorage immediately for optimistic UI
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // If authenticated, also remove from database
    if (isAuthenticated) {
      try {
        const response = await fetch(`/api/user/saved/${tenderId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          console.error("Failed to remove tender from database");
          // Already removed from localStorage and state
        }
      } catch (error) {
        console.error("Error removing tender from database:", error);
        // Already removed from localStorage and state
      }
    }
  };

  const updateTags = async (tenderId: string, tags: string[]) => {
    const updated = savedTenders.map((st) =>
      st.tenderId === tenderId ? { ...st, tags } : st
    );
    setSavedTenders(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Note: Current API doesn't support tags, but we keep them in localStorage
    // TODO: Add tags support to API if needed
  };

  const updateNotes = async (tenderId: string, notes: string) => {
    const updated = savedTenders.map((st) =>
      st.tenderId === tenderId ? { ...st, notes } : st
    );
    setSavedTenders(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // If authenticated, also update database
    if (isAuthenticated) {
      try {
        const savedTender = savedTenders.find(st => st.tenderId === tenderId);
        const response = await fetch(`/api/user/saved/${tenderId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            notes,
            tenderData: savedTender?.tender, // Pass tender data in case it doesn't exist in DB
          }),
        });

        if (!response.ok) {
          console.error("Failed to update notes in database");
        }
      } catch (error) {
        console.error("Error updating notes in database:", error);
      }
    }
  };

  const toggleSubmitted = async (tenderId: string) => {
    const updated = savedTenders.map((st) =>
      st.tenderId === tenderId ? { ...st, isSubmitted: !st.isSubmitted } : st
    );
    setSavedTenders(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Note: Current API doesn't support isSubmitted, but we keep it in localStorage
    // TODO: Add isSubmitted support to API if needed
  };

  const isSaved = (tenderId: string) => {
    return savedTenders.some((st) => st.tenderId === tenderId);
  };

  return {
    savedTenders,
    saveTender,
    removeTender,
    updateTags,
    updateNotes,
    toggleSubmitted,
    isSaved,
    isLoading,
  };
};
