import puppeteer, { Browser, Page } from 'puppeteer';
import TurndownService from 'turndown';

export interface ScrapedPageResult {
    markdown: string;
    links: { text: string; href: string }[];
    title: string;
}

export class ScraperService {
    private turndownService: TurndownService;
    private browser: Browser | null = null;

    constructor() {
        this.turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    }

    private async getBrowser(): Promise<Browser> {
        // Reuse existing browser instance for better performance
        if (this.browser && this.browser.isConnected()) {
            return this.browser;
        }
        
        console.log('🚀 Launching new browser instance...');
        this.browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--disable-software-rasterizer',
                '--disable-extensions'
            ]
        });
        
        return this.browser;
    }

    /**
     * Close browser instance (call this when done with all scraping)
     */
    async closeBrowser(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
            this.browser = null;
            console.log('🔒 Browser closed');
        }
    }

    /**
     * Auto-scroll to bottom of page to trigger lazy-loaded images
     * Requirements: 4.4
     */
    private async autoScroll(page: Page): Promise<void> {
        await page.evaluate(async () => {
            await new Promise<void>((resolve) => {
                let totalHeight = 0;
                const distance = 100;
                const timer = setInterval(() => {
                    const scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight) {
                        clearInterval(timer);
                        resolve();
                    }
                }, 100);
            });
        });
    }

    /**
     * Retry with exponential backoff (3s, 6s, 12s)
     * Requirements: 4.13
     */
    private async retry<T>(fn: () => Promise<T>, retries = 3, currentAttempt = 0): Promise<T> {
        try {
            return await fn();
        } catch (error) {
            if (retries > 0) {
                const delays = [3000, 6000, 12000];
                const delay = delays[currentAttempt] || 12000;
                console.warn(`Retrying... attempts left: ${retries}, waiting ${delay}ms`);
                await new Promise(r => setTimeout(r, delay));
                return this.retry(fn, retries - 1, currentAttempt + 1);
            }
            throw error;
        }
    }

    async scrapePage(url: string): Promise<ScrapedPageResult> {
        const browser = await this.getBrowser();
        let page: Page | null = null;
        try {
            page = await browser.newPage();

            // DAHA YUMUŞAK BLOCKING: Sadece büyük medya dosyalarını blokla
            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const resourceType = req.resourceType();
                // Sadece image ve media'yı blokla, CSS/font'ları geçir (render için gerekli olabilir)
                if (['image', 'media'].includes(resourceType)) {
                    req.abort();
                } else {
                    req.continue();
                }
            });

            console.log(`🕷️ Scraping: ${url}`);

            await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

            // DAHA ESNEK NAVIGATION: domcontentloaded yeterli, networkidle2 çok katı
            await this.retry(() => page!.goto(url, {
                waitUntil: 'domcontentloaded', // Daha hızlı ve güvenilir
                timeout: 45000 // 45 saniye (bazı siteler yavaş olabilir)
            }));
            
            // SPA'lar için JavaScript render süresi
            // ⚠️ PlayStüdyo gibi React SPA'lar için daha uzun bekleme gerekebilir
            await new Promise(r => setTimeout(r, 6000)); // 6 saniye (React SPA'lar için)

            // Auto-scroll to trigger lazy-loaded content
            await this.autoScroll(page);

            // Extract links and title with retry logic for execution context errors
            // NAVBAR ÖNCELİKLİ: Menü linklerini önce topla (KOBİ siteleri için kritik!)
            let extractedData = { title: '', links: [] as { text: string; href: string }[], navLinks: [] as { text: string; href: string }[] };
            try {
                extractedData = await this.retry(async () => {
                    // Add a small delay to allow for any immediate client-side redirects
                    await new Promise(r => setTimeout(r, 500));

                    return page!.evaluate(() => {
                        // 1. ÖNCE NAVBAR/MENU LİNKLERİNİ TOPLA (Yüksek öncelikli!)
                        const navSelectors = [
                            'nav a',           // <nav> içindeki linkler
                            '.menu a',         // .menu class'ı
                            '.navbar a',       // .navbar class'ı
                            '.header a',       // .header class'ı
                            'header a',        // header içindeki tüm linkler
                            '#menu a',         // #menu id'si
                            '[role="navigation"] a', // ARIA role
                            '.navigation a',   // .navigation class'ı
                            'header nav a'     // header içindeki nav
                        ];
                        
                        const navAnchors = new Set<HTMLAnchorElement>();
                        navSelectors.forEach(selector => {
                            document.querySelectorAll(selector).forEach(a => {
                                if (a instanceof HTMLAnchorElement) {
                                    navAnchors.add(a);
                                }
                            });
                        });
                        
                        const navLinks = Array.from(navAnchors).map(a => ({
                            text: (a as HTMLElement).innerText.trim() || (a as HTMLElement).getAttribute('aria-label') || '',
                            href: (a as HTMLAnchorElement).href,
                            isNav: true
                        }));
                        
                        // 2. SONRA DİĞER TÜM LİNKLERİ TOPLA
                        const allAnchors = Array.from(document.querySelectorAll('a'));
                        const allLinks = allAnchors.map(a => ({
                            text: (a as HTMLElement).innerText.trim() || (a as HTMLElement).getAttribute('aria-label') || '',
                            href: (a as HTMLAnchorElement).href,
                            isNav: false
                        }));
                        
                        // 3. FİLTRELE (noise removal)
                        const noise = ['login', 'signin', 'signup', 'register', 'cart', 'basket', 'account', 'profile', 'logout', 'policy', 'terms', 'kvkk', 'facebook.com', 'twitter.com', 'instagram.com', 'linkedin.com', 'youtube.com'];
                        
                        const cleanNavLinks = navLinks.filter(l => {
                            const lowerHref = l.href.toLowerCase();
                            return l.href.startsWith('http') && 
                                   !l.href.includes('#') && 
                                   !noise.some(n => lowerHref.includes(n)) &&
                                   l.text.length >= 2;
                        });
                        
                        const cleanAllLinks = allLinks.filter(l => {
                            const lowerHref = l.href.toLowerCase();
                            return l.href.startsWith('http') && 
                                   !l.href.includes('#') && 
                                   !noise.some(n => lowerHref.includes(n)) &&
                                   l.text.length >= 2;
                        });
                        
                        // 4. DUPLICATE TEMİZLE: Nav linklerini ÖNCE ekle, sonra diğerlerini
                        const seenHrefs = new Set<string>();
                        const finalLinks: Array<{ text: string; href: string; isNav: boolean }> = [];
                        
                        // Önce nav linklerini ekle
                        cleanNavLinks.forEach(l => {
                            if (!seenHrefs.has(l.href)) {
                                seenHrefs.add(l.href);
                                finalLinks.push(l);
                            }
                        });
                        
                        // Sonra diğer linkleri ekle
                        cleanAllLinks.forEach(l => {
                            if (!seenHrefs.has(l.href)) {
                                seenHrefs.add(l.href);
                                finalLinks.push({ ...l, isNav: false });
                            }
                        });
                        
                        // Max 150 link
                        const limitedLinks = finalLinks.slice(0, 150);
                        
                        return {
                            title: document.title,
                            links: limitedLinks.map(l => ({ text: l.text, href: l.href })),
                            navLinks: limitedLinks.filter(l => l.isNav).map(l => ({ text: l.text, href: l.href }))
                        };
                    });
                }, 3);
                
                console.log(`   📊 Links: ${extractedData.links.length} total (${extractedData.navLinks.length} from navbar)`);
            } catch (err) {
                console.warn(`⚠️ Failed to extract links/title from ${url} after retries. Continuing with content only.`);
            }

            // ÖNCE HTML'İ AL (noise reduction öncesi)
            let html = '';
            try {
                html = await page.content();
            } catch (e) {
                console.warn(`⚠️ Failed to get content for ${url}, trying one more time after delay.`);
                await new Promise(r => setTimeout(r, 1000));
                try {
                    html = await page.content();
                } catch (retryE) {
                    console.error(`❌ Could not retrieve content for ${url}`);
                    throw retryE;
                }
            }

            // HTML boşsa hemen uyar
            if (!html || html.length < 100) {
                console.error(`❌ HTML too short or empty for ${url} (${html.length} chars)`);
                throw new Error(`Empty HTML content for ${url}`);
            }

            // YUMUŞAK Noise Reduction - Sadece gerçek gürültüyü temizle
            // ⚠️ DİKKAT: nav, header, footer SİLİNMEZ! Bunlar önemli linkler içerir
            try {
                await page.evaluate(() => {
                    const selectors = [
                        'script', 
                        'style', 
                        'svg', 
                        'noscript', 
                        'iframe', 
                        '.cookie-banner', 
                        '.cookie-consent',
                        '.popup', 
                        '.modal',
                        '#cookie-banner',
                        '#cookie-consent'
                    ];
                    selectors.forEach(s => document.querySelectorAll(s).forEach(el => el.remove()));
                });
                
                // Temizlenmiş HTML'i tekrar al
                html = await page.content();
            } catch (e) {
                console.warn(`⚠️ Noise reduction failed for ${url}, using original HTML.`);
                // html zaten yukarıda alındı, devam et
            }

            // Markdown'a çevir
            const markdown = this.turndownService.turndown(html);

            // Detaylı log
            console.log(`   📄 HTML: ${html.length} chars → Markdown: ${markdown.length} chars`);

            if (markdown.length < 50) {
                console.warn(`⚠️ Warning: Content too short for ${url} (${markdown.length} chars)`);
                console.warn(`   HTML Preview (first 500 chars):`);
                console.warn(`   ${html.substring(0, 500)}`);
            }

            return { markdown, links: extractedData.links, title: extractedData.title };

        } catch (error) {
            console.error(`❌ Scrape failed for ${url}:`, error);
            throw error;
        } finally {
            // Close only the page, not the browser (browser is reused)
            if (page) {
                await page.close();
            }
        }
    }
}
