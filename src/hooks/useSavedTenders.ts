import { useState, useEffect } from "react";
import { SavedTender, NormalizedTender } from "@/types/tender";

const STORAGE_KEY = "tender-finder-saved-tenders";

export const useSavedTenders = () => {
  const [savedTenders, setSavedTenders] = useState<SavedTender[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setSavedTenders(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse saved tenders:", e);
      }
    }
  }, []);

  const saveTender = (tender: NormalizedTender) => {
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const removeTender = (tenderId: string) => {
    const updated = savedTenders.filter((st) => st.tenderId !== tenderId);
    setSavedTenders(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateTags = (tenderId: string, tags: string[]) => {
    const updated = savedTenders.map((st) =>
      st.tenderId === tenderId ? { ...st, tags } : st
    );
    setSavedTenders(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const updateNotes = (tenderId: string, notes: string) => {
    const updated = savedTenders.map((st) =>
      st.tenderId === tenderId ? { ...st, notes } : st
    );
    setSavedTenders(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const toggleSubmitted = (tenderId: string) => {
    const updated = savedTenders.map((st) =>
      st.tenderId === tenderId ? { ...st, isSubmitted: !st.isSubmitted } : st
    );
    setSavedTenders(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
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
  };
};
