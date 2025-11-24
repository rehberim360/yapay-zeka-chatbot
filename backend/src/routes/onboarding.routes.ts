/**
 * Onboarding Routes - Smart Onboarding V2
 * 
 * Defines HTTP routes for the onboarding workflow
 * Requirements: 3.1-3.10, 7.1-7.10, 8.1-8.13
 */

import { Router } from 'express';
import { OnboardingController } from '../controllers/onboarding.controller.js';
import { authenticateJWT } from '../middleware/auth.js';
import { rateLimitMiddleware } from '../middleware/rate-limiter.js';

const router = Router();
const onboardingController = new OnboardingController();

// Apply rate limiting to all onboarding routes
router.use('/onboarding', rateLimitMiddleware);

// Smart Onboarding V2 Routes (all require authentication)
// TODO: Re-enable authenticateJWT after implementing frontend auth
router.post('/onboarding/start', onboardingController.startOnboarding);
router.post('/onboarding/select-pages', onboardingController.selectPages);
router.post('/onboarding/approve-offerings', onboardingController.approveOfferings);  // NEW
router.post('/onboarding/approve-company', onboardingController.approveCompany);
router.post('/onboarding/select-offerings', onboardingController.selectOfferings);
router.post('/onboarding/retry/:jobId', onboardingController.retryJob);
router.get('/onboarding/status/:jobId', onboardingController.getStatus);

// Custom Field Management Routes (Requirements: 6A.4-6A.14)
router.patch('/offerings/:id/meta-info', onboardingController.updateMetaInfo);

// Legacy routes (for backward compatibility - can be removed later)
router.get('/job-status/:jobId', onboardingController.getStatus);

export default router;
