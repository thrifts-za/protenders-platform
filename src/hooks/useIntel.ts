import { useQuery } from "@tanstack/react-query";
import { getApiUrl } from "@/config/api";

export interface TenderIntel {
  score: number;
  valueBand: string;
  paymentReliability?: number;
  competitors?: string[];
  flags: string[];
  lastUpdated?: string;
}

const fetchTenderIntel = async (tenderId: string): Promise<TenderIntel | null> => {
  try {
    const response = await fetch(getApiUrl(`/api/tenders/${tenderId}/intel`));
    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    console.log("Intel API unavailable");
  }
  
  // Return null if not available
  return null;
};

export const useIntel = (tenderId: string) => {
  return useQuery({
    queryKey: ["intel", tenderId],
    queryFn: () => fetchTenderIntel(tenderId),
    enabled: !!tenderId,
  });
};
