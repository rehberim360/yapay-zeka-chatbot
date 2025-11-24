/**
 * Type validation tests for Smart Onboarding V2
 * Validates that all core interfaces and enums are properly defined
 * Requirements: 1.4, 2.1-2.8
 */

import * as Types from '../types/onboarding-v2.js';

const {
  BusinessType,
  BotPurpose,
  CriticalDataType,
  ConfidenceLevel,
  PagePriority,
} = Types;

type SectorAnalysis = Types.SectorAnalysis;
type CompanyInfoV2 = Types.CompanyInfoV2;
type Offering = Types.Offering;
type SuggestedPage = Types.SuggestedPage;
type OnboardingPhase = Types.OnboardingPhase;
type OnboardingJob = Types.OnboardingJob;
type SmartDiscoveryResult = Types.SmartDiscoveryResult;
type SystemPromptData = Types.SystemPromptData;

describe('Smart Onboarding V2 Types', () => {
  describe('Enums', () => {
    it('should define BusinessType enum with all required values', () => {
      expect(BusinessType.HEALTHCARE).toBe('HEALTHCARE');
      expect(BusinessType.FOOD).toBe('FOOD');
      expect(BusinessType.REAL_ESTATE).toBe('REAL_ESTATE');
      expect(BusinessType.LEGAL).toBe('LEGAL');
      expect(BusinessType.BEAUTY).toBe('BEAUTY');
      expect(BusinessType.EDUCATION).toBe('EDUCATION');
      expect(BusinessType.RETAIL).toBe('RETAIL');
      expect(BusinessType.SERVICE).toBe('SERVICE');
      expect(BusinessType.AUTOMOTIVE).toBe('AUTOMOTIVE');
      expect(BusinessType.FINANCE).toBe('FINANCE');
      expect(BusinessType.HOSPITALITY).toBe('HOSPITALITY');
      expect(BusinessType.FITNESS).toBe('FITNESS');
      expect(BusinessType.ENTERTAINMENT).toBe('ENTERTAINMENT');
      expect(BusinessType.OTHER).toBe('OTHER');
    });

    it('should define BotPurpose enum with all required values', () => {
      expect(BotPurpose.APPOINTMENT).toBe('APPOINTMENT');
      expect(BotPurpose.RESERVATION).toBe('RESERVATION');
      expect(BotPurpose.BOOKING).toBe('BOOKING');
      expect(BotPurpose.ORDER).toBe('ORDER');
      expect(BotPurpose.LEAD).toBe('LEAD');
      expect(BotPurpose.INFO).toBe('INFO');
      expect(BotPurpose.SUPPORT).toBe('SUPPORT');
    });

    it('should define CriticalDataType enum with all required values', () => {
      expect(CriticalDataType.SERVICES).toBe('SERVICES');
      expect(CriticalDataType.PRODUCTS).toBe('PRODUCTS');
      expect(CriticalDataType.MENU).toBe('MENU');
      expect(CriticalDataType.PORTFOLIO).toBe('PORTFOLIO');
    });

    it('should define ConfidenceLevel enum', () => {
      expect(ConfidenceLevel.LOW).toBe('LOW');
      expect(ConfidenceLevel.MEDIUM).toBe('MEDIUM');
      expect(ConfidenceLevel.HIGH).toBe('HIGH');
    });

    it('should define PagePriority enum', () => {
      expect(PagePriority.CRITICAL).toBe('CRITICAL');
      expect(PagePriority.HIGH).toBe('HIGH');
      expect(PagePriority.MEDIUM).toBe('MEDIUM');
      expect(PagePriority.LOW).toBe('LOW');
    });
  });

  describe('SectorAnalysis Interface', () => {
    it('should create valid SectorAnalysis object', () => {
      const sectorAnalysis: SectorAnalysis = {
        sector: 'Healthcare',
        sub_sector: 'Dental Clinic',
        business_type: BusinessType.HEALTHCARE,
        bot_purpose: BotPurpose.APPOINTMENT,
        critical_data_type: CriticalDataType.SERVICES,
        bot_personality: 'Professional and caring',
        expected_user_intent: ['Randevu almak', 'Fiyat öğrenmek'],
        recommended_features: ['appointment_booking', 'service_info'],
      };

      expect(sectorAnalysis.business_type).toBe(BusinessType.HEALTHCARE);
      expect(sectorAnalysis.bot_purpose).toBe(BotPurpose.APPOINTMENT);
      expect(sectorAnalysis.expected_user_intent).toHaveLength(2);
    });
  });

  describe('CompanyInfoV2 Interface', () => {
    it('should create valid CompanyInfoV2 object', () => {
      const companyInfo: CompanyInfoV2 = {
        name: 'Test Dental Clinic',
        sector: 'Healthcare',
        sub_sector: 'Dental',
        description: 'Professional dental services',
        detected_language: 'tr',
        tone_of_voice: 'professional',
        phone: '+90 555 123 45 67',
        email: 'info@testclinic.com',
        address: 'Test Address',
        working_hours: 'Mon-Fri: 09:00-18:00',
        social_media: {
          instagram: '@testclinic',
        },
      };

      expect(companyInfo.name).toBe('Test Dental Clinic');
      expect(companyInfo.phone).toBe('+90 555 123 45 67');
    });
  });

  describe('Offering Interface', () => {
    it('should create valid Offering object with meta_info', () => {
      const offering: Offering = {
        name: 'Dental Cleaning',
        description: 'Professional teeth cleaning',
        type: 'SERVICE',
        price: 500,
        currency: 'TRY',
        duration_min: 30,
        category: 'Dental Services',
        confidence_level: ConfidenceLevel.HIGH,
        meta_info: {
          duration: '30 dk',
          doctor: 'Dr. Test',
          insurance_covered: true,
        },
      };

      expect(offering.type).toBe('SERVICE');
      expect(offering.price).toBe(500);
      expect(offering.meta_info).toBeDefined();
    });
  });

  describe('SuggestedPage Interface', () => {
    it('should create valid SuggestedPage object', () => {
      const suggestedPage: SuggestedPage = {
        url: 'https://example.com/services',
        type: 'SERVICE_DETAIL',
        priority: PagePriority.HIGH,
        reason: 'Contains detailed service information',
        expected_data: 'Service prices and descriptions',
        auto_select: true,
      };

      expect(suggestedPage.priority).toBe(PagePriority.HIGH);
      expect(suggestedPage.auto_select).toBe(true);
    });
  });

  describe('OnboardingPhase Type', () => {
    it('should accept valid phase values', () => {
      const phases: OnboardingPhase[] = [
        'SMART_DISCOVERY',
        'SMART_PAGE_SELECTION',
        'BATCH_DEEP_DIVE',
        'COMPANY_INFO_REVIEW',
        'OFFERING_SELECTION',
        'COMPLETION',
      ];

      expect(phases).toHaveLength(6);
      expect(phases[0]).toBe('SMART_DISCOVERY');
      expect(phases[5]).toBe('COMPLETION');
    });
  });

  describe('OnboardingJob Interface', () => {
    it('should create valid OnboardingJob object', () => {
      const job: OnboardingJob = {
        id: 'test-job-id',
        user_id: 'test-user-id',
        url: 'https://example.com',
        current_phase: 'SMART_DISCOVERY',
        phase_data: {},
        status: 'IN_PROGRESS',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      expect(job.current_phase).toBe('SMART_DISCOVERY');
      expect(job.status).toBe('IN_PROGRESS');
    });
  });

  describe('SmartDiscoveryResult Interface', () => {
    it('should create valid SmartDiscoveryResult object', () => {
      const result: SmartDiscoveryResult = {
        sector_analysis: {
          sector: 'Healthcare',
          sub_sector: 'Dental',
          business_type: BusinessType.HEALTHCARE,
          bot_purpose: BotPurpose.APPOINTMENT,
          critical_data_type: CriticalDataType.SERVICES,
          bot_personality: 'Professional',
          expected_user_intent: ['Randevu almak'],
          recommended_features: ['appointment_booking'],
        },
        company_info: {
          name: 'Test Clinic',
          detected_language: 'tr',
        },
        offerings: [],
        analysis: {
          total_offerings_found: 0,
          confidence_level: ConfidenceLevel.LOW,
          recommendation: 'Additional scraping recommended',
        },
        suggested_pages: [],
      };

      expect(result.sector_analysis.business_type).toBe(BusinessType.HEALTHCARE);
      expect(result.analysis.confidence_level).toBe(ConfidenceLevel.LOW);
    });
  });

  describe('SystemPromptData Interface', () => {
    it('should create valid SystemPromptData object', () => {
      const promptData: SystemPromptData = {
        company_name: 'Test Company',
        sector: 'Healthcare',
        language: 'tr',
        tone: 'professional',
        business_type: BusinessType.HEALTHCARE,
        bot_purpose: BotPurpose.APPOINTMENT,
        critical_data_type: CriticalDataType.SERVICES,
        bot_personality: 'Professional and caring',
        expected_user_intent: ['Randevu almak'],
        offerings: [],
        company_info: {
          phone: '+90 555 123 45 67',
        },
      };

      expect(promptData.business_type).toBe(BusinessType.HEALTHCARE);
      expect(promptData.bot_purpose).toBe(BotPurpose.APPOINTMENT);
    });
  });
});
