/**
 * Custom hook for managing onboarding state with localStorage persistence
 * Task 21: Frontend State Machine
 */

import { useState, useEffect } from 'react';
import type { CompanyInfo, Offering, PageInfo, ScrapedData, HomeData } from '@/types/onboarding';

export type OnboardingState =
  | 'INPUT'
  | 'DISCOVERING'
  | 'ANALYZING'
  | 'REVIEW_COMPANY'
  | 'REVIEW_PAGES'
  | 'PROCESSING_OFFERINGS'       // NEW
  | 'REVIEW_DETAILED_OFFERINGS'  // NEW
  | 'PROCESSING_OTHER'           // NEW
  | 'COMPANY_INFO'
  | 'OFFERING_CAROUSEL'
  | 'COMPLETION';

interface OnboardingStateData {
  state: OnboardingState;
  jobId: string | null;
  scrapedData: ScrapedData | null;
  homeData: HomeData | null;
  suggestedPages: PageInfo[];
  currentOfferingIndex: number;
  tempCompanyInfo: CompanyInfo | null;
  tempExtraInfo: string;
  tempSelectedOfferings: Offering[];
  progress: {
    current: number;
    total: number;
    stats: Record<string, unknown>;
  };
}

const STORAGE_KEY = 'onboarding_state';
const STORAGE_VERSION = '1.0';

const initialState: OnboardingStateData = {
  state: 'INPUT',
  jobId: null,
  scrapedData: null,
  homeData: null,
  suggestedPages: [],
  currentOfferingIndex: 0,
  tempCompanyInfo: null,
  tempExtraInfo: '',
  tempSelectedOfferings: [],
  progress: { current: 0, total: 100, stats: {} }
};

/**
 * Load state from localStorage
 */
function loadState(): OnboardingStateData | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const parsed = JSON.parse(stored);
    
    // Version check
    if (parsed.version !== STORAGE_VERSION) {
      console.log('State version mismatch, clearing storage');
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Validate state structure
    if (!parsed.data || typeof parsed.data.state !== 'string') {
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

/**
 * Save state to localStorage
 */
function saveState(data: OnboardingStateData): void {
  if (typeof window === 'undefined') return;

  try {
    const toStore = {
      version: STORAGE_VERSION,
      timestamp: new Date().toISOString(),
      data
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

/**
 * Clear state from localStorage
 */
function clearState(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Hook for managing onboarding state with persistence
 */
export function useOnboardingState() {
  const [stateData, setStateData] = useState<OnboardingStateData>(() => {
    // Try to load from localStorage on mount
    const loaded = loadState();
    return loaded || initialState;
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    // Don't persist INPUT state (fresh start)
    if (stateData.state === 'INPUT') {
      clearState();
      return;
    }

    // Don't persist COMPLETION state (finished)
    if (stateData.state === 'COMPLETION') {
      clearState();
      return;
    }

    saveState(stateData);
  }, [stateData]);

  // State transition helpers
  const setState = (newState: OnboardingState) => {
    setStateData(prev => ({ ...prev, state: newState }));
  };

  const setJobId = (jobId: string | null) => {
    setStateData(prev => ({ ...prev, jobId }));
  };

  const setScrapedData = (scrapedData: ScrapedData | null) => {
    setStateData(prev => ({ ...prev, scrapedData }));
  };

  const setHomeData = (homeData: HomeData | null) => {
    setStateData(prev => ({ ...prev, homeData }));
  };

  const setSuggestedPages = (suggestedPages: PageInfo[]) => {
    setStateData(prev => ({ ...prev, suggestedPages }));
  };

  const setCurrentOfferingIndex = (index: number) => {
    setStateData(prev => ({ ...prev, currentOfferingIndex: index }));
  };

  const setTempCompanyInfo = (companyInfo: CompanyInfo | null) => {
    setStateData(prev => ({ ...prev, tempCompanyInfo: companyInfo }));
  };

  const setTempExtraInfo = (extraInfo: string) => {
    setStateData(prev => ({ ...prev, tempExtraInfo: extraInfo }));
  };

  const setTempSelectedOfferings = (offerings: Offering[]) => {
    setStateData(prev => ({ ...prev, tempSelectedOfferings: offerings }));
  };

  const setProgress = (progress: OnboardingStateData['progress']) => {
    setStateData(prev => ({ ...prev, progress }));
  };

  const updateProgress = (updater: (prev: OnboardingStateData['progress']) => OnboardingStateData['progress']) => {
    setStateData(prev => ({ ...prev, progress: updater(prev.progress) }));
  };

  // Reset to initial state
  const resetState = () => {
    clearState();
    setStateData(initialState);
  };

  // Check if we can resume from saved state
  const canResume = stateData.state !== 'INPUT' && stateData.state !== 'COMPLETION';

  return {
    // State values
    state: stateData.state,
    jobId: stateData.jobId,
    scrapedData: stateData.scrapedData,
    homeData: stateData.homeData,
    suggestedPages: stateData.suggestedPages,
    currentOfferingIndex: stateData.currentOfferingIndex,
    tempCompanyInfo: stateData.tempCompanyInfo,
    tempExtraInfo: stateData.tempExtraInfo,
    tempSelectedOfferings: stateData.tempSelectedOfferings,
    progress: stateData.progress,

    // Setters
    setState,
    setJobId,
    setScrapedData,
    setHomeData,
    setSuggestedPages,
    setCurrentOfferingIndex,
    setTempCompanyInfo,
    setTempExtraInfo,
    setTempSelectedOfferings,
    setProgress,
    updateProgress,

    // Utilities
    resetState,
    canResume
  };
}
