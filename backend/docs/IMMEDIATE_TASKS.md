# 🚀 HEMEN YAPILACAKLAR (24 Kasım 2025)

> **Hedef:** Mevcut chatbot sistemini stabilize et  
> **Süre:** 2-3 saat  
> **Öncelik:** P0 (Kritik)

---

## ✅ GÖREV 1: Function Calling'i Aktif Et (1 saat)

### Durum
- ✅ Fonksiyonlar tanımlı
- ❌ Gemini'ye gönderilmiyor
- ❌ Function call handling eksik

### Yapılacaklar

**1.1 Gemini'ye Function Definitions Gönder**

```typescript
// backend/src/services/bot.service.ts

// Mevcut kod:
const model = this.genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-preview-09-2025',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
});

// Değiştirilecek:
const model = this.genAI.getGenerativeModel({
  model: 'gemini-2.5-flash-preview-09-2025',
  generationConfig: {
    temperature: 0.7,
    maxOutputTokens: 2048,
  },
  tools: [
    {
      functionDeclarations: [
        {
          name: 'list_services',
          description: 'Mevcut hizmetleri listele',
          parameters: {
            type: 'object',
            properties: {
              category: {
                type: 'string',
                description: 'Hizmet kategorisi (opsiyonel)',
              },
            },
          },
        },
        {
          name: 'get_service_details',
          description: 'Belirli bir hizmetin detaylarını getir',
          parameters: {
            type: 'object',
            properties: {
              service_id: {
                type: 'string',
                description: 'Hizmet ID',
              },
            },
            required: ['service_id'],
          },
        },
        {
          name: 'search_knowledge_base',
          description: 'Bilgi tabanında arama yap',
          parameters: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Arama sorgusu',
              },
            },
            required: ['query'],
          },
        },
      ],
    },
  ],
});
```

**1.2 Function Call Handling Ekle**

```typescript
// processMessage metodunda:

for await (const chunk of result.stream) {
  const text = chunk.text();
  
  // Function call kontrolü
  if (chunk.functionCalls && chunk.functionCalls.length > 0) {
    const functionCall = chunk.functionCalls[0];
    
    logger.info('Function call detected', {
      name: functionCall.name,
      args: functionCall.args,
    });
    
    // Fonksiyonu çalıştır
    const functionResult = await this.executeFunction(
      tenantId,
      functionCall.name,
      functionCall.args
    );
    
    // Sonucu AI'ya geri gönder
    const followUpPrompt = [
      { text: prompt },
      {
        functionResponse: {
          name: functionCall.name,
          response: functionResult,
        },
      },
    ];
    
    const followUpResult = await model.generateContentStream(followUpPrompt);
    
    for await (const followUpChunk of followUpResult.stream) {
      const followUpText = followUpChunk.text();
      if (followUpText) {
        fullResponse += followUpText;
        yield followUpText;
      }
    }
    
    break; // Function call işlendi
  }
  
  if (text) {
    fullResponse += text;
    yield text;
  }
}
```

**1.3 executeFunction Metodunu Tamamla**

```typescript
private async executeFunction(
  tenantId: string,
  functionName: string,
  args: any
): Promise<any> {
  try {
    switch (functionName) {
      case 'list_services':
        return await this.listServices(tenantId, args);
      
      case 'get_service_details':
        return await this.getServiceDetails(tenantId, args);
      
      case 'search_knowledge_base':
        return await this.searchKnowledgeBase(tenantId, args);
      
      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  } catch (error) {
    logger.error('Function execution failed', {
      functionName,
      args,
      error,
    });
    
    return {
      error: true,
      message: 'Fonksiyon çalıştırılamadı',
    };
  }
}

private async listServices(tenantId: string, args: any) {
  const { data } = await supabase
    .from('offerings')
    .select('id, name, type, price, currency, duration_min, category, description')
    .eq('tenant_id', tenantId)
    .eq('is_available', true)
    .eq('type', 'SERVICE');
  
  return {
    services: data || [],
    count: data?.length || 0,
  };
}

private async getServiceDetails(tenantId: string, args: any) {
  const { data } = await supabase
    .from('offerings')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('id', args.service_id)
    .single();
  
  if (!data) {
    return { error: true, message: 'Hizmet bulunamadı' };
  }
  
  return data;
}

private async searchKnowledgeBase(tenantId: string, args: any) {
  const { data } = await supabase
    .from('bot_knowledge_base')
    .select('question, answer, category')
    .eq('tenant_id', tenantId)
    .eq('is_active', true)
    .ilike('question', `%${args.query}%`)
    .limit(3);
  
  return {
    results: data || [],
    count: data?.length || 0,
  };
}
```

### Test

```bash
# Server'ı başlat
cd backend
npm run dev

# Test script'i çalıştır
node test-chatbot.js
```

**Test Mesajları:**
1. "Hizmetlerinizi gösterebilir misiniz?"
2. "Yoga dersi hakkında bilgi verir misiniz?"
3. "Fiyatlar nedir?"

**Beklenen:** Function call'lar çalışmalı, hizmetler listelenmeli

---

## ✅ GÖREV 2: Redis Cache Entegrasyonu (1 saat)

### 2.1 Upstash Redis Setup

1. https://upstash.com/ → Sign up (GitHub ile)
2. Create Database → Redis
3. Copy connection string

### 2.2 Environment Variables

```bash
# backend/.env
REDIS_URL=rediss://default:xxxxx@xxxxx.upstash.io:6379
```

### 2.3 Redis Client Setup

```bash
npm install ioredis
```

```typescript
// backend/src/lib/redis.ts

import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

export { redis };
```

### 2.4 Cache Service

```typescript
// backend/src/services/cache.service.ts

import { redis } from '../lib/redis.js';

export class CacheService {
  /**
   * Get bot prompt from cache
   */
  async getBotPrompt(tenantId: string): Promise<string | null> {
    const key = `bot_prompt:${tenantId}`;
    return await redis.get(key);
  }
  
  /**
   * Cache bot prompt
   */
  async cacheBotPrompt(tenantId: string, prompt: string): Promise<void> {
    const key = `bot_prompt:${tenantId}`;
    await redis.set(key, prompt, 'EX', 3600); // 1 hour
  }
  
  /**
   * Get offerings from cache
   */
  async getOfferings(tenantId: string): Promise<any[] | null> {
    const key = `offerings:${tenantId}`;
    const cached = await redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }
  
  /**
   * Cache offerings
   */
  async cacheOfferings(tenantId: string, offerings: any[]): Promise<void> {
    const key = `offerings:${tenantId}`;
    await redis.set(key, JSON.stringify(offerings), 'EX', 300); // 5 minutes
  }
  
  /**
   * Invalidate cache
   */
  async invalidate(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
}

export const cacheService = new CacheService();
```

### 2.5 Bot Service'e Entegre Et

```typescript
// backend/src/services/bot.service.ts

import { cacheService } from './cache.service.js';

// buildPrompt metodunda:
private async buildPrompt(tenantId: string, context: any): Promise<string> {
  // Check cache
  const cached = await cacheService.getBotPrompt(tenantId);
  if (cached) {
    logger.info('Using cached bot prompt', { tenantId });
    return this.combinePromptWithHistory(cached, context);
  }
  
  // Build fresh prompt
  const parts: string[] = [];
  
  // ... (mevcut kod)
  
  const basePrompt = parts.join('\n\n---\n\n');
  
  // Cache it
  await cacheService.cacheBotPrompt(tenantId, basePrompt);
  
  return this.combinePromptWithHistory(basePrompt, context);
}

// listServices metodunda:
private async listServices(tenantId: string, args: any) {
  // Check cache
  const cached = await cacheService.getOfferings(tenantId);
  if (cached) {
    logger.info('Using cached offerings', { tenantId });
    return { services: cached, count: cached.length };
  }
  
  // Fetch from database
  const { data } = await supabase
    .from('offerings')
    .select('*')
    .eq('tenant_id', tenantId)
    .eq('is_available', true)
    .eq('type', 'SERVICE');
  
  // Cache it
  if (data) {
    await cacheService.cacheOfferings(tenantId, data);
  }
  
  return { services: data || [], count: data?.length || 0 };
}
```

### Test

```bash
# İlk request (cache miss)
node test-chatbot.js

# İkinci request (cache hit)
node test-chatbot.js
```

**Beklenen:** İkinci request daha hızlı olmalı

---

## ✅ GÖREV 3: Error Handling İyileştirme (30 dakika)

### 3.1 Circuit Breaker Pattern

```typescript
// backend/src/services/bot.service.ts

private circuitBreaker = {
  failures: 0,
  lastFailure: null as Date | null,
  threshold: 5,
  timeout: 60000, // 1 minute
};

private isCircuitOpen(): boolean {
  if (this.circuitBreaker.failures < this.circuitBreaker.threshold) {
    return false;
  }
  
  const timeSinceLastFailure = 
    Date.now() - (this.circuitBreaker.lastFailure?.getTime() || 0);
  
  if (timeSinceLastFailure > this.circuitBreaker.timeout) {
    this.circuitBreaker.failures = 0;
    return false;
  }
  
  return true;
}

private async generateWithFallback(prompt: string): Promise<string> {
  // Check circuit breaker
  if (this.isCircuitOpen()) {
    logger.warn('Circuit breaker open, using fallback');
    return this.getFallbackResponse();
  }
  
  try {
    const result = await this.model.generateContent(prompt);
    this.circuitBreaker.failures = 0; // Reset on success
    return result.response.text();
    
  } catch (error) {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = new Date();
    
    logger.error('Gemini generation failed', {
      failures: this.circuitBreaker.failures,
      error,
    });
    
    return this.getFallbackResponse();
  }
}

private getFallbackResponse(): string {
  return `Üzgünüm, şu anda yanıt veremiyorum. Lütfen birkaç dakika sonra tekrar deneyin.`;
}
```

---

## 📊 BAŞARI KRİTERLERİ

### Görev 1: Function Calling
- [ ] Function definitions Gemini'ye gönderiliyor
- [ ] Function call handling çalışıyor
- [ ] list_services fonksiyonu çalışıyor
- [ ] get_service_details fonksiyonu çalışıyor
- [ ] search_knowledge_base fonksiyonu çalışıyor
- [ ] Test: "Hizmetlerinizi gösterebilir misiniz?" → Hizmetler listeleniyor

### Görev 2: Redis Cache
- [ ] Redis bağlantısı çalışıyor
- [ ] Bot prompt cache'leniyor
- [ ] Offerings cache'leniyor
- [ ] Cache hit rate >50%
- [ ] Test: İkinci request daha hızlı

### Görev 3: Error Handling
- [ ] Circuit breaker pattern eklendi
- [ ] Fallback responses çalışıyor
- [ ] Error logging iyileştirildi

---

## 🎯 SONUÇ

Bu 3 görev tamamlandığında:
- ✅ Chatbot akıllı fonksiyonlar kullanacak
- ✅ Response time iyileşecek (cache sayesinde)
- ✅ Sistem daha güvenilir olacak (error handling)
- ✅ Production-ready seviyeye yaklaşacak

**Sonraki Adım:** Firecrawl entegrasyonu ve güvenlik iyileştirmeleri

---

**Oluşturulma:** 24 Kasım 2025  
**Durum:** Ready to Start 🚀  
**Tahmini Süre:** 2-3 saat
