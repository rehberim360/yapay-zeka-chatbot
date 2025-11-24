import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import type { SmartDiscoveryResult } from '../types/onboarding-v2.js';
import { retryGeminiOperation, getUserFriendlyErrorMessage } from '../utils/error-recovery.js';
import { logGeminiCall, type GeminiLogData } from '../utils/logger.js';

dotenv.config();

export class AiExtractorService {
  private genAI: GoogleGenerativeAI;
  private model: any;
  private proModel: any; // Gemini for heavy operations

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    // Flash model for light operations (chatbot responses)
    const flashModel = process.env.GEMINI_FLASH_MODEL || 'gemini-2.0-flash-exp';
    this.model = this.genAI.getGenerativeModel({
      model: flashModel,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });
    
    // Pro model for onboarding (heavy operations - data extraction)
    const proModel = process.env.GEMINI_PRO_MODEL || 'gemini-1.5-pro';
    this.proModel = this.genAI.getGenerativeModel({
      model: proModel,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });
    
    console.log(`🤖 Gemini Models Initialized:`);
    console.log(`   Flash Model: ${flashModel} (light operations)`);
    console.log(`   Pro Model: ${proModel} (onboarding)`);
  }

  /**
   * Smart Discovery - PHASE 1: Analyze homepage and suggest pages to scrape
   * NO OFFERINGS extraction here, only page suggestions
   * Uses Gemini  for better accuracy
   * Requirements: 1.3, 1.4, 1.5, 1.6, 1.7, 1.8, 2.1-2.16
   */
  async smartDiscovery(markdown: string, links: string[]): Promise<SmartDiscoveryResult> {
    const startTime = Date.now();
    
    // Truncate markdown if too long (Requirements: 14.5 - Optimize Gemini prompts for token efficiency)
    const truncatedMarkdown = markdown.length > 20000 
      ? markdown.substring(0, 20000) + '\n\n[İçerik kısaltıldı...]'
      : markdown;
    
    // Limit links to reduce token usage
    const limitedLinks = links.slice(0, 150);
    
    console.log(`📝 Smart Discovery - Markdown: ${markdown.length} chars, Links: ${links.length}`);
    
    const prompt = `
Sen uzman bir iş analisti ve web sitesi stratejistisin. Görevin, bir web sitesinin ana sayfasını analiz ederek:
1. İşletmenin sektörünü ve chatbot amacını belirlemek
2. Şirket bilgilerini çıkarmak
3. ⚠️ DİKKAT: Offerings ÇIKARMA! Sadece hangi sayfaların taranması gerektiğini belirle
4. Ek tarama için önerilecek sayfaları belirlemek (MAKSIMUM ${process.env.MAX_PAGES_TO_SCRAPE || '20'} sayfa)

# BOT PURPOSE CLASSIFICATION RULES

Web sitesini analiz et ve şu soruları sor:

1️⃣ Kullanıcı bir KİŞİ ile mi görüşecek?
   → EVET: Doktor, Kuaför, Avukat, Psikolog → bot_purpose: "APPOINTMENT"
   → HAYIR: 2. soruya geç

2️⃣ Kullanıcı bir MEKAN/VARLIK mı kiralayacak?
   → EVET: Otel Odası, Restoran Masası, Araç → bot_purpose: "RESERVATION"
   → HAYIR: 3. soruya geç

3️⃣ Kullanıcı bir ETKİNLİK/SEYAHAT için BİLET mi alacak?
   → EVET: Sinema, Konser, Uçak, Otobüs → bot_purpose: "BOOKING"
   → HAYIR: 4. soruya geç

4️⃣ Kullanıcı fiziksel bir ÜRÜN mü satın alacak?
   → EVET: Pizza, Kıyafet, Elektronik → bot_purpose: "ORDER"
   → HAYIR: 5. soruya geç

5️⃣ Kullanıcı GÖRÜŞME/TEKLİF mi talep edecek?
   → EVET: Emlak, Oto Galeri, Danışmanlık → bot_purpose: "LEAD"
   → HAYIR: 6. soruya geç

6️⃣ Kullanıcı sadece BİLGİ mi alacak?
   → EVET: SSS, Eğitim, Kamu → bot_purpose: "INFO"
   → HAYIR: 7. soruya geç

7️⃣ Kullanıcı DESTEK/YARDIM mı talep edecek?
   → EVET: Teknik Servis, Müşteri Hizmetleri → bot_purpose: "SUPPORT"
   → HAYIR: bot_purpose: "INFO" (varsayılan)

# SECTOR EXAMPLES

- HEALTHCARE: Hastane, Klinik, Diş Hekimi, Psikolog → bot_purpose: APPOINTMENT
- FOOD (Masa): Restoran, Kafe → bot_purpose: RESERVATION
- FOOD (Paket): Pizza, Yemek Siparişi → bot_purpose: ORDER
- REAL_ESTATE: Emlak, Gayrimenkul → bot_purpose: LEAD
- BEAUTY: Kuaför, Güzellik Salonu → bot_purpose: APPOINTMENT
- HOSPITALITY: Otel, Pansiyon → bot_purpose: RESERVATION
- ENTERTAINMENT: Sinema, Tiyatro → bot_purpose: BOOKING
- LEGAL: Avukat, Hukuk Bürosu → bot_purpose: APPOINTMENT
- SERVICE: Tesisatçı, Elektrikçi → bot_purpose: APPOINTMENT veya SUPPORT

# JSON SCHEMA

{
  "sector_analysis": {
    "sector": "Ana sektör (Örn: Sağlık, Yemek, Emlak)",
    "sub_sector": "Alt sektör (Örn: Diş Kliniği, İtalyan Restoranı)",
    "business_type": "HEALTHCARE | FOOD | REAL_ESTATE | LEGAL | BEAUTY | EDUCATION | RETAIL | SERVICE | AUTOMOTIVE | FINANCE | HOSPITALITY | FITNESS | ENTERTAINMENT | OTHER",
    "bot_purpose": "APPOINTMENT | RESERVATION | BOOKING | ORDER | LEAD | INFO | SUPPORT",
    "critical_data_type": "SERVICES | PRODUCTS | MENU | PORTFOLIO",
    "bot_personality": "Chatbot'un kişiliği (Örn: Profesyonel ve Yardımsever, Samimi ve Eğlenceli)",
    "expected_user_intent": ["Kullanıcının muhtemel amaçları listesi"],
    "recommended_features": ["Önerilen chatbot özellikleri"]
  },
  "company_info": {
    "name": "Şirket adı",
    "sector": "Sektör",
    "sub_sector": "Alt sektör",
    "description": "Detaylı açıklama (2-3 cümle)",
    "detected_language": "tr | en (Web sitesinin ana dili - içeriğe bakarak tespit et)",
    "tone_of_voice": "İletişim tonu",
    "phone": "+90...",
    "email": "email@...",
    "address": "Tam adres",
    "working_hours": "Çalışma saatleri",
    "social_media": {
      "instagram": "...",
      "facebook": "...",
      "twitter": "...",
      "linkedin": "..."
    },
    "website": "Web sitesi URL"
  },

  "suggested_pages": [
    {
      "url": "https://...",
      "type": "SERVICE_DETAIL | SERVICE_LISTING | PRODUCT_DETAIL | PRODUCT_LISTING | PRICING_PAGE | ABOUT_PAGE",
      "priority": "CRITICAL | HIGH | MEDIUM | LOW",
      "reason": "Neden önerildiği",
      "expected_data": "Beklenen veri",
      "auto_select": true
    }
  ]
}

# SUGGESTED PAGES RULES

⚠️ ÇOK ÖNEMLİ: Bu aşamada offerings ÇIKARMA! Sadece hangi sayfaların taranması gerektiğini belirle.

- MAKSIMUM ${process.env.MAX_PAGES_TO_SCRAPE || '20'} sayfa öner
- CRITICAL: Ana hizmet/ürün listesi sayfaları (SERVICE_LISTING, PRODUCT_LISTING, MENU_PAGE)
- HIGH: Fiyat listesi, Detaylı hizmet/ürün sayfaları
- MEDIUM: Hakkımızda, İletişim, SSS
- LOW: Blog, Haberler
- auto_select: true → CRITICAL ve HIGH öncelikli sayfalar için

SAYFA TİPLERİ:
- SERVICE_LISTING: Birden fazla hizmetin listelendiği sayfa
- SERVICE_DETAIL: Tek bir hizmetin detaylı anlatıldığı sayfa
- PRODUCT_LISTING: Birden fazla ürünün listelendiği sayfa
- PRODUCT_DETAIL: Tek bir ürünün detaylı anlatıldığı sayfa
- MENU_PAGE: Menü/Fiyat listesi sayfası
- PRICING_PAGE: Fiyat listesi sayfası
- CONTACT_PAGE: İletişim sayfası
- ABOUT_PAGE: Hakkımızda sayfası
- FAQ_PAGE: SSS sayfası

# WEB SİTESİ İÇERİĞİ

${truncatedMarkdown}

# MEVCUT LİNKLER

${JSON.stringify(limitedLinks, null, 2)}

ÖNEMLİ KURALLAR:
1. Sitenin ANA FONKSİYONUNA odaklan. Restoran hem masa rezervasyonu hem paket servis yapıyorsa, hangisi daha öncelikliyse ona göre bot_purpose seç.
2. ⚠️ Bu aşamada offerings ÇIKARMA! Sadece suggested_pages döndür.
3. Önce SERVICE_LISTING/PRODUCT_LISTING gibi liste sayfalarını öner
4. Sonra detay sayfalarını öner
5. Son olarak bilgilendirme sayfalarını (İletişim, Hakkımızda) öner
6. MAKSIMUM ${process.env.MAX_PAGES_TO_SCRAPE || '20'} sayfa öner
`;

    try {
      // Use Gemini for better accuracy in onboarding
      const { result, response, text } = await retryGeminiOperation(async () => {
        const result = await this.proModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return { result, response, text };
      }, 'Smart Discovery  API');
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Token usage metadata
      const usageMetadata = response.usageMetadata || {};
      const promptTokens = usageMetadata.promptTokenCount || 0;
      const responseTokens = usageMetadata.candidatesTokenCount || 0;
      const totalTokens = usageMetadata.totalTokenCount || 0;

      // Log data
      const logData = {
        timestamp: new Date().toISOString(),
        method: 'smartDiscovery',
        duration_ms: duration,
        markdown_length: markdown.length,
        truncated_length: truncatedMarkdown.length,
        links_count: links.length,
        tokens: {
          prompt: promptTokens,
          response: responseTokens,
          total: totalTokens
        },
        response_preview: text.substring(0, 500) + '...',
        full_response: text,
        input_data: {
          markdown: truncatedMarkdown,
          links: limitedLinks.map(l => ({ text: '', href: l })) // Links string array olarak geliyor
        }
      };

      // Console output
      console.log(`\n${'='.repeat(100)}`);
      console.log(`🤖 GEMINI SMART DISCOVERY RESPONSE`);
      console.log(`${'='.repeat(100)}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`📊 Tokens: Prompt=${promptTokens} | Response=${responseTokens} | Total=${totalTokens}`);
      console.log(`📝 Response Length: ${text.length} chars`);
      console.log(`\n📄 FULL RESPONSE (Formatted):`);
      console.log(`${'-'.repeat(100)}`);
      
      try {
        const parsed = JSON.parse(this.cleanJson(text));
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(text);
      }
      
      console.log(`${'-'.repeat(100)}`);
      console.log(`${'='.repeat(100)}\n`);

      // Log Gemini API call (Requirements: 16.2)
      logGeminiCall({
        method: 'smartDiscovery',
        timestamp: logData.timestamp,
        duration_ms: duration,
        tokens: logData.tokens,
        response_preview: logData.response_preview,
        full_response: logData.full_response,
        context: {
          markdown_length: markdown.length,
          links_count: links.length
        }
      });
      
      // Also write to file for backward compatibility
      await this.writeLogToFile('smartDiscovery', logData);

      const parsedResult: SmartDiscoveryResult = JSON.parse(this.cleanJson(text));
      
      // Validate and limit suggested pages to MAX_PAGES_TO_SCRAPE
      const maxPages = parseInt(process.env.MAX_PAGES_TO_SCRAPE || '10', 10);
      if (parsedResult.suggested_pages && parsedResult.suggested_pages.length > maxPages) {
        console.warn(`⚠️ Gemini suggested ${parsedResult.suggested_pages.length} pages, limiting to ${maxPages}`);
        parsedResult.suggested_pages = parsedResult.suggested_pages.slice(0, maxPages);
      }

      return parsedResult;
    } catch (error) {
      console.error('Smart Discovery error:', error);
      throw new Error('Failed to perform Smart Discovery with AI');
    }
  }

  /**
   * PHASE 2: Initial Extraction - Extract offerings and find detail links
   * Uses Gemini 2.5 Flash Preview for better accuracy
   * Requirements: 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 6.1-6.8
   */
  async initialExtraction(
    homepageMarkdown: string,
    sectorAnalysis: any,
    companyInfo: any,
    scrapedPages: Array<{ url: string; markdown: string; type: string; links?: any[] }>
  ): Promise<{ 
    company_info_updates: any; 
    offerings: any[];
    offering_detail_links: string[];
    needs_detail_scraping: boolean;
    knowledge_base: any[];
  }> {
    const startTime = Date.now();
    
    // Combine all page content
    const pagesContent = scrapedPages.map((page, index) => {
      const linksSection = page.links && page.links.length > 0
        ? `\n\nMEVCUT LİNKLER:\n${JSON.stringify(page.links.slice(0, 50), null, 2)}`
        : '';
      
      return `
=== SAYFA ${index + 1}: ${page.url} (${page.type}) ===
${page.markdown.substring(0, 15000)}${linksSection}
`;
    }).join('\n\n');
    
    console.log(`📝 Final Extraction: Homepage + ${scrapedPages.length} scraped pages`);
    
    const prompt = `
Sen uzman bir veri çıkarıcısısın. Görevin, ana sayfa ve taranmış sayfalardan veri çıkarmak ve offering detay linklerini bulmak.

SEKTÖR BİLGİSİ:
${JSON.stringify(sectorAnalysis, null, 2)}

MEVCUT FİRMA BİLGİLERİ:
${JSON.stringify(companyInfo, null, 2)}

ANA SAYFA İÇERİĞİ:
${homepageMarkdown.substring(0, 10000)}

TARANAN SAYFALAR (${scrapedPages.length} sayfa):
${pagesContent}

İSTENEN JSON FORMATI:
{
  "company_info_updates": {
    "phone": "Güncellenmiş telefon (varsa)",
    "email": "Güncellenmiş email (varsa)",
    "address": "Güncellenmiş adres (varsa)",
    "working_hours": "Güncellenmiş çalışma saatleri (varsa)",
    "description": "Daha detaylı açıklama (varsa)",
    "social_media": {...}
  },
  "offerings": [
    {
      "name": "Hizmet/Ürün adı",
      "description": "DETAYLI açıklama (sayfada gördüğün TÜM bilgileri ekle)",
      "type": "SERVICE | PRODUCT",
      "price": null veya sayı,
      "currency": "TRY",
      "duration_min": null veya sayı,
      "category": "Kategori",
      "source_url": "https://... (Bu hizmetin/ürünün bulunduğu sayfa)",
      "detail_link": "https://... (Bu hizmetin DETAY sayfası linki - varsa)",
      "confidence_level": "HIGH | MEDIUM | LOW",
      "meta_info": {
        // ⚠️ ÇOK ÖNEMLİ: Sayfada gördüğün TÜM bilgileri buraya ekle!
        // Sektöre özel örnekler:
        ${this.getSectorMetaInfoExamples(sectorAnalysis.sector, sectorAnalysis.business_type)}
      }
    }
  ],
  "offering_detail_links": [
    "https://example.com/dersler/pilates/",
    "https://example.com/dersler/yoga/"
  ],
  "needs_detail_scraping": true,
  "knowledge_base": [
    {
      "category": "FAQ | ABOUT | CONTACT | TEAM | POLICY",
      "title": "Başlık",
      "content": "İçerik özeti",
      "source_url": "https://...",
      "metadata": {}
    }
  ]
}

ÖNEMLİ KURALLAR:

1. OFFERINGS - DETAYLI ÇIKARMA:
   - TÜM offerings'leri çıkar
   - Description'ı DETAYLI yaz (sayfada gördüğün tüm bilgileri ekle)
   - meta_info'yu MUTLAKA doldur (boş bırakma!)
   - Sayfada gördüğün her bilgiyi meta_info'ya ekle:
     * Hedef kitle, seviye, süre, kapasite
     * Faydalar, özellikler, gereksinimler
     * Eğitmen, ekipman, lokasyon bilgileri
   - Her offering için detail_link var mı kontrol et

2. OFFERING_DETAIL_LINKS:
   - Offerings'lerdeki tüm detail_link'leri topla
   - Duplicate'leri temizle
   - Sadece offerings ile ilgili detay sayfaları

3. NEEDS_DETAIL_SCRAPING - AKILLI KARAR:
   - ⚠️ DİKKAT: Detail scraping SADECE offerings için özel detay sayfaları varsa gerekli!
   - Eğer offerings'ler navbar/header'dan çıkarıldıysa ve yeterli bilgi varsa → false
   - Eğer offerings'ler DETAYLI (description > 50 karakter ve meta_info dolu) → false
   - Eğer offerings'ler BASIT (sadece isim) ve detail_link varsa → true
   - Eğer offering_detail_links boş → false
   - VARSAYILAN: false (çoğu durumda detail scraping gereksiz)

4. KNOWLEDGE_BASE - BİLGİ SAYFALARI:
   - ⚠️ ÖNEMLİ: İletişim, Hakkımızda, Şubeler, Franchise gibi sayfalar KNOWLEDGE BASE için!
   - Bu sayfalardan offerings ÇIKARMA!
   - SSS, Hakkımızda, İletişim, Politika, Şubeler, Franchise sayfalarını kategorize et
   - Her sayfa için özet çıkar
   - Chatbot için faydalı bilgileri topla
   - Şube bilgileri, iletişim detayları, firma geçmişi vb.

5. COMPANY_INFO_UPDATES:
   - Sadece YENİ veya DAHA DETAYLI bilgileri ekle

⚠️ ÇOK ÖNEMLİ: 
- Offerings'leri mümkün olduğunca DETAYLI çıkar!
- meta_info'yu BOŞ BIRAKMA!
- Sayfada gördüğün HER bilgiyi ekle!
- Detail scraping sadece offerings gerçekten basitse gerekli!
`;

    try {
      // Use Gemini for better accuracy
      const { result, response, text } = await retryGeminiOperation(async () => {
        const result = await this.proModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return { result, response, text };
      }, 'Final Extraction Gemini ');
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Token usage metadata
      const usageMetadata = response.usageMetadata || {};
      const promptTokens = usageMetadata.promptTokenCount || 0;
      const responseTokens = usageMetadata.candidatesTokenCount || 0;
      const totalTokens = usageMetadata.totalTokenCount || 0;

      // Log data
      const logData = {
        timestamp: new Date().toISOString(),
        method: 'finalExtraction',
        duration_ms: duration,
        pages_count: scrapedPages.length,
        sector: sectorAnalysis.sector,
        tokens: {
          prompt: promptTokens,
          response: responseTokens,
          total: totalTokens
        },
        response_preview: text.substring(0, 500) + '...',
        full_response: text,
        input_data: {
          homepage_length: homepageMarkdown.length,
          pages: scrapedPages.map(p => ({
            url: p.url,
            type: p.type,
            markdown: p.markdown,  // ✅ Markdown içeriğini de kaydet
            markdown_length: p.markdown.length,
            links_count: p.links?.length || 0
          }))
        }
      };

      // Console output
      console.log(`\n${'='.repeat(100)}`);
      console.log(`🤖 GEMINI FINAL EXTRACTION RESPONSE`);
      console.log(`${'='.repeat(100)}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`📊 Tokens: Prompt=${promptTokens} | Response=${responseTokens} | Total=${totalTokens}`);
      console.log(`📄 Pages Processed: ${scrapedPages.length}`);
      console.log(`\n📄 FULL RESPONSE (Formatted):`);
      console.log(`${'-'.repeat(100)}`);
      
      try {
        const parsed = JSON.parse(this.cleanJson(text));
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(text);
      }
      
      console.log(`${'-'.repeat(100)}`);
      console.log(`${'='.repeat(100)}\n`);

      // Log Gemini API call
      logGeminiCall({
        method: 'initialExtraction',
        timestamp: logData.timestamp,
        duration_ms: duration,
        tokens: logData.tokens,
        response_preview: logData.response_preview,
        full_response: logData.full_response,
        context: {
          pages_count: scrapedPages.length,
          sector: sectorAnalysis.sector
        }
      });
      
      // Also write to file for backward compatibility
      await this.writeLogToFile('initialExtraction', logData);

      const parsedResult = JSON.parse(this.cleanJson(text));
      
      // Ensure arrays exist
      parsedResult.offering_detail_links = parsedResult.offering_detail_links || [];
      parsedResult.knowledge_base = parsedResult.knowledge_base || [];
      parsedResult.needs_detail_scraping = parsedResult.needs_detail_scraping || false;

      return parsedResult;
    } catch (error) {
      console.error('Initial extraction error:', error);
      throw new Error('Failed to perform initial extraction with AI');
    }
  }

  /**
   * PHASE 3: Detail Enrichment - Enrich offerings with detail page data
   * Only called if needs_detail_scraping is true
   */
  async detailEnrichment(
    offerings: any[],
    detailPages: Array<{ url: string; markdown: string; links?: any[] }>,
    sectorAnalysis: any
  ): Promise<{ enriched_offerings: any[] }> {
    const startTime = Date.now();
    
    const pagesContent = detailPages.map((page, index) => {
      const linksSection = page.links && page.links.length > 0
        ? `\n\nMEVCUT LİNKLER:\n${JSON.stringify(page.links.slice(0, 50), null, 2)}`
        : '';
      
      return `
=== DETAY SAYFASI ${index + 1}: ${page.url} ===
${page.markdown.substring(0, 15000)}${linksSection}
`;
    }).join('\n\n');
    
    console.log(`📝 Detail Enrichment: ${offerings.length} offerings + ${detailPages.length} detail pages`);
    
    // Sektöre özel meta_info örnekleri
    const sectorExamples = this.getSectorMetaInfoExamples(sectorAnalysis.sector, sectorAnalysis.business_type);
    
    const prompt = `
Sen uzman bir veri zenginleştirme uzmanısın. Görevin, mevcut offerings'leri detay sayfalarından gelen bilgilerle zenginleştirmek.

SEKTÖR: ${sectorAnalysis.sector}
ALT SEKTÖR: ${sectorAnalysis.sub_sector || 'N/A'}
İŞLETME TİPİ: ${sectorAnalysis.business_type}

MEVCUT OFFERINGS:
${JSON.stringify(offerings, null, 2)}

DETAY SAYFALARI (${detailPages.length} sayfa):
${pagesContent}

İSTENEN JSON FORMATI:
{
  "enriched_offerings": [
    {
      "name": "...",
      "description": "Daha detaylı açıklama (detay sayfasından)",
      "type": "SERVICE | PRODUCT",
      "price": sayı (detay sayfasından, yoksa null),
      "currency": "TRY",
      "duration_min": sayı (detay sayfasından, yoksa null),
      "category": "...",
      "source_url": "...",
      "detail_link": "...",
      "confidence_level": "HIGH",
      "meta_info": {
        ${sectorExamples}
      }
    }
  ]
}

ÖNEMLİ KURALLAR:
1. Her offering için ilgili detay sayfasını bul:
   - detail_link ile URL eşleştir
   - Eğer detail_link yoksa, offering name ile sayfa içeriğini eşleştir
2. Detay sayfasından TÜM bilgileri çıkar:
   - Fiyat bilgisi (varsa)
   - Süre bilgisi (varsa)
   - Eğitmen/Uzman bilgisi (varsa)
   - Kapasite/Kişi sayısı (varsa)
   - Hedef kitle (varsa)
   - Faydalar/Özellikler (varsa)
   - Gereksinimler (varsa)
   - Seviye bilgisi (varsa)
   - Ekipman bilgisi (varsa)
   - Lokasyon/Şube bilgisi (varsa)
3. meta_info'yu MUTLAKA doldur:
   - Boş {} BIRAKMA!
   - Detay sayfasında gördüğün HER bilgiyi ekle
   - Yukarıdaki sektör örneklerini referans al
4. description'ı detay sayfasından güncelle (daha detaylı yap)
5. confidence_level'ı HIGH yap (detay sayfası var)
6. Eğer detay sayfası bulunamazsa, mevcut offering'i olduğu gibi bırak

⚠️ ÇOK ÖNEMLİ: 
- meta_info BOŞ BIRAKMA! 
- Detay sayfasında gördüğün HER bilgiyi ekle!
- Sektöre özel alanları kullan!
`;

    try {
      const { result, response, text } = await retryGeminiOperation(async () => {
        const result = await this.proModel.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return { result, response, text };
      }, 'Detail Enrichment Gemini API');
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      const usageMetadata = response.usageMetadata || {};
      const promptTokens = usageMetadata.promptTokenCount || 0;
      const responseTokens = usageMetadata.candidatesTokenCount || 0;
      const totalTokens = usageMetadata.totalTokenCount || 0;

      console.log(`\n${'='.repeat(100)}`);
      console.log(`🤖 GEMINI DETAIL ENRICHMENT RESPONSE`);
      console.log(`${'='.repeat(100)}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`📊 Tokens: Prompt=${promptTokens} | Response=${responseTokens} | Total=${totalTokens}`);
      console.log(`📄 Detail Pages: ${detailPages.length}`);
      console.log(`\n📄 FULL RESPONSE (Formatted):`);
      console.log(`${'-'.repeat(100)}`);
      
      try {
        const parsed = JSON.parse(this.cleanJson(text));
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(text);
      }
      
      console.log(`${'-'.repeat(100)}`);
      console.log(`${'='.repeat(100)}\n`);

      logGeminiCall({
        method: 'detailEnrichment',
        timestamp: new Date().toISOString(),
        duration_ms: duration,
        tokens: {
          prompt: promptTokens,
          response: responseTokens,
          total: totalTokens
        },
        response_preview: text.substring(0, 500) + '...',
        full_response: text,
        context: {
          offerings_count: offerings.length,
          detail_pages_count: detailPages.length,
          sector: sectorAnalysis.sector
        }
      });
      
      await this.writeLogToFile('detailEnrichment', {
        timestamp: new Date().toISOString(),
        method: 'detailEnrichment',
        duration_ms: duration,
        offerings_count: offerings.length,
        detail_pages_count: detailPages.length,
        tokens: {
          prompt: promptTokens,
          response: responseTokens,
          total: totalTokens
        },
        response_preview: text.substring(0, 500) + '...',
        full_response: text
      });

      return JSON.parse(this.cleanJson(text));
    } catch (error) {
      console.error('Detail enrichment error:', error);
      throw new Error('Failed to perform detail enrichment with AI');
    }
  }

  /**
   * Extract offerings from batch of pages
   * @deprecated Use finalExtraction instead for better results
   * Requirements: 4.7, 4.8, 4.9, 4.10, 4.11, 4.12, 6.1-6.8
   */
  async extractOfferings(
    pages: Array<{ url: string; markdown: string; links?: any[] }>,
    sectorAnalysis: { sector: string; sub_sector: string; business_type: string; critical_data_type: string }
  ): Promise<any> {
    const startTime = Date.now();
    
    // Combine all page content with links
    const combinedContent = pages.map((page, index) => {
      const linksSection = page.links && page.links.length > 0
        ? `\n\nMEVCUT LİNKLER:\n${JSON.stringify(page.links.slice(0, 50), null, 2)}`
        : '';
      
      return `
=== SAYFA ${index + 1}: ${page.url} ===
${page.markdown.substring(0, 10000)}${linksSection}
`;
    }).join('\n\n');
    
    console.log(`📝 Extracting offerings from ${pages.length} pages`);
    
    const prompt = `
Sen uzman bir veri çıkarıcısısın. Görevin, verilen sayfalardan hizmet/ürün bilgilerini STANDART EVRENSEL FORMATTA çıkarmak.

SEKTÖR: ${sectorAnalysis.sector}
ALT SEKTÖR: ${sectorAnalysis.sub_sector}
İŞLETME TİPİ: ${sectorAnalysis.business_type}
KRİTİK VERİ TİPİ: ${sectorAnalysis.critical_data_type}

İSTENEN JSON FORMATI:
{
  "offerings": [
    {
      "name": "...",
      "description": "...",
      "type": "SERVICE",
      "price": 500,
      "currency": "TRY",
      "category": "...",
      "source_url": "https://...",
      "confidence_level": "HIGH",
      "meta_info": {}
    }
  ]
}

meta_info İÇİN ESNEK YAKLASIM:

meta_info, sayfada bulduğun HERHANGİ BİR ilgili detayı içerebilir. Sektöre özgü örnekler:

FOOD: calories, allergens, spicy_level, portion_size, preparation_time, vegetarian, vegan
HEALTHCARE: duration, session_count, anesthesia_required, recovery_time, doctor, insurance_covered
REAL_ESTATE: rooms, sqm, floor, building_age, heating, furnished, balcony, parking
BEAUTY: duration, stylist, includes, gender, appointment_required
SERVICE: duration, warranty, includes, emergency_available, service_area, brands
EDUCATION: duration, hours_per_week, total_hours, class_size, level, certificate, instructor

ANCAK bunlarla sınırlı değilsin! Sayfada gördüğün DİĞER ilgili bilgileri de ekle:
- Ürün/hizmet özellikleri
- Teknik detaylar
- Kullanım bilgileri
- Özel notlar
- Herhangi bir faydalı bilgi

ÖNEMLİ KURALLAR:
1. Standart alanlar (name, description, type, price, category) HER ZAMAN AYNI
2. meta_info'ya sayfada MEVCUT olan HERHANGİ BİR ilgili bilgiyi ekle
3. Fiyat yoksa → price: null (0 YAZMA!)
4. meta_info'da sadece MEVCUT bilgileri ekle, UYDURMA!
5. Bilgi yoksa o field'ı ATLA (null koyma!)
6. **source_url ÇOK ÖNEMLİ:** Her offering için MUTLAKA doğru source_url belirt:
   - Eğer hizmet/ürün için MEVCUT LİNKLER listesinde özel bir link varsa, onu kullan
   - Örn: "Kick Boks" için "/ders/22/kick-boks" veya "/kick-boks" linki varsa
   - Eğer özel link yoksa, mevcut sayfa URL'ini kullan
7. confidence_level: HIGH (tam bilgi), MEDIUM (eksik bilgi), LOW (sadece isim)
8. Field isimleri snake_case olmalı (örn: preparation_time, spicy_level)

CONFIDENCE LEVEL KURALLARI:
- HIGH: İsim + Açıklama + Fiyat + Kategori tam
- MEDIUM: İsim + Açıklama var, fiyat veya kategori eksik
- LOW: Sadece isim var

# SAYFA İÇERİKLERİ

${combinedContent}

ÖNEMLİ: Tüm offerings'i çıkar, eksik bırakma!
`;

    try {
      // Retry Gemini API call with 1 retry and 5s delay (Requirements: 13.3)
      const { result, response, text } = await retryGeminiOperation(async () => {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return { result, response, text };
      }, 'Extract Offerings Gemini API');
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Token usage metadata
      const usageMetadata = response.usageMetadata || {};
      const promptTokens = usageMetadata.promptTokenCount || 0;
      const responseTokens = usageMetadata.candidatesTokenCount || 0;
      const totalTokens = usageMetadata.totalTokenCount || 0;

      // Log data
      const logData = {
        timestamp: new Date().toISOString(),
        method: 'extractOfferings',
        duration_ms: duration,
        pages_count: pages.length,
        sector: sectorAnalysis.sector,
        tokens: {
          prompt: promptTokens,
          response: responseTokens,
          total: totalTokens
        },
        response_preview: text.substring(0, 500) + '...',
        full_response: text,
        input_data: {
          pages: pages.map(p => ({
            url: p.url,
            markdown: p.markdown,
            links_count: p.links?.length || 0
          }))
        }
      };

      // Console output
      console.log(`\n${'='.repeat(100)}`);
      console.log(`🤖 GEMINI EXTRACT OFFERINGS RESPONSE`);
      console.log(`${'='.repeat(100)}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`📊 Tokens: Prompt=${promptTokens} | Response=${responseTokens} | Total=${totalTokens}`);
      console.log(`📄 Pages Processed: ${pages.length}`);
      console.log(`\n📄 FULL RESPONSE (Formatted):`);
      console.log(`${'-'.repeat(100)}`);
      
      try {
        const parsed = JSON.parse(this.cleanJson(text));
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        console.log(text);
      }
      
      console.log(`${'-'.repeat(100)}`);
      console.log(`${'='.repeat(100)}\n`);

      // Log Gemini API call (Requirements: 16.2)
      logGeminiCall({
        method: 'extractOfferings',
        timestamp: logData.timestamp,
        duration_ms: duration,
        tokens: logData.tokens,
        response_preview: logData.response_preview,
        full_response: logData.full_response,
        context: {
          pages_count: pages.length,
          sector: sectorAnalysis.sector
        }
      });
      
      // Also write to file for backward compatibility
      await this.writeLogToFile('extractOfferings', logData);

      return JSON.parse(this.cleanJson(text));
    } catch (error) {
      console.error('Offerings extraction error:', error);
      throw new Error('Failed to extract offerings with AI');
    }
  }

  async extractData(markdown: string): Promise<any> {
    // Markdown'ı kısalt (Gemini'nin token limitini aşmamak için)
    const truncatedMarkdown = markdown.length > 15000 
      ? markdown.substring(0, 15000) + '\n\n[İçerik kısaltıldı...]'
      : markdown;
    
    console.log(`📝 Markdown length: ${markdown.length} chars (truncated to ${truncatedMarkdown.length})`);
    
    const startTime = Date.now();
    const prompt = `
      Sen uzman bir veri madencisi ve iş analistisin. Görevin, sana verilen web sitesi içeriğini (Markdown) analiz ederek, bir yapay zeka asistanının (chatbot) eğitimi için gerekli olan yapılandırılmış veriyi çıkarmaktır.
      
      HEDEF: Eksiksiz, detaylı ve sektöre özel veriler çıkarmak.
      
      Aşağıdaki JSON şemasına BİREBİR uymalısın:

      {
        "company_info": {
          "name": "İşletmenin Tam Resmi Adı",
          "description": "İşletmenin ne yaptığı, misyonu ve değer önerisi hakkında detaylı açıklama (En az 2-3 cümle).",
          "sector": "İşletmenin ana sektörü (Örn: Restoran, Güzellik Merkezi, Diş Kliniği, Hukuk Bürosu, E-Ticaret)",
          "detected_language": "Sitenin ana dili (tr, en, de, vb.)",
          "tone_of_voice": "Markanın iletişim dili (Örn: Kurumsal ve Profesyonel, Samimi ve Eğlenceli, Lüks ve Seçkin)",
          "contact": {
            "phone": "+90...",
            "address": "Tam açık adres",
            "email": "info@...",
            "social_media": { 
              "instagram": "...", 
              "facebook": "...",
              "twitter": "...",
              "linkedin": "...",
              "youtube": "...",
              "tiktok": "..."
            }
          }
        },
        "extracted_knowledge": [
          { "key": "working_hours", "value": "Pazartesi-Cuma: 09:00-18:00, Cumartesi: 10:00-14:00" },
          { "key": "payment_methods", "value": "Kredi Kartı, Nakit, Havale" },
          { "key": "cancellation_policy", "value": "Randevu iptalleri en geç 24 saat önceden yapılmalıdır." },
          { "key": "wifi_password", "value": "Müşteriler için wifi şifresi (varsa)" },
          { "key": "parking", "value": "Otopark durumu" }
        ],
        "offerings": [
          {
            "name": "Hizmet/Ürün Adı (Örn: Saç Kesimi, İmplant Tedavisi, Burger Menü)",
            "description": "Bu hizmetin/ürünün detaylı açıklaması. İçerik, süreç ve faydalar.",
            "type": "SERVICE", // Eğer randevu/zaman gerektiriyorsa 'SERVICE', fiziksel bir ürünse 'PRODUCT'
            "price": 0, // Fiyat bulunamazsa 0 yaz. Sadece sayısal değer.
            "currency": "TRY",
            "estimated_duration_minutes": 60, // Hizmet süresi tahmini (dk). Bulunamazsa null.
            "category": "Kategori (Örn: Saç Bakımı, Cerrahi, Ana Yemekler)",
            "attributes": {
              // Sektöre özel dinamik özellikler
              "target_audience": "Kadın/Erkek/Çocuk",
              "ingredients": "İçerik listesi (Yemek ise)",
              "requirements": "Gerekli ön hazırlıklar"
            }
          }
        ]
      }

      KURALLAR:
      1. "offerings" listesi çok önemlidir. Sitedeki TÜM hizmetleri/ürünleri eksiksiz çıkarmaya çalış.
      2. Fiyatlar metin içindeyse (örn: "500 TL'den başlayan fiyatlarla") en düşük rakamı al.
      3. Süre bilgisi yoksa, sektör standartlarına göre mantıklı bir tahmin yapma, null bırak.
      4. "extracted_knowledge" kısmına SSS (Sıkça Sorulan Sorular) bölümündeki bilgileri de ekle.
      5. Markdown içeriğindeki gürültüden (navigasyon, footer linkleri) etkilenme, ana içeriğe odaklan.
      6. price: Sadece yalın RAKAM olmalı (Örn: 500). "500 TL", "Başlayan fiyatlarla" ASLA YAZMA. Bulamazsan null yap.

      İŞTE WEB SİTESİ İÇERİĞİ:
      ${truncatedMarkdown}
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Token kullanımı ve metadata
      const usageMetadata = response.usageMetadata || {};
      const promptTokens = usageMetadata.promptTokenCount || 0;
      const responseTokens = usageMetadata.candidatesTokenCount || 0;
      const totalTokens = usageMetadata.totalTokenCount || 0;

      // Log detayları
      const logData = {
        timestamp: new Date().toISOString(),
        method: 'extractData',
        duration_ms: duration,
        markdown_length: markdown.length,
        truncated_length: truncatedMarkdown.length,
        tokens: {
          prompt: promptTokens,
          response: responseTokens,
          total: totalTokens
        },
        response_preview: text.substring(0, 500) + '...',
        full_response: text
      };

      // Console'a özet yazdır
      console.log(`\n${'='.repeat(100)}`);
      console.log(`🤖 GEMINI EXTRACT DATA RESPONSE`);
      console.log(`${'='.repeat(100)}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`📊 Tokens: Prompt=${promptTokens} | Response=${responseTokens} | Total=${totalTokens}`);
      console.log(`📝 Response Length: ${text.length} chars`);
      console.log(`\n📄 FULL RESPONSE (Formatted):`);
      console.log(`${'-'.repeat(100)}`);
      
      // JSON'u güzel formatlayarak yazdır
      try {
        const parsed = JSON.parse(this.cleanJson(text));
        console.log(JSON.stringify(parsed, null, 2));
      } catch (e) {
        // Parse edilemezse raw text'i yazdır
        console.log(text);
      }
      
      console.log(`${'-'.repeat(100)}`);
      console.log(`${'='.repeat(100)}\n`);

      // Dosyaya detaylı log yaz
      await this.writeLogToFile('extractData', logData);

      return JSON.parse(this.cleanJson(text));
    } catch (error) {
      console.error('AI Extraction error:', error);
      throw new Error('Failed to extract data with AI');
    }
  }

  async analyzeLinks(links: { text: string; href: string }[], rootUrl: string): Promise<{ relevant_links: { url: string; type: string }[] }> {
    const startTime = Date.now();
    const prompt = `
        Sen bir web sitesi stratejistisin. Aşağıdaki link listesini analiz et ve hangilerinin değerli veri sayfası olduğunu belirle.
        
        SAYFA TÜRLERİ:
        1. SERVICE_DETAIL: Tek bir hizmetin detaylı anlatıldığı sayfa
        2. SERVICE_LISTING: Birden fazla hizmetin listelendiği sayfa (Örn: "Hizmetlerimiz", "Tedavilerimiz")
        3. PRODUCT_DETAIL: Tek bir ürünün detaylı anlatıldığı sayfa
        4. PRODUCT_LISTING: Birden fazla ürünün listelendiği sayfa (Örn: "Ürünlerimiz", "Menü")
        5. PRICING_PAGE: Fiyat listesi sayfası (Çok önemli! Bazı sitelerde hizmetler ayrı, fiyatlar ayrı tabloda olur)
        6. KNOWLEDGE_PAGE: KVKK, Gizlilik Politikası, Kullanım Koşulları, İletişim, Hakkımızda gibi bilgi sayfaları
        
        ÖNEMLİ KURALLAR:
        - KVKK, Gizlilik, İletişim, Hakkımızda gibi sayfaları mutlaka KNOWLEDGE_PAGE olarak işaretle
        - Blog, Sepet, Giriş, Kayıt sayfalarını GÖRMEZDEN GEL
        - Fiyat listesi sayfalarını kaçırma!
        
        ÖNEMLİ İPUCU: URL yapısına dikkat et. Genellikle şu URL'ler değerlidir:
        - "/hizmetler/", "/services/", "/tedaviler/", "/treatments/"
        - "/urunler/", "/products/", "/menu/", "/yemekler/"
        - "/fiyatlar/", "/fiyat-listesi/", "/pricing/", "/prices/"
        - "/kvkk/", "/gizlilik/", "/privacy/", "/iletisim/", "/contact/", "/hakkimizda/", "/about/"

        Ana URL: ${rootUrl}

        Link Listesi:
        ${JSON.stringify(links.slice(0, 150))}

        İstenen JSON Formatı:
        {
            "relevant_links": [
                { "url": "https://...", "type": "SERVICE_DETAIL" }, 
                { "url": "https://...", "type": "SERVICE_LISTING" },
                { "url": "https://...", "type": "PRODUCT_DETAIL" },
                { "url": "https://...", "type": "PRICING_PAGE" },
                { "url": "https://...", "type": "KNOWLEDGE_PAGE" }
            ]
        }
        
        ⚠️ ÇOK ÖNEMLİ: MUTLAKA EN FAZLA ${process.env.MAX_PAGES_TO_SCRAPE || 10} ADET LINK SEÇ!
        Daha fazla link seçersen sistem hata verecek. Sadece en değerli ${process.env.MAX_PAGES_TO_SCRAPE || 10} sayfayı seç.
        `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Token kullanımı ve metadata
      const usageMetadata = response.usageMetadata || {};
      const promptTokens = usageMetadata.promptTokenCount || 0;
      const responseTokens = usageMetadata.candidatesTokenCount || 0;
      const totalTokens = usageMetadata.totalTokenCount || 0;

      // Log detayları
      const logData = {
        timestamp: new Date().toISOString(),
        method: 'analyzeLinks',
        duration_ms: duration,
        input_links_count: links.length,
        root_url: rootUrl,
        tokens: {
          prompt: promptTokens,
          response: responseTokens,
          total: totalTokens
        },
        response_preview: text.substring(0, 500) + '...',
        full_response: text,
        parsed_result: null as any
      };

      const parsedResult = JSON.parse(this.cleanJson(text));
      
      // ⚠️ GÜVENLIK: Gemini limiti aşarsa zorla kısalt
      const maxPages = parseInt(process.env.MAX_PAGES_TO_SCRAPE || '10', 10);
      if (parsedResult.relevant_links && parsedResult.relevant_links.length > maxPages) {
        console.warn(`⚠️ Gemini ${parsedResult.relevant_links.length} link seçti ama limit ${maxPages}. İlk ${maxPages} link alınıyor.`);
        parsedResult.relevant_links = parsedResult.relevant_links.slice(0, maxPages);
      }
      
      logData.parsed_result = parsedResult;

      // Console'a özet yazdır
      console.log(`\n${'='.repeat(100)}`);
      console.log(`🤖 GEMINI ANALYZE LINKS RESPONSE`);
      console.log(`${'='.repeat(100)}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`📊 Tokens: Prompt=${promptTokens} | Response=${responseTokens} | Total=${totalTokens}`);
      console.log(`🔗 Input Links: ${links.length}`);
      console.log(`✅ Selected Links: ${parsedResult.relevant_links?.length || 0}`);
      console.log(`\n📄 SELECTED PAGES:`);
      console.log(`${'-'.repeat(100)}`);
      
      // Her linki ayrı satırda göster
      if (parsedResult.relevant_links && parsedResult.relevant_links.length > 0) {
        parsedResult.relevant_links.forEach((link: any, index: number) => {
          console.log(`\n${index + 1}. [${link.type}]`);
          console.log(`   URL: ${link.url}`);
        });
      } else {
        console.log('   Hiç link seçilmedi!');
      }
      
      console.log(`\n${'-'.repeat(100)}`);
      console.log(`${'='.repeat(100)}\n`);

      // Dosyaya detaylı log yaz
      await this.writeLogToFile('analyzeLinks', logData);

      return parsedResult;
    } catch (error) {
      console.error('Link Analysis error:', error);
      return { relevant_links: [] };
    }
  }

  private cleanJson(text: string): string {
    // Remove markdown code blocks if present
    let clean = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    // Find the first '{' and last '}' to be safe
    const firstOpen = clean.indexOf('{');
    const lastClose = clean.lastIndexOf('}');
    if (firstOpen !== -1 && lastClose !== -1) {
      clean = clean.substring(firstOpen, lastClose + 1);
    }
    return clean;
  }

  private async writeLogToFile(method: string, data: any): Promise<void> {
    try {
      // logs klasörünü oluştur (yoksa)
      const logsDir = path.join(process.cwd(), 'logs', 'gemini');
      await fs.mkdir(logsDir, { recursive: true });

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      // 1. JSON formatı (mevcut)
      const jsonFilename = `gemini-${method}-${timestamp}.json`;
      const jsonFilepath = path.join(logsDir, jsonFilename);
      const logContent = {
        ...data,
        markdown_preview: data.markdown_length 
          ? `[${data.markdown_length} characters - see full_response for content]`
          : undefined
      };
      await fs.writeFile(jsonFilepath, JSON.stringify(logContent, null, 2), 'utf-8');
      
      // 2. OKUNAB İLİR TXT formatı (YENİ!)
      const txtFilename = `gemini-${method}-${timestamp}.txt`;
      const txtFilepath = path.join(logsDir, txtFilename);
      
      let txtContent = '';
      txtContent += '='.repeat(80) + '\n';
      txtContent += `GEMINI API LOG: ${method}\n`;
      txtContent += '='.repeat(80) + '\n\n';
      
      txtContent += `📅 Timestamp: ${data.timestamp}\n`;
      txtContent += `⏱️  Duration: ${data.duration_ms}ms\n`;
      txtContent += `📊 Tokens: Prompt=${data.tokens?.prompt || 0} | Response=${data.tokens?.response || 0} | Total=${data.tokens?.total || 0}\n\n`;
      
      if (data.markdown_length) {
        txtContent += `📝 Input Markdown Length: ${data.markdown_length} chars\n`;
        txtContent += `📝 Truncated Length: ${data.truncated_length} chars\n`;
      }
      
      if (data.links_count) {
        txtContent += `🔗 Links Count: ${data.links_count}\n`;
      }
      
      if (data.pages_count) {
        txtContent += `📄 Pages Processed: ${data.pages_count}\n`;
      }
      
      if (data.sector) {
        txtContent += `🏢 Sector: ${data.sector}\n`;
      }
      
      // PUPPETEER INPUT (Gemini'ye gönderilen veri)
      if (data.input_data) {
        txtContent += '\n' + '='.repeat(80) + '\n';
        txtContent += '📥 PUPPETEER → GEMINI INPUT\n';
        txtContent += '='.repeat(80) + '\n\n';
        
        if (data.input_data.markdown) {
          txtContent += '--- MARKDOWN CONTENT ---\n';
          txtContent += data.input_data.markdown.substring(0, 2000); // İlk 2000 karakter
          if (data.input_data.markdown.length > 2000) {
            txtContent += `\n\n... [${data.input_data.markdown.length - 2000} more characters] ...\n`;
          }
          txtContent += '\n\n';
        }
        
        if (data.input_data.links && data.input_data.links.length > 0) {
          txtContent += '--- LINKS (Navbar öncelikli) ---\n';
          data.input_data.links.slice(0, 50).forEach((link: any, i: number) => {
            txtContent += `${i + 1}. ${link.text || '[no text]'}\n   → ${link.href}\n`;
          });
          if (data.input_data.links.length > 50) {
            txtContent += `\n... [${data.input_data.links.length - 50} more links] ...\n`;
          }
          txtContent += '\n';
        }
        
        if (data.input_data.pages) {
          txtContent += '--- SCRAPED PAGES ---\n';
          data.input_data.pages.forEach((page: any, i: number) => {
            txtContent += `\n${'='.repeat(80)}\n`;
            txtContent += `📄 PAGE ${i + 1}: ${page.url}\n`;
            txtContent += `${'='.repeat(80)}\n`;
            txtContent += `Type: ${page.type || 'N/A'}\n`;
            txtContent += `Markdown Length: ${page.markdown?.length || 0} chars\n`;
            txtContent += `Links Count: ${page.links_count || 0}\n`;
            txtContent += `\n--- MARKDOWN CONTENT ---\n`;
            if (page.markdown && page.markdown.length > 0) {
              // İlk 2000 karakter göster
              txtContent += page.markdown.substring(0, 2000);
              if (page.markdown.length > 2000) {
                txtContent += `\n\n... [${page.markdown.length - 2000} more characters] ...\n`;
              }
            } else {
              txtContent += '⚠️ MARKDOWN BOŞ! (Puppeteer scraping başarısız olabilir)\n';
            }
            txtContent += '\n';
          });
          txtContent += '\n';
        }
      }
      
      txtContent += '\n' + '='.repeat(80) + '\n';
      txtContent += '📤 GEMINI → OUTPUT RESPONSE\n';
      txtContent += '='.repeat(80) + '\n\n';
      
      // Full response'u güzel formatlayarak yaz
      if (data.full_response) {
        try {
          const parsed = JSON.parse(data.full_response);
          txtContent += this.formatObjectReadable(parsed, 0);
        } catch (e) {
          txtContent += data.full_response;
        }
      }
      
      txtContent += '\n\n' + '='.repeat(80) + '\n';
      txtContent += 'END OF LOG\n';
      txtContent += '='.repeat(80) + '\n';
      
      await fs.writeFile(txtFilepath, txtContent, 'utf-8');
      console.log(`📁 Logs saved: ${jsonFilename} + ${txtFilename}`);
    } catch (error) {
      console.error('Failed to write log file:', error);
    }
  }
  
  /**
   * Validate and finalize offerings from listing page
   * Cross-checks with homepage offerings and ensures accuracy
   * Requirements: Data validation and quality assurance
   */
  async validateListingOfferings(
    listingOfferings: any[],
    homepageOfferings: any[],
    sectorAnalysis: { sector: string; sub_sector: string; business_type: string; bot_purpose: string }
  ): Promise<{ validated_offerings: any[]; validation_notes: string }> {
    const startTime = Date.now();
    
    console.log(`🔍 Validating ${listingOfferings.length} listing offerings against ${homepageOfferings.length} homepage offerings`);
    
    const prompt = `
Sen uzman bir veri doğrulama uzmanısın. Görevin, bir hizmet/ürün listeleme sayfasından çıkarılan offerings'leri doğrulamak ve homepage'den gelen offerings'lerle karşılaştırmak.

SEKTÖR BİLGİSİ:
- Sektör: ${sectorAnalysis.sector}
- Alt Sektör: ${sectorAnalysis.sub_sector}
- İşletme Tipi: ${sectorAnalysis.business_type}
- Bot Amacı: ${sectorAnalysis.bot_purpose}

LİSTELEME SAYFASINDAN ÇIKARILAN OFFERİNGS (DOĞRU VERİ):
${JSON.stringify(listingOfferings, null, 2)}

HOMEPAGE'DEN ÇIKARILAN OFFERİNGS (REFERANS):
${JSON.stringify(homepageOfferings, null, 2)}

GÖREV:
1. Listeleme sayfasındaki offerings'leri DOĞRULA
2. Her offering'in doğru kategoride olduğunu kontrol et:
   - SERVICE: Hizmetler (oda, tedavi, ders, danışmanlık, vb.)
   - PRODUCT: Fiziksel ürünler (tişört, telefon, yemek, vb.)
   - Eğer bir offering "ek hizmet" ise (oda süsleme, ekstra bagaj, vb.), bunu meta_info'da belirt
3. Homepage offerings'leriyle karşılaştır:
   - ÖNEMLİ: Listeleme sayfası sadece BELİRLİ BİR KATEGORİYİ içerir (örn: sadece grup dersleri veya sadece ürünler)
   - Homepage'deki DİĞER KATEGORİLERDEKİ offerings'leri KORUMALISIN
   - Örnek: Eğer listing page "grup dersleri" içeriyorsa, homepage'deki "personal training", "havuz", "beslenme" gibi offerings'leri SİLME
   - Sadece AYNI KATEGORİDEKİ offerings'leri karşılaştır
4. Her offering için source_url'in DOĞRU olduğunu kontrol et
5. Duplicate kontrolü yap (sadece URL bazlı)

ÖNEMLİ KURAL:
- Listeleme sayfası genellikle TEK BİR KATEGORİYİ içerir (örn: sadece dersler, sadece ürünler, sadece odalar)
- Homepage'deki FARKLI KATEGORİLERDEKİ offerings'leri validated_offerings'e EKLE
- Sadece AYNI KATEGORİDEKİ offerings'leri karşılaştır ve güncelle

ÇIKTI FORMATI:
{
  "validated_offerings": [
    {
      "name": "...",
      "description": "...",
      "type": "SERVICE" veya "PRODUCT",
      "price": null veya sayı,
      "currency": "TRY",
      "category": "...",
      "source_url": "https://...",
      "confidence_level": "HIGH",
      "meta_info": {
        "is_addon_service": true/false,  // Ek hizmet mi?
        "offering_category": "main_service" veya "addon_service" veya "product",
        ... diğer meta bilgiler
      }
    }
  ],
  "validation_notes": "Doğrulama süreci hakkında kısa not (hangi offerings eklendi/çıkarıldı/düzeltildi)"
}

ÖNEMLİ KURALLAR:
1. Listeleme sayfasındaki offerings'ler %100 doğrudur, bunları KORU
2. Homepage'deki offerings'leri sadece REFERANS olarak kullan
3. Duplicate kontrolü SADECE URL bazlı yap
4. type field'ını doğru belirle (SERVICE vs PRODUCT)
5. Ek hizmetleri meta_info'da işaretle
6. validation_notes'da yaptığın değişiklikleri açıkla
`;

    try {
      const { result, response, text } = await retryGeminiOperation(async () => {
        const result = await this.model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        return { result, response, text };
      }, 'Validate Listing Offerings Gemini API');
      
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Token usage metadata
      const usageMetadata = response.usageMetadata || {};
      const promptTokens = usageMetadata.promptTokenCount || 0;
      const responseTokens = usageMetadata.candidatesTokenCount || 0;
      const totalTokens = usageMetadata.totalTokenCount || 0;

      console.log(`\n${'='.repeat(100)}`);
      console.log(`🤖 GEMINI VALIDATE OFFERINGS RESPONSE`);
      console.log(`${'='.repeat(100)}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`📊 Tokens: Prompt=${promptTokens} | Response=${responseTokens} | Total=${totalTokens}`);
      console.log(`\n📄 VALIDATION RESULT:`);
      console.log(`${'-'.repeat(100)}`);
      
      const parsed = JSON.parse(this.cleanJson(text));
      console.log(JSON.stringify(parsed, null, 2));
      console.log(`${'-'.repeat(100)}`);
      console.log(`${'='.repeat(100)}\n`);

      // Log Gemini API call
      logGeminiCall({
        method: 'validateListingOfferings',
        timestamp: new Date().toISOString(),
        duration_ms: duration,
        tokens: {
          prompt: promptTokens,
          response: responseTokens,
          total: totalTokens
        },
        response_preview: text.substring(0, 500) + '...',
        full_response: text,
        context: {
          listing_count: listingOfferings.length,
          homepage_count: homepageOfferings.length,
          sector: sectorAnalysis.sector
        }
      });

      return parsed;
    } catch (error) {
      console.error('Validation error:', error);
      // Fallback: return original listings if validation fails
      return {
        validated_offerings: listingOfferings,
        validation_notes: 'Validation failed, using original listings'
      };
    }
  }

  /**
   * Get sector-specific meta_info examples for better Gemini extraction
   */
  private getSectorMetaInfoExamples(sector: string, businessType: string): string {
    const sectorLower = sector.toLowerCase();
    const businessLower = businessType.toLowerCase();
    
    // FITNESS / GYM
    if (sectorLower.includes('fitness') || sectorLower.includes('spor') || businessLower.includes('fitness')) {
      return `
        // Fitness/Spor için örnekler:
        "instructor": "Eğitmen adı",
        "capacity": 15,
        "difficulty_level": "Beginner | Intermediate | Advanced",
        "duration_min": 60,
        "target_audience": "Kadın | Erkek | Herkes",
        "equipment_needed": "Mat, Dumbbell, vb.",
        "calories_burned": 400,
        "muscle_groups": ["Bacak", "Karın", "Kol"],
        "benefits": ["Yağ yakımı", "Kas gelişimi"],
        "requirements": "Özel gereksinim yoksa boş bırak"
      `;
    }
    
    // HEALTHCARE
    if (sectorLower.includes('sağlık') || sectorLower.includes('klinik') || sectorLower.includes('diş') || businessLower.includes('healthcare')) {
      return `
        // Sağlık/Klinik için örnekler:
        "doctor": "Doktor adı",
        "duration_min": 30,
        "session_count": 1,
        "anesthesia_required": true/false,
        "recovery_time": "1 gün",
        "insurance_covered": true/false,
        "age_restriction": "18+",
        "preparation_required": "Açlık gerekli",
        "follow_up_required": true/false
      `;
    }
    
    // FOOD / RESTAURANT
    if (sectorLower.includes('restoran') || sectorLower.includes('yemek') || sectorLower.includes('food') || businessLower.includes('food')) {
      return `
        // Restoran/Yemek için örnekler:
        "calories": 450,
        "allergens": ["Gluten", "Süt"],
        "spicy_level": "Hafif | Orta | Acı",
        "portion_size": "Büyük",
        "preparation_time": "15 dakika",
        "vegetarian": true/false,
        "vegan": true/false,
        "ingredients": ["Domates", "Peynir"]
      `;
    }
    
    // BEAUTY / SALON
    if (sectorLower.includes('kuaför') || sectorLower.includes('güzellik') || businessLower.includes('beauty')) {
      return `
        // Güzellik/Kuaför için örnekler:
        "stylist": "Stilist adı",
        "duration_min": 90,
        "includes": ["Yıkama", "Kesim", "Fön"],
        "gender": "Kadın | Erkek | Unisex",
        "appointment_required": true/false,
        "products_used": ["Loreal", "Wella"]
      `;
    }
    
    // REAL ESTATE
    if (sectorLower.includes('emlak') || businessLower.includes('real_estate')) {
      return `
        // Emlak için örnekler:
        "rooms": 3,
        "sqm": 120,
        "floor": 5,
        "building_age": 10,
        "heating": "Kombi",
        "furnished": true/false,
        "balcony": true/false,
        "parking": true/false,
        "location": "Kadıköy, İstanbul"
      `;
    }
    
    // HOSPITALITY / HOTEL
    if (sectorLower.includes('otel') || sectorLower.includes('hotel') || businessLower.includes('hospitality')) {
      return `
        // Otel için örnekler:
        "capacity": 2,
        "bed_type": "King Size | Twin",
        "view": "Deniz | Şehir | Bahçe",
        "sqm": 35,
        "floor": 3,
        "amenities": ["Minibar", "TV", "Klima"],
        "breakfast_included": true/false,
        "cancellation_policy": "24 saat önceden"
      `;
    }
    
    // EDUCATION
    if (sectorLower.includes('eğitim') || businessLower.includes('education')) {
      return `
        // Eğitim için örnekler:
        "duration_hours": 40,
        "hours_per_week": 4,
        "total_weeks": 10,
        "class_size": 15,
        "level": "Beginner | Intermediate | Advanced",
        "certificate": true/false,
        "instructor": "Eğitmen adı",
        "online_available": true/false
      `;
    }
    
    // DEFAULT
    return `
        // Genel örnekler (sektöre özel bilgileri ekle):
        "duration_min": 60,
        "capacity": 10,
        "target_audience": "Hedef kitle",
        "requirements": "Gereksinimler",
        "benefits": ["Fayda 1", "Fayda 2"],
        "includes": ["Dahil olan 1", "Dahil olan 2"]
      `;
  }

  /**
   * Format object in readable way (alt alta)
   */
  private formatObjectReadable(obj: any, indent: number = 0): string {
    const spaces = '  '.repeat(indent);
    let result = '';
    
    if (Array.isArray(obj)) {
      result += '[\n';
      obj.forEach((item, index) => {
        result += spaces + '  ' + this.formatObjectReadable(item, indent + 1);
        if (index < obj.length - 1) result += ',';
        result += '\n';
      });
      result += spaces + ']';
    } else if (typeof obj === 'object' && obj !== null) {
      result += '{\n';
      const keys = Object.keys(obj);
      keys.forEach((key, index) => {
        result += spaces + '  ' + key + ': ';
        const value = obj[key];
        if (typeof value === 'object' && value !== null) {
          result += this.formatObjectReadable(value, indent + 1);
        } else if (typeof value === 'string') {
          result += '"' + value + '"';
        } else {
          result += String(value);
        }
        if (index < keys.length - 1) result += ',';
        result += '\n';
      });
      result += spaces + '}';
    } else if (typeof obj === 'string') {
      result += '"' + obj + '"';
    } else {
      result += String(obj);
    }
    
    return result;
  }

  /**
   * Extract company info updates from contact/about pages
   * NEW method for OTHER_PAGES_SCRAPING phase
   */
  async extractCompanyInfoUpdates(
    pages: Array<{ url: string; markdown: string; type: string }>,
    existingCompanyInfo: any
  ): Promise<any> {
    const startTime = Date.now();

    const pagesContent = pages.map(p => `
=== PAGE: ${p.url} (${p.type}) ===
${p.markdown}
`).join('\n\n');

    const prompt = `
Sen uzman bir veri madencisisin. Görevin, iletişim, hakkımızda ve diğer bilgilendirme sayfalarından 
firma bilgilerini çıkarmak ve mevcut bilgileri güncellemek.

MEVCUT FİRMA BİLGİLERİ:
${JSON.stringify(existingCompanyInfo, null, 2)}

TARANAN SAYFALAR:
${pagesContent}

İSTENEN JSON FORMATI (sadece yeni/güncellenmiş alanları döndür):
{
  "phone": "Telefon numarası (varsa)",
  "email": "E-posta adresi (varsa)",
  "address": "Adres (varsa)",
  "working_hours": "Çalışma saatleri (varsa)",
  "social_media": {
    "instagram": "URL",
    "facebook": "URL",
    "twitter": "URL",
    "linkedin": "URL"
  },
  "description": "Firma açıklaması (daha detaylı varsa güncelle)"
}

⚠️ ÖNEMLİ:
- Sadece yeni veya daha detaylı bilgileri döndür
- Mevcut bilgiler yeterliyse boş obje döndür: {}
- Sosyal medya linklerini tam URL olarak ver
- Telefon numarasını uluslararası formatta ver (+90...)
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const endTime = Date.now();
      const duration = endTime - startTime;

      const usageMetadata = response.usageMetadata || {};
      const promptTokens = usageMetadata.promptTokenCount || 0;
      const responseTokens = usageMetadata.candidatesTokenCount || 0;
      const totalTokens = usageMetadata.totalTokenCount || 0;

      console.log(`\n${'='.repeat(100)}`);
      console.log(`🤖 GEMINI COMPANY INFO UPDATES RESPONSE`);
      console.log(`${'='.repeat(100)}`);
      console.log(`⏱️  Duration: ${duration}ms`);
      console.log(`📊 Tokens: Prompt=${promptTokens} | Response=${responseTokens} | Total=${totalTokens}`);
      console.log(`📄 Pages Analyzed: ${pages.length}`);
      console.log(`\n📝 RESPONSE:`);
      console.log(`${'-'.repeat(100)}`);
      console.log(text);
      console.log(`${'-'.repeat(100)}`);
      console.log(`${'='.repeat(100)}\n`);

      const logData = {
        timestamp: new Date().toISOString(),
        method: 'extractCompanyInfoUpdates',
        duration_ms: duration,
        pages_count: pages.length,
        tokens: {
          prompt: promptTokens,
          response: responseTokens,
          total: totalTokens
        },
        full_response: text
      };

      await this.writeLogToFile('extractCompanyInfoUpdates', logData);

      return JSON.parse(this.cleanJson(text));
    } catch (error) {
      console.error('Company info extraction error:', error);
      return {};
    }
  }
}
