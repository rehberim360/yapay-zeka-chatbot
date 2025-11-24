import axios from 'axios';
import pkg from 'xml2js';
const { Parser } = pkg;


export interface SitemapLink {
    url: string;
    lastModified?: string;
    priority?: string;
}

export class SitemapService {
    /**
     * Bir URL'in sitemap.xml dosyasını bulmaya çalışır
     * Önce /sitemap.xml, sonra /sitemap_index.xml, sonra robots.txt kontrol eder
     */
    async findAndParseSitemap(rootUrl: string): Promise<SitemapLink[]> {
        const enableSitemap = process.env.ENABLE_SITEMAP === 'true';
        if (!enableSitemap) {
            console.log('📍 Sitemap desteği kapalı (.env ENABLE_SITEMAP=false)');
            return [];
        }

        console.log('📍 Sitemap aranıyor...');

        // URL'i temizle (trailing slash kaldır)
        const baseUrl = rootUrl.replace(/\/$/, '');

        // Sitemap çeşitleri
        const sitemapUrls = [
            `${baseUrl}/sitemap.xml`,
            `${baseUrl}/sitemap_index.xml`,
            `${baseUrl}/sitemap-index.xml`,
            `${baseUrl}/sitemap/sitemap.xml`
        ];

        // Önce sitemap.xml dene
        for (const sitemapUrl of sitemapUrls) {
            try {
                const links = await this.fetchAndParseSitemap(sitemapUrl);
                if (links.length > 0) {
                    console.log(`✅ Sitemap bulundu: ${sitemapUrl} (${links.length} URL)`);
                    return links;
                }
            } catch (error) {
                // Devam et, başka sitemap dene
            }
        }

        // robots.txt'den sitemap konumunu öğrenmeyi dene
        try {
            const robotsUrl = `${baseUrl}/robots.txt`;
            const robotsLinks = await this.findSitemapFromRobots(robotsUrl);
            if (robotsLinks.length > 0) {
                console.log(`✅ Sitemap robots.txt'den bulundu (${robotsLinks.length} URL)`);
                return robotsLinks;
            }
        } catch (error) {
            // Sorun değil
        }

        console.log('⚠️ Sitemap bulunamadı, klasik scraping devam edecek');
        return [];
    }

    private async fetchAndParseSitemap(sitemapUrl: string): Promise<SitemapLink[]> {
        const response = await axios.get(sitemapUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AI-Chatbot-Bot/1.0)'
            }
        });

        const xmlData = response.data;
        const parser = new Parser();
        const result = await parser.parseStringPromise(xmlData);

        const links: SitemapLink[] = [];

        // Normal sitemap (urlset)
        if (result.urlset && result.urlset.url) {
            for (const urlEntry of result.urlset.url) {
                links.push({
                    url: urlEntry.loc[0],
                    lastModified: urlEntry.lastmod?.[0],
                    priority: urlEntry.priority?.[0]
                });
            }
        }

        // Sitemap index (sitemapindex)
        if (result.sitemapindex && result.sitemapindex.sitemap) {
            for (const sitemapEntry of result.sitemapindex.sitemap) {
                const childSitemapUrl = sitemapEntry.loc[0];
                try {
                    const childLinks = await this.fetchAndParseSitemap(childSitemapUrl);
                    links.push(...childLinks);
                } catch (error) {
                    console.warn(`⚠️ Child sitemap fetch failed: ${childSitemapUrl}`);
                }
            }
        }

        return links;
    }

    private async findSitemapFromRobots(robotsUrl: string): Promise<SitemapLink[]> {
        const response = await axios.get(robotsUrl, {
            timeout: 5000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; AI-Chatbot-Bot/1.0)'
            }
        });

        const robotsTxt = response.data;
        const sitemapLines = robotsTxt.split('\n')
            .filter((line: string) => line.toLowerCase().startsWith('sitemap:'));

        for (const line of sitemapLines) {
            const sitemapUrl = line.split(':', 2)[1].trim();
            try {
                const links = await this.fetchAndParseSitemap(sitemapUrl);
                if (links.length > 0) {
                    return links;
                }
            } catch (error) {
                // Devam
            }
        }

        return [];
    }

    /**
     * Sitemap'ten gelen URL'leri "değerli" sayfalara filtreler
     * Hizmet/Ürün/Fiyat detay sayfalarını tanımaya çalışır
     */
    filterValuableUrls(sitemapLinks: SitemapLink[], rootUrl: string): { text: string; href: string }[] {
        const valuablePatterns = [
            /\/(hizmet|service|tedavi|treatment|urun|product|menu|yemek|food|dish)/i,
            /\/(fiyat|price|pricing)/i,
            /\/(oda|room|konaklama|accommodation)/i,
            /\/(paket|package|kampanya|offer)/i
        ];

        const noisePatterns = [
            /\/(blog|haber|news|makale|article)/i,
            /\/(kategori|category|etiket|tag)/i,
            /\/(sepet|cart|checkout|giris|login|kayit|register)/i,
            /\/(sayfa|page)\//i  // Pagination
        ];

        return sitemapLinks
            .filter(link => {
                const url = link.url.toLowerCase();

                // Gürültü kontrolü
                if (noisePatterns.some(pattern => pattern.test(url))) {
                    return false;
                }

                // Ana sayfa değil
                if (url === rootUrl || url === `${rootUrl}/`) {
                    return false;
                }

                // Değerli pattern'lerden birine uyuyor mu?
                return valuablePatterns.some(pattern => pattern.test(url));
            })
            .map(link => ({
                text: this.extractTitleFromUrl(link.url),
                href: link.url
            }))
            .slice(0, 150); // Max 150 link
    }

    private extractTitleFromUrl(url: string): string {
        // URL'den slug çıkar ve başlık haline getir
        try {
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('/').filter(p => p);
            const lastPart = pathParts[pathParts.length - 1] || '';
            return lastPart
                .replace(/-/g, ' ')
                .replace(/_/g, ' ')
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ');
        } catch {
            return 'Unknown';
        }
    }
}
