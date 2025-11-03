import { useState, useEffect } from "react";
import { useAuth } from "./useAuth";
import { SearchParams } from "@/types/tender";
import { getApiUrl } from "@/config/api";

export interface AlertRule {
  id: string;
  name: string;
  searchParams: SearchParams;
  active: boolean;
  emailEnabled: boolean;
  frequency?: "daily" | "weekly";
  createdAt: string;
}

const STORAGE_KEY = "tender-finder-alert-rules";

const getLocalRules = (): AlertRule[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

const saveLocalRules = (rules: AlertRule[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(rules));
};

export const useAlerts = () => {
  const { isAuthenticated } = useAuth();
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRules = async () => {
      if (isAuthenticated) {
        try {
          const response = await fetch(getApiUrl("/api/user/alerts"));
          if (response.ok) {
            const serverRules = await response.json();
            setRules(serverRules);
            setIsLoading(false);
            return;
          }
        } catch (e) {
          console.log("Server alerts unavailable, using local");
        }
      }
      
      // Fallback to local
      setRules(getLocalRules());
      setIsLoading(false);
    };

    loadRules();
  }, [isAuthenticated]);

  const saveRule = async (rule: Omit<AlertRule, "id" | "createdAt">) => {
    const newRule: AlertRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (isAuthenticated) {
      try {
        const response = await fetch(getApiUrl("/api/user/alerts"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRule),
        });
        if (response.ok) {
          const saved = await response.json();
          setRules((prev) => [...prev, saved]);
          return saved;
        }
      } catch (e) {
        console.log("Failed to save to server, using local");
      }
    }

    // Local save
    const updated = [...rules, newRule];
    setRules(updated);
    saveLocalRules(updated);
    return newRule;
  };

  const deleteRule = async (id: string) => {
    if (isAuthenticated) {
      try {
        await fetch(getApiUrl(`/api/user/alerts/${id}`), { method: "DELETE" });
      } catch (e) {
        console.log("Failed to delete from server");
      }
    }

    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    saveLocalRules(updated);
  };

  const toggleRule = async (id: string) => {
    const updated = rules.map((r) =>
      r.id === id ? { ...r, active: !r.active } : r
    );
    setRules(updated);
    saveLocalRules(updated);

    if (isAuthenticated) {
      try {
        await fetch(getApiUrl(`/api/user/alerts/${id}`), {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ active: !rules.find((r) => r.id === id)?.active }),
        });
      } catch (e) {
        console.log("Failed to sync to server");
      }
    }
  };

  return {
    rules,
    isLoading,
    saveRule,
    deleteRule,
    toggleRule,
    isLocal: !isAuthenticated,
  };
};
