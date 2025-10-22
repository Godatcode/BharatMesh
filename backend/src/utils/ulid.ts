import { ulid as generateUlid, decodeTime } from 'ulid';

/**
 * Generate a ULID with optional device prefix
 * Format: DEVICEID-ULID
 */
export function generateId(devicePrefix?: string): string {
  const id = generateUlid();
  return devicePrefix ? `${devicePrefix}-${id}` : id;
}

/**
 * Extract timestamp from ULID
 */
export function extractTimestamp(id: string): number {
  const ulidPart = id.includes('-') ? id.split('-').pop()! : id;
  return decodeTime(ulidPart);
}

/**
 * Extract device ID from prefixed ULID
 */
export function extractDeviceId(id: string): string | null {
  if (!id.includes('-')) return null;
  return id.split('-')[0];
}

/**
 * Validate ULID format
 */
export function isValidUlid(id: string): boolean {
  const ulidPart = id.includes('-') ? id.split('-').pop()! : id;
  return /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$/.test(ulidPart);
}

