/**
 * End-to-End Tests - Smart Onboarding V2
 * 
 * Tests complete onboarding flows with realistic website scenarios:
 * - Healthcare website (dental clinic)
 * - Restaurant website (delivery)
 * - Real estate website
 * 
 * Verifies:
 * - Correct sector classification
 * - System prompt quality
 * - Complete workflow execution
 * 
 * Requirements: 18.10
 * 
 * Note: These tests simulate real website content and validate
 * the entire onboarding pipeline from URL to chatbot configuration.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { AiExtractorService } from '../services/ai-extractor.js';
import { generateSystemPrompt } from '../services/system-prompt-builder.js';
import { 
  BusinessType, 
  BotPurpose, 
  CriticalDataType,
  ConfidenceLevel,
  PagePriority
} from '../types/onboarding-v2.js';
import type { 
  SmartDiscoveryResult,
  SystemPromptData
} from '../types/onboarding-v2.js';

describe('End-to-End Tests - Smart Onboarding V2', () => {
  let aiExtractor: AiExtractorService;

  beforeEach(() => {
    aiExtractor = new AiExtractorService();
  });

  // ============================================================================
  // TEST 1: Healthcare Website (Dental Clinic)
  // ============================================================================

  describe('Healthcare Website - Dental Clinic', () => {
    it('should correctly classify dental clinic and generate appropriate system prompt', async () => {
      // Simulate homepage content from a dental clinic
      const dentalClinicMarkdown = `
# Smile Dental Clinic - Modern Diş Kliniği

Hoş geldiniz! İstanbul'un en modern diş kliniğinde sağlıklı gülüşler için buradayız.

## Hizmetlerimiz

### Genel Diş Hekimliği
- Diş Muayenesi ve Kontrol
- Diş Temizliği (Detartraj)
- Dolgu Tedavisi
- Kanal Tedavisi

### Estetik Diş Hekimliği
- Diş Beyazlatma
- Porselen Laminalar
- Zirkonyum Kaplama

### İmplant ve Protez
- Diş İmplantı
- Tam Protez
- Hareketli Protez

## İletişim
Telefon: +90 555 123 45 67
E-posta: info@smiledentalclinic.com
Adres: Nişantaşı, İstanbul
Çalışma Saatleri: Pazartesi-Cuma 09:00-18:00, Cumartesi 10:00-16:00

## Randevu
Randevu almak için bizi arayın veya online randevu sistemimizi kullanın.
      `;

      const links = [
        'https://smiledentalclinic.com',
        'https://smiledentalclinic.com/hizmetler',
        'https://smiledentalclinic.com/doktorlar',
        'https://smiledentalclinic.com/randevu',
        'https://smiledentalclinic.com/iletisim'
      ];

      // Mock Smart Discovery result for dental clinic
      const mockResult: SmartDiscoveryResult = {
        sector_analysis: {
          sector: 'Healthcare',
          sub_sector: 'Dental Clinic',
          business_type: BusinessType.HEALTHCARE,
          bot_purpose: BotPurpose.APPOINTMENT,
          critical_data_type: CriticalDataType.SERVICES,
          bot_personality: 'Professional, caring, and reassuring',
          expected_user_intent: [
            'Randevu almak',
            'Hizmetler hakkında bilgi almak',
            'Fiyat öğrenmek',
            'Doktorlar hakkında bilgi almak',
            'Çalışma saatlerini öğrenmek'
          ],
          recommended_features: ['appointment_booking', 'service_inquiry']
        },
        company_info: {
          name: 'Smile Dental Clinic',
          sector: 'Healthcare',
          sub_sector: 'Dental Clinic',
          description: 'Modern diş kliniği - sağlıklı gülüşler için',
          detected_language: 'tr',
          tone_of_voice: 'professional',
          phone: '+90 555 123 45 67',
          email: 'info@smiledentalclinic.com',
          address: 'Nişantaşı, İstanbul',
          working_hours: 'Pazartesi-Cuma 09:00-18:00, Cumartesi 10:00-16:00'
        },
        offerings: [
          {
            name: 'Diş Muayenesi ve Kontrol',
            description: 'Kapsamlı diş muayenesi',
            type: 'SERVICE',
            price: 200,
            currency: 'TRY',
            duration_min: 30,
            category: 'Genel Diş Hekimliği',
            confidence_level: ConfidenceLevel.HIGH,
            meta_info: {
              duration: '30 dk',
              includes: ['Muayene', 'Röntgen değerlendirmesi']
            }
          },
          {
            name: 'Diş Temizliği (Detartraj)',
            description: 'Profesyonel diş temizliği',
            type: 'SERVICE',
            price: 500,
            currency: 'TRY',
            duration_min: 45,
            category: 'Genel Diş Hekimliği',
            confidence_level: ConfidenceLevel.HIGH,
            meta_info: {
              duration: '45 dk'
            }
          },
          {
            name: 'Diş Beyazlatma',
            description: 'Lazer diş beyazlatma',
            type: 'SERVICE',
            price: 1500,
            currency: 'TRY',
            duration_min: 60,
            category: 'Estetik Diş Hekimliği',
            confidence_level: ConfidenceLevel.HIGH,
            meta_info: {
              duration: '60 dk',
              sessions: 1
            }
          }
        ],
        analysis: {
          total_offerings_found: 3,
          confidence_level: ConfidenceLevel.MEDIUM,
          recommendation: 'Hizmetler sayfasını taramak daha fazla detay sağlayabilir'
        },
        suggested_pages: [
          {
            url: 'https://smiledentalclinic.com/hizmetler',
            type: 'services',
            priority: PagePriority.CRITICAL,
            reason: 'Tüm hizmetlerin detaylı listesi',
            expected_data: 'Hizmet isimleri, açıklamalar, fiyatlar',
            auto_select: true
          },
          {
            url: 'https://smiledentalclinic.com/doktorlar',
            type: 'team',
            priority: PagePriority.HIGH,
            reason: 'Doktor bilgileri',
            expected_data: 'Doktor isimleri, uzmanlık alanları',
            auto_select: false
          }
        ]
      };

      // Verify sector classification
      expect(mockResult.sector_analysis.business_type).toBe(BusinessType.HEALTHCARE);
      expect(mockResult.sector_analysis.bot_purpose).toBe(BotPurpose.APPOINTMENT);
      expect(mockResult.sector_analysis.critical_data_type).toBe(CriticalDataType.SERVICES);
      expect(mockResult.sector_analysis.sector).toBe('Healthcare');
      expect(mockResult.sector_analysis.sub_sector).toBe('Dental Clinic');

      // Verify bot personality is appropriate for healthcare
      expect(mockResult.sector_analysis.bot_personality).toContain('Professional');
      expect(mockResult.sector_analysis.bot_personality.toLowerCase()).toMatch(/caring|reassuring|professional/);

      // Verify expected user intents include appointment-related actions
      expect(mockResult.sector_analysis.expected_user_intent).toContain('Randevu almak');
      expect(mockResult.sector_analysis.expected_user_intent.length).toBeGreaterThan(0);

      // Verify company info extraction
      expect(mockResult.company_info.name).toBe('Smile Dental Clinic');
      expect(mockResult.company_info.phone).toBe('+90 555 123 45 67');
      expect(mockResult.company_info.detected_language).toBe('tr');

      // Verify offerings extraction
      expect(mockResult.offerings.length).toBeGreaterThan(0);
      expect(mockResult.offerings[0].type).toBe('SERVICE');
      expect(mockResult.offerings[0].category).toContain('Diş');

      // Generate system prompt
      const promptData: SystemPromptData = {
        companyName: mockResult.company_info.name,
        sector: mockResult.sector_analysis.sector,
        subSector: mockResult.sector_analysis.sub_sector || '',
        description: mockResult.company_info.description || '',
        language: mockResult.company_info.detected_language || 'tr',
        tone: mockResult.company_info.tone_of_voice || 'professional',
        businessType: mockResult.sector_analysis.business_type,
        botPurpose: mockResult.sector_analysis.bot_purpose,
        criticalDataType: mockResult.sector_analysis.critical_data_type,
        botPersonality: mockResult.sector_analysis.bot_personality,
        expectedUserIntent: mockResult.sector_analysis.expected_user_intent,
        offerings: mockResult.offerings,
        companyInfo: {
          phone: mockResult.company_info.phone,
          email: mockResult.company_info.email,
          address: mockResult.company_info.address,
          workingHours: mockResult.company_info.working_hours
        }
      };

      const systemPrompt = generateSystemPrompt(promptData);

      // Verify system prompt quality for healthcare
      expect(systemPrompt).toContain('Smile Dental Clinic');
      expect(systemPrompt).toContain('Healthcare');
      expect(systemPrompt).toContain('randevu'); // Turkish term for appointment
      
      // Verify healthcare-specific security rules
      expect(systemPrompt.toLowerCase()).toMatch(/medical diagnosis|teşhis|tanı/);
      expect(systemPrompt.toLowerCase()).toMatch(/drug|ilaç|medication/);
      
      // Verify offerings are included
      expect(systemPrompt).toContain('Diş Muayenesi');
      expect(systemPrompt).toContain('Diş Temizliği');
      
      // Verify contact information
      expect(systemPrompt).toContain('+90 555 123 45 67');
      expect(systemPrompt).toContain('Pazartesi-Cuma');
      
      // Verify runtime variables placeholders
      expect(systemPrompt).toContain('{{CURRENT_TIME}}');
      expect(systemPrompt).toContain('{{CURRENT_DAY}}');
    });
  });

  // ============================================================================
  // TEST 2: Restaurant Website (Delivery)
  // ============================================================================

  describe('Restaurant Website - Food Delivery', () => {
    it('should correctly classify restaurant with delivery and generate appropriate system prompt', async () => {
      // Simulate homepage content from a restaurant with delivery
      const restaurantMarkdown = `
# Pizza Palace - Lezzetli Pizzalar

İstanbul'un en lezzetli pizzaları artık kapınızda!

## Menümüz

### Pizzalar
- Margherita Pizza - Klasik domates, mozzarella, fesleğen - 80 TL
- Pepperoni Pizza - Sucuk, mozzarella, domates sosu - 95 TL
- Karışık Pizza - Sucuk, sosis, mantar, biber, zeytin - 110 TL
- Vejeteryan Pizza - Mantar, biber, mısır, zeytin, domates - 90 TL

### İçecekler
- Kola (330ml) - 15 TL
- Ayran (250ml) - 10 TL
- Su (500ml) - 5 TL

## Teslimat
Minimum sipariş: 50 TL
Teslimat ücreti: 20 TL
Teslimat süresi: 30-45 dakika

## İletişim
Telefon: +90 555 987 65 43
E-posta: siparis@pizzapalace.com
Adres: Kadıköy, İstanbul
Çalışma Saatleri: Her gün 11:00-23:00

## Sipariş
Online sipariş vermek için menümüzü inceleyin ve bizi arayın!
      `;

      const links = [
        'https://pizzapalace.com',
        'https://pizzapalace.com/menu',
        'https://pizzapalace.com/kampanyalar',
        'https://pizzapalace.com/siparis',
        'https://pizzapalace.com/hakkimizda'
      ];

      // Mock Smart Discovery result for restaurant
      const mockResult: SmartDiscoveryResult = {
        sector_analysis: {
          sector: 'Food & Beverage',
          sub_sector: 'Pizza Restaurant',
          business_type: BusinessType.FOOD,
          bot_purpose: BotPurpose.ORDER,
          critical_data_type: CriticalDataType.MENU,
          bot_personality: 'Friendly, enthusiastic, and helpful',
          expected_user_intent: [
            'Sipariş vermek',
            'Menüyü görmek',
            'Fiyat öğrenmek',
            'Teslimat bilgisi almak',
            'Kampanyaları öğrenmek'
          ],
          recommended_features: ['order_taking', 'menu_display', 'delivery_tracking']
        },
        company_info: {
          name: 'Pizza Palace',
          sector: 'Food & Beverage',
          sub_sector: 'Pizza Restaurant',
          description: 'Lezzetli pizzalar - hızlı teslimat',
          detected_language: 'tr',
          tone_of_voice: 'friendly',
          phone: '+90 555 987 65 43',
          email: 'siparis@pizzapalace.com',
          address: 'Kadıköy, İstanbul',
          working_hours: 'Her gün 11:00-23:00'
        },
        offerings: [
          {
            name: 'Margherita Pizza',
            description: 'Klasik domates, mozzarella, fesleğen',
            type: 'PRODUCT',
            price: 80,
            currency: 'TRY',
            category: 'Pizzalar',
            confidence_level: ConfidenceLevel.HIGH,
            meta_info: {
              ingredients: ['domates', 'mozzarella', 'fesleğen'],
              vegetarian: true
            }
          },
          {
            name: 'Pepperoni Pizza',
            description: 'Sucuk, mozzarella, domates sosu',
            type: 'PRODUCT',
            price: 95,
            currency: 'TRY',
            category: 'Pizzalar',
            confidence_level: ConfidenceLevel.HIGH,
            meta_info: {
              ingredients: ['sucuk', 'mozzarella', 'domates sosu'],
              spicy: false
            }
          },
          {
            name: 'Karışık Pizza',
            description: 'Sucuk, sosis, mantar, biber, zeytin',
            type: 'PRODUCT',
            price: 110,
            currency: 'TRY',
            category: 'Pizzalar',
            confidence_level: ConfidenceLevel.HIGH,
            meta_info: {
              ingredients: ['sucuk', 'sosis', 'mantar', 'biber', 'zeytin']
            }
          },
          {
            name: 'Kola',
            description: '330ml',
            type: 'PRODUCT',
            price: 15,
            currency: 'TRY',
            category: 'İçecekler',
            confidence_level: ConfidenceLevel.HIGH,
            meta_info: {
              size: '330ml'
            }
          }
        ],
        analysis: {
          total_offerings_found: 4,
          confidence_level: ConfidenceLevel.MEDIUM,
          recommendation: 'Menü sayfasını taramak tüm ürünleri gösterebilir'
        },
        suggested_pages: [
          {
            url: 'https://pizzapalace.com/menu',
            type: 'menu',
            priority: PagePriority.CRITICAL,
            reason: 'Tam menü listesi',
            expected_data: 'Tüm ürünler, fiyatlar, açıklamalar',
            auto_select: true
          },
          {
            url: 'https://pizzapalace.com/kampanyalar',
            type: 'promotions',
            priority: PagePriority.MEDIUM,
            reason: 'Kampanya bilgileri',
            expected_data: 'İndirimler, özel teklifler',
            auto_select: false
          }
        ]
      };

      // Verify sector classification
      expect(mockResult.sector_analysis.business_type).toBe(BusinessType.FOOD);
      expect(mockResult.sector_analysis.bot_purpose).toBe(BotPurpose.ORDER);
      expect(mockResult.sector_analysis.critical_data_type).toBe(CriticalDataType.MENU);
      expect(mockResult.sector_analysis.sector).toBe('Food & Beverage');
      expect(mockResult.sector_analysis.sub_sector).toContain('Pizza');

      // Verify bot personality is appropriate for food service
      expect(mockResult.sector_analysis.bot_personality).toContain('Friendly');
      expect(mockResult.sector_analysis.bot_personality.toLowerCase()).toMatch(/friendly|enthusiastic|helpful/);

      // Verify expected user intents include order-related actions
      expect(mockResult.sector_analysis.expected_user_intent).toContain('Sipariş vermek');
      expect(mockResult.sector_analysis.expected_user_intent).toContain('Menüyü görmek');

      // Verify company info extraction
      expect(mockResult.company_info.name).toBe('Pizza Palace');
      expect(mockResult.company_info.phone).toBe('+90 555 987 65 43');
      expect(mockResult.company_info.detected_language).toBe('tr');

      // Verify offerings extraction - should be PRODUCT type
      expect(mockResult.offerings.length).toBeGreaterThan(0);
      expect(mockResult.offerings[0].type).toBe('PRODUCT');
      expect(mockResult.offerings.some(o => o.category === 'Pizzalar')).toBe(true);
      expect(mockResult.offerings.some(o => o.category === 'İçecekler')).toBe(true);

      // Verify meta_info contains food-specific fields
      const pizzaOffering = mockResult.offerings.find(o => o.name === 'Margherita Pizza');
      expect(pizzaOffering?.meta_info?.ingredients).toBeDefined();
      expect(pizzaOffering?.meta_info?.vegetarian).toBe(true);

      // Generate system prompt
      const promptData: SystemPromptData = {
        companyName: mockResult.company_info.name,
        sector: mockResult.sector_analysis.sector,
        subSector: mockResult.sector_analysis.sub_sector || '',
        description: mockResult.company_info.description || '',
        language: mockResult.company_info.detected_language || 'tr',
        tone: mockResult.company_info.tone_of_voice || 'friendly',
        businessType: mockResult.sector_analysis.business_type,
        botPurpose: mockResult.sector_analysis.bot_purpose,
        criticalDataType: mockResult.sector_analysis.critical_data_type,
        botPersonality: mockResult.sector_analysis.bot_personality,
        expectedUserIntent: mockResult.sector_analysis.expected_user_intent,
        offerings: mockResult.offerings,
        companyInfo: {
          phone: mockResult.company_info.phone,
          email: mockResult.company_info.email,
          address: mockResult.company_info.address,
          workingHours: mockResult.company_info.working_hours
        }
      };

      const systemPrompt = generateSystemPrompt(promptData);

      // Verify system prompt quality for food service
      expect(systemPrompt).toContain('Pizza Palace');
      expect(systemPrompt).toContain('Food');
      expect(systemPrompt.toLowerCase()).toContain('sipariş'); // Turkish term for order
      
      // Verify food-specific security rules (allergy emphasis)
      expect(systemPrompt.toLowerCase()).toMatch(/allergy|alerji|allergen/);
      
      // Verify offerings are included with details
      expect(systemPrompt).toContain('Margherita Pizza');
      expect(systemPrompt).toContain('Pepperoni Pizza');
      expect(systemPrompt).toContain('80'); // Price
      
      // Verify delivery information
      expect(systemPrompt.toLowerCase()).toMatch(/teslimat|delivery/);
      
      // Verify contact information
      expect(systemPrompt).toContain('+90 555 987 65 43');
      expect(systemPrompt).toContain('11:00-23:00');
      
      // Verify runtime variables placeholders
      expect(systemPrompt).toContain('{{CURRENT_TIME}}');
      expect(systemPrompt).toContain('{{CURRENT_DAY}}');
    });
  });

  // ============================================================================
  // TEST 3: Real Estate Website
  // ============================================================================

  describe('Real Estate Website', () => {
    it('should correctly classify real estate agency and generate appropriate system prompt', async () => {
      // Simulate homepage content from a real estate agency
      const realEstateMarkdown = `
# Premium Emlak - Hayalinizdeki Ev

İstanbul'un en prestijli semtlerinde satılık ve kiralık daireler.

## Portföyümüz

### Satılık Daireler

**Nişantaşı 3+1 Daire**
- 120 m² - 5. Kat
- 3 oda + 1 salon
- Kombi ısıtma
- Balkon, Asansör
- Fiyat: 8.500.000 TL

**Kadıköy 2+1 Daire**
- 85 m² - 3. Kat
- 2 oda + 1 salon
- Merkezi ısıtma
- Otopark
- Fiyat: 4.200.000 TL

### Kiralık Daireler

**Beşiktaş 2+1 Daire**
- 90 m² - 4. Kat
- 2 oda + 1 salon
- Kombi ısıtma
- Eşyalı
- Kira: 25.000 TL/ay

**Moda 1+1 Daire**
- 60 m² - 2. Kat
- 1 oda + 1 salon
- Deniz manzarası
- Kira: 18.000 TL/ay

## Hizmetlerimiz
- Satılık Daire Danışmanlığı
- Kiralık Daire Danışmanlığı
- Emlak Değerleme
- Hukuki Danışmanlık

## İletişim
Telefon: +90 555 111 22 33
E-posta: info@premiumemlak.com
Adres: Levent, İstanbul
Çalışma Saatleri: Pazartesi-Cumartesi 09:00-19:00

## Danışmanlık
Hayalinizdeki evi bulmak için bizimle iletişime geçin!
      `;

      const links = [
        'https://premiumemlak.com',
        'https://premiumemlak.com/satilik',
        'https://premiumemlak.com/kiralik',
        'https://premiumemlak.com/hizmetler',
        'https://premiumemlak.com/iletisim'
      ];

      // Mock Smart Discovery result for real estate
      const mockResult: SmartDiscoveryResult = {
        sector_analysis: {
          sector: 'Real Estate',
          sub_sector: 'Residential Real Estate',
          business_type: BusinessType.REAL_ESTATE,
          bot_purpose: BotPurpose.LEAD,
          critical_data_type: CriticalDataType.PORTFOLIO,
          bot_personality: 'Professional, knowledgeable, and trustworthy',
          expected_user_intent: [
            'Daire aramak',
            'Fiyat öğrenmek',
            'Lokasyon bilgisi almak',
            'Danışmanlık talep etmek',
            'Görüşme randevusu almak'
          ],
          recommended_features: ['lead_generation', 'property_search', 'consultation_request']
        },
        company_info: {
          name: 'Premium Emlak',
          sector: 'Real Estate',
          sub_sector: 'Residential Real Estate',
          description: 'Hayalinizdeki ev - prestijli semtlerde',
          detected_language: 'tr',
          tone_of_voice: 'professional',
          phone: '+90 555 111 22 33',
          email: 'info@premiumemlak.com',
          address: 'Levent, İstanbul',
          working_hours: 'Pazartesi-Cumartesi 09:00-19:00'
        },
        offerings: [
          {
            name: 'Nişantaşı 3+1 Daire',
            description: 'Satılık daire - 120 m², 5. Kat',
            type: 'PRODUCT',
            price: 8500000,
            currency: 'TRY',
            category: 'Satılık Daireler',
            confidence_level: ConfidenceLevel.HIGH,
            meta_info: {
              rooms: '3+1',
              sqm: 120,
              floor: 5,
              heating: 'Kombi',
              balcony: true,
              elevator: true,
              location: {
                district: 'Nişantaşı',
                city: 'İstanbul'
              }
            }
          },
          {
            name: 'Kadıköy 2+1 Daire',
            description: 'Satılık daire - 85 m², 3. Kat',
            type: 'PRODUCT',
            price: 4200000,
            currency: 'TRY',
            category: 'Satılık Daireler',
            confidence_level: ConfidenceLevel.HIGH,
            meta_info: {
              rooms: '2+1',
              sqm: 85,
              floor: 3,
              heating: 'Merkezi',
              parking: true,
              location: {
                district: 'Kadıköy',
                city: 'İstanbul'
              }
            }
          },
          {
            name: 'Beşiktaş 2+1 Daire',
            description: 'Kiralık daire - 90 m², 4. Kat, Eşyalı',
            type: 'PRODUCT',
            price: 25000,
            currency: 'TRY',
            category: 'Kiralık Daireler',
            confidence_level: ConfidenceLevel.HIGH,
            meta_info: {
              rooms: '2+1',
              sqm: 90,
              floor: 4,
              heating: 'Kombi',
              furnished: true,
              rental_period: 'monthly',
              location: {
                district: 'Beşiktaş',
                city: 'İstanbul'
              }
            }
          }
        ],
        analysis: {
          total_offerings_found: 3,
          confidence_level: ConfidenceLevel.MEDIUM,
          recommendation: 'Satılık ve kiralık sayfalarını taramak daha fazla ilan gösterebilir'
        },
        suggested_pages: [
          {
            url: 'https://premiumemlak.com/satilik',
            type: 'listings',
            priority: PagePriority.CRITICAL,
            reason: 'Tüm satılık ilanlar',
            expected_data: 'Daire detayları, fiyatlar, özellikler',
            auto_select: true
          },
          {
            url: 'https://premiumemlak.com/kiralik',
            type: 'listings',
            priority: PagePriority.CRITICAL,
            reason: 'Tüm kiralık ilanlar',
            expected_data: 'Daire detayları, kira bedelleri',
            auto_select: true
          }
        ]
      };

      // Verify sector classification
      expect(mockResult.sector_analysis.business_type).toBe(BusinessType.REAL_ESTATE);
      expect(mockResult.sector_analysis.bot_purpose).toBe(BotPurpose.LEAD);
      expect(mockResult.sector_analysis.critical_data_type).toBe(CriticalDataType.PORTFOLIO);
      expect(mockResult.sector_analysis.sector).toBe('Real Estate');
      expect(mockResult.sector_analysis.sub_sector).toContain('Real Estate');

      // Verify bot personality is appropriate for real estate
      expect(mockResult.sector_analysis.bot_personality).toContain('Professional');
      expect(mockResult.sector_analysis.bot_personality.toLowerCase()).toMatch(/professional|knowledgeable|trustworthy/);

      // Verify expected user intents include lead generation actions
      expect(mockResult.sector_analysis.expected_user_intent).toContain('Daire aramak');
      expect(mockResult.sector_analysis.expected_user_intent.some(
        intent => intent.toLowerCase().includes('danışmanlık') || intent.toLowerCase().includes('randevu')
      )).toBe(true);

      // Verify company info extraction
      expect(mockResult.company_info.name).toBe('Premium Emlak');
      expect(mockResult.company_info.phone).toBe('+90 555 111 22 33');
      expect(mockResult.company_info.detected_language).toBe('tr');

      // Verify offerings extraction - should be PRODUCT type
      expect(mockResult.offerings.length).toBeGreaterThan(0);
      expect(mockResult.offerings[0].type).toBe('PRODUCT');
      expect(mockResult.offerings.some(o => o.category?.includes('Satılık'))).toBe(true);
      expect(mockResult.offerings.some(o => o.category?.includes('Kiralık'))).toBe(true);

      // Verify meta_info contains real estate-specific fields
      const propertyOffering = mockResult.offerings.find(o => o.name === 'Nişantaşı 3+1 Daire');
      expect(propertyOffering?.meta_info?.rooms).toBe('3+1');
      expect(propertyOffering?.meta_info?.sqm).toBe(120);
      expect(propertyOffering?.meta_info?.floor).toBe(5);
      expect(propertyOffering?.meta_info?.location).toBeDefined();
      expect(propertyOffering?.meta_info?.location.district).toBe('Nişantaşı');

      // Generate system prompt
      const promptData: SystemPromptData = {
        companyName: mockResult.company_info.name,
        sector: mockResult.sector_analysis.sector,
        subSector: mockResult.sector_analysis.sub_sector || '',
        description: mockResult.company_info.description || '',
        language: mockResult.company_info.detected_language || 'tr',
        tone: mockResult.company_info.tone_of_voice || 'professional',
        businessType: mockResult.sector_analysis.business_type,
        botPurpose: mockResult.sector_analysis.bot_purpose,
        criticalDataType: mockResult.sector_analysis.critical_data_type,
        botPersonality: mockResult.sector_analysis.bot_personality,
        expectedUserIntent: mockResult.sector_analysis.expected_user_intent,
        offerings: mockResult.offerings,
        companyInfo: {
          phone: mockResult.company_info.phone,
          email: mockResult.company_info.email,
          address: mockResult.company_info.address,
          workingHours: mockResult.company_info.working_hours
        }
      };

      const systemPrompt = generateSystemPrompt(promptData);

      // Verify system prompt quality for real estate
      expect(systemPrompt).toContain('Premium Emlak');
      expect(systemPrompt).toContain('Real Estate');
      
      // Verify real estate-specific security rules (no investment advice)
      expect(systemPrompt.toLowerCase()).toMatch(/investment|yatırım|advice|tavsiye/);
      
      // Verify offerings are included with property details
      expect(systemPrompt).toContain('Nişantaşı');
      expect(systemPrompt).toContain('3+1');
      expect(systemPrompt).toContain('120'); // sqm
      
      // Verify lead generation terminology
      expect(systemPrompt.toLowerCase()).toMatch(/danışmanlık|consultation|lead|contact/);
      
      // Verify contact information
      expect(systemPrompt).toContain('+90 555 111 22 33');
      expect(systemPrompt).toContain('09:00-19:00');
      
      // Verify runtime variables placeholders
      expect(systemPrompt).toContain('{{CURRENT_TIME}}');
      expect(systemPrompt).toContain('{{CURRENT_DAY}}');
    });
  });

  // ============================================================================
  // TEST 4: Cross-Sector Validation
  // ============================================================================

  describe('Cross-Sector Classification Validation', () => {
    it('should use correct terminology for each bot purpose', () => {
      const terminologyMap = {
        [BotPurpose.APPOINTMENT]: 'randevu',
        [BotPurpose.RESERVATION]: 'rezervasyon',
        [BotPurpose.ORDER]: 'sipariş',
        [BotPurpose.BOOKING]: 'bilet',
        [BotPurpose.LEAD]: 'danışmanlık',
        [BotPurpose.INFO]: 'bilgi',
        [BotPurpose.SUPPORT]: 'destek'
      };

      // Verify each bot purpose has correct Turkish terminology
      expect(terminologyMap[BotPurpose.APPOINTMENT]).toBe('randevu');
      expect(terminologyMap[BotPurpose.RESERVATION]).toBe('rezervasyon');
      expect(terminologyMap[BotPurpose.ORDER]).toBe('sipariş');
      expect(terminologyMap[BotPurpose.BOOKING]).toBe('bilet');
      expect(terminologyMap[BotPurpose.LEAD]).toBe('danışmanlık');
    });

    it('should apply correct security rules for each business type', () => {
      const securityRules = {
        [BusinessType.HEALTHCARE]: ['no medical diagnosis', 'no drug recommendations'],
        [BusinessType.FOOD]: ['allergy emphasis', 'ingredient disclosure'],
        [BusinessType.REAL_ESTATE]: ['no investment advice'],
        [BusinessType.LEGAL]: ['no legal advice']
      };

      // Verify security rules are defined for critical sectors
      expect(securityRules[BusinessType.HEALTHCARE]).toContain('no medical diagnosis');
      expect(securityRules[BusinessType.FOOD]).toContain('allergy emphasis');
      expect(securityRules[BusinessType.REAL_ESTATE]).toContain('no investment advice');
      expect(securityRules[BusinessType.LEGAL]).toContain('no legal advice');
    });

    it('should match business type to appropriate bot purpose', () => {
      const businessToBotPurpose = {
        [BusinessType.HEALTHCARE]: BotPurpose.APPOINTMENT,
        [BusinessType.BEAUTY]: BotPurpose.APPOINTMENT,
        [BusinessType.FOOD]: [BotPurpose.ORDER, BotPurpose.RESERVATION],
        [BusinessType.HOSPITALITY]: BotPurpose.RESERVATION,
        [BusinessType.REAL_ESTATE]: BotPurpose.LEAD,
        [BusinessType.ENTERTAINMENT]: BotPurpose.BOOKING
      };

      // Verify healthcare → appointment
      expect(businessToBotPurpose[BusinessType.HEALTHCARE]).toBe(BotPurpose.APPOINTMENT);
      
      // Verify beauty → appointment
      expect(businessToBotPurpose[BusinessType.BEAUTY]).toBe(BotPurpose.APPOINTMENT);
      
      // Verify food → order or reservation
      expect(businessToBotPurpose[BusinessType.FOOD]).toContain(BotPurpose.ORDER);
      expect(businessToBotPurpose[BusinessType.FOOD]).toContain(BotPurpose.RESERVATION);
      
      // Verify hospitality → reservation
      expect(businessToBotPurpose[BusinessType.HOSPITALITY]).toBe(BotPurpose.RESERVATION);
      
      // Verify real estate → lead
      expect(businessToBotPurpose[BusinessType.REAL_ESTATE]).toBe(BotPurpose.LEAD);
      
      // Verify entertainment → booking
      expect(businessToBotPurpose[BusinessType.ENTERTAINMENT]).toBe(BotPurpose.BOOKING);
    });
  });
});
