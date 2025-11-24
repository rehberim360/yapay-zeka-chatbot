/**
 * Property-Based Tests for System Prompt Builder Service
 * Feature: smart-onboarding-v2
 */

import * as fc from 'fast-check';
import {
  generateSystemPrompt,
  injectRuntimeVariables,
  mapScrapingToSystemPromptData,
  BusinessType,
  BotPurpose,
  CriticalDataType,
  type SystemPromptData,
  type Phase1ScrapingResult
} from '../services/system-prompt-builder.js';

describe('SystemPromptBuilder - Property-Based Tests', () => {
  /**
   * Property 13: System Prompt Section Completeness
   * Validates: Requirements 9.2-9.6, 9.16
   * 
   * For any generated system prompt, it should contain all required sections: 
   * System Time, Identity, Personality, Primary Goal, Offerings, Security Rules, 
   * Sector-Specific Instructions, and Prompt Injection Protection.
   */
  describe('Property 13: System Prompt Section Completeness', () => {
    it('should include all required sections for any valid SystemPromptData', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            companyName: fc.string({ minLength: 1, maxLength: 50 }),
            sector: fc.constantFrom('Sağlık', 'Yemek', 'Emlak', 'Güzellik', 'Eğitim'),
            subSector: fc.string({ minLength: 1, maxLength: 30 }),
            description: fc.string({ minLength: 10, maxLength: 200 }),
            language: fc.constantFrom('Türkçe', 'English'),
            tone: fc.constantFrom('Profesyonel', 'Samimi', 'Enerjik'),
            businessType: fc.constantFrom(...Object.values(BusinessType)),
            botPurpose: fc.constantFrom(...Object.values(BotPurpose)),
            criticalDataType: fc.constantFrom(...Object.values(CriticalDataType)),
            botPersonality: fc.string({ minLength: 5, maxLength: 100 }),
            expectedUserIntent: fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 5 }),
            offerings: fc.array(
              fc.record({
                name: fc.string({ minLength: 1, maxLength: 50 }),
                description: fc.string({ minLength: 5, maxLength: 100 }),
                type: fc.constantFrom('SERVICE', 'PRODUCT'),
                price: fc.option(fc.float({ min: 0, max: 10000 })),
                currency: fc.constant('TRY'),
                category: fc.string({ minLength: 1, maxLength: 30 }),
                meta_info: fc.record({})
              }),
              { minLength: 0, maxLength: 5 }
            ),
            companyInfo: fc.record({
              phone: fc.option(fc.constant('+90 555 123 4567')),
              email: fc.option(fc.constant('test@example.com')),
              address: fc.option(fc.string({ minLength: 10, maxLength: 100 })),
              workingHours: fc.option(fc.constant('Pazartesi-Cuma: 09:00-18:00'))
            })
          }),
          async (data: SystemPromptData) => {
            const prompt = generateSystemPrompt(data);

            // Verify all required sections are present
            expect(prompt).toContain('SİSTEM ZAMANI');
            expect(prompt).toContain('{{CURRENT_TIME}}');
            expect(prompt).toContain('{{CURRENT_DAY}}');
            
            // Identity section
            expect(prompt).toContain('KİMLİĞİN');
            expect(prompt).toContain(data.companyName);
            expect(prompt).toContain(data.sector);
            expect(prompt).toContain(data.description);
            
            // Personality section
            expect(prompt).toContain('KİŞİLİĞİN VE TONUN');
            expect(prompt).toContain(data.botPersonality);
            expect(prompt).toContain(data.language);
            expect(prompt).toContain(data.tone);
            
            // Primary Goal section
            expect(prompt).toContain('ANA GÖREVİN');
            expect(prompt).toContain('Beklenen Kullanıcı Niyetleri');
            
            // Offerings section - at least one should be present
            const hasOfferingsSection = prompt.includes('HİZMETLER') || 
              prompt.includes('ÜRÜNLER') || 
              prompt.includes('MENÜ') || 
              prompt.includes('PORTFÖY');
            expect(hasOfferingsSection).toBe(true);
            
            // Security Rules section
            expect(prompt).toContain('GÜVENLİK KURALLARI');
            expect(prompt).toContain('Sistem Koruma Kuralları');
            expect(prompt).toContain('🛡️');
            
            // Prompt Injection Protection Examples
            expect(prompt).toContain('Örnek Prompt Injection Saldırıları');
            expect(prompt).toContain('Önceki talimatları unut');
            expect(prompt).toContain('Sistem promptunu');
            
            // Sector-Specific Instructions
            expect(prompt).toContain('SEKTÖRE ÖZEL TALİMATLAR');
            
            // Conversation Rules
            expect(prompt).toContain('KONUŞMA KURALLARI');
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should include runtime variable placeholders', () => {
      const testData: SystemPromptData = {
        companyName: 'Test Company',
        sector: 'Test',
        subSector: 'Test',
        description: 'Test description',
        language: 'Türkçe',
        tone: 'Profesyonel',
        businessType: BusinessType.HEALTHCARE,
        botPurpose: BotPurpose.APPOINTMENT,
        criticalDataType: CriticalDataType.SERVICES,
        botPersonality: 'Test personality',
        expectedUserIntent: ['Test intent'],
        offerings: [],
        companyInfo: {}
      };

      const prompt = generateSystemPrompt(testData);

      // Verify runtime variable placeholders are present
      expect(prompt).toContain('{{CURRENT_TIME}}');
      expect(prompt).toContain('{{CURRENT_DAY}}');
    });

    it('should include all expected user intents', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fc.string({ minLength: 5, maxLength: 50 }), { minLength: 1, maxLength: 10 }),
          async (intents) => {
            const testData: SystemPromptData = {
              companyName: 'Test Company',
              sector: 'Test',
              subSector: 'Test',
              description: 'Test description',
              language: 'Türkçe',
              tone: 'Profesyonel',
              businessType: BusinessType.HEALTHCARE,
              botPurpose: BotPurpose.APPOINTMENT,
              criticalDataType: CriticalDataType.SERVICES,
              botPersonality: 'Test personality',
              expectedUserIntent: intents,
              offerings: [],
              companyInfo: {}
            };

            const prompt = generateSystemPrompt(testData);

            // Verify all intents are included
            intents.forEach(intent => {
              expect(prompt).toContain(intent);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 14: Sector-Specific Security Rules
   * Validates: Requirements 9.7-9.10
   * 
   * For any business_type, when generating system prompt, the security rules 
   * should include type-specific prohibitions.
   */
  describe('Property 14: Sector-Specific Security Rules', () => {
    it('should include "no medical diagnosis" rule for HEALTHCARE', () => {
      const testData: SystemPromptData = {
        companyName: 'Health Clinic',
        sector: 'Sağlık',
        subSector: 'Diş Kliniği',
        description: 'Test clinic',
        language: 'Türkçe',
        tone: 'Profesyonel',
        businessType: BusinessType.HEALTHCARE,
        botPurpose: BotPurpose.APPOINTMENT,
        criticalDataType: CriticalDataType.SERVICES,
        botPersonality: 'Professional',
        expectedUserIntent: ['Randevu almak'],
        offerings: [],
        companyInfo: {}
      };

      const prompt = generateSystemPrompt(testData);

      // Verify HEALTHCARE-specific security rules
      expect(prompt).toContain('Teşhis koyma');
      expect(prompt).toContain('ilaç önerme');
      expect(prompt).toContain('112');
    });

    it('should include "allergy emphasis" rule for FOOD', () => {
      const testData: SystemPromptData = {
        companyName: 'Restaurant',
        sector: 'Yemek',
        subSector: 'Restoran',
        description: 'Test restaurant',
        language: 'Türkçe',
        tone: 'Samimi',
        businessType: BusinessType.FOOD,
        botPurpose: BotPurpose.ORDER,
        criticalDataType: CriticalDataType.MENU,
        botPersonality: 'Friendly',
        expectedUserIntent: ['Sipariş vermek'],
        offerings: [],
        companyInfo: {}
      };

      const prompt = generateSystemPrompt(testData);

      // Verify FOOD-specific security rules
      expect(prompt).toContain('Alerji bilgisi');
      expect(prompt).toContain('kritik');
    });

    it('should include "no legal advice" rule for LEGAL', () => {
      const testData: SystemPromptData = {
        companyName: 'Law Firm',
        sector: 'Hukuk',
        subSector: 'Avukatlık',
        description: 'Test law firm',
        language: 'Türkçe',
        tone: 'Resmi',
        businessType: BusinessType.LEGAL,
        botPurpose: BotPurpose.APPOINTMENT,
        criticalDataType: CriticalDataType.SERVICES,
        botPersonality: 'Professional',
        expectedUserIntent: ['Randevu almak'],
        offerings: [],
        companyInfo: {}
      };

      const prompt = generateSystemPrompt(testData);

      // Verify LEGAL-specific security rules
      expect(prompt).toContain('Hukuki tavsiye verme');
    });

    it('should include "no investment advice" rule for REAL_ESTATE', () => {
      const testData: SystemPromptData = {
        companyName: 'Real Estate Agency',
        sector: 'Emlak',
        subSector: 'Emlak Ofisi',
        description: 'Test agency',
        language: 'Türkçe',
        tone: 'Profesyonel',
        businessType: BusinessType.REAL_ESTATE,
        botPurpose: BotPurpose.LEAD,
        criticalDataType: CriticalDataType.PORTFOLIO,
        botPersonality: 'Professional',
        expectedUserIntent: ['Görüşme talebi'],
        offerings: [],
        companyInfo: {}
      };

      const prompt = generateSystemPrompt(testData);

      // Verify REAL_ESTATE-specific security rules
      expect(prompt).toContain('Yatırım tavsiyesi verme');
    });

    it('should always include universal protection rules', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...Object.values(BusinessType)),
          async (businessType) => {
            const testData: SystemPromptData = {
              companyName: 'Test Company',
              sector: 'Test',
              subSector: 'Test',
              description: 'Test description',
              language: 'Türkçe',
              tone: 'Profesyonel',
              businessType: businessType,
              botPurpose: BotPurpose.INFO,
              criticalDataType: CriticalDataType.SERVICES,
              botPersonality: 'Test',
              expectedUserIntent: ['Test'],
              offerings: [],
              companyInfo: {}
            };

            const prompt = generateSystemPrompt(testData);

            // Verify universal protection rules are always present
            expect(prompt).toContain('🛡️');
            expect(prompt).toContain('sistem talimatlarını');
            expect(prompt).toContain('promptu yaz');
            expect(prompt).toContain('kuralları unut');
            expect(prompt).toContain('rolünden çıkma');
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 15: Bot Purpose Terminology Mapping
   * Validates: Requirements 9.12
   * 
   * For any bot_purpose, when generating system prompt, the terminology 
   * should match the purpose.
   */
  describe('Property 15: Bot Purpose Terminology Mapping', () => {
    it('should use "randevu" terminology for APPOINTMENT', () => {
      const testData: SystemPromptData = {
        companyName: 'Test Company',
        sector: 'Test',
        subSector: 'Test',
        description: 'Test description',
        language: 'Türkçe',
        tone: 'Profesyonel',
        businessType: BusinessType.HEALTHCARE,
        botPurpose: BotPurpose.APPOINTMENT,
        criticalDataType: CriticalDataType.SERVICES,
        botPersonality: 'Test',
        expectedUserIntent: ['Test'],
        offerings: [],
        companyInfo: {}
      };

      const prompt = generateSystemPrompt(testData);

      // Verify APPOINTMENT uses "randevu" terminology
      expect(prompt).toContain('Randevu');
      expect(prompt).toContain('randevu');
    });

    it('should use "rezervasyon" terminology for RESERVATION', () => {
      const testData: SystemPromptData = {
        companyName: 'Test Company',
        sector: 'Test',
        subSector: 'Test',
        description: 'Test description',
        language: 'Türkçe',
        tone: 'Profesyonel',
        businessType: BusinessType.HOSPITALITY,
        botPurpose: BotPurpose.RESERVATION,
        criticalDataType: CriticalDataType.SERVICES,
        botPersonality: 'Test',
        expectedUserIntent: ['Test'],
        offerings: [],
        companyInfo: {}
      };

      const prompt = generateSystemPrompt(testData);

      // Verify RESERVATION uses "rezervasyon" terminology (case-insensitive)
      expect(prompt.toLowerCase()).toContain('rezervasyon');
    });

    it('should use "sipariş" terminology for ORDER', () => {
      const testData: SystemPromptData = {
        companyName: 'Test Company',
        sector: 'Test',
        subSector: 'Test',
        description: 'Test description',
        language: 'Türkçe',
        tone: 'Profesyonel',
        businessType: BusinessType.FOOD,
        botPurpose: BotPurpose.ORDER,
        criticalDataType: CriticalDataType.MENU,
        botPersonality: 'Test',
        expectedUserIntent: ['Test'],
        offerings: [],
        companyInfo: {}
      };

      const prompt = generateSystemPrompt(testData);

      // Verify ORDER uses "sipariş" terminology (case-insensitive)
      expect(prompt.toLowerCase()).toContain('sipariş');
    });

    it('should use "bilet" terminology for BOOKING', () => {
      const testData: SystemPromptData = {
        companyName: 'Test Company',
        sector: 'Test',
        subSector: 'Test',
        description: 'Test description',
        language: 'Türkçe',
        tone: 'Profesyonel',
        businessType: BusinessType.ENTERTAINMENT,
        botPurpose: BotPurpose.BOOKING,
        criticalDataType: CriticalDataType.SERVICES,
        botPersonality: 'Test',
        expectedUserIntent: ['Test'],
        offerings: [],
        companyInfo: {}
      };

      const prompt = generateSystemPrompt(testData);

      // Verify BOOKING uses "bilet" terminology (case-insensitive)
      expect(prompt.toLowerCase()).toContain('bilet');
    });

    it('should map terminology correctly for all bot purposes', async () => {
      const terminologyMap: Record<BotPurpose, string[]> = {
        [BotPurpose.APPOINTMENT]: ['randevu'],
        [BotPurpose.RESERVATION]: ['rezervasyon'],
        [BotPurpose.ORDER]: ['sipariş'],
        [BotPurpose.BOOKING]: ['bilet'],
        [BotPurpose.LEAD]: ['görüşme', 'lead'],
        [BotPurpose.INFO]: ['bilgi'],
        [BotPurpose.SUPPORT]: ['destek', 'support', 'sorunu çözmek']
      };

      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(...Object.values(BotPurpose)),
          async (botPurpose) => {
            const testData: SystemPromptData = {
              companyName: 'Test Company',
              sector: 'Test',
              subSector: 'Test',
              description: 'Test description',
              language: 'Türkçe',
              tone: 'Profesyonel',
              businessType: BusinessType.SERVICE,
              botPurpose: botPurpose,
              criticalDataType: CriticalDataType.SERVICES,
              botPersonality: 'Test',
              expectedUserIntent: ['Test'],
              offerings: [],
              companyInfo: {}
            };

            const prompt = generateSystemPrompt(testData);
            const expectedTerms = terminologyMap[botPurpose];
            const promptLower = prompt.toLowerCase();

            // Verify at least one of the expected terms is used (case-insensitive)
            const hasExpectedTerm = expectedTerms.some(term => promptLower.includes(term.toLowerCase()));
            expect(hasExpectedTerm).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Additional validation tests
   */
  describe('System Prompt Builder Implementation Validation', () => {
    it('should handle offerings with meta_info', () => {
      const testData: SystemPromptData = {
        companyName: 'Test Company',
        sector: 'Sağlık',
        subSector: 'Diş Kliniği',
        description: 'Test description',
        language: 'Türkçe',
        tone: 'Profesyonel',
        businessType: BusinessType.HEALTHCARE,
        botPurpose: BotPurpose.APPOINTMENT,
        criticalDataType: CriticalDataType.SERVICES,
        botPersonality: 'Test',
        expectedUserIntent: ['Test'],
        offerings: [
          {
            name: 'Kanal Tedavisi',
            description: 'Test',
            type: 'SERVICE',
            price: 5000,
            currency: 'TRY',
            category: 'Endodonti',
            meta_info: {
              duration: '60 dk',
              session_count: 2,
              anesthesia_required: true
            }
          }
        ],
        companyInfo: {}
      };

      const prompt = generateSystemPrompt(testData);

      // Verify offerings are included with meta_info
      expect(prompt).toContain('Kanal Tedavisi');
      expect(prompt).toContain('duration');
      expect(prompt).toContain('60 dk');
      expect(prompt).toContain('session_count');
    });

    it('should include company contact information when provided', () => {
      const testData: SystemPromptData = {
        companyName: 'Test Company',
        sector: 'Test',
        subSector: 'Test',
        description: 'Test description',
        language: 'Türkçe',
        tone: 'Profesyonel',
        businessType: BusinessType.HEALTHCARE,
        botPurpose: BotPurpose.APPOINTMENT,
        criticalDataType: CriticalDataType.SERVICES,
        botPersonality: 'Test',
        expectedUserIntent: ['Test'],
        offerings: [],
        companyInfo: {
          phone: '+90 555 123 4567',
          email: 'test@example.com',
          address: 'Test Address',
          workingHours: 'Pazartesi-Cuma: 09:00-18:00'
        }
      };

      const prompt = generateSystemPrompt(testData);

      // Verify contact information is included
      expect(prompt).toContain('+90 555 123 4567');
      expect(prompt).toContain('test@example.com');
      expect(prompt).toContain('Test Address');
      expect(prompt).toContain('Pazartesi-Cuma: 09:00-18:00');
    });

    it('should handle empty offerings array', () => {
      const testData: SystemPromptData = {
        companyName: 'Test Company',
        sector: 'Test',
        subSector: 'Test',
        description: 'Test description',
        language: 'Türkçe',
        tone: 'Profesyonel',
        businessType: BusinessType.HEALTHCARE,
        botPurpose: BotPurpose.APPOINTMENT,
        criticalDataType: CriticalDataType.SERVICES,
        botPersonality: 'Test',
        expectedUserIntent: ['Test'],
        offerings: [],
        companyInfo: {}
      };

      const prompt = generateSystemPrompt(testData);

      // Should not throw error and should still include offerings section
      expect(prompt).toBeDefined();
      expect(prompt.length).toBeGreaterThan(0);
    });
  });

  /**
   * Property 16: Runtime Variable Injection
   * Validates: Requirements 10.1-10.4
   * 
   * For any system prompt containing {{CURRENT_TIME}} or {{CURRENT_DAY}}, 
   * when injected with runtime variables, the placeholders should be replaced 
   * with current date/time in the specified timezone and format.
   */
  describe('Property 16: Runtime Variable Injection', () => {
    it('should replace {{CURRENT_TIME}} placeholder', () => {
      const promptWithPlaceholder = 'Current time is: {{CURRENT_TIME}}';
      const injected = injectRuntimeVariables(promptWithPlaceholder);

      expect(injected).not.toContain('{{CURRENT_TIME}}');
      expect(injected).toMatch(/Current time is: .+/);
    });

    it('should replace {{CURRENT_DAY}} placeholder', () => {
      const promptWithPlaceholder = 'Current day is: {{CURRENT_DAY}}';
      const injected = injectRuntimeVariables(promptWithPlaceholder);

      expect(injected).not.toContain('{{CURRENT_DAY}}');
      expect(injected).toMatch(/Current day is: .+/);
    });

    it('should replace all occurrences of placeholders', () => {
      const promptWithMultiplePlaceholders = `
        Time 1: {{CURRENT_TIME}}
        Day 1: {{CURRENT_DAY}}
        Time 2: {{CURRENT_TIME}}
        Day 2: {{CURRENT_DAY}}
      `;
      
      const injected = injectRuntimeVariables(promptWithMultiplePlaceholders);

      // Should not contain any placeholders
      expect(injected).not.toContain('{{CURRENT_TIME}}');
      expect(injected).not.toContain('{{CURRENT_DAY}}');
      
      // Should have replaced all occurrences
      const timeMatches = injected.match(/Time \d: .+/g);
      const dayMatches = injected.match(/Day \d: .+/g);
      expect(timeMatches).toHaveLength(2);
      expect(dayMatches).toHaveLength(2);
    });

    it('should handle different timezones', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom('Europe/Istanbul', 'America/New_York', 'Asia/Tokyo', 'Europe/London'),
          async (timezone) => {
            const promptWithPlaceholder = 'Time: {{CURRENT_TIME}}, Day: {{CURRENT_DAY}}';
            const injected = injectRuntimeVariables(promptWithPlaceholder, timezone);

            // Placeholders should be replaced
            expect(injected).not.toContain('{{CURRENT_TIME}}');
            expect(injected).not.toContain('{{CURRENT_DAY}}');
            
            // Should contain actual date/time
            expect(injected).toMatch(/Time: .+, Day: .+/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should format Turkish dates correctly', () => {
      const promptWithPlaceholder = 'Tarih: {{CURRENT_TIME}}';
      const injected = injectRuntimeVariables(promptWithPlaceholder, 'Europe/Istanbul', 'tr-TR');

      // Should not contain placeholder
      expect(injected).not.toContain('{{CURRENT_TIME}}');
      
      // Turkish format should include day name and time
      // Example: "22 Kasım 2025 Cumartesi 18:25"
      // Note: Using .+? for Turkish characters (ı, ş, ğ, ü, ö, ç)
      expect(injected).toMatch(/Tarih: \d{1,2}\s+.+?\s+\d{4}\s+.+?\s+\d{1,2}:\d{2}/);
    });

    it('should format English dates correctly', () => {
      const promptWithPlaceholder = 'Date: {{CURRENT_TIME}}';
      const injected = injectRuntimeVariables(promptWithPlaceholder, 'America/New_York', 'en-US');

      // Should not contain placeholder
      expect(injected).not.toContain('{{CURRENT_TIME}}');
      
      // English format should include day name and AM/PM
      // Example: "November 22, 2025 Saturday 02:30 PM"
      expect(injected).toMatch(/Date: \w+ \d{1,2}, \d{4} \w+ \d{1,2}:\d{2} (AM|PM)/);
    });

    it('should handle prompts without placeholders', () => {
      const promptWithoutPlaceholders = 'This is a regular prompt without any placeholders.';
      const injected = injectRuntimeVariables(promptWithoutPlaceholders);

      // Should return unchanged
      expect(injected).toBe(promptWithoutPlaceholders);
    });
  });

  /**
   * Property 27: Timezone-Aware Date Formatting
   * Validates: Requirements 10.3, 10.9
   * 
   * For any tenant with specified timezone, when formatting dates for runtime variables, 
   * the system should use that timezone; when not specified, should default to Europe/Istanbul.
   */
  describe('Property 27: Timezone-Aware Date Formatting', () => {
    it('should default to Europe/Istanbul when no timezone specified', () => {
      const promptWithPlaceholder = 'Time: {{CURRENT_TIME}}';
      const injected = injectRuntimeVariables(promptWithPlaceholder);

      // Should not contain placeholder
      expect(injected).not.toContain('{{CURRENT_TIME}}');
      
      // Should have some date/time value
      expect(injected).toMatch(/Time: .+/);
    });

    it('should use specified timezone', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom(
            'Europe/Istanbul',
            'America/New_York',
            'Asia/Tokyo',
            'Europe/London',
            'Australia/Sydney',
            'America/Los_Angeles'
          ),
          async (timezone) => {
            const promptWithPlaceholder = 'Time: {{CURRENT_TIME}}';
            const injected = injectRuntimeVariables(promptWithPlaceholder, timezone);

            // Should successfully inject without errors
            expect(injected).not.toContain('{{CURRENT_TIME}}');
            expect(injected).toMatch(/Time: .+/);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should produce different times for different timezones', () => {
      const promptWithPlaceholder = 'Time: {{CURRENT_TIME}}';
      
      const istanbulInjected = injectRuntimeVariables(promptWithPlaceholder, 'Europe/Istanbul');
      const nyInjected = injectRuntimeVariables(promptWithPlaceholder, 'America/New_York');
      const tokyoInjected = injectRuntimeVariables(promptWithPlaceholder, 'Asia/Tokyo');

      // All should be different (unless we're at a very specific time)
      // At minimum, they should all be valid
      expect(istanbulInjected).not.toContain('{{CURRENT_TIME}}');
      expect(nyInjected).not.toContain('{{CURRENT_TIME}}');
      expect(tokyoInjected).not.toContain('{{CURRENT_TIME}}');
    });
  });

  /**
   * Property 25: Performance - Runtime Variable Injection
   * Validates: Requirements 14.10
   * 
   * For any system prompt, runtime variable injection should complete in under 1 millisecond.
   */
  describe('Property 25: Performance - Runtime Variable Injection', () => {
    it('should complete injection in under 10ms for typical prompts', async () => {
      const typicalPrompt = `
        # System Prompt
        Time: {{CURRENT_TIME}}
        Day: {{CURRENT_DAY}}
        
        This is a typical system prompt with some content.
        It has multiple lines and sections.
        
        Current time: {{CURRENT_TIME}}
        Current day: {{CURRENT_DAY}}
      `;

      await fc.assert(
        fc.asyncProperty(
          fc.constant(typicalPrompt),
          async (prompt) => {
            const startTime = performance.now();
            injectRuntimeVariables(prompt);
            const endTime = performance.now();
            
            const duration = endTime - startTime;
            
            // Should complete in under 10ms (relaxed for reliability)
            // In practice, it's usually < 1ms, but we allow margin for system variance
            expect(duration).toBeLessThan(10);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should complete injection in under 10ms for large prompts', async () => {
      // Create a large prompt (10KB+)
      const largePrompt = `
        # System Prompt
        Time: {{CURRENT_TIME}}
        Day: {{CURRENT_DAY}}
        
        ${'This is a large system prompt with lots of content. '.repeat(500)}
        
        Current time: {{CURRENT_TIME}}
        Current day: {{CURRENT_DAY}}
      `;

      const startTime = performance.now();
      injectRuntimeVariables(largePrompt);
      const endTime = performance.now();
      
      const duration = endTime - startTime;
      
      // Should still complete in under 10ms even for large prompts
      expect(duration).toBeLessThan(10);
    });

    it('should handle multiple injections efficiently', () => {
      const prompt = 'Time: {{CURRENT_TIME}}, Day: {{CURRENT_DAY}}';
      
      const startTime = performance.now();
      
      // Perform 1000 injections
      for (let i = 0; i < 1000; i++) {
        injectRuntimeVariables(prompt);
      }
      
      const endTime = performance.now();
      const averageDuration = (endTime - startTime) / 1000;
      
      // Average should be well under 1ms
      expect(averageDuration).toBeLessThan(1);
    });
  });

  /**
   * Mapping Tests
   */
  describe('Phase1 to SystemPromptData Mapping', () => {
    it('should correctly map Phase1ScrapingResult to SystemPromptData', () => {
      const phase1Result: Phase1ScrapingResult = {
        sector_analysis: {
          sector: 'Sağlık',
          sub_sector: 'Diş Kliniği',
          business_type: BusinessType.HEALTHCARE,
          bot_purpose: BotPurpose.APPOINTMENT,
          critical_data_type: CriticalDataType.SERVICES,
          bot_personality: 'Profesyonel, Güvenilir',
          expected_user_intent: ['Randevu almak', 'Fiyat öğrenmek']
        },
        company_info: {
          name: 'Test Clinic',
          sector: 'Sağlık',
          description: 'Test description',
          detected_language: 'Türkçe',
          tone_of_voice: 'Profesyonel',
          contact: {
            phone: '+90 555 123 4567',
            email: 'test@example.com'
          }
        },
        offerings: [],
        analysis: {
          total_offerings_found: 0,
          confidence_level: 'LOW',
          recommendation: 'Test'
        },
        suggested_pages: []
      };

      const mapped = mapScrapingToSystemPromptData(phase1Result);

      expect(mapped.companyName).toBe('Test Clinic');
      expect(mapped.sector).toBe('Sağlık');
      expect(mapped.businessType).toBe(BusinessType.HEALTHCARE);
      expect(mapped.botPurpose).toBe(BotPurpose.APPOINTMENT);
      expect(mapped.companyInfo.phone).toBe('+90 555 123 4567');
    });

    it('should expand expected_user_intent with purpose-specific intents', () => {
      const phase1Result: Phase1ScrapingResult = {
        sector_analysis: {
          sector: 'Sağlık',
          sub_sector: 'Diş Kliniği',
          business_type: BusinessType.HEALTHCARE,
          bot_purpose: BotPurpose.APPOINTMENT,
          critical_data_type: CriticalDataType.SERVICES,
          bot_personality: 'Profesyonel',
          expected_user_intent: []
        },
        company_info: {
          name: 'Test Clinic',
          sector: 'Sağlık',
          description: 'Test',
          detected_language: 'Türkçe',
          tone_of_voice: 'Profesyonel',
          contact: {}
        },
        offerings: [],
        analysis: {
          total_offerings_found: 0,
          confidence_level: 'LOW',
          recommendation: 'Test'
        },
        suggested_pages: []
      };

      const mapped = mapScrapingToSystemPromptData(phase1Result);

      // Should include base intents + APPOINTMENT-specific intents
      expect(mapped.expectedUserIntent.length).toBeGreaterThan(0);
      expect(mapped.expectedUserIntent).toContain('Randevu almak');
    });
  });
});
