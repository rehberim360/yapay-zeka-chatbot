import { ScraperService } from './scraper.js';
import { AiExtractorService } from './ai-extractor.js';
import { SitemapService } from './sitemap.js';
import { supabase } from '../lib/supabase.js';

export class OrchestratorService {
    private scraper: ScraperService;
    private ai: AiExtractorService;
    private sitemap: SitemapService;

    constructor() {
        this.scraper = new ScraperService();
        this.ai = new AiExtractorService();
        this.sitemap = new SitemapService();
    }

    async startJob(url: string): Promise<any> {
        // Create Job in DB
        const { data: job, error } = await supabase
            .from('scraping_jobs')
            .insert({
                root_url: url,
                status: 'PENDING'
            })
            .select()
            .single();

        if (error) {
            console.error('Failed to create job:', error);
            throw new Error('Database error: Could not create scraping job');
        }

        // Start async process
        this.processJob(job.id, url);

        return job;
    }

    private async updateJobStatus(jobId: string, status: string, logs?: string[], result?: any, error?: any) {
        const updateData: any = { status };
        // Result is now stored in scraped_pages table, so we don't update it here to avoid schema errors
        if (error) updateData.error_log = error.message || JSON.stringify(error);

        console.log(`📝 Updating job ${jobId} status to: ${status}`);
        const { error: updateError } = await supabase.from('scraping_jobs').update(updateData).eq('id', jobId);

        if (updateError) {
            console.error(`❌ Failed to update job status:`, updateError);
        } else {
            console.log(`✅ Job status updated successfully to: ${status}`);
        }
    }

    private async saveScrapedPage(jobId: string, url: string, type: string, markdown: string, data: any) {
        const { error } = await supabase.from('scraped_pages').insert({
            job_id: jobId,
            url: url,
            page_type: type,
            raw_markdown: markdown,
            extracted_data: data
        });

        if (error) {
            console.error(`❌ Failed to save page ${url} to DB:`, error);
            // Critical pages (like JOB_RESULT) should throw an error to prevent job completion
            if (type === 'JOB_RESULT') {
                throw new Error(`Critical error: Failed to save ${type} page to database: ${error.message}`);
            }
        } else {
            console.log(`💾 Saved page ${url} to DB.`);
        }
    }

    private async savePendingApprovals(jobId: string, suggestedPages: { url: string; type: string }[], homeData: any) {
        // Ana sayfadan çıkarılan offerings'leri de ekle
        const enrichedPages = suggestedPages.map(page => ({
            ...page,
            // URL'den sayfa adını tahmin et (fallback)
            title: this.extractTitleFromUrl(page.url)
        }));

        const { error } = await supabase.from('pending_approvals').insert({
            job_id: jobId,
            suggested_pages: enrichedPages,
            home_data: homeData // Firma bilgileri ve ana sayfa offerings'leri
        });

        if (error) {
            console.error(`❌ Failed to save pending approvals:`, error);
            throw new Error('Could not save pending approvals to database');
        } else {
            console.log(`💾 Saved ${suggestedPages.length} pages for user approval.`);
        }
    }

    private extractTitleFromUrl(url: string): string {
        try {
            const urlObj = new URL(url);
            const path = urlObj.pathname;
            // Son segment'i al ve temizle
            const segments = path.split('/').filter(s => s.length > 0);
            const lastSegment = segments[segments.length - 1] || 'Ana Sayfa';
            // Kebab-case'i Title Case'e çevir
            return lastSegment
                .split('-')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        } catch {
            return 'Sayfa';
        }
    }

    private async processJob(jobId: string, rootUrl: string) {
        try {
            // PHASE 1: DISCOVERY
            await this.updateJobStatus(jobId, 'DISCOVERY');
            console.log('Starting Discovery Phase...');

            // 1.a Sitemap Kontrolü (Opsiyonel)
            const sitemapLinks = await this.sitemap.findAndParseSitemap(rootUrl);
            let discoveredLinks: { text: string; href: string }[] = [];

            if (sitemapLinks.length > 0) {
                console.log(`📍 Sitemap'ten ${sitemapLinks.length} URL bulundu`);
                discoveredLinks = this.sitemap.filterValuableUrls(sitemapLinks, rootUrl);
                console.log(`📍 Filtreleme sonrası ${discoveredLinks.length} değerli URL`);
            }

            // 1.b Klasik Scraping (Sitemap yoksa veya yeterli link yoksa)
            const homeResult = await this.scraper.scrapePage(rootUrl);
            console.log(`Discovery complete. Found ${homeResult.links.length} links from HTML.`);

            // Sitemap + HTML linklerini birleştir (ama önce sitemap)
            const allLinks = discoveredLinks.length > 0
                ? [...discoveredLinks, ...homeResult.links]
                : homeResult.links;

            // Save Home Page
            const homeData = await this.ai.extractData(homeResult.markdown);
            await this.saveScrapedPage(jobId, rootUrl, 'HOME', homeResult.markdown, homeData);
            
            console.log(`📊 Ana Sayfa Özeti:`);
            console.log(`   - Firma: ${homeData.company_info?.name || 'Bulunamadı'}`);
            console.log(`   - Sektör: ${homeData.company_info?.sector || 'Bulunamadı'}`);
            console.log(`   - Bulunan Hizmet/Ürün: ${homeData.offerings?.length || 0}`);
            console.log(`   - Toplam Link: ${allLinks.length}`);

            // PHASE 2: STRATEGY
            await this.updateJobStatus(jobId, 'STRATEGY');
            console.log('Analyzing links with AI...');

            const strategyResult = await this.ai.analyzeLinks(allLinks, rootUrl);
            
            // ⚠️ GÜVENLIK: Çift kontrol - Gemini limiti aşarsa zorla kısalt
            const maxPagesLimit = parseInt(process.env.MAX_PAGES_TO_SCRAPE || '10', 10);
            if (strategyResult.relevant_links.length > maxPagesLimit) {
                console.warn(`⚠️ UYARI: Gemini ${strategyResult.relevant_links.length} link döndürdü ama MAX_PAGES_TO_SCRAPE=${maxPagesLimit}`);
                console.warn(`⚠️ İlk ${maxPagesLimit} link alınıyor, geri kalanı görmezden geliniyor.`);
                strategyResult.relevant_links = strategyResult.relevant_links.slice(0, maxPagesLimit);
            }
            
            console.log(`\n📊 Strateji Özeti:`);
            console.log(`   - Toplam Link Analiz Edildi: ${allLinks.length}`);
            console.log(`   - Gemini'nin Seçtiği Sayfa: ${strategyResult.relevant_links.length}`);
            console.log(`   - MAX_PAGES_TO_SCRAPE Limiti: ${maxPagesLimit}`);
            console.log(`   - Kullanıcıya Önerilecek Sayfa: ${Math.min(strategyResult.relevant_links.length, maxPagesLimit)}`);
            console.log(`\n   📄 Taranacak Sayfa Listesi:`);
            strategyResult.relevant_links.forEach((link, idx) => {
                console.log(`     ${idx + 1}. [${link.type}] ${link.url}`);
            });
            console.log('');

            // WAITING FOR USER APPROVAL
            await this.updateJobStatus(jobId, 'WAITING_APPROVAL');
            console.log('⏸️ Job paused. Waiting for user approval...');

            // Suggestion'ları ve ana sayfa verisini DB'ye kaydet
            await this.savePendingApprovals(jobId, strategyResult.relevant_links, homeData);

            // İşlem burada durur, kullanıcı onayını bekler
            // continueWithApprovedPages() metodu onay geldiğinde çağrılacak

        } catch (error) {
            console.error('Job failed:', error);
            await this.updateJobStatus(jobId, 'FAILED', [], undefined, error);
        }
    }

    /**
     * Kullanıcı onayladıktan sonra deep dive fazına devam et
     */
    async continueWithApprovedPages(jobId: string, approvedPages: { url: string; type: string }[]) {
        try {
            console.log(`🚀 Continuing job ${jobId} with ${approvedPages.length} approved pages`);

            // PHASE 3: DEEP DIVE
            await this.updateJobStatus(jobId, 'DEEP_DIVE');
            console.log('Starting Deep Dive Phase...');

            // Ana sayfa verisini al
            const { data: homePageData } = await supabase
                .from('scraped_pages')
                .select('extracted_data')
                .eq('job_id', jobId)
                .eq('page_type', 'HOME')
                .single();

            const homeData = homePageData?.extracted_data || {};

            const allOfferings: any[] = [];
            // Ana sayfadan gelen offerings'e metadata ekle
            if (homeData.offerings) {
                const homeOfferings = homeData.offerings.map((o: any) => ({
                    ...o,
                    _source_type: 'HOME'
                }));
                allOfferings.push(...homeOfferings);
            }

            // Limit pages based on .env config
            const maxPages = parseInt(process.env.MAX_PAGES_TO_SCRAPE || '10', 10);
            const targetLinks = approvedPages.slice(0, maxPages);

            console.log(`\n${'='.repeat(80)}`);
            console.log(`📊 SCRAPING SUMMARY`);
            console.log(`${'='.repeat(80)}`);
            console.log(`📄 Ana Sayfa: 1 sayfa (HOME)`);
            console.log(`📄 Detay Sayfaları: ${targetLinks.length} sayfa`);
            console.log(`📄 TOPLAM TARANACAK SAYFA: ${1 + targetLinks.length} sayfa`);
            console.log(`${'='.repeat(80)}\n`);

            for (const link of targetLinks) {
                console.log(`🚀 Deep diving into: ${link.url}`);
                try {
                    const pageResult = await this.scraper.scrapePage(link.url);

                    console.log(`🧠 AI analyzing content length: ${pageResult.markdown.length} chars`);

                    const pageData = await this.ai.extractData(pageResult.markdown);

                    // Save Child Page
                    await this.saveScrapedPage(jobId, link.url, link.type, pageResult.markdown, pageData);

                    if (pageData.offerings && pageData.offerings.length > 0) {
                        console.log(`✅ Found ${pageData.offerings.length} offerings in ${link.url}`);
                        // Detay sayfalarından gelen offerings'e metadata ekle
                        const detailOfferings = pageData.offerings.map((o: any) => ({
                            ...o,
                            _source_type: link.type // SERVICE_DETAIL, PRODUCT_DETAIL, etc.
                        }));
                        allOfferings.push(...detailOfferings);
                    } else {
                        console.log(`⚠️ No offerings found in ${link.url}`);
                    }
                } catch (e) {
                    console.error(`❌ Failed to scrape ${link.url}`, e);
                }
            }

            // Merge Data
            const finalResult = {
                company_info: homeData.company_info,
                extracted_knowledge: homeData.extracted_knowledge,
                offerings: this.mergeOfferings(allOfferings)
            };

            // Save Final Result as a special page entry (workaround for missing 'result' column in scraping_jobs)
            // Use a valid-looking URL to avoid potential validation issues
            await this.saveScrapedPage(jobId, 'http://internal/job-result', 'JOB_RESULT', '', finalResult);

            await this.updateJobStatus(jobId, 'COMPLETED');
            
            console.log(`\n${'='.repeat(80)}`);
            console.log(`✅ JOB COMPLETED SUCCESSFULLY`);
            console.log(`${'='.repeat(80)}`);
            console.log(`📄 Toplam Taranan Sayfa: ${1 + targetLinks.length} sayfa`);
            console.log(`   - Ana Sayfa: 1`);
            console.log(`   - Detay Sayfaları: ${targetLinks.length}`);
            console.log(`🎯 Toplam Hizmet/Ürün: ${finalResult.offerings.length}`);
            console.log(`${'='.repeat(80)}\n`);

        } catch (error) {
            console.error('Job failed:', error);
            await this.updateJobStatus(jobId, 'FAILED', [], undefined, error);
        }
    }

    private mergeOfferings(offerings: any[]): any[] {
        const unique = new Map();

        // Priority: Detay sayfalarındaki veriler ana sayfadaki verileri ezer
        // Önce ana sayfa, sonra detay sayfaları eklenirse, detaylar üzerine yazar
        const sorted = offerings.sort((a, b) => {
            // HOME veya LISTING'den gelenleri önce ekle, sonra DETAIL'ları
            const aIsDetail = a._source_type?.includes('DETAIL');
            const bIsDetail = b._source_type?.includes('DETAIL');
            return aIsDetail === bIsDetail ? 0 : aIsDetail ? 1 : -1;
        });

        sorted.forEach(o => {
            const key = o.name?.toLowerCase().trim();
            if (key && !unique.has(key)) {
                // İlk görülen adı ekle
                unique.set(key, o);
            } else if (key && unique.has(key)) {
                // Eğer yeni olan daha detaylıysa (DETAIL tipindeyse), güncelle
                const existing = unique.get(key);
                const newIsDetail = o._source_type?.includes('DETAIL');
                const existingIsDetail = existing._source_type?.includes('DETAIL');

                if (newIsDetail && !existingIsDetail) {
                    console.log(`🔄 Detay sayfası verisi "${o.name}" ana sayfa verisinin üzerine yazıldı`);
                    unique.set(key, o);
                }
            }
        });

        return Array.from(unique.values()).map(o => {
            // _source_type'ı kullanıcıya gösterme, sadece internal
            const { _source_type, ...clean } = o;
            return clean;
        });
    }

    async getJobStatus(jobId: string) {
        const { data, error } = await supabase
            .from('scraping_jobs')
            .select('*')
            .eq('id', jobId)
            .single();

        if (error) {
            console.error(`❌ Error fetching job status for ${jobId}:`, error);
            return null;
        }
        
        if (!data) {
            console.error(`❌ No job found with ID: ${jobId}`);
            return null;
        }

        console.log(`✅ Job ${jobId} status: ${data.status}`);
        return data;
    }

    async getJobResult(jobId: string) {
        const { data, error } = await supabase
            .from('scraped_pages')
            .select('extracted_data')
            .eq('job_id', jobId)
            .eq('page_type', 'JOB_RESULT')
            .single();

        if (error) {
            console.error('❌ Error fetching job result:', error);
            return null;
        }
        if (!data) {
            console.error('❌ No data found for JOB_RESULT');
            return null;
        }
        console.log('✅ Job result data found:', JSON.stringify(data.extracted_data).substring(0, 200));
        return data.extracted_data;
    }

    async processUrl(url: string): Promise<any> {
        const job = await this.startJob(url);
        console.log(`Job started with ID: ${job.id}`);
        console.log(`🔄 Starting polling loop. Initial status: ${job.status}`);

        // Poll DB for status
        let currentStatus = job.status;
        let result = null;
        let errorCount = 0;
        let pollCount = 0;

        while (currentStatus !== 'COMPLETED' && currentStatus !== 'FAILED') {
            pollCount++;
            console.log(`🔄 Poll #${pollCount} - Current status: ${currentStatus}`);
            await new Promise(resolve => setTimeout(resolve, 1000));

            const updatedJob = await this.getJobStatus(job.id);
            console.log(`🔄 Poll #${pollCount} - Updated job:`, updatedJob ? `status=${updatedJob.status}` : 'NULL');

            if (updatedJob) {
                currentStatus = updatedJob.status;
                console.log(`🔄 Poll #${pollCount} - Status updated to: ${currentStatus}`);
            } else {
                console.warn(`⚠️ Failed to poll job status for ${job.id}`);
                errorCount++;
                if (errorCount > 10) {
                    throw new Error('Lost connection to database while polling job status');
                }
            }

            // Safety check to prevent infinite loop
            if (pollCount > 300) { // 5 minutes max
                console.error(`❌ Polling timeout after ${pollCount} attempts`);
                throw new Error('Job polling timeout - exceeded 5 minutes');
            }
        }

        console.log(`Polling finished. Final status: ${currentStatus}`);

        if (currentStatus === 'FAILED') {
            throw new Error('Analysis failed during execution');
        }

        // Fetch result from scraped_pages
        console.log('Fetching final result from DB...');
        result = await this.getJobResult(job.id);

        if (!result) {
            console.error('❌ Could not find job result in scraped_pages');
            throw new Error('Job completed but result could not be retrieved from database');
        }

        console.log('✅ Retrieved job result from DB. Returning to frontend...');
        console.log('Result preview:', JSON.stringify(result).substring(0, 300));

        return result;
    }
}
