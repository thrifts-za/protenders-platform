import { format, formatDistanceToNow, parseISO, isValid, differenceInDays } from "date-fns";

export const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "Invalid date";
    return format(date, "d MMM yyyy, HH:mm");
  } catch {
    return "Invalid date";
  }
};

export const formatRelativeDate = (dateString: string | undefined): string => {
  if (!dateString) return "N/A";
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return "Invalid date";
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "Invalid date";
  }
};

export const getDaysUntilClose = (dateString: string | undefined): number | null => {
  if (!dateString) return null;
  try {
    const date = parseISO(dateString);
    if (!isValid(date)) return null;
    return differenceInDays(date, new Date());
  } catch {
    return null;
  }
};

export const isClosingSoon = (dateString: string | undefined, days: number = 7): boolean => {
  const daysUntil = getDaysUntilClose(dateString);
  return daysUntil !== null && daysUntil >= 0 && daysUntil <= days;
};
