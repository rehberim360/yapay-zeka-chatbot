/**
 * Onboarding Controller - Smart Onboarding V2
 * 
 * Handles HTTP endpoints for the onboarding workflow:
 * - POST /api/onboarding/start - Start new onboarding
 * - POST /api/onboarding/select-pages - User selects pages to scrape
 * - POST /api/onboarding/approve-company - User approves company info
 * - POST /api/onboarding/select-offerings - User selects offerings
 * - GET /api/onboarding/status/:jobId - Get job status (polling)
 * 
 * Requirements: 3.1-3.10, 7.1-7.10, 8.1-8.13
 */

import type { Request, Response } from 'express';
import { OrchestratorServiceV2 } from '../services/orchestrator-v2.js';
import { z } from 'zod';
import { getUserFriendlyErrorMessage } from '../utils/error-recovery.js';
import type { 
  SuggestedPage, 
  CompanyInfoV2, 
  Offering,
  SmartPageSelectionData,
  OfferingSelectionData
} from '../types/onboarding-v2.js';

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

/**
 * Schema for starting onboarding
 * Requirements: 3.1
 * Note: userId comes from JWT token, not request body
 */
const startOnboardingSchema = z.object({
  url: z.string().url('Invalid URL format'),
  tenantId: z.string().uuid().optional()
});

/**
 * Schema for page selection
 * Requirements: 3.6, 3.7, 3.9
 */
const selectPagesSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  selectedPages: z.array(z.object({
    url: z.string().min(1), // Allow relative URLs like /pricing
    type: z.string(),
    priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    reason: z.string(),
    expected_data: z.string(),
    auto_select: z.boolean()
  })),
  skipped: z.boolean().default(false)
});

/**
 * Schema for company info approval
 * Requirements: 7.1-7.10
 */
const approveCompanySchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  companyInfo: z.object({
    name: z.string().min(1, 'Company name required'),
    sector: z.string().optional(),
    sub_sector: z.string().optional(),
    description: z.string().optional(),
    detected_language: z.string().optional(),
    tone_of_voice: z.string().optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    address: z.string().optional(),
    working_hours: z.string().optional(),
    social_media: z.record(z.string(), z.string()).optional(),
    website: z.string().url().optional().or(z.literal(''))
  })
});

/**
 * Schema for offering selection
 * Requirements: 8.1-8.13
 */
const selectOfferingsSchema = z.object({
  jobId: z.string().uuid('Invalid job ID'),
  selectedOfferings: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    type: z.enum(['SERVICE', 'PRODUCT']),
    price: z.number().optional(),
    currency: z.string().optional(),
    duration_min: z.number().optional(),
    category: z.string().optional(),
    image_url: z.string().optional(),
    is_available: z.boolean().optional(),
    source_url: z.string().optional(),
    confidence_level: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    meta_info: z.record(z.string(), z.any()).optional()
  }))
});

/**
 * Schema for custom field operations
 * Requirements: 6A.4-6A.14
 */
const updateMetaInfoSchema = z.object({
  action: z.enum(['add', 'update', 'remove']),
  key: z.string().regex(/^[a-z0-9_]{1,50}$/, 'Field name must be snake_case, max 50 chars'),
  value: z.any().optional(),
  type: z.enum(['string', 'number', 'boolean', 'array']).optional(),
  label: z.string().optional()
});

// ============================================================================
// CONTROLLER
// ============================================================================

export class OnboardingController {
  private orchestrator: OrchestratorServiceV2;

  constructor() {
    this.orchestrator = new OrchestratorServiceV2();
  }

  /**
   * POST /api/onboarding/start
   * Start new onboarding process
   * 
   * Requirements: 3.1, 1.1-1.11
   */
  startOnboarding = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📥 POST /api/onboarding/start');
      
      // Get userId from JWT token (set by authenticateJWT middleware)
      // TODO: Make this required after implementing frontend auth
      // Using a fixed UUID for anonymous users during development
      const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

      // Validate request (userId comes from JWT, not body)
      const startSchema = z.object({
        url: z.string().url('Invalid URL format'),
        tenantId: z.string().uuid().optional()
      });
      
      const { url, tenantId } = startSchema.parse(req.body);

      console.log(`🚀 Starting onboarding for URL: ${url}`);
      console.log(`   User ID: ${userId}`);
      if (tenantId) {
        console.log(`   Tenant ID: ${tenantId}`);
      }

      // Start onboarding (async - Smart Discovery runs in background)
      const job = await this.orchestrator.startOnboarding(url, userId, tenantId);

      res.status(202).json({
        success: true,
        jobId: job.id,
        status: job.status,
        currentPhase: job.current_phase,
        message: 'Onboarding started. Use jobId to poll for status.'
      });

    } catch (error) {
      console.error('❌ Start onboarding error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues
        });
      } else {
        const err = error as Error;
        res.status(500).json({
          success: false,
          error: 'Failed to start onboarding',
          message: getUserFriendlyErrorMessage(err),
          details: err.message
        });
      }
    }
  };

  /**
   * POST /api/onboarding/select-pages
   * User selects pages to scrape (or skips)
   * 
   * Requirements: 3.5-3.10
   */
  selectPages = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📥 POST /api/onboarding/select-pages');
      
      // Validate request
      const { jobId, selectedPages, selectedOfferings, skipped } = req.body;

      console.log(`📄 Page selection for job: ${jobId}`);
      console.log(`   Selected pages: ${selectedPages?.length || 0}`);
      console.log(`   Selected offerings: ${selectedOfferings?.length || 0}`);
      console.log(`   Skipped: ${skipped}`);

      // Auto-add offering detail pages from selected offerings
      const autoAddedPages: SuggestedPage[] = [];
      if (selectedOfferings && selectedOfferings.length > 0) {
        for (const offering of selectedOfferings) {
          if (offering.source_url) {
            // Check if this page is already in selectedPages
            const alreadySelected = selectedPages.some((p: any) => p.url === offering.source_url);
            
            if (!alreadySelected) {
              console.log(`   🔗 Auto-adding detail page for: ${offering.name} → ${offering.source_url}`);
              autoAddedPages.push({
                url: offering.source_url,
                type: offering.type === 'PRODUCT' ? 'PRODUCT_DETAIL' : 'SERVICE_DETAIL',
                priority: 'HIGH',
                reason: `Detay sayfası: ${offering.name}`,
                expected_data: `${offering.name} için detaylı bilgiler`,
                auto_select: true
              });
            }
          }
        }
      }

      // Merge selected pages with auto-added pages
      const allSelectedPages = [...(selectedPages || []), ...autoAddedPages];
      console.log(`   📊 Total pages to scrape: ${allSelectedPages.length} (${selectedPages?.length || 0} user + ${autoAddedPages.length} auto)`);

      // Save page selection data with user-selected offerings
      const selectionData: any = {
        selected_pages: allSelectedPages as SuggestedPage[],
        selected_offerings: selectedOfferings || [], // User-selected offerings
        skipped
      };

      // Get job and update phase data
      const job = await this.orchestrator.getJobStatus(jobId);
      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Job not found'
        });
        return;
      }

      // Save selection data and move to next phase
      await this.orchestrator.savePhaseData(jobId, 'SMART_PAGE_SELECTION', selectionData);

      // If user selected pages, start Offering Pages Scraping
      // If user skipped, move directly to Offering Detail Review
      if (!skipped && allSelectedPages.length > 0) {
        console.log('🛍️ Starting Offering Pages Scraping...');
        this.orchestrator.executePhase(jobId, 'OFFERING_PAGES_SCRAPING').catch(err => {
          console.error('❌ Offering Pages Scraping failed:', err);
        });
      } else {
        console.log('⏭️ Skipping page scraping, moving to Offering Detail Review');
        // Phase will be updated by savePhaseData
      }

      res.json({
        success: true,
        message: skipped 
          ? 'Page selection skipped. Proceeding to offering review.'
          : `Processing ${allSelectedPages.length} selected pages (${autoAddedPages.length} auto-added from offerings).`,
        nextPhase: skipped ? 'OFFERING_DETAIL_REVIEW' : 'OFFERING_PAGES_SCRAPING'
      });

    } catch (error) {
      console.error('❌ Select pages error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues
        });
      } else {
        const err = error as Error;
        res.status(500).json({
          success: false,
          error: 'Failed to process page selection',
          message: getUserFriendlyErrorMessage(err),
          details: err.message
        });
      }
    }
  };

  /**
   * POST /api/onboarding/approve-company
   * User reviews and approves company information
   * 
   * Requirements: 7.1-7.10
   */
  approveCompany = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📥 POST /api/onboarding/approve-company');
      
      // Validate request
      const { jobId, companyInfo } = approveCompanySchema.parse(req.body);

      console.log(`🏢 Company info approval for job: ${jobId}`);
      console.log(`   Company: ${companyInfo.name}`);

      // Additional validation for phone and email if provided
      if (companyInfo.phone) {
        const phoneRegex = /^\+90 5\d{2} \d{3} \d{2} \d{2}$/;
        if (!phoneRegex.test(companyInfo.phone)) {
          res.status(400).json({
            success: false,
            error: 'Invalid phone format. Expected: +90 5XX XXX XX XX'
          });
          return;
        }
      }

      // Save company info
      await this.orchestrator.savePhaseData(jobId, 'COMPANY_INFO_REVIEW', companyInfo as CompanyInfoV2);

      res.json({
        success: true,
        message: 'Company information approved.',
        nextPhase: 'OFFERING_SELECTION'
      });

    } catch (error) {
      console.error('❌ Approve company error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues
        });
      } else {
        const err = error as Error;
        res.status(500).json({
          success: false,
          error: 'Failed to approve company information',
          message: getUserFriendlyErrorMessage(err),
          details: err.message
        });
      }
    }
  };

  /**
   * POST /api/onboarding/select-offerings
   * User selects which offerings to include in chatbot
   * 
   * Requirements: 8.1-8.13
   */
  selectOfferings = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📥 POST /api/onboarding/select-offerings');
      
      // Validate request
      const { jobId, selectedOfferings } = selectOfferingsSchema.parse(req.body);

      console.log(`🎯 Offering selection for job: ${jobId}`);
      console.log(`   Selected: ${selectedOfferings.length} offerings`);

      // Validate at least one offering selected (Requirement 8.12)
      if (selectedOfferings.length === 0) {
        res.status(400).json({
          success: false,
          error: 'At least one offering must be selected'
        });
        return;
      }

      // Save offering selection
      const offeringData: OfferingSelectionData = {
        selected_offerings: selectedOfferings as Offering[],
        total_count: selectedOfferings.length
      };

      await this.orchestrator.savePhaseData(jobId, 'OFFERING_SELECTION', offeringData);

      // Start completion phase (generate system prompt, save to database)
      console.log('🎯 Starting completion phase...');
      this.orchestrator.completeOnboarding(jobId).catch(err => {
        console.error('❌ Completion failed:', err);
      });

      res.json({
        success: true,
        message: `${selectedOfferings.length} offerings selected. Finalizing chatbot configuration.`,
        nextPhase: 'COMPLETION'
      });

    } catch (error) {
      console.error('❌ Select offerings error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues
        });
      } else {
        const err = error as Error;
        res.status(500).json({
          success: false,
          error: 'Failed to process offering selection',
          message: getUserFriendlyErrorMessage(err),
          details: err.message
        });
      }
    }
  };

  /**
   * POST /api/onboarding/retry/:jobId
   * Manually retry a failed onboarding job
   * 
   * Requirements: 13.5, 13.8
   */
  retryJob = async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobId } = req.params;

      if (!jobId) {
        res.status(400).json({
          success: false,
          error: 'Job ID required'
        });
        return;
      }

      console.log(`🔄 POST /api/onboarding/retry/${jobId}`);

      const job = await this.orchestrator.getJobStatus(jobId);

      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Job not found',
          jobId
        });
        return;
      }

      if (job.status === 'COMPLETED') {
        res.status(400).json({
          success: false,
          error: 'Job already completed',
          message: 'Cannot retry a completed job'
        });
        return;
      }

      // Resume from current phase
      console.log(`🔄 Retrying job from phase: ${job.current_phase}`);
      this.orchestrator.resumeOnboarding(jobId).catch(err => {
        console.error('❌ Retry failed:', err);
      });

      res.json({
        success: true,
        message: 'Job retry initiated',
        currentPhase: job.current_phase
      });

    } catch (error) {
      console.error('❌ Retry job error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retry job',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * GET /api/onboarding/status/:jobId
   * Get current status of onboarding job (for polling)
   * 
   * Requirements: 3.1-3.10, 15.1-15.12
   */
  getStatus = async (req: Request, res: Response): Promise<void> => {
    try {
      const { jobId } = req.params;

      if (!jobId) {
        res.status(400).json({
          success: false,
          error: 'Job ID required'
        });
        return;
      }

      console.log(`📊 GET /api/onboarding/status/${jobId}`);

      const job = await this.orchestrator.getJobStatus(jobId);

      if (!job) {
        res.status(404).json({
          success: false,
          error: 'Job not found',
          jobId
        });
        return;
      }

      // Return job status with phase data
      res.json({
        success: true,
        jobId: job.id,
        status: job.status,
        currentPhase: job.current_phase,
        phaseData: job.phase_data,
        errorLog: job.error_log,
        createdAt: job.created_at,
        updatedAt: job.updated_at
      });

    } catch (error) {
      console.error('❌ Get status error:', error);
      const err = error as Error;
      res.status(500).json({
        success: false,
        error: 'Failed to get job status',
        message: getUserFriendlyErrorMessage(err),
        details: err.message
      });
    }
  };

  /**
   * PATCH /api/offerings/:id/meta-info
   * Add, update, or remove custom fields in offering meta_info
   * 
   * Requirements: 6A.4-6A.14
   */
  updateMetaInfo = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      
      if (!id) {
        res.status(400).json({
          success: false,
          error: 'Offering ID required'
        });
        return;
      }

      console.log(`🔧 PATCH /api/offerings/${id}/meta-info`);

      // Validate request
      const { action, key, value, type, label } = updateMetaInfoSchema.parse(req.body);

      console.log(`   Action: ${action}`);
      console.log(`   Field: ${key}`);

      // Get user ID from JWT
      // TODO: Make this required after implementing frontend auth
      // Using a fixed UUID for anonymous users during development
      const userId = req.user?.id || '00000000-0000-0000-0000-000000000000';

      let result;
      
      switch (action) {
        case 'add':
          if (!type || !label) {
            res.status(400).json({
              success: false,
              error: 'Type and label required for add action'
            });
            return;
          }
          result = await this.orchestrator.addCustomField(id, key, value, type, label);
          break;
          
        case 'update':
          result = await this.orchestrator.updateCustomField(id, key, value);
          break;
          
        case 'remove':
          result = await this.orchestrator.removeCustomField(id, key);
          break;
      }

      res.json({
        success: true,
        message: `Custom field ${action}ed successfully`,
        offering: result
      });

    } catch (error) {
      console.error('❌ Update meta info error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues
        });
      } else {
        const err = error as Error;
        res.status(500).json({
          success: false,
          error: 'Failed to update meta info',
          message: getUserFriendlyErrorMessage(err),
          details: err.message
        });
      }
    }
  };

  /**
   * POST /api/onboarding/approve-offerings
   * User reviews and approves detailed offerings after scraping
   * NEW endpoint for OFFERING_DETAIL_REVIEW phase
   * 
   * Requirements: NEW
   */
  approveOfferings = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('📥 POST /api/onboarding/approve-offerings');
      
      // Validate request
      const { jobId, reviewedOfferings } = z.object({
        jobId: z.string().uuid('Invalid job ID'),
        reviewedOfferings: z.array(z.any())
      }).parse(req.body);

      console.log(`🛍️ Offering review for job: ${jobId}`);
      console.log(`   Reviewed: ${reviewedOfferings.length} offerings`);

      // Save reviewed offerings
      const reviewData = {
        reviewed_offerings: reviewedOfferings as Offering[],
        approved: true
      };

      await this.orchestrator.savePhaseData(jobId, 'OFFERING_DETAIL_REVIEW', reviewData);

      // Start Other Pages Scraping
      console.log('📄 Starting Other Pages Scraping...');
      this.orchestrator.executePhase(jobId, 'OTHER_PAGES_SCRAPING').catch((err: Error) => {
        console.error('❌ Other Pages Scraping failed:', err);
      });

      res.json({
        success: true,
        message: `${reviewedOfferings.length} offerings approved. Processing other pages.`,
        nextPhase: 'OTHER_PAGES_SCRAPING'
      });

    } catch (error) {
      console.error('❌ Approve offerings error:', error);
      
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          details: error.issues
        });
      } else {
        const err = error as Error;
        res.status(500).json({
          success: false,
          error: 'Failed to approve offerings',
          message: getUserFriendlyErrorMessage(err),
          details: err.message
        });
      }
    }
  };
}
