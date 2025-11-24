/**
 * Smart Onboarding V2 Type Definitions
 * 
 * This file contains all core interfaces and enums for the Smart Onboarding V2 system.
 * Requirements: 1.4, 2.1-2.8
 */

// ============================================================================
// KNOWLEDGE BASE
// ============================================================================

/**
 * Knowledge base item for chatbot context
 * Extracted from FAQ, About, Contact, Policy pages
 */
export interface KnowledgeBaseItem {
  category: 'FAQ' | 'ABOUT' | 'CONTACT' | 'TEAM' | 'POLICY' | 'OTHER';
  title: string;
  content: string;
  source_url: string;
  metadata?: Record<string, any>;
}

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Business sector categories for classification
 * Used to determine appropriate chatbot behavior and system prompt rules
 */
export enum BusinessType {
  HEALTHCARE = 'HEALTHCARE',
  FOOD = 'FOOD',
  REAL_ESTATE = 'REAL_ESTATE',
  LEGAL = 'LEGAL',
  BEAUTY = 'BEAUTY',
  EDUCATION = 'EDUCATION',
  RETAIL = 'RETAIL',
  SERVICE = 'SERVICE',
  AUTOMOTIVE = 'AUTOMOTIVE',
  FINANCE = 'FINANCE',
  HOSPITALITY = 'HOSPITALITY',
  FITNESS = 'FITNESS',
  ENTERTAINMENT = 'ENTERTAINMENT',
  OTHER = 'OTHER'
}

/**
 * Primary purpose/goal of the chatbot
 * Determines terminology and conversation flow
 * 
 * - APPOINTMENT: Person-to-person meetings (healthcare, beauty, consulting)
 * - RESERVATION: Space/asset rental (hotels, restaurants, venues)
 * - BOOKING: Event/travel tickets (cinema, concerts, flights)
 * - ORDER: Physical product sales (e-commerce, food delivery)
 * - LEAD: Lead generation and consultation requests
 * - INFO: Information-only chatbot
 * - SUPPORT: Technical support and troubleshooting
 */
export enum BotPurpose {
  APPOINTMENT = 'APPOINTMENT',
  RESERVATION = 'RESERVATION',
  BOOKING = 'BOOKING',
  ORDER = 'ORDER',
  LEAD = 'LEAD',
  INFO = 'INFO',
  SUPPORT = 'SUPPORT'
}

/**
 * Type of critical data to extract from website
 * Guides the scraping and extraction strategy
 */
export enum CriticalDataType {
  SERVICES = 'SERVICES',
  PRODUCTS = 'PRODUCTS',
  MENU = 'MENU',
  PORTFOLIO = 'PORTFOLIO'
}

/**
 * Confidence level for extracted data
 */
export enum ConfidenceLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

/**
 * Priority level for suggested pages
 */
export enum PagePriority {
  CRITICAL = 'CRITICAL',
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

// ============================================================================
// CORE INTERFACES
// ============================================================================

/**
 * Sector analysis result from Smart Discovery
 * Contains business classification and chatbot configuration
 */
export interface SectorAnalysis {
  sector: string;
  sub_sector: string;
  business_type: BusinessType;
  bot_purpose: BotPurpose;
  critical_data_type: CriticalDataType;
  bot_personality: string;
  expected_user_intent: string[];
  recommended_features: string[];
}

/**
 * Company information extracted from website
 * Extended version with additional fields for Smart Onboarding V2
 */
export interface CompanyInfoV2 {
  name: string;
  sector?: string;
  sub_sector?: string;
  description?: string;
  detected_language?: string;
  tone_of_voice?: string;
  phone?: string;
  email?: string;
  address?: string;
  working_hours?: string;
  social_media?: Record<string, string>;
  website?: string;
}

/**
 * Flexible offering structure with sector-specific meta_info
 * Supports different attribute schemas based on business_type
 */
export interface Offering {
  id?: string;
  tenant_id?: string;
  name: string;
  description?: string;
  type: 'SERVICE' | 'PRODUCT';
  price?: number;
  currency?: string;
  duration_min?: number;
  category?: string;
  image_url?: string;
  is_available?: boolean;
  source_url?: string;
  confidence_level?: ConfidenceLevel;
  meta_info?: MetaInfo;
  created_at?: string;
  updated_at?: string;
}

/**
 * Flexible metadata for offerings
 * Stored in JSONB attributes column in database
 * 
 * AI discovers and adds any relevant fields from website.
 * Users can manually add custom fields.
 * No predefined schema - fully flexible.
 */
export type MetaInfo = Record<string, any> & {
  _custom_fields?: CustomFieldMetadata[];
};

/**
 * Metadata about custom fields added by users
 */
export interface CustomFieldMetadata {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  added_by: 'ai' | 'user';
  added_at: string;
  updated_at?: string;
}

// ============================================================================
// COMMON META_INFO FIELD EXAMPLES (For Documentation & Suggestions)
// ============================================================================
// These are NOT enforced schemas, just examples of commonly found fields
// AI will discover and add whatever it finds on the website
// Users can add any custom fields they want

/**
 * Common fields for HEALTHCARE offerings (examples only)
 * - duration, session_count, doctor, insurance_covered, recovery_time
 */

/**
 * Common fields for FOOD offerings (examples only)
 * - calories, allergens, spicy_level, portion_size, preparation_time, vegetarian, vegan
 */

/**
 * Common fields for REAL_ESTATE offerings (examples only)
 * - rooms, sqm, floor, total_floors, building_age, heating, furnished, balcony, parking
 */

/**
 * Common fields for BEAUTY offerings (examples only)
 * - duration, stylist, includes, gender, appointment_required, guarantee_period
 */

/**
 * Common fields for SERVICE offerings (examples only)
 * - duration, warranty, includes, emergency_available, service_area, brands
 */

/**
 * Common fields for EDUCATION offerings (examples only)
 * - duration, hours_per_week, total_hours, class_size, level, certificate, online_available, instructor
 */

/**
 * Suggested page for additional scraping
 * Returned by Smart Discovery with AI reasoning
 */
export interface SuggestedPage {
  url: string;
  type: string;
  priority: PagePriority;
  reason: string;
  expected_data: string;
  auto_select: boolean;
  scraped?: boolean; // Internal flag to track if page was pre-scraped
}

// ============================================================================
// ONBOARDING WORKFLOW
// ============================================================================

/**
 * Onboarding workflow phases
 * Represents the state machine for the onboarding process
 */
export type OnboardingPhase = 
  | 'SMART_DISCOVERY'
  | 'SMART_PAGE_SELECTION'
  | 'OFFERING_PAGES_SCRAPING'  // Scrape selected pages and extract offerings
  | 'WAITING_APPROVAL'          // User reviews all data (company info + offerings + pages)
  | 'COMPLETION';

/**
 * Onboarding job tracking
 * Stores progress and data for each phase
 */
export interface OnboardingJob {
  id: string;
  tenant_id?: string;
  user_id: string;
  url: string;
  current_phase: OnboardingPhase;
  phase_data: PhaseData;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  error_log?: ErrorLog[];
  created_at: string;
  updated_at: string;
}

/**
 * Data stored for each phase of onboarding
 */
export interface PhaseData {
  SMART_DISCOVERY?: SmartDiscoveryResult;
  SMART_PAGE_SELECTION?: SmartPageSelectionData;
  OFFERING_PAGES_SCRAPING?: OfferingPagesScrapingResult;  // NEW
  OFFERING_DETAIL_REVIEW?: OfferingDetailReviewData;      // NEW
  OTHER_PAGES_SCRAPING?: OtherPagesScrapingResult;         // NEW
  COMPANY_INFO_REVIEW?: CompanyInfoV2;
  OFFERING_SELECTION?: OfferingSelectionData;
  COMPLETION?: CompletionData;
}

/**
 * Result from Smart Discovery phase (Phase 1) - NEW 2-REQUEST FLOW
 * NO OFFERINGS here - only page suggestions
 */
export interface SmartDiscoveryResult {
  sector_analysis: SectorAnalysis;
  company_info: CompanyInfoV2;
  suggested_pages: SuggestedPage[];
  // NOTE: offerings removed - will be extracted in finalExtraction phase
  // homepage_markdown stored internally for finalExtraction
}

/**
 * Data from Smart Page Selection phase (Phase 2)
 */
export interface SmartPageSelectionData {
  selected_pages: SuggestedPage[];
  skipped: boolean;
}

/**
 * Result from Batch Deep Dive phase (Phase 3)
 */
export interface BatchDeepDiveResult {
  offerings: Offering[];
  processed_pages: string[];
  failed_pages?: Array<{
    url: string;
    error: string;
  }>;
}

/**
 * Result from Offering Pages Scraping phase (NEW 3-REQUEST HYBRID FLOW)
 * Scrapes pages, extracts initial data, and enriches if needed
 */
export interface OfferingPagesScrapingResult {
  offerings: Offering[];
  company_info_updates?: Partial<CompanyInfoV2>;
  knowledge_base?: KnowledgeBaseItem[];
  processed_pages: string[];
  failed_pages?: Array<{
    url: string;
    error: string;
  }>;
}

/**
 * Data from Offering Detail Review phase (NEW)
 * User reviews and approves detailed offerings
 */
export interface OfferingDetailReviewData {
  reviewed_offerings: Offering[];
  approved: boolean;
}

/**
 * Result from Other Pages Scraping phase (NEW)
 * Scrapes contact, about, and other informational pages
 */
export interface OtherPagesScrapingResult {
  company_info_updates?: Partial<CompanyInfoV2>;
  processed_pages: string[];
  failed_pages?: Array<{
    url: string;
    error: string;
  }>;
}

/**
 * Data from Offering Selection phase (Phase 5)
 */
export interface OfferingSelectionData {
  selected_offerings: Offering[];
  total_count: number;
}

/**
 * Data from Completion phase (Phase 6)
 */
export interface CompletionData {
  tenant_id: string;
  system_prompt: string;
  total_offerings: number;
  completion_time: string;
}

/**
 * Error log entry
 */
export interface ErrorLog {
  timestamp: string;
  phase: OnboardingPhase;
  error_type: string;
  message: string;
  stack_trace?: string;
  context?: Record<string, any>;
}

// ============================================================================
// SCRAPING & EXTRACTION
// ============================================================================

/**
 * Scraped page data
 */
export interface ScrapedPage {
  url: string;
  markdown: string;
  links: string[];
  scraped_at: Date;
  success: boolean;
  error?: string;
}

/**
 * Batch processing group
 */
export interface PageBatch {
  batch_number: number;
  pages: SuggestedPage[];
}

/**
 * Offerings extraction result from batch processing
 */
export interface OfferingsExtractionResult {
  offerings: Offering[];
  source_url: string;
}

/**
 * Duplicate detection result
 */
export interface DuplicateDetectionResult {
  duplicates: DuplicateGroup[];
  unique_offerings: Offering[];
}

/**
 * Group of duplicate offerings
 */
export interface DuplicateGroup {
  group: Array<{
    id?: number;
    name: string;
    source: string;
  }>;
  recommendation: 'MERGE' | 'KEEP_BOTH' | 'KEEP_FIRST' | 'KEEP_SECOND';
  reason: string;
  suggested_merge?: Offering;
}

// ============================================================================
// SYSTEM PROMPT GENERATION
// ============================================================================

/**
 * Data required for system prompt generation
 */
export interface SystemPromptData {
  company_name: string;
  sector: string;
  sub_sector?: string;
  description?: string;
  language: string;
  tone: string;
  business_type: BusinessType;
  bot_purpose: BotPurpose;
  critical_data_type: CriticalDataType;
  bot_personality: string;
  expected_user_intent: string[];
  offerings: Offering[];
  company_info: {
    phone?: string;
    email?: string;
    address?: string;
    working_hours?: string;
    social_media?: Record<string, string>;
  };
  custom_instructions?: string;
}

/**
 * Runtime variables for system prompt injection
 */
export interface RuntimeVariables {
  current_time: string;
  current_day: string;
  timezone: string;
}
