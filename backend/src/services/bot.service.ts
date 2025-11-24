/**
 * Bot Service - Chatbot Core Engine
 * 
 * Gemini AI ile entegre chatbot motoru.
 * Streaming responses, function calling, conversation management.
 */

import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { supabase } from '../lib/supabase.js';
import { logger } from '../utils/logger.js';
import { SystemPromptBuilder } from './system-prompt-builder.js';

interface ConversationContext {
  conversationId: string;
  tenantId: string;
  customerId?: string | undefined;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  metadata: Record<string, any>;
}

interface BotConfig {
  system_instructions: string;
  personality: string;
  language: string;
  features: {
    appointments: boolean;
    knowledge_base: boolean;
    handover: boolean;
  };
  ai_model: string;
  temperature: number;
  max_tokens: number;
}

export class BotService {
  private genAI: GoogleGenerativeAI;
  private promptBuilder: SystemPromptBuilder;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not set in environment');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.promptBuilder = new SystemPromptBuilder();
  }

  /**
   * Process user message with streaming response
   */
  async *processMessage(
    tenantId: string,
    sessionId: string,
    userMessage: string,
    customerInfo?: {
      email?: string;
      phone?: string;
      name?: string;
    }
  ): AsyncGenerator<string, void, unknown> {
    try {
      // 1. Load or create conversation
      let context = await this.loadConversationContext(tenantId, sessionId);
      
      if (!context) {
        context = await this.createConversation(tenantId, sessionId, customerInfo);
      }

      // 2. Add user message to context
      context.messages.push({
        role: 'user',
        content: userMessage,
      });

      // 3. Build system prompt
      const systemPrompt = await this.promptBuilder.build(tenantId);

      // 4. Get bot config
      const botConfig = await this.getBotConfig(tenantId);

      // 5. Get AI model
      const model = this.genAI.getGenerativeModel({
        model: botConfig.ai_model,
        generationConfig: {
          temperature: botConfig.temperature,
          maxOutputTokens: botConfig.max_tokens,
        },
        systemInstruction: systemPrompt,
      });

      // 6. Prepare chat history
      const history = context.messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      // 7. Start chat session
      const chat = model.startChat({ history });

      // 8. Stream response
      const startTime = Date.now();
      const result = await chat.sendMessageStream(userMessage);

      let fullResponse = '';
      let functionCall: any = null;

      for await (const chunk of result.stream) {
        const text = chunk.text();

        // Check for function call
        const calls = chunk.functionCalls?.();
        if (calls && calls.length > 0) {
          functionCall = calls[0];
          break;
        }

        if (text) {
          fullResponse += text;
          yield text; // Stream to client
        }
      }

      // 8. Handle function call if present
      if (functionCall) {
        logger.info('Function call detected', {
          function: functionCall.name,
          args: functionCall.args,
        });

        const functionResult = await this.executeFunction(
          tenantId,
          context.conversationId,
          functionCall.name,
          functionCall.args
        );

        // Send function result back to AI
        const followUpMessages = [
          ...aiMessages,
          {
            functionResponse: {
              name: functionCall.name,
              response: functionResult,
            },
          },
        ];

        const followUpResult = await model.generateContentStream(followUpMessages);

        for await (const chunk of followUpResult.stream) {
          const text = chunk.text();
          if (text) {
            fullResponse += text;
            yield text;
          }
        }
      }

      const latency = Date.now() - startTime;

      // 9. Save messages to database
      await this.saveMessages(context.conversationId, [
        { role: 'user', content: userMessage },
        {
          role: 'assistant',
          content: fullResponse,
          metadata: {
            model: botConfig.ai_model,
            latency_ms: latency,
            function_call: functionCall?.name,
          },
        },
      ]);

      logger.info('Message processed', {
        tenantId,
        conversationId: context.conversationId,
        latency,
        hasFunction: !!functionCall,
      });
    } catch (error) {
      logger.error('Error processing message', {
        tenantId,
        sessionId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      // Fallback response
      yield 'Üzgünüm, şu anda yanıt veremiyorum. Lütfen tekrar deneyin.';
    }
  }

  /**
   * Load conversation context from database
   */
  private async loadConversationContext(
    tenantId: string,
    sessionId: string
  ): Promise<ConversationContext | null> {
    const { data: conversation } = await supabase
      .from('conversations')
      .select('id, customer_id, context')
      .eq('tenant_id', tenantId)
      .eq('session_id', sessionId)
      .eq('status', 'active')
      .single();

    if (!conversation) {
      return null;
    }

    // Load recent messages (last 10)
    const { data: messages } = await supabase
      .from('messages')
      .select('role, content')
      .eq('conversation_id', conversation.id)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      conversationId: conversation.id,
      tenantId,
      customerId: conversation.customer_id,
      messages: (messages || []).reverse(),
      metadata: conversation.context || {},
    };
  }

  /**
   * Create new conversation
   */
  private async createConversation(
    tenantId: string,
    sessionId: string,
    customerInfo?: {
      email?: string;
      phone?: string;
      name?: string;
    }
  ): Promise<ConversationContext> {
    // 1. Create or get customer
    let customerId: string | undefined;

    if (customerInfo?.email || customerInfo?.phone) {
      const { data: customer } = await supabase
        .from('customers')
        .upsert(
          {
            tenant_id: tenantId,
            email: customerInfo.email,
            phone: customerInfo.phone,
            full_name: customerInfo.name,
            last_seen_at: new Date().toISOString(),
          },
          {
            onConflict: 'tenant_id,email',
          }
        )
        .select('id')
        .single();

      customerId = customer?.id;
    }

    // 2. Create conversation
    const { data: conversation } = await supabase
      .from('conversations')
      .insert({
        tenant_id: tenantId,
        customer_id: customerId,
        session_id: sessionId,
        status: 'active',
        source: 'widget',
      })
      .select('id')
      .single();

    if (!conversation) {
      throw new Error('Failed to create conversation');
    }

    return {
      conversationId: conversation.id,
      tenantId,
      customerId: customerId || undefined,
      messages: [],
      metadata: {},
    };
  }

  /**
   * Get bot configuration
   */
  private async getBotConfig(tenantId: string): Promise<BotConfig> {
    const { data: config } = await supabase
      .from('bot_configs')
      .select('*')
      .eq('tenant_id', tenantId)
      .single();

    if (!config) {
      // Return default config
      return {
        system_instructions: 'Sen yardımsever bir asistansın.',
        personality: 'professional',
        language: 'tr',
        features: {
          appointments: true,
          knowledge_base: true,
          handover: true,
        },
        ai_model: 'gemini-2.0-flash-exp',
        temperature: 0.7,
        max_tokens: 2048,
      };
    }

    return config as BotConfig;
  }

  /**
   * Format messages for AI
   */
  private formatMessagesForAI(
    messages: Array<{ role: string; content: string }>,
    systemPrompt: string
  ): any[] {
    const formatted: any[] = [
      {
        role: 'user',
        parts: [{ text: systemPrompt }],
      },
      {
        role: 'model',
        parts: [{ text: 'Anladım, yardımcı olmaya hazırım.' }],
      },
    ];

    for (const msg of messages) {
      formatted.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    return formatted;
  }

  /**
   * Save messages to database
   */
  private async saveMessages(
    conversationId: string,
    messages: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
      metadata?: Record<string, any>;
    }>
  ): Promise<void> {
    const records = messages.map((msg) => ({
      conversation_id: conversationId,
      role: msg.role,
      content: msg.content,
      metadata: msg.metadata || {},
      model: msg.metadata?.model,
      latency_ms: msg.metadata?.latency_ms,
    }));

    await supabase.from('messages').insert(records);
  }

  /**
   * Execute function call
   */
  private async executeFunction(
    tenantId: string,
    conversationId: string,
    functionName: string,
    args: any
  ): Promise<any> {
    logger.info('Executing function', { functionName, args });

    switch (functionName) {
      case 'list_services':
        return await this.listServices(tenantId, args);

      case 'get_service_details':
        return await this.getServiceDetails(tenantId, args);

      case 'check_appointment_availability':
        return await this.checkAvailability(tenantId, args);

      case 'create_appointment':
        return await this.createAppointment(tenantId, conversationId, args);

      case 'search_knowledge_base':
        return await this.searchKnowledgeBase(tenantId, args);

      case 'handover_to_human':
        return await this.handoverToHuman(tenantId, conversationId, args);

      default:
        throw new Error(`Unknown function: ${functionName}`);
    }
  }

  /**
   * List services (from offerings table)
   */
  private async listServices(tenantId: string, args: any) {
    const { data } = await supabase
      .from('offerings')
      .select('id, name, type, price, currency, duration_min, category, description')
      .eq('tenant_id', tenantId)
      .eq('is_available', true)
      .eq('type', 'SERVICE')
      .order('name');

    return data || [];
  }

  /**
   * Get service details
   */
  private async getServiceDetails(tenantId: string, args: any) {
    const { data } = await supabase
      .from('offerings')
      .select('*')
      .eq('tenant_id', tenantId)
      .eq('id', args.service_id)
      .single();

    return data;
  }

  /**
   * Check appointment availability (simplified)
   */
  private async checkAvailability(tenantId: string, args: any) {
    const { date, time, offering_id } = args;

    // Get offering details
    const { data: offering } = await supabase
      .from('offerings')
      .select('duration_min, provider_name')
      .eq('id', offering_id)
      .single();

    if (!offering) {
      return { available: false, reason: 'Service not found' };
    }

    // Check for conflicts
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('scheduled_date', date)
      .eq('scheduled_time', time)
      .in('status', ['pending', 'confirmed'])
      .limit(1);

    return {
      available: !conflicts || conflicts.length === 0,
      reason: conflicts && conflicts.length > 0 ? 'Time slot already booked' : null,
    };
  }

  /**
   * Create appointment
   */
  private async createAppointment(tenantId: string, conversationId: string, args: any) {
    const { offering_id, customer_name, customer_email, customer_phone, date, time, notes } = args;

    // Get offering details
    const { data: offering } = await supabase
      .from('offerings')
      .select('duration_min')
      .eq('id', offering_id)
      .single();

    if (!offering) {
      throw new Error('Service not found');
    }

    // Create appointment
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        tenant_id: tenantId,
        offering_id,
        conversation_id: conversationId,
        customer_name,
        customer_email,
        customer_phone,
        scheduled_date: date,
        scheduled_time: time,
        duration_minutes: offering.duration_min,
        status: 'pending',
        notes,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create appointment: ${error.message}`);
    }

    return appointment;
  }

  /**
   * Search knowledge base
   */
  private async searchKnowledgeBase(tenantId: string, args: any) {
    const { query } = args;

    const { data } = await supabase
      .from('bot_knowledge_base')
      .select('question, answer, category')
      .eq('tenant_id', tenantId)
      .eq('is_active', true)
      .ilike('question', `%${query}%`)
      .limit(3);

    return data || [];
  }

  /**
   * Handover to human
   */
  private async handoverToHuman(tenantId: string, conversationId: string, args: any) {
    // Update conversation status
    await supabase
      .from('conversations')
      .update({ status: 'handed_over' })
      .eq('id', conversationId);

    // Create notification
    const { data: users } = await supabase
      .from('users')
      .select('id')
      .eq('tenant_id', tenantId)
      .eq('role', 'admin')
      .limit(1);

    if (users && users.length > 0 && users[0]) {
      await supabase.from('notifications').insert({
        tenant_id: tenantId,
        user_id: users[0].id,
        type: 'handover_request',
        title: 'Yeni Canlı Destek Talebi',
        message: args.reason || 'Müşteri canlı destek talep etti',
        action_url: `/conversations/${conversationId}`,
      });
    }

    return { success: true, message: 'Handover initiated' };
  }
}
