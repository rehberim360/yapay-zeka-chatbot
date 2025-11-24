/**
 * Property-Based Tests for Validation Utilities
 * 
 * Tests validation functions using property-based testing with fast-check.
 */

import * as fc from 'fast-check';
import { validateTurkishPhone, validateEmail, validateWorkingHours } from '../utils/validation';

describe('Validation Property Tests', () => {
  /**
   * Feature: smart-onboarding-v2, Property 11: Phone Number Validation
   * Validates: Requirements 7.5
   * 
   * For any valid Turkish phone format, the validation should accept it.
   * For any invalid format, the validation should reject it.
   */
  describe('Property 11: Phone Number Validation', () => {
    it('should accept valid Turkish phone formats', () => {
      fc.assert(
        fc.property(
          // Generate valid Turkish phone numbers (5XX XXX XX XX - 10 digits starting with 5)
          fc.integer({ min: 5000000000, max: 5999999999 }),
          (phoneNumber) => {
            const phoneStr = phoneNumber.toString();
            
            // Test valid formats without spaces
            const format1 = `+90${phoneStr}`;
            const format2 = `0${phoneStr}`;
            const format3 = phoneStr;
            
            // All formats should be valid
            expect(validateTurkishPhone(format1)).toBe(true);
            expect(validateTurkishPhone(format2)).toBe(true);
            expect(validateTurkishPhone(format3)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept valid Turkish phone with spaces and dashes', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 500, max: 599 }),
          fc.integer({ min: 0, max: 999 }),
          fc.integer({ min: 0, max: 99 }),
          fc.integer({ min: 0, max: 99 }),
          (prefix, middle, part1, part2) => {
            const formatted = `+90 ${prefix} ${middle.toString().padStart(3, '0')} ${part1.toString().padStart(2, '0')} ${part2.toString().padStart(2, '0')}`;
            expect(validateTurkishPhone(formatted)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid phone formats', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Too short
            fc.constant('123'),
            // Too long
            fc.constant('+90 5XX XXX XX XX XXX'),
            // Wrong country code
            fc.constant('+1 555 123 45 67'),
            // Wrong prefix (not 5XX)
            fc.constant('+90 4XX XXX XX XX'),
            fc.constant('0412345678'),
            // Invalid characters
            fc.constant('+90 5XX XXX XX XX abc'),
            // Empty string
            fc.constant(''),
            // Only spaces
            fc.constant('   '),
            // Wrong format
            fc.constant('not a phone number')
          ),
          (invalidPhone) => {
            expect(validateTurkishPhone(invalidPhone)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject phones with wrong prefix (not starting with 5)', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 4 }).chain(prefix => 
            fc.integer({ min: 0, max: 99999999 }).map(rest => 
              `+90${prefix}${rest.toString().padStart(9, '0')}`
            )
          ),
          (invalidPhone) => {
            expect(validateTurkishPhone(invalidPhone)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject non-string inputs', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.integer(),
            fc.object(),
            fc.array(fc.string())
          ),
          (invalidInput) => {
            expect(validateTurkishPhone(invalidInput as any)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: smart-onboarding-v2, Property 12: Email Validation
   * Validates: Requirements 7.6
   * 
   * For any valid email format, the validation should accept it.
   * For any invalid format, the validation should reject it.
   */
  describe('Property 12: Email Validation', () => {
    it('should accept valid email formats', () => {
      fc.assert(
        fc.property(
          fc.emailAddress(),
          (email) => {
            expect(validateEmail(email)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should accept emails with various valid characters', () => {
      fc.assert(
        fc.property(
          fc.array(fc.constantFrom('a', 'b', 'c', '1', '2', '3', '.', '_', '-'), { minLength: 1, maxLength: 20 }),
          fc.array(fc.constantFrom('a', 'b', 'c', '1', '2', '3', '-'), { minLength: 1, maxLength: 20 }),
          fc.array(fc.constantFrom('a', 'b', 'c'), { minLength: 2, maxLength: 5 }),
          (localPart, domain, tld) => {
            // Ensure local part doesn't start/end with dot
            const localStr = localPart.join('').replace(/^\.+|\.+$/g, '') || 'a';
            const domainStr = domain.join('').replace(/^-+|-+$/g, '') || 'example';
            const tldStr = tld.join('');
            const email = `${localStr}@${domainStr}.${tldStr}`;
            
            expect(validateEmail(email)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid email formats', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Missing @
            fc.constant('invalidemail.com'),
            // Missing domain
            fc.constant('invalid@'),
            // Missing local part
            fc.constant('@domain.com'),
            // Multiple @
            fc.constant('invalid@@domain.com'),
            // Missing TLD
            fc.constant('invalid@domain'),
            // Spaces
            fc.constant('invalid email@domain.com'),
            // Empty string
            fc.constant(''),
            // Only @
            fc.constant('@'),
            // Invalid characters
            fc.constant('invalid<>@domain.com')
          ),
          (invalidEmail) => {
            expect(validateEmail(invalidEmail)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject non-string inputs', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.integer(),
            fc.object(),
            fc.array(fc.string())
          ),
          (invalidInput) => {
            expect(validateEmail(invalidInput as any)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional property tests for Working Hours Validation
   * Not explicitly required but important for completeness
   */
  describe('Working Hours Validation', () => {
    it('should accept valid working hours formats', () => {
      const validFormats = [
        'Pazartesi-Cuma: 09:00-18:00',
        'Monday-Friday: 09:00-18:00',
        'Her gün: 08:00-22:00',
        'Everyday: 08:00-22:00',
        'Pazartesi: 09:00-18:00\nSalı: 10:00-19:00',
        'Mon-Fri: 09:00-17:00; Sat: 10:00-14:00'
      ];

      validFormats.forEach(format => {
        expect(validateWorkingHours(format)).toBe(true);
      });
    });

    it('should accept valid time ranges', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 23 }),
          fc.integer({ min: 0, max: 59 }),
          fc.integer({ min: 0, max: 23 }),
          fc.integer({ min: 0, max: 59 }),
          (startHour, startMin, endHour, endMin) => {
            const startTime = `${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}`;
            const endTime = `${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}`;
            const workingHours = `Monday-Friday: ${startTime}-${endTime}`;
            
            expect(validateWorkingHours(workingHours)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should reject invalid working hours formats', () => {
      const invalidFormats = [
        '',
        '   ',
        'No time specified',
        'Monday-Friday',
        'Monday: 25:00-18:00',  // Invalid hour
        'Monday: 09:60-18:00',  // Invalid minute
        'Monday: 09:00',  // Missing end time
        'Monday: -18:00',  // Missing start time
      ];

      invalidFormats.forEach(format => {
        expect(validateWorkingHours(format)).toBe(false);
      });
    });

    it('should reject non-string inputs', () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.integer(),
            fc.object(),
            fc.array(fc.string())
          ),
          (invalidInput) => {
            expect(validateWorkingHours(invalidInput as any)).toBe(false);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
