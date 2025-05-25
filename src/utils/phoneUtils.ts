/**
 * Phone number utility functions for WhatsApp bot
 * Handles proper formatting and normalization of phone numbers
 */

/**
 * Normalize phone number by removing @c.us suffix and any non-digit characters
 * @param phoneNumber - Phone number to normalize (can be with or without @c.us)
 * @returns Clean phone number with only digits
 */
export function normalizePhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove @c.us suffix if present
  const withoutSuffix = phoneNumber.replace('@c.us', '');
  
  // Remove any non-digit characters
  return withoutSuffix.replace(/[^\d]/g, '');
}

/**
 * Format phone number for WhatsApp by adding @c.us suffix
 * @param phoneNumber - Phone number to format (clean digits only)
 * @returns Phone number with @c.us suffix
 */
export function formatForWhatsApp(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Normalize first to ensure clean number
  const cleanNumber = normalizePhoneNumber(phoneNumber);
  
  // Add @c.us suffix if not already present
  return cleanNumber.endsWith('@c.us') ? cleanNumber : `${cleanNumber}@c.us`;
}

/**
 * Check if a phone number (sender.id) is the owner
 * @param senderId - The sender.id from WhatsApp message (includes @c.us)
 * @param ownerNumber - The owner number from config (clean digits)
 * @returns true if the sender is the owner
 */
export function isOwner(senderId: string, ownerNumber: string): boolean {
  if (!senderId || !ownerNumber) return false;
  
  // Normalize both numbers for comparison
  const normalizedSenderId = normalizePhoneNumber(senderId);
  const normalizedOwnerNumber = normalizePhoneNumber(ownerNumber);
  
  return normalizedSenderId === normalizedOwnerNumber;
}

/**
 * Extract display phone number from sender.id for logging/display purposes
 * @param senderId - The sender.id from WhatsApp message
 * @returns Clean phone number for display
 */
export function getDisplayPhoneNumber(senderId: string): string {
  return normalizePhoneNumber(senderId);
}

/**
 * Validate if phone number format is valid (has @c.us suffix)
 * @param phoneNumber - Phone number to validate
 * @returns true if phone number has @c.us suffix
 */
export function isValidWhatsAppFormat(phoneNumber: string): boolean {
  return Boolean(phoneNumber && phoneNumber.includes('@c.us'));
}
