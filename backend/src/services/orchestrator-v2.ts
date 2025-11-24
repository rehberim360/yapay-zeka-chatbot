/**
 * Orchestrator Service - Smart Onboarding V2
 * 
 * Manages the complete onboarding workflow state machine:
 * SMART_DISCOVERY → SMART_PAGE_SELECTION → BATCH_DEEP_DIVE → 
 * COMPANY_INFO_REVIEW → OFFERING_SELECTION → COMPLETION
 * 
 * Requirements: 12.1-12.10, 13.8, 13.9
 */

import { supabase } from '../lib/supabase.js';
import { ScraperService } from './scraper.js';
import { AiExtractorService } from './ai-extractor.js';
import { DuplicateDetector } from './duplicate-detector.js';
import { groupIntoBatches } from '../utils/batch-processor.js';
import { retryDatabaseOperation } from '../utils/database-retry.js';
import { 
  logPhaseCompletion, 
  logOnboardingCompletion, 
  logError,
  type PhaseLogData,
  type OnboardingCompletionLogData 
} from '../utils/logger.js';
import type {
  OnboardingJob,
  OnboardingPhase,
  PhaseData,
  SmartDiscoveryResult,
  SmartPageSelectionData,
  OfferingPagesScrapingResult,
  OfferingDetailReviewData,
  OtherPagesScrapingResult,
  CustomFieldMetadata,
  CompanyInfoV2,
  OfferingSelectionData,
  CompletionData,
  ErrorLog,
  SuggestedPage,
  Offering
} from '../types/onboarding-v2.js';
import { ConfidenceLevel, PagePriority } from '../types/onboarding-v2.js';

export class OrchestratorServiceV2 {
  private scraper: ScraperService;
  private ai: AiExtractorService;
  private duplicateDetector: DuplicateDetector;
  // private promptBuilder: SystemPromptBuilder;

  constructor() {
    this.scraper = new ScraperService();
    this.ai = new AiExtractorService();
    this.duplicateDetector = new DuplicateDetector();
    
    console.log(`🔧 Scraper: Puppeteer (improved)`);
    
    // SystemPromptBuilder will be implemented later
    // this.promptBuilder = new SystemPromptBuilder();
  }

  /**
   * Start a new onboarding process
   * Creates onboarding_jobs record and begins Smart Discovery phase
   * 
   * Requirements: 12.1, 13.8
   */
  async startOnboarding(url: string, userId: string, tenantId?: string): Promise<OnboardingJob> {
    console.log(`🚀 Starting onboarding for URL: ${url}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Tenant ID: ${tenantId || 'Will be created'}`);

    try {
      // Create onboarding job record
      const { data: job, error } = await supabase
        .from('onboarding_jobs')
        .insert({
          tenant_id: tenantId || null,
          user_id: userId,
          url: url,
          current_phase: 'SMART_DISCOVERY',
          phase_data: {},
          status: 'IN_PROGRESS'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to create onboarding job:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log(`✅ Onboarding job created: ${job.id}`);

      // Start Smart Discovery phase asynchronously
      this.executePhase(job.id, 'SMART_DISCOVERY').catch(err => {
        console.error(`❌ Smart Discovery failed for job ${job.id}:`, err);
        this.logError(job.id, 'SMART_DISCOVERY', err);
      });

      return job as OnboardingJob;
    } catch (error) {
      console.error('❌ Failed to start onboarding:', error);
      throw error;
    }
  }

  /**
   * Execute a specific phase of the onboarding workflow
   * Saves phase data after completion
   * 
   * Requirements: 12.1-12.6, 13.8
   */
  async executePhase(jobId: string, phase: OnboardingPhase): Promise<any> {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`📍 EXECUTING PHASE: ${phase}`);
    console.log(`   Job ID: ${jobId}`);
    console.log(`${'='.repeat(80)}\n`);

    const startTime = Date.now();

    try {
      // Get current job state
      const job = await this.getJob(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found`);
      }

      let result: any;

      switch (phase) {
        case 'SMART_DISCOVERY':
          result = await this.executeSmartDiscovery(job);
          break;
        case 'OFFERING_PAGES_SCRAPING':
          result = await this.executeOfferingPagesScraping(job);
          break;
        case 'WAITING_APPROVAL':
          // This phase is handled by frontend - user reviews all data
          // Just return existing data for status endpoint
          result = {
            status: 'waiting_approval',
            message: 'Waiting for user to review and approve data'
          };
          break;
        case 'COMPLETION':
          result = await this.executeCompletion(job);
          break;
        default:
          throw new Error(`Unknown phase: ${phase}`);
      }

      // Save phase data
      await this.savePhaseData(jobId, phase, result);

      const duration = Date.now() - startTime;
      
      // Log phase completion (Requirements: 16.7)
      logPhaseCompletion({
        jobId,
        phase,
        duration_ms: duration,
        success: true
      });

      console.log(`✅ Phase ${phase} completed successfully`);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const err = error as Error;
      
      console.error(`❌ Phase ${phase} failed:`, error);
      
      // Log phase failure (Requirements: 16.7)
      logPhaseCompletion({
        jobId,
        phase,
        duration_ms: duration,
        success: false,
        error: err.message
      });
      
      // Log error with context (Requirements: 16.3)
      logError({
        error: err,
        jobId,
        phase,
        context: { phase, jobId }
      });
      
      await this.logError(jobId, phase, error);
      
      // Close browser on error to free resources
      await this.scraper.closeBrowser();
      
      throw error;
    }
  }

  /**
   * Resume an incomplete onboarding from last completed phase
   * 
   * Requirements: 12.9
   */
  async resumeOnboarding(jobId: string): Promise<OnboardingJob> {
    console.log(`🔄 Resuming onboarding job: ${jobId}`);

    const job = await this.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    if (job.status === 'COMPLETED') {
      console.log(`✅ Job already completed`);
      return job;
    }

    if (job.status === 'FAILED') {
      console.log(`⚠️ Job previously failed, restarting from current phase`);
    }

    console.log(`📍 Resuming from phase: ${job.current_phase}`);

    // Continue from current phase
    await this.executePhase(jobId, job.current_phase);

    return await this.getJob(jobId) as OnboardingJob;
  }

  /**
   * Complete the onboarding process and finalize tenant
   * 
   * Requirements: 12.7, 13.9
   */
  async completeOnboarding(jobId: string): Promise<any> {
    console.log(`🎯 Completing onboarding job: ${jobId}`);

    const startTime = Date.now();
    const job = await this.getJob(jobId);
    if (!job) {
      throw new Error(`Job ${jobId} not found`);
    }

    // Execute completion phase
    const result = await this.executePhase(jobId, 'COMPLETION');

    // Update job status
    await this.updateJobStatus(jobId, 'COMPLETED');

    const totalDuration = Date.now() - startTime;
    
    // Count completed phases
    const completedPhases = Object.keys(job.phase_data);
    
    // Log onboarding completion (Requirements: 16.7)
    logOnboardingCompletion({
      jobId,
      tenantId: result.tenant_id,
      total_duration_ms: totalDuration,
      api_call_count: completedPhases.length, // Approximate
      phases_completed: completedPhases
    });

    console.log(`✅ Onboarding completed successfully`);
    console.log(`   Tenant ID: ${result.tenant_id}`);
    console.log(`   Total Offerings: ${result.total_offerings}`);

    // Close browser to free resources
    await this.scraper.closeBrowser();

    return result;
  }

  // ============================================================================
  // PHASE IMPLEMENTATIONS
  // ============================================================================

  /**
   * Phase 1: Smart Discovery - NEW SIMPLIFIED VERSION
   * Single Gemini API call for sector analysis, company info, and page suggestions
   * NO OFFERINGS extraction here, only page suggestions
   * 
   * Requirements: 1.1-1.11, 2.1-2.16
   */
  private async executeSmartDiscovery(job: OnboardingJob): Promise<SmartDiscoveryResult> {
    console.log(`🔍 Starting Smart Discovery for: ${job.url}`);

    // Scrape homepage
    console.log(`📄 Scraping homepage...`);
    const homeResult = await this.scraper.scrapePage(job.url);
    console.log(`✅ Homepage scraped: ${homeResult.markdown.length} chars, ${homeResult.links.length} links`);

    // Call Smart Discovery (single Gemini API call - NO OFFERINGS)
    console.log(`🧠 Calling Smart Discovery AI `);
    const linkStrings = homeResult.links.map(l => typeof l === 'string' ? l : l.href);
    const discoveryResult = await this.ai.smartDiscovery(homeResult.markdown, linkStrings);
    
    console.log(`\n📊 Smart Discovery Results:`);
    console.log(`   Sector: ${discoveryResult.sector_analysis.sector}`);
    console.log(`   Bot Purpose: ${discoveryResult.sector_analysis.bot_purpose}`);
    console.log(`   Company: ${discoveryResult.company_info.name}`);
    console.log(`   Suggested Pages: ${discoveryResult.suggested_pages.length}`);

    // Store homepage markdown for later use in final extraction
    (discoveryResult as any).homepage_markdown = homeResult.markdown;

    return discoveryResult;
  }

  /**
   * Phase 3: Initial Extraction - NEW 3-REQUEST HYBRID FLOW
   * Scrape selected pages and extract initial data + find detail links
   * 
   * Requirements: 4.1-4.14, 5.1-5.8
   */
  private async executeOfferingPagesScraping(job: OnboardingJob): Promise<OfferingPagesScrapingResult> {
    console.log(`🛍️ Starting Initial Extraction (3-Request Hybrid Flow)`);

    const selectionData = job.phase_data.SMART_PAGE_SELECTION as SmartPageSelectionData;
    const discoveryData = job.phase_data.SMART_DISCOVERY as SmartDiscoveryResult;
    
    if (!selectionData || selectionData.skipped) {
      console.log(`⏭️ Page selection was skipped, no scraping needed`);
      return {
        offerings: [],
        processed_pages: []
      };
    }

    const selectedPages = selectionData.selected_pages;
    console.log(`📄 Scraping ${selectedPages.length} pages...`);

    if (selectedPages.length === 0) {
      console.log(`⏭️ No pages to scrape`);
      return {
        offerings: [],
        processed_pages: []
      };
    }

    const scrapedPages: Array<{ url: string; markdown: string; type: string; links: any[] }> = [];
    const processedPages: string[] = [];
    const failedPages: Array<{ url: string; error: string }> = [];

    // Scrape ALL selected pages with rate limiting
    for (let i = 0; i < selectedPages.length; i++) {
      const page = selectedPages[i];
      if (!page) continue;
      
      try {
        // Convert relative URLs to absolute URLs
        let fullUrl = page.url;
        if (page.url.startsWith('/')) {
          const baseUrl = new URL(job.url);
          fullUrl = `${baseUrl.origin}${page.url}`;
        }
        
        console.log(`   🔍 [${i + 1}/${selectedPages.length}] Scraping: ${fullUrl}`);
        
        // Rate limiting: 3-5 second delay between scrapes
        if (i > 0) {
          const delay = 3000 + Math.random() * 2000; // 3-5 seconds
          console.log(`   ⏱️ Waiting ${Math.round(delay / 1000)}s before next scrape...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }

        const result = await this.scraper.scrapePage(fullUrl);
        
        // ⚠️ MARKDOWN BOŞ KONTROLÜ
        if (!result.markdown || result.markdown.length < 50) {
          console.warn(`   ⚠️ WARNING: Markdown too short or empty (${result.markdown?.length || 0} chars)`);
          console.warn(`   This page may not be scraped correctly!`);
        }
        
        scrapedPages.push({ 
          url: fullUrl, 
          markdown: result.markdown, 
          type: page.type,
          links: result.links 
        });
        processedPages.push(fullUrl);
        console.log(`   ✅ Scraped successfully: ${result.markdown.length} chars`);
      } catch (error: any) {
        console.error(`   ❌ Failed to scrape ${page.url}:`, error.message);
        failedPages.push({ url: page.url, error: error.message });
      }
    }

    console.log(`\n✅ Scraping complete: ${scrapedPages.length}/${selectedPages.length} pages`);

    // Call INITIAL EXTRACTION (Gemini Request #2)
    if (scrapedPages.length > 0) {
      try {
        console.log(`\n🧠 Calling Initial Extraction`);
        console.log(`   Homepage + ${scrapedPages.length} scraped pages`);
        
        // DEBUG: Markdown uzunluklarını kontrol et
        console.log(`\n📊 Scraped Pages Markdown Lengths:`);
        scrapedPages.forEach((page, i) => {
          console.log(`   ${i + 1}. ${page.url}: ${page.markdown.length} chars`);
        });
        
        const homepageMarkdown = (discoveryData as any).homepage_markdown || '';
        console.log(`   Homepage markdown: ${homepageMarkdown.length} chars`);
        
        const extractionResult = await this.ai.initialExtraction(
          homepageMarkdown,
          discoveryData.sector_analysis,
          discoveryData.company_info,
          scrapedPages
        );
        
        console.log(`\n✅ Initial Extraction Complete:`);
        console.log(`   Offerings: ${extractionResult.offerings.length}`);
        console.log(`   Offering Detail Links: ${extractionResult.offering_detail_links.length}`);
        console.log(`   Knowledge Base Items: ${extractionResult.knowledge_base.length}`);
        console.log(`   Needs Detail Scraping: ${extractionResult.needs_detail_scraping}`);

        // If detail scraping needed, execute Phase 3.5
        let finalOfferings = extractionResult.offerings;
        
        if (extractionResult.needs_detail_scraping && extractionResult.offering_detail_links.length > 0) {
          console.log(`\n🔍 Detail scraping needed, executing Phase 3.5...`);
          
          // DUPLICATE LINK KONTROLÜ: Zaten scraping edilmiş linkleri filtrele
          const alreadyScrapedUrls = new Set(processedPages.map(url => url.toLowerCase().trim()));
          const uniqueDetailLinks = extractionResult.offering_detail_links.filter(link => {
            const normalizedLink = link.toLowerCase().trim();
            if (alreadyScrapedUrls.has(normalizedLink)) {
              console.log(`   ⏭️ Skipping duplicate link: ${link} (already scraped)`);
              return false;
            }
            return true;
          });
          
          console.log(`   📊 Detail links: ${extractionResult.offering_detail_links.length} total, ${uniqueDetailLinks.length} unique`);
          
          if (uniqueDetailLinks.length === 0) {
            console.log(`   ℹ️ No new detail links to scrape (all already processed)`);
          } else {
            const detailPages: Array<{ url: string; markdown: string; links: any[] }> = [];
            
            // Scrape detail pages with rate limiting
            for (let i = 0; i < uniqueDetailLinks.length; i++) {
              const detailUrl = uniqueDetailLinks[i];
              if (!detailUrl) continue;
              
              try {
                console.log(`   🔍 [${i + 1}/${uniqueDetailLinks.length}] Scraping detail: ${detailUrl}`);
                
                // Rate limiting: 3-5 saniye bekleme
                if (i > 0) {
                  const delay = 3000 + Math.random() * 2000;
                  console.log(`   ⏱️ Waiting ${Math.round(delay / 1000)}s before next scrape...`);
                  await new Promise(resolve => setTimeout(resolve, delay));
                }

                const result = await this.scraper.scrapePage(detailUrl);
                
                // ⚠️ MARKDOWN BOŞ KONTROLÜ
                if (!result.markdown || result.markdown.length < 50) {
                  console.warn(`   ⚠️ WARNING: Detail page markdown too short (${result.markdown?.length || 0} chars)`);
                  console.warn(`   This may affect detail enrichment quality!`);
                }
                
                detailPages.push({ 
                  url: detailUrl, 
                  markdown: result.markdown,
                  links: result.links 
                });
                processedPages.push(detailUrl);
                console.log(`   ✅ Detail scraped: ${result.markdown.length} chars`);
              } catch (error: any) {
                console.error(`   ❌ Failed to scrape detail ${detailUrl}:`, error.message);
                failedPages.push({ url: detailUrl, error: error.message });
              }
            }

            // Call DETAIL ENRICHMENT (Gemini Request #3)
            if (detailPages.length > 0) {
              console.log(`\n🧠 Calling Detail Enrichment `);
              
              const enrichmentResult = await this.ai.detailEnrichment(
                extractionResult.offerings,
                detailPages,
                discoveryData.sector_analysis
              );
              
              finalOfferings = enrichmentResult.enriched_offerings;
              console.log(`✅ Detail Enrichment Complete: ${finalOfferings.length} offerings enriched`);
            }
          }
        }

        const result: OfferingPagesScrapingResult = {
          offerings: finalOfferings,
          processed_pages: processedPages,
          company_info_updates: extractionResult.company_info_updates,
          knowledge_base: extractionResult.knowledge_base
        };
        
        if (failedPages.length > 0) {
          result.failed_pages = failedPages;
        }
        
        return result;
      } catch (error: any) {
        console.error(`   ❌ Failed initial extraction:`, error.message);
        throw error;
      }
    }

    return {
      offerings: [],
      processed_pages: processedPages,
      failed_pages: failedPages
    };
  }

  /**
   * Phase 5: Other Pages Scraping - DEPRECATED
   * Now handled in executeOfferingPagesScraping (all pages scraped together)
   * 
   * @deprecated Use executeOfferingPagesScraping instead
   */
  private async executeOtherPagesScraping(job: OnboardingJob): Promise<OtherPagesScrapingResult> {
    console.log(`⏭️ OTHER_PAGES_SCRAPING phase deprecated - already handled in OFFERING_PAGES_SCRAPING`);
    
    // Return empty result - data already extracted in previous phase
    return {
      company_info_updates: {},
      processed_pages: []
    };
  }

  /**
   * Phase 6: Completion
   * Generate system prompt and finalize tenant
   * 
   * Requirements: 9.1-9.18, 12.7
   */
  private async executeCompletion(job: OnboardingJob): Promise<CompletionData> {
    console.log(`🎯 Executing completion phase`);

    const discoveryData = job.phase_data.SMART_DISCOVERY as SmartDiscoveryResult;
    const companyInfo = job.phase_data.COMPANY_INFO_REVIEW as CompanyInfoV2;
    const offeringData = job.phase_data.OFFERING_SELECTION as OfferingSelectionData;

    if (!discoveryData || !companyInfo || !offeringData) {
      throw new Error('Missing required phase data for completion');
    }

    // Generate system prompt (placeholder for now)
    console.log(`📝 Generating system prompt...`);
    const systemPrompt = `System prompt for ${companyInfo.name} - ${discoveryData.sector_analysis.sector}`;
    console.log(`✅ System prompt generated: ${systemPrompt.length} chars`);

    // Create or update tenant
    let tenantId = job.tenant_id;
    
    if (!tenantId) {
      console.log(`🏢 Creating new tenant...`);
      const { data: tenant, error } = await supabase
        .from('tenants')
        .insert({
          name: companyInfo.name,
          sector: discoveryData.sector_analysis.sector,
          metadata: {
            system_prompt: systemPrompt,
            sector_analysis: discoveryData.sector_analysis,
            company_info: companyInfo,
            timezone: 'Europe/Istanbul',
            detected_language: companyInfo.detected_language || 'tr'
          }
        })
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create tenant: ${error.message}`);
      }

      tenantId = tenant.id;
      console.log(`✅ Tenant created: ${tenantId}`);

      // Update job with tenant_id
      await supabase
        .from('onboarding_jobs')
        .update({ tenant_id: tenantId })
        .eq('id', job.id);
    } else {
      console.log(`🏢 Updating existing tenant: ${tenantId}`);
      const { error } = await supabase
        .from('tenants')
        .update({
          name: companyInfo.name,
          sector: discoveryData.sector_analysis.sector,
          metadata: {
            system_prompt: systemPrompt,
            sector_analysis: discoveryData.sector_analysis,
            company_info: companyInfo,
            timezone: 'Europe/Istanbul',
            detected_language: companyInfo.detected_language || 'tr'
          }
        })
        .eq('id', tenantId);

      if (error) {
        throw new Error(`Failed to update tenant: ${error.message}`);
      }

      console.log(`✅ Tenant updated`);
    }

    // Save offerings to database
    if (!tenantId) {
      throw new Error('Tenant ID is required');
    }
    
    console.log(`💾 Saving ${offeringData.selected_offerings.length} offerings...`);
    await this.saveOfferings(tenantId, offeringData.selected_offerings);
    console.log(`✅ Offerings saved`);

    return {
      tenant_id: tenantId,
      system_prompt: systemPrompt,
      total_offerings: offeringData.selected_offerings.length,
      completion_time: new Date().toISOString()
    };
  }

  // ============================================================================
  // DATABASE OPERATIONS
  // ============================================================================

  /**
   * Get onboarding job by ID
   */
  private async getJob(jobId: string): Promise<OnboardingJob | null> {
    const { data, error } = await supabase
      .from('onboarding_jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (error) {
      console.error(`❌ Failed to get job ${jobId}:`, error);
      return null;
    }

    return data as OnboardingJob;
  }

  /**
   * Save phase data to database
   * Implements retry logic (Requirements: 12.10)
   */
  async savePhaseData(jobId: string, phase: OnboardingPhase, data: any): Promise<void> {
    await retryDatabaseOperation(
      async () => {
        // Get current phase_data
        const job = await this.getJob(jobId);
        if (!job) {
          throw new Error(`Job ${jobId} not found`);
        }

        // Update phase_data
        const updatedPhaseData = {
          ...job.phase_data,
          [phase]: data
        };

        // Determine next phase
        const nextPhase = this.getNextPhase(phase);

        // Update job
        const { error } = await supabase
          .from('onboarding_jobs')
          .update({
            phase_data: updatedPhaseData,
            current_phase: nextPhase || phase,
            updated_at: new Date().toISOString()
          })
          .eq('id', jobId);

        if (error) {
          throw error;
        }

        console.log(`💾 Phase data saved for ${phase}`);
        if (nextPhase) {
          console.log(`➡️ Next phase: ${nextPhase}`);
        }
      },
      {
        maxRetries: 3,
        delayMs: 1000,
        onRetry: (attempt) => {
          console.warn(`⚠️ Save failed, retrying (${attempt}/3)...`);
        }
      }
    );
  }

  /**
   * Update job status
   */
  private async updateJobStatus(jobId: string, status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'): Promise<void> {
    const { error } = await supabase
      .from('onboarding_jobs')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', jobId);

    if (error) {
      console.error(`❌ Failed to update job status:`, error);
      throw new Error(`Failed to update job status: ${error.message}`);
    }

    console.log(`✅ Job status updated to: ${status}`);
  }

  /**
   * Log error to database
   * 
   * Requirements: 12.8, 13.6
   */
  private async logError(jobId: string, phase: OnboardingPhase, error: any): Promise<void> {
    try {
      const job = await this.getJob(jobId);
      if (!job) return;

      const errorLog: ErrorLog = {
        timestamp: new Date().toISOString(),
        phase,
        error_type: error.name || 'Error',
        message: error.message || String(error),
        stack_trace: error.stack,
        context: {
          jobId,
          url: job.url
        }
      };

      const updatedErrorLog = [...(job.error_log || []), errorLog];

      await supabase
        .from('onboarding_jobs')
        .update({
          error_log: updatedErrorLog,
          status: 'FAILED',
          updated_at: new Date().toISOString()
        })
        .eq('id', jobId);

      console.log(`📝 Error logged for job ${jobId}`);
    } catch (err) {
      console.error(`❌ Failed to log error:`, err);
    }
  }

  /**
   * Save offerings to database
   * 
   * Requirements: 6.9, 6.10, 8.5
   */
  private async saveOfferings(tenantId: string, offerings: Offering[]): Promise<void> {
    const offeringsToInsert = offerings.map(o => ({
      tenant_id: tenantId,
      name: o.name,
      type: o.type,
      price: o.price,
      currency: o.currency || 'TRY',
      duration_min: o.duration_min,
      category: o.category,
      attributes: o.meta_info || {} // Store meta_info in JSONB attributes column
    }));

    const { error } = await supabase
      .from('offerings')
      .insert(offeringsToInsert);

    if (error) {
      throw new Error(`Failed to save offerings: ${error.message}`);
    }
  }

  /**
   * Get offerings from database
   * 
   * Requirements: 6.9, 6.10
   */
  async getOfferings(tenantId: string): Promise<Offering[]> {
    const { data, error } = await supabase
      .from('offerings')
      .select('*')
      .eq('tenant_id', tenantId);

    if (error) {
      throw new Error(`Failed to get offerings: ${error.message}`);
    }

    // Parse attributes as meta_info
    return (data || []).map(o => ({
      ...o,
      meta_info: o.attributes
    }));
  }

  // ============================================================================
  // CUSTOM FIELD MANAGEMENT
  // ============================================================================

  /**
   * Add custom field to offering meta_info
   * 
   * Requirements: 6A.4-6A.14
   */
  async addCustomField(
    offeringId: string,
    key: string,
    value: any,
    type: 'string' | 'number' | 'boolean' | 'array',
    label: string
  ): Promise<Offering> {
    console.log(`➕ Adding custom field: ${key} to offering ${offeringId}`);

    // Validate field name (Requirement 6A.8)
    // Must be snake_case: lowercase letters, numbers, underscores only
    // Must not be empty
    // Max 50 characters
    if (!key || key.length === 0) {
      throw new Error('Field name cannot be empty');
    }
    
    if (key.length > 50) {
      throw new Error('Field name must be max 50 characters');
    }
    
    const snakeCaseRegex = /^[a-z0-9_]+$/;
    if (!snakeCaseRegex.test(key)) {
      throw new Error('Field name must be snake_case (lowercase letters, numbers, underscores only)');
    }

    // Get current offering
    const { data: offering, error: fetchError } = await supabase
      .from('offerings')
      .select('*')
      .eq('id', offeringId)
      .single();

    if (fetchError || !offering) {
      throw new Error(`Offering not found: ${offeringId}`);
    }

    const metaInfo = offering.attributes || {};
    const customFields = metaInfo._custom_fields || [];

    // Check if field already exists (Requirement 6A.9)
    if (key in metaInfo && key !== '_custom_fields') {
      throw new Error(`Field '${key}' already exists`);
    }

    // Sanitize value if string (XSS protection - Requirement 6A.10)
    let sanitizedValue = value;
    if (type === 'string' && typeof value === 'string') {
      sanitizedValue = this.sanitizeFieldValue(value);
    }

    // Add field metadata
    const fieldMetadata: CustomFieldMetadata = {
      key,
      label,
      type,
      added_by: 'user',
      added_at: new Date().toISOString()
    };

    // Update meta_info
    const updatedMetaInfo = {
      ...metaInfo,
      [key]: sanitizedValue,
      _custom_fields: [...customFields, fieldMetadata]
    };

    // Save to database
    const { data: updated, error: updateError } = await supabase
      .from('offerings')
      .update({
        attributes: updatedMetaInfo,
        updated_at: new Date().toISOString()
      })
      .eq('id', offeringId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(`Failed to add custom field: ${updateError?.message}`);
    }

    console.log(`✅ Custom field added: ${key}`);

    return {
      ...updated,
      meta_info: updated.attributes
    };
  }

  /**
   * Update custom field value in offering meta_info
   * 
   * Requirements: 6A.11
   */
  async updateCustomField(
    offeringId: string,
    key: string,
    value: any
  ): Promise<Offering> {
    console.log(`✏️ Updating custom field: ${key} in offering ${offeringId}`);

    // Get current offering
    const { data: offering, error: fetchError } = await supabase
      .from('offerings')
      .select('*')
      .eq('id', offeringId)
      .single();

    if (fetchError || !offering) {
      throw new Error(`Offering not found: ${offeringId}`);
    }

    const metaInfo = offering.attributes || {};
    const customFields = metaInfo._custom_fields || [];

    // Check if field exists
    if (!(key in metaInfo) || key === '_custom_fields') {
      throw new Error(`Field '${key}' does not exist`);
    }

    // Find field metadata
    const fieldMeta = customFields.find((f: CustomFieldMetadata) => f.key === key);
    
    // Sanitize value if string
    let sanitizedValue = value;
    if (fieldMeta?.type === 'string' && typeof value === 'string') {
      sanitizedValue = this.sanitizeFieldValue(value);
    }

    // Update field metadata timestamp
    const updatedCustomFields = customFields.map((f: CustomFieldMetadata) =>
      f.key === key
        ? { ...f, updated_at: new Date().toISOString() }
        : f
    );

    // Update meta_info
    const updatedMetaInfo = {
      ...metaInfo,
      [key]: sanitizedValue,
      _custom_fields: updatedCustomFields
    };

    // Save to database
    const { data: updated, error: updateError } = await supabase
      .from('offerings')
      .update({
        attributes: updatedMetaInfo,
        updated_at: new Date().toISOString()
      })
      .eq('id', offeringId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(`Failed to update custom field: ${updateError?.message}`);
    }

    console.log(`✅ Custom field updated: ${key}`);

    return {
      ...updated,
      meta_info: updated.attributes
    };
  }

  /**
   * Remove custom field from offering meta_info
   * 
   * Requirements: 6A.12
   */
  async removeCustomField(
    offeringId: string,
    key: string
  ): Promise<Offering> {
    console.log(`🗑️ Removing custom field: ${key} from offering ${offeringId}`);

    // Get current offering
    const { data: offering, error: fetchError } = await supabase
      .from('offerings')
      .select('*')
      .eq('id', offeringId)
      .single();

    if (fetchError || !offering) {
      throw new Error(`Offering not found: ${offeringId}`);
    }

    const metaInfo = offering.attributes || {};
    const customFields = metaInfo._custom_fields || [];

    // Check if field exists
    if (!(key in metaInfo) || key === '_custom_fields') {
      throw new Error(`Field '${key}' does not exist`);
    }

    // Check if field is user-added (can only remove user-added fields)
    const fieldMeta = customFields.find((f: CustomFieldMetadata) => f.key === key);
    if (fieldMeta && fieldMeta.added_by === 'ai') {
      throw new Error(`Cannot remove AI-discovered field '${key}'`);
    }

    // Remove field and its metadata
    const { [key]: removed, ...remainingMetaInfo } = metaInfo;
    const updatedCustomFields = customFields.filter((f: CustomFieldMetadata) => f.key !== key);

    const updatedMetaInfo = {
      ...remainingMetaInfo,
      _custom_fields: updatedCustomFields
    };

    // Save to database
    const { data: updated, error: updateError } = await supabase
      .from('offerings')
      .update({
        attributes: updatedMetaInfo,
        updated_at: new Date().toISOString()
      })
      .eq('id', offeringId)
      .select()
      .single();

    if (updateError || !updated) {
      throw new Error(`Failed to remove custom field: ${updateError?.message}`);
    }

    console.log(`✅ Custom field removed: ${key}`);

    return {
      ...updated,
      meta_info: updated.attributes
    };
  }

  /**
   * Sanitize field value to prevent XSS
   * 
   * Requirements: 6A.10
   */
  private sanitizeFieldValue(value: string): string {
    // Remove HTML tags and script content
    return value
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]+>/g, '')
      .trim();
  }

  // ============================================================================
  // HELPER METHODS
  // ============================================================================

  /**
   * Determine next phase in workflow
   */
  private getNextPhase(currentPhase: OnboardingPhase): OnboardingPhase | null {
    const phaseOrder: OnboardingPhase[] = [
      'SMART_DISCOVERY',
      'SMART_PAGE_SELECTION',
      'OFFERING_PAGES_SCRAPING',
      'WAITING_APPROVAL', // User reviews all data (company + offerings + pages)
      'COMPLETION'
    ];

    const currentIndex = phaseOrder.indexOf(currentPhase);
    if (currentIndex === -1 || currentIndex === phaseOrder.length - 1) {
      return null;
    }

    return phaseOrder[currentIndex + 1] || null;
  }

  /**
   * Get job status (public method for API)
   */
  async getJobStatus(jobId: string): Promise<OnboardingJob | null> {
    return this.getJob(jobId);
  }
}
