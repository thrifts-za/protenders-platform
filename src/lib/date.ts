import { format, formatDistanceToNow, parseISO, isValid, differenceInDays } from "date-fns";

/**
 * Normalize a date input to a Date object
 * Handles string, Date, or undefined inputs from Prisma
 */
function normalizeDate(input: string | Date | undefined | null): Date | null {
  if (!input) return null;

  try {
    if (input instanceof Date) {
      return isValid(input) ? input : null;
    }
    const parsed = parseISO(input);
    return isValid(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export const formatDate = (dateInput: string | Date | undefined): string => {
  const date = normalizeDate(dateInput);
  if (!date) return "N/A";
  try {
    return format(date, "d MMM yyyy, HH:mm");
  } catch {
    return "Invalid date";
  }
};

export const formatRelativeDate = (dateInput: string | Date | undefined): string => {
  const date = normalizeDate(dateInput);
  if (!date) return "N/A";
  try {
    return formatDistanceToNow(date, { addSuffix: true });
  } catch {
    return "Invalid date";
  }
};

export const getDaysUntilClose = (dateInput: string | Date | undefined): number | null => {
  const date = normalizeDate(dateInput);
  if (!date) return null;
  try {
    return differenceInDays(date, new Date());
  } catch {
    return null;
  }
};

export const isClosingSoon = (dateInput: string | Date | undefined, days: number = 7): boolean => {
  const daysUntil = getDaysUntilClose(dateInput);
  return daysUntil !== null && daysUntil >= 0 && daysUntil <= days;
};
