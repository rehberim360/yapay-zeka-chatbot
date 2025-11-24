/**
 * Chat API Routes
 * 
 * Chatbot ile iletişim için API endpoints.
 * Streaming responses destekler.
 */

import { Router, type Request, type Response } from 'express';
import { BotService } from '../services/bot.service.js';
import { logger } from '../utils/logger.js';
import { z } from 'zod';

const router = Router();
const botService = new BotService();

// ============================================
// VALIDATION SCHEMAS
// ============================================

const sendMessageSchema = z.object({
  tenant_id: z.string().min(1),
  session_id: z.string().min(1),
  message: z.string().min(1).max(2000),
  customer_info: z
    .object({
      email: z.string().email().optional().or(z.undefined()),
      phone: z.string().optional().or(z.undefined()),
      name: z.string().optional().or(z.undefined()),
    })
    .optional()
    .or(z.undefined()),
});

// ============================================
// ROUTES
// ============================================

/**
 * POST /api/chat/message
 * Send message to chatbot (streaming response)
 */
router.post('/message', async (req: Request, res: Response) => {
  try {
    // Validate request
    const validated = sendMessageSchema.parse(req.body);

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    logger.info('Processing chat message', {
      tenantId: validated.tenant_id,
      sessionId: validated.session_id,
      messageLength: validated.message.length,
    });

    // Stream response
    const stream = botService.processMessage(
      validated.tenant_id,
      validated.session_id,
      validated.message,
      validated.customer_info
    );

    for await (const chunk of stream) {
      // Send chunk as SSE (Server-Sent Events)
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    // Send completion event
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (error) {
    logger.error('Error in chat message endpoint', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    if (error instanceof z.ZodError) {
      res.status(400).json({
        error: 'Validation error',
        details: error.issues,
      });
    } else {
      res.status(500).json({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
});

/**
 * GET /api/chat/conversations
 * Get all conversations for a tenant
 */
router.get('/conversations', async (req: Request, res: Response) => {
  try {
    const tenantId = req.query.tenant_id as string;

    if (!tenantId) {
      return res.status(400).json({ error: 'tenant_id is required' });
    }

    const { supabase } = await import('../lib/supabase.js');

    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(
        `
        id,
        session_id,
        status,
        message_count,
        started_at,
        last_message_at,
        customers (
          full_name,
          email,
          phone
        )
      `
      )
      .eq('tenant_id', tenantId)
      .order('last_message_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    res.json({ conversations });
  } catch (error) {
    logger.error('Error fetching conversations', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      error: 'Failed to fetch conversations',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/chat/conversations/:id
 * Get conversation details with messages
 */
router.get('/conversations/:id', async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.id;

    const { supabase } = await import('../lib/supabase.js');

    // Get conversation
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select(
        `
        *,
        customers (
          full_name,
          email,
          phone
        )
      `
      )
      .eq('id', conversationId)
      .single();

    if (convError) {
      throw convError;
    }

    // Get messages
    const { data: messages, error: msgError } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      throw msgError;
    }

    res.json({
      conversation,
      messages,
    });
  } catch (error) {
    logger.error('Error fetching conversation', {
      conversationId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      error: 'Failed to fetch conversation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * POST /api/chat/conversations/:id/close
 * Close a conversation
 */
router.post('/conversations/:id/close', async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.id;

    const { supabase } = await import('../lib/supabase.js');

    const { data, error } = await supabase
      .from('conversations')
      .update({
        status: 'closed',
        closed_at: new Date().toISOString(),
      })
      .eq('id', conversationId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    logger.info('Conversation closed', { conversationId });

    res.json({ conversation: data });
  } catch (error) {
    logger.error('Error closing conversation', {
      conversationId: req.params.id,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      error: 'Failed to close conversation',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/chat/history/:conversationId
 * Get conversation history (for widget)
 */
router.get('/history/:conversationId', async (req: Request, res: Response) => {
  try {
    const conversationId = req.params.conversationId;

    const { supabase } = await import('../lib/supabase.js');

    const { data: messages, error } = await supabase
      .from('messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(50);

    if (error) {
      throw error;
    }

    res.json({ messages: messages || [] });
  } catch (error) {
    logger.error('Error fetching history', {
      conversationId: req.params.conversationId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    res.status(500).json({
      error: 'Failed to fetch history',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
