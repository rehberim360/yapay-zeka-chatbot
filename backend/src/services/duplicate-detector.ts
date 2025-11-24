/**
 * Duplicate Detector Service
 * Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6, 5.7, 5.8
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import type { Offering, DuplicateDetectionResult, DuplicateGroup } from '../types/onboarding-v2.js';

dotenv.config();

export class DuplicateDetector {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-preview-09-2025',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });
  }

  /**
   * Calculate Levenshtein distance between two strings
   * Used for similar name detection
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];

    // Initialize matrix
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      if (matrix[0]) {
        matrix[0][j] = j;
      }
    }

    // Fill matrix
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        const prevRow = matrix[i - 1];
        const currRow = matrix[i];
        
        if (prevRow && currRow) {
          const prevCell = currRow[j - 1];
          const diagCell = prevRow[j - 1];
          const aboveCell = prevRow[j];
          
          if (prevCell !== undefined && diagCell !== undefined && aboveCell !== undefined && matrix[i]) {
            matrix[i]![j] = Math.min(
              aboveCell + 1,       // deletion
              prevCell + 1,        // insertion
              diagCell + cost      // substitution
            );
          }
        }
      }
    }

    const lastRow = matrix[len1];
    const result = lastRow?.[len2];
    return result !== undefined ? result : len2;
  }

  /**
   * Check if two offerings are variants (e.g., Kadın/Erkek, Büyük/Küçük)
   * Requirements: 5.6
   */
  private isVariant(name1: string, name2: string): boolean {
    const variantKeywords = [
      'kadın', 'erkek', 'çocuk',
      'büyük', 'orta', 'küçük',
      'small', 'medium', 'large',
      'boy', 'girl', 'kid',
      'xs', 's', 'm', 'l', 'xl', 'xxl'
    ];

    const lower1 = name1.toLowerCase();
    const lower2 = name2.toLowerCase();

    // Check if both names contain variant keywords
    const hasVariant1 = variantKeywords.some(keyword => lower1.includes(keyword));
    const hasVariant2 = variantKeywords.some(keyword => lower2.includes(keyword));

    if (hasVariant1 && hasVariant2) {
      // Remove variant keywords and compare base names
      let base1 = lower1;
      let base2 = lower2;
      
      variantKeywords.forEach(keyword => {
        base1 = base1.replace(keyword, '').trim();
        base2 = base2.replace(keyword, '').trim();
      });

      // If base names are similar, they are variants
      return this.levenshteinDistance(base1, base2) <= 2;
    }

    return false;
  }

  /**
   * Get completeness score for an offering
   * Higher score = more complete information
   */
  private getCompletenessScore(offering: Offering): number {
    let score = 0;
    
    if (offering.name) score += 1;
    if (offering.description && offering.description.length > 10) score += 2;
    if (offering.price !== null && offering.price !== undefined) score += 2;
    if (offering.category) score += 1;
    if (offering.meta_info && Object.keys(offering.meta_info).length > 0) score += 2;
    if (offering.image_url) score += 1;
    
    return score;
  }

  /**
   * Detect duplicates using exact and similar name matching
   * Requirements: 5.1, 5.2, 5.3, 5.4
   */
  async detectDuplicates(offerings: Offering[]): Promise<DuplicateDetectionResult> {
    console.log(`🔍 Detecting duplicates in ${offerings.length} offerings...`);
    
    const duplicateGroups: DuplicateGroup[] = [];
    const processed = new Set<number>();
    const uniqueOfferings: Offering[] = [];

    for (let i = 0; i < offerings.length; i++) {
      if (processed.has(i)) continue;

      const current = offerings[i];
      if (!current) continue;
      
      const group: Array<{ id?: number; name: string; source: string }> = [{
        id: i,
        name: current.name,
        source: current.source_url || 'unknown'
      }];

      // Find potential duplicates
      for (let j = i + 1; j < offerings.length; j++) {
        if (processed.has(j)) continue;

        const candidate = offerings[j];
        if (!candidate) continue;

        // Exact name match (Requirements: 5.2)
        if (current.name.toLowerCase() === candidate.name.toLowerCase()) {
          group.push({
            id: j,
            name: candidate.name,
            source: candidate.source_url || 'unknown'
          });
          processed.add(j);
          continue;
        }

        // Similar name detection (Levenshtein distance < 3) (Requirements: 5.3)
        const distance = this.levenshteinDistance(
          current.name.toLowerCase(),
          candidate.name.toLowerCase()
        );

        if (distance < 3 && distance > 0) {
          // Check if they are variants (Requirements: 5.6)
          if (this.isVariant(current.name, candidate.name)) {
            // Keep as separate offerings (variants should not be merged)
            continue;
          }

          // Similar names but not variants - potential duplicate
          group.push({
            id: j,
            name: candidate.name,
            source: candidate.source_url || 'unknown'
          });
          processed.add(j);
        }
      }

      // If group has duplicates, decide how to handle them
      if (group.length > 1) {
        // Get all offerings in this group
        const groupOfferings = group
          .map(g => offerings[g.id!])
          .filter(o => o !== undefined) as Offering[];

        // Find the most complete offering (Requirements: 5.3)
        const mostComplete = groupOfferings.reduce((best, current) => {
          const bestScore = this.getCompletenessScore(best);
          const currentScore = this.getCompletenessScore(current);
          return currentScore > bestScore ? current : best;
        });

        duplicateGroups.push({
          group,
          recommendation: 'MERGE',
          reason: 'Identical or similar names detected',
          suggested_merge: mostComplete
        });

        // Add the most complete offering to unique list
        uniqueOfferings.push(mostComplete);
        processed.add(i);
      } else {
        // No duplicates found, add to unique list
        uniqueOfferings.push(current);
        processed.add(i);
      }
    }

    console.log(`✅ Found ${duplicateGroups.length} duplicate groups`);
    console.log(`✅ ${uniqueOfferings.length} unique offerings after deduplication`);

    return {
      duplicates: duplicateGroups,
      unique_offerings: uniqueOfferings
    };
  }

  /**
   * AI-assisted duplicate confirmation for edge cases
   * Requirements: 5.4, 5.5
   */
  async confirmDuplicatesWithAI(
    offering1: Offering,
    offering2: Offering
  ): Promise<{ isDuplicate: boolean; reason: string }> {
    const prompt = `
Sen bir veri analisti uzmanısın. İki hizmet/ürünün aynı şey olup olmadığını belirlemelisin.

HİZMET/ÜRÜN 1:
İsim: ${offering1.name}
Açıklama: ${offering1.description || 'Yok'}
Kategori: ${offering1.category || 'Yok'}
Fiyat: ${offering1.price || 'Yok'} ${offering1.currency || ''}

HİZMET/ÜRÜN 2:
İsim: ${offering2.name}
Açıklama: ${offering2.description || 'Yok'}
Kategori: ${offering2.category || 'Yok'}
Fiyat: ${offering2.price || 'Yok'} ${offering2.currency || ''}

SORU: Bu iki hizmet/ürün aynı şey mi, yoksa farklı varyantlar mı?

KURALLAR:
- Eğer sadece isim farklılığı varsa (örn: "Saç Kesimi" vs "Saç Kesimi Hizmeti") → AYNI
- Eğer varyant göstergeleri varsa (Kadın/Erkek, Büyük/Küçük) → FARKLI
- Eğer fiyatlar çok farklıysa → FARKLI
- Eğer kategoriler farklıysa → FARKLI

JSON FORMATI:
{
  "is_duplicate": true,
  "reason": "Açıklama"
}
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const parsed = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim());
      
      return {
        isDuplicate: parsed.is_duplicate,
        reason: parsed.reason
      };
    } catch (error) {
      console.error('AI duplicate confirmation error:', error);
      // Default to not duplicate if AI fails
      return {
        isDuplicate: false,
        reason: 'AI confirmation failed, keeping both'
      };
    }
  }

  /**
   * Merge duplicate offerings
   * Requirements: 5.7, 5.8
   */
  mergeDuplicates(duplicates: DuplicateGroup[]): Offering[] {
    return duplicates
      .map(group => group.suggested_merge)
      .filter(offering => offering !== undefined) as Offering[];
  }
}
