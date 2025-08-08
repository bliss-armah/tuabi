/**
 * Formats and validates phone numbers for Ghana
 * Accepts various formats and converts to standard format: 0245289983
 */

export const formatPhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  let cleaned = phoneNumber.replace(/\D/g, "");

  // Handle international format (+233)
  if (cleaned.startsWith("233")) {
    cleaned = "0" + cleaned.substring(3);
  }

  // Handle country code without + (233)
  if (cleaned.startsWith("233") && cleaned.length === 12) {
    cleaned = "0" + cleaned.substring(3);
  }

  // Ensure it starts with 0
  if (!cleaned.startsWith("0")) {
    cleaned = "0" + cleaned;
  }

  return cleaned;
};

export const validatePhoneNumber = (phoneNumber: string): boolean => {
  const formatted = formatPhoneNumber(phoneNumber);

  // Ghana phone numbers should be 10 digits starting with 0
  const phoneRegex = /^0[0-9]{9}$/;

  return phoneRegex.test(formatted);
};

export const normalizePhoneNumber = (phoneNumber: string): string => {
  const formatted = formatPhoneNumber(phoneNumber);

  if (!validatePhoneNumber(formatted)) {
    throw new Error("Invalid phone number format");
  }

  return formatted;
};
