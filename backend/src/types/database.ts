export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Tenant {
    id: string;
    name: string;
    sector: string | null;
    metadata: {
        address?: string;
        phone?: string;
        website?: string;
        tone_of_voice?: string;
        description?: string;
        detected_language?: string;
        [key: string]: any;
    };
    created_at: string;
    updated_at: string;
}

export interface Offering {
    id: string;
    tenant_id: string;
    name: string;
    type: 'SERVICE' | 'PRODUCT';
    price: number | null;
    currency: string;
    duration_min: number | null;
    category: string | null;
    attributes: {
        description?: string;
        features?: string[];
        [key: string]: any;
    };
    created_at: string;
    updated_at: string;
}

export interface ScrapingJob {
    id: string;
    tenant_id: string | null;
    status: 'PENDING' | 'DISCOVERY' | 'STRATEGY' | 'WAITING_APPROVAL' | 'DEEP_DIVE' | 'COMPLETED' | 'FAILED';
    root_url: string;
    total_pages_found: number;
    processed_pages: number;
    error_log: string | null;
    created_at: string;
}

export interface ScrapedPage {
    id: string;
    job_id: string | null;
    url: string;
    page_type: 'HOME' | 'SERVICE_DETAIL' | 'PRODUCT_DETAIL' | 'CONTACT' | 'JOB_RESULT' | string | null;
    raw_markdown: string | null;
    extracted_data: Json | null;
    is_processed: boolean;
    created_at: string;
}

// AI Extraction Response Types
export interface CompanyInfo {
    name: string;
    sector: string;
    description?: string;
    detected_language?: string;
    tone_of_voice?: string;
    contact?: {
        phone?: string;
        email?: string;
        address?: string;
    };
}

export interface OfferingData {
    name: string;
    type: 'SERVICE' | 'PRODUCT';
    description?: string;
    price?: number;
    currency?: string;
    estimated_duration_minutes?: number;
    features?: string[];
    category?: string;
}

export interface ExtractedPageData {
    company_info?: CompanyInfo;
    offerings?: OfferingData[];
    extracted_knowledge?: string;
}

export interface JobResultData {
    company_info: CompanyInfo;
    offerings: OfferingData[];
    extracted_knowledge?: string;
}
