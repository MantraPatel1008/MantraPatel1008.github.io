/**
 * Core Type Definitions for JARVIS OS
 */

export interface Task {
  id: string;
  agentType: string;
  input: Record<string, any>;
  priority?: 'low' | 'medium' | 'high';
  haltOnError?: boolean;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface TaskResult {
  taskId: string;
  agentType: string;
  status: 'completed' | 'failed' | 'pending';
  result?: Record<string, any>;
  error?: string;
  timestamp: Date;
}

export interface AgentRequest {
  agentType: string;
  action: string;
  params: Record<string, any>;
}

export interface ClientData {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone?: string;
  website?: string;
  industry: string;
  confidence: number; // 0-1 score
  sourceType: 'instagram' | 'facebook' | 'google_maps' | 'email_verification';
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface OutreachCampaign {
  id: string;
  name: string;
  leads: Lead[];
  status: 'draft' | 'active' | 'completed';
  messageTemplate?: string;
  channels: ('email' | 'whatsapp' | 'instagram_dm')[];
  metrics?: {
    sent: number;
    opens: number;
    clicks: number;
    responses: number;
    meetingsBooked: number;
  };
  createdAt: Date;
}

export interface Meeting {
  id: string;
  title: string;
  attendees: string[];
  scheduledTime: Date;
  duration: number; // in minutes
  meetingLink?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  transcript?: string;
  summary?: string;
  actionItems?: string[];
  createdAt: Date;
}

export interface ContentPost {
  id: string;
  title: string;
  content: string;
  platforms: string[];
  scheduledTime?: Date;
  status: 'draft' | 'scheduled' | 'published';
  metrics?: {
    likes?: number;
    comments?: number;
    shares?: number;
    views?: number;
  };
  createdAt: Date;
}

export interface Workflow {
  id: string;
  name: string;
  description?: string;
  trigger: Record<string, any>;
  actions: WorkflowAction[];
  isActive: boolean;
  createdAt: Date;
}

export interface WorkflowAction {
  id: string;
  type: string;
  config: Record<string, any>;
  order: number;
}

export interface SystemStats {
  uptime: number;
  tasksCompleted: number;
  tasksRunning: number;
  errorCount: number;
  memory: Record<string, any>;
}
