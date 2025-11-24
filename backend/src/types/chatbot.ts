/**
 * Chatbot System Type Definitions
 */

// ============================================
// DATABASE TYPES
// ============================================

export interface User {
  id: string;
  tenant_id: string;
  email: string;
  password_hash?: string;
  full_name: string;
  role: 'admin' | 'user' | 'viewer';
  last_login_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Customer {
  id: string;
  tenant_id: string;
  email?: string;
  phone?: string;
  full_name?: string;
  metadata: Record<string, any>;
  first_seen_at: Date;
  last_seen_at: Date;
  total_conversations: number;
  total_appointments: number;
  created_at: Date;
}

export interface BotConfig {
  id: string;
  tenant_id: string;
  system_instructions: string;
  personality: 'professional' | 'friendly' | 'casual' | 'formal';
  language: string;
  features: {
    appointments: boolean;
    knowledge_base: boolean;
    handover: boolean;
  };
  ai_model: string;
  temperature: number;
  max_tokens: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface KnowledgeBaseItem {
  id: string;
  tenant_id: string;
  question: string;
  answer: string;
  category?: string;
  keywords?: string[];
  priority: number;
  usage_count: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  customer_id?: string;
  session_id: string;
  status: 'active' | 'closed' | 'handed_over';
  context: Record<string, any>;
  source: string;
  message_count: number;
  started_at: Date;
  last_message_at: Date;
  closed_at?: Date;
  created_at: Date;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata: Record<string, any>;
  model?: string;
  tokens_used?: number;
  latency_ms?: number;
  created_at: Date;
}

export interface Appointment {
  id: string;
  tenant_id: string;
  offering_id?: string;
  customer_id?: string;
  conversation_id?: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:MM
  duration_minutes: number;
  end_time: string; // HH:MM (computed)
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  priority: number;
  notes?: string;
  cancellation_reason?: string;
  confirmed_at?: Date;
  completed_at?: Date;
  cancelled_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Notification {
  id: string;
  tenant_id: string;
  user_id: string;
  type: 'appointment_created' | 'appointment_cancelled' | 'new_conversation' | 'handover_request';
  title: string;
  message: string;
  action_url?: string;
  is_read: boolean;
  read_at?: Date;
  created_at: Date;
}

// ============================================
// API REQUEST/RESPONSE TYPES
// ============================================

export interface SendMessageRequest {
  tenant_id: string;
  session_id: string;
  message: string;
  customer_info?: {
    email?: string;
    phone?: string;
    name?: string;
  };
}

export interface SendMessageResponse {
  chunk?: string;
  done?: boolean;
}

export interface GetConversationsResponse {
  conversations: Array<
    Conversation & {
      customers?: Pick<Customer, 'full_name' | 'email' | 'phone'>;
    }
  >;
}

export interface GetConversationResponse {
  conversation: Conversation & {
    customers?: Pick<Customer, 'full_name' | 'email' | 'phone'>;
  };
  messages: Message[];
}

// ============================================
// FUNCTION CALL TYPES
// ============================================

export interface ListServicesArgs {
  category?: string;
}

export interface GetServiceDetailsArgs {
  service_id: string;
}

export interface CheckAppointmentAvailabilityArgs {
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  offering_id: string;
}

export interface CreateAppointmentArgs {
  offering_id: string;
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
}

export interface SearchKnowledgeBaseArgs {
  query: string;
}

export interface HandoverToHumanArgs {
  reason: string;
}

// ============================================
// INTERNAL TYPES
// ============================================

export interface ConversationContext {
  conversationId: string;
  tenantId: string;
  customerId?: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  metadata: Record<string, any>;
}

export interface TimeSlot {
  time: string; // HH:MM
  available: boolean;
  reason?: string;
}

export interface AvailabilityResult {
  available: boolean;
  reason?: string;
}
