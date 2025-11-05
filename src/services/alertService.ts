import { SavedAlert, SearchParams, AlertFrequency } from "@/types/tender";

// Get user email from localStorage or use demo email
const getUserEmail = () => {
  if (typeof window === 'undefined') return "demo@example.com";
  return localStorage.getItem("userEmail") || "demo@example.com";
};

/**
 * Alert service for managing saved searches and alerts via backend API
 */

export const saveAlert = async (
  email: string,
  frequency: AlertFrequency,
  searchParams: SearchParams,
  name?: string
): Promise<SavedAlert> => {
  try {
    const response = await fetch(`/api/savesearch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": email,
      },
      body: JSON.stringify({
        name: name || "Unnamed Alert",
        keywords: searchParams.keywords,
        categories: searchParams.categories,
        closingInDays: searchParams.closingInDays,
        submissionMethods: searchParams.submissionMethods,
        buyer: searchParams.buyer,
        status: searchParams.status,
        alertFrequency: frequency,
        userEmail: email,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save alert");
    }

    const savedSearch = await response.json();

    // Transform backend response to SavedAlert format
    return {
      id: savedSearch.id,
      name: savedSearch.name,
      email,
      frequency: savedSearch.alertFrequency as AlertFrequency,
      searchParams: {
        keywords: savedSearch.keywords,
        categories: savedSearch.categories,
        closingInDays: savedSearch.closingInDays,
        submissionMethods: savedSearch.submissionMethods,
        buyer: savedSearch.buyer,
        status: savedSearch.status,
      },
      active: savedSearch.alertFrequency !== "none",
      createdAt: savedSearch.createdAt,
      nextRun: savedSearch.lastAlertSent || new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error saving alert:", error);
    throw error;
  }
};

export const getAlerts = async (email?: string): Promise<SavedAlert[]> => {
  try {
    const userEmail = email || getUserEmail();
    const response = await fetch(`/api/alerts?userEmail=${userEmail}`);

    if (!response.ok) {
      throw new Error("Failed to fetch alerts");
    }

    const savedSearches = await response.json();

    // Transform backend response to SavedAlert format
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return savedSearches.map((search: any) => ({
      id: search.id,
      name: search.name,
      email: userEmail,
      frequency: search.alertFrequency as AlertFrequency,
      searchParams: {
        keywords: search.keywords,
        categories: search.categories,
        closingInDays: search.closingInDays,
        submissionMethods: search.submissionMethods,
        buyer: search.buyer,
        status: search.status,
      },
      active: search.alertFrequency !== "none",
      createdAt: search.createdAt,
      nextRun: search.lastAlertSent || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Error fetching alerts:", error);
    return [];
  }
};

export const toggleAlert = async (id: string): Promise<SavedAlert | null> => {
  try {
    // Get current alert to determine new state
    const alerts = await getAlerts();
    const alert = alerts.find((a) => a.id === id);
    if (!alert) return null;

    const newFrequency = alert.active ? "none" : alert.frequency;

    const response = await fetch(`/api/alerts/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        alertFrequency: newFrequency,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to toggle alert");
    }

    const updated = await response.json();

    return {
      ...alert,
      active: updated.alertFrequency !== "none",
      frequency: updated.alertFrequency,
    };
  } catch (error) {
    console.error("Error toggling alert:", error);
    return null;
  }
};

export const deleteAlert = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`/api/alerts/${id}`, {
      method: "DELETE",
    });

    return response.ok;
  } catch (error) {
    console.error("Error deleting alert:", error);
    return false;
  }
};
