/**
 * Utility functions for calendar export (ICS format)
 */

export interface CalendarEvent {
  title: string;
  description?: string;
  location?: string;
  startDate: Date;
  endDate?: Date;
  url?: string;
}

/**
 * Format a date for ICS format (YYYYMMDDTHHMMSSZ)
 */
function formatICSDate(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Escape special characters in ICS text fields
 */
function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Generate ICS file content for a calendar event
 */
export function generateICSContent(event: CalendarEvent): string {
  const now = new Date();
  const dtstamp = formatICSDate(now);
  const dtstart = formatICSDate(event.startDate);
  const dtend = event.endDate ? formatICSDate(event.endDate) : dtstart;

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Protenders//Tender Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${escapeICSText(event.title)}`,
  ];

  if (event.description) {
    lines.push(`DESCRIPTION:${escapeICSText(event.description)}`);
  }

  if (event.location) {
    lines.push(`LOCATION:${escapeICSText(event.location)}`);
  }

  if (event.url) {
    lines.push(`URL:${event.url}`);
  }

  // Generate a unique ID
  const uid = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}@protenders.co.za`;
  lines.push(`UID:${uid}`);

  lines.push('STATUS:CONFIRMED');
  lines.push('SEQUENCE:0');
  lines.push('END:VEVENT');
  lines.push('END:VCALENDAR');

  return lines.join('\r\n');
}

/**
 * Download an ICS file for a calendar event
 */
export function downloadICSFile(event: CalendarEvent, filename: string = 'event.ics'): void {
  const icsContent = generateICSContent(event);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Clean up the URL object
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Create a tender closing date calendar event
 */
export function createTenderCalendarEvent(
  tenderTitle: string,
  closingDate: string | Date,
  tenderDescription?: string,
  tenderUrl?: string
): CalendarEvent {
  const closing = new Date(closingDate);

  // Set to end of day (23:59) for tender closing
  closing.setHours(23, 59, 0, 0);

  return {
    title: `Tender Closing: ${tenderTitle}`,
    description: tenderDescription
      ? `${tenderDescription}\n\nView tender: ${tenderUrl || 'https://protenders.co.za'}`
      : `View tender: ${tenderUrl || 'https://protenders.co.za'}`,
    startDate: closing,
    endDate: closing,
    url: tenderUrl,
  };
}
