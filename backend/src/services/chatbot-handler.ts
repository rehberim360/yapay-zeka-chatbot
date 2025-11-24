/**
 * Chatbot API Handler
 * Kullanıcı mesajlarını işler ve Gemini'ye gönderir
 */

export interface ChatRequest {
  tenantId: string;
  message: string;
  sessionId?: string;
  userId?: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
  timestamp: string;
}

/**
 * Chatbot mesajını işle
 */
export const handleChatMessage = async (request: ChatRequest): Promise<ChatResponse> => {
  // 1. Tenant bilgilerini al
  const tenant = await getTenant(request.tenantId);
  
  if (!tenant || !tenant.metadata?.system_prompt) {
    throw new Error('Tenant not found or system prompt not configured');
  }
  
  // 2. System prompt'u al ve runtime değişkenleri ekle
  const staticPrompt = tenant.metadata.system_prompt;
  const dynamicPrompt = injectRuntimeVariables(staticPrompt, tenant.metadata.timezone || 'Europe/Istanbul');
  
  // 3. Gemini'ye gönder
  const geminiRequest: { systemInstruction: string; message: string; sessionId?: string } = {
    systemInstruction: dynamicPrompt,
    message: request.message
  };
  if (request.sessionId !== undefined) {
    geminiRequest.sessionId = request.sessionId;
  }
  const response = await callGemini(geminiRequest);
  
  // 4. Cevabı döndür
  return {
    reply: response.text,
    sessionId: request.sessionId || generateSessionId(),
    timestamp: new Date().toISOString()
  };
};

/**
 * Gemini API çağrısı
 */
const callGemini = async (params: {
  systemInstruction: string;
  message: string;
  sessionId?: string;
}) => {
  // Gemini API implementasyonu
  // Bu kısım mevcut ai-extractor.ts'den adapte edilebilir
  
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  
  const model = genAI.getGenerativeModel({
    model: 'gemini-1.5-flash',
    systemInstruction: params.systemInstruction
  });
  
  const result = await model.generateContent(params.message);
  const response = await result.response;
  
  return {
    text: response.text()
  };
};

/**
 * Tenant bilgilerini al
 */
const getTenant = async (tenantId: string) => {
  // Supabase'den tenant bilgilerini çek
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );
  
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', tenantId)
    .single();
  
  if (error) throw error;
  return data;
};

/**
 * Session ID oluştur
 */
const generateSessionId = (): string => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Örnek kullanım
 */
export const exampleUsage = async () => {
  const response = await handleChatMessage({
    tenantId: 'tenant-123',
    message: 'Şu an açık mısınız?',
    sessionId: 'session-456'
  });
  
  console.log(response.reply);
  // Örnek cevap: "✅ Evet, şu an açığız! Pazartesi günü saat 14:30. 
  //               Size nasıl yardımcı olabilirim? 😊"
};
