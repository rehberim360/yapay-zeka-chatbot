/**
 * Input Validation Utilities
 * 
 * Provides validation functions for user inputs during onboarding process.
 * Validates Turkish phone numbers, email addresses, and working hours formats.
 */

/**
 * Validates Turkish phone number format
 * 
 * Valid formats:
 * - +90 5XX XXX XX XX
 * - +905XXXXXXXXX
 * - 05XXXXXXXXX
 * - 5XXXXXXXXX
 * 
 * Requirements: 7.5
 * 
 * @param phone - Phone number to validate
 * @returns true if valid Turkish phone format, false otherwise
 */
export function validateTurkishPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') {
    return false;
  }

  // Remove all spaces and dashes for normalization
  const normalized = phone.replace(/[\s-]/g, '');

  // Pattern 1: +90 5XX XXX XX XX (with country code)
  const pattern1 = /^\+905[0-9]{9}$/;
  
  // Pattern 2: 05XX XXX XX XX (without country code)
  const pattern2 = /^05[0-9]{9}$/;
  
  // Pattern 3: 5XX XXX XX XX (without leading 0)
  const pattern3 = /^5[0-9]{9}$/;

  return pattern1.test(normalized) || pattern2.test(normalized) || pattern3.test(normalized);
}

/**
 * Validates email address format
 * 
 * Requirements: 7.6
 * 
 * @param email - Email address to validate
 * @returns true if valid email format, false otherwise
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // RFC 5322 compliant email regex (simplified but robust)
  // Must have @ symbol, domain, and at least one dot in domain
  const emailPattern = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  return emailPattern.test(email);
}

/**
 * Validates working hours format
 * 
 * Valid formats:
 * - "Pazartesi-Cuma: 09:00-18:00"
 * - "Monday-Friday: 09:00-18:00"
 * - "Her gün: 08:00-22:00"
 * - "Everyday: 08:00-22:00"
 * - "09:00-18:00" (time only, without day specification)
 * - Multiple lines separated by newline or semicolon
 * 
 * Requirements: 7.10
 * 
 * @param workingHours - Working hours string to validate
 * @returns true if valid working hours format, false otherwise
 */
export function validateWorkingHours(workingHours: string): boolean {
  if (!workingHours || typeof workingHours !== 'string') {
    return false;
  }

  // Split by newline or semicolon to handle multiple lines
  const lines = workingHours.split(/[\n;]/).map(line => line.trim()).filter(line => line.length > 0);

  if (lines.length === 0) {
    return false;
  }

  // Each line should contain at least one time range (HH:MM-HH:MM)
  const timeRangePattern = /([0-2][0-9]):([0-5][0-9])\s*-\s*([0-2][0-9]):([0-5][0-9])/;

  for (const line of lines) {
    // Check if line contains at least one valid time range
    const matches = line.match(timeRangePattern);
    if (!matches) {
      return false;
    }

    // Validate that hours are in valid range (00-23)
    const startHour = parseInt(matches[1] || '0', 10);
    const startMin = parseInt(matches[2] || '0', 10);
    const endHour = parseInt(matches[3] || '0', 10);
    const endMin = parseInt(matches[4] || '0', 10);

    if (startHour > 23 || endHour > 23) {
      return false;
    }

    // Validate that start time is before end time (or equal for 24-hour operations)
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    // Allow end time to be before start time (e.g., 22:00-02:00 for overnight)
    // But both times should be valid
    if (startMinutes < 0 || endMinutes < 0) {
      return false;
    }
  }

  return true;
}

/**
 * Validation error messages in Turkish
 */
export const ValidationErrors = {
  PHONE_INVALID: 'Geçersiz telefon numarası formatı. Lütfen +90 5XX XXX XX XX formatında giriniz.',
  EMAIL_INVALID: 'Geçersiz e-posta adresi formatı. Lütfen geçerli bir e-posta adresi giriniz.',
  WORKING_HOURS_INVALID: 'Geçersiz çalışma saatleri formatı. Örnek: "Pazartesi-Cuma: 09:00-18:00"',
  PHONE_REQUIRED: 'Telefon numarası zorunludur.',
  EMAIL_REQUIRED: 'E-posta adresi zorunludur.',
  WORKING_HOURS_REQUIRED: 'Çalışma saatleri zorunludur.'
};

/**
 * Validation error messages in English
 */
export const ValidationErrorsEN = {
  PHONE_INVALID: 'Invalid phone number format. Please enter in +90 5XX XXX XX XX format.',
  EMAIL_INVALID: 'Invalid email address format. Please enter a valid email address.',
  WORKING_HOURS_INVALID: 'Invalid working hours format. Example: "Monday-Friday: 09:00-18:00"',
  PHONE_REQUIRED: 'Phone number is required.',
  EMAIL_REQUIRED: 'Email address is required.',
  WORKING_HOURS_REQUIRED: 'Working hours is required.'
};
