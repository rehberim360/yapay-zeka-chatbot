// Onboarding sürecinde kullanılan type'lar

// Backend V2 ile uyumlu flat yapı
export interface CompanyInfo {
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
    social_media?: {
        instagram?: string;
        facebook?: string;
        twitter?: string;
        linkedin?: string;
        youtube?: string;
        tiktok?: string;
    };
    website?: string;
    extra_info?: string;
}

export interface Offering {
    name: string;
    description?: string;
    type: 'SERVICE' | 'PRODUCT';
    price?: number;
    currency?: string;
    estimated_duration_minutes?: number;
    duration?: number;
    duration_unit?: string;
    category?: string;
    features?: string[];
    image_url?: string;
    meta_info?: Record<string, unknown>;
}

export interface PageInfo {
    url: string;
    type: string;
    title?: string;
}

export interface ScrapedData {
    company_info: CompanyInfo;
    offerings: Offering[];
    extracted_knowledge?: Array<{
        key: string;
        value: string;
    }>;
}

export interface HomeData {
    company_info: CompanyInfo;
    offerings?: Offering[];
    bot_purpose?: string; // APPOINTMENT, RESERVATION, BOOKING, ORDER, LEAD, INFO
    sector?: string;
}

export interface JobStatus {
    id: string;
    status: 'PENDING' | 'DISCOVERY' | 'STRATEGY' | 'WAITING_APPROVAL' | 'DEEP_DIVE' | 'COMPLETED' | 'FAILED';
    root_url: string;
    created_at: string;
    updated_at: string;
    error_log?: string;
}

export interface PendingApprovals {
    success: boolean;
    suggestedPages: PageInfo[];
    homeData: HomeData;
}

export interface JobResult {
    company_info: CompanyInfo;
    offerings: Offering[];
    extracted_knowledge?: Array<{
        key: string;
        value: string;
    }>;
}
