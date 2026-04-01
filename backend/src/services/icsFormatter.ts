/**
 * ICS Formatter Module
 *
 * Implements RFC 5545 formatting utilities for iCalendar data generation.
 * Provides functions for special character escaping, line folding, CRLF formatting,
 * and timestamp formatting according to RFC 5545 specifications.
 *
 * Requirements: 5.1, 5.2, 5.3, 5.4, 1.5
 */

export interface ICSFormatterOptions {
  foldLines?: boolean;
  escapeSpecialChars?: boolean;
}

/**
 * Escapes special characters in ICS text fields per RFC 5545.
 *
 * Escapes:
 * - Backslash (\) → \\
 * - Comma (,) → \,
 * - Semicolon (;) → \;
 * - Newline (\n) → \n (literal backslash-n)
 *
 * Requirement 5.3: Escape special characters (comma, semicolon, backslash, newline)
 * Requirement 5.4: Replace newline characters with escaped newline sequences
 *
 * @param text - The text to escape
 * @returns The escaped text
 */
export function escapeICSText(text: string): string {
  return text
    .replace(/\\/g, '\\\\') // Backslash must be escaped first
    .replace(/,/g, '\\,') // Escape comma
    .replace(/;/g, '\\;') // Escape semicolon
    .replace(/\n/g, '\\n') // Escape newline as literal \n
    .replace(/\r/g, ''); // Remove carriage returns (will be added by CRLF formatting)
}

/**
 * Folds a line at the specified maximum length per RFC 5545 folding rules.
 *
 * Lines longer than maxLength octets are broken and continued on the next line
 * with a space prefix. This ensures compatibility with RFC 5545 parsers.
 *
 * Requirement 5.2: Fold lines longer than 75 octets per RFC 5545 folding rules
 *
 * @param line - The line to fold
 * @param maxLength - Maximum line length in octets (default: 75)
 * @returns The folded line with CRLF line breaks
 */
export function foldLine(line: string, maxLength: number = 75): string {
  if (line.length <= maxLength) {
    return line;
  }

  const result: string[] = [];
  let currentPos = 0;

  // First line gets full maxLength
  result.push(line.substring(0, maxLength));
  currentPos = maxLength;

  // Subsequent lines get maxLength - 1 (to account for leading space)
  while (currentPos < line.length) {
    const chunkSize = maxLength - 1;
    result.push(' ' + line.substring(currentPos, currentPos + chunkSize));
    currentPos += chunkSize;
  }

  return result.join('\r\n');
}

/**
 * Formats an ICS line with key-value pair, applying optional escaping and folding.
 *
 * Requirement 5.1: Format line breaks using CRLF (\r\n)
 * Requirement 5.2: Fold lines longer than 75 octets
 * Requirement 5.3: Escape special characters in text fields
 *
 * @param key - The property key (e.g., "SUMMARY", "DESCRIPTION")
 * @param value - The property value
 * @param options - Formatting options
 * @returns The formatted ICS line with CRLF
 */
export function formatICSLine(
  key: string,
  value: string,
  options: ICSFormatterOptions = {}
): string {
  const { foldLines = true, escapeSpecialChars = true } = options;

  // Escape special characters if enabled
  const processedValue = escapeSpecialChars ? escapeICSText(value) : value;

  // Construct the line
  const line = `${key}:${processedValue}`;

  // Apply line folding if enabled
  return foldLines ? foldLine(line) : line;
}

/**
 * Formats a Date object as an ICS timestamp.
 *
 * Supports two formats:
 * - UTC format: YYYYMMDDTHHmmssZ (when timezone is not provided)
 * - Timezone-aware local format: YYYYMMDDTHHmmss (when timezone is provided)
 *
 * When a timezone is provided, time components are extracted in that timezone
 * using Intl.DateTimeFormat, ensuring correct output regardless of the server's
 * local timezone.
 *
 * Requirement 1.5: Format timestamps in UTC with TZID parameter for local timezone
 *
 * @param date - The date to format
 * @param timezone - Optional IANA timezone identifier (e.g., "America/Argentina/Buenos_Aires")
 * @returns The formatted timestamp string
 */
export function formatICSTimestamp(date: Date, timezone?: string): string {
  if (timezone) {
    // Extract time components in the specified timezone, not the server's local timezone
    const formatted = date.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });

    // toLocaleString returns e.g. "01/15/2024, 14:00:00"
    const match = formatted.match(
      /^(\d{2})\/(\d{2})\/(\d{4}),\s*(\d{2}):(\d{2}):(\d{2})$/
    );
    if (!match) {
      throw new Error(
        `formatICSTimestamp: unexpected locale format "${formatted}" for timezone "${timezone}"`
      );
    }

    const [, month, day, year, hours, minutes, seconds] = match;
    // Normalize hour 24 (midnight expressed as 24:00:00) to 00
    const normalizedHours = hours === '24' ? '00' : hours;
    return `${year}${month}${day}T${normalizedHours}${minutes}${seconds}`;
  }

  // No timezone: fall back to server-local time components (UTC path handled by formatUTCTimestamp)
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

/**
 * Formats a Date object as a UTC timestamp (convenience function).
 *
 * @param date - The date to format
 * @returns The formatted UTC timestamp (YYYYMMDDTHHmmssZ)
 */
export function formatUTCTimestamp(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');

  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}
