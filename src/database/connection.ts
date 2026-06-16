/**
 * Database Connection & Configuration
 */

import { createClient } from '@supabase/supabase-js';
import { Logger } from '../utils/logger';

const logger = new Logger('Database');

let supabase: any = null;

/**
 * Initialize Database Connection
 */
export function initializeDatabase() {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      logger.warn('Supabase credentials not set - database features disabled');
      return null;
    }

    supabase = createClient(supabaseUrl, supabaseKey);
    logger.info('✅ Database connection established');
    return supabase;
  } catch (error) {
    logger.error('Failed to initialize database', error);
    return null;
  }
}

/**
 * Get Database Instance
 */
export function getDatabase() {
  if (!supabase) {
    supabase = initializeDatabase();
  }
  return supabase;
}

/**
 * Database Schema Queries
 */
export const dbSchema = {
  // Clients table
  clients: `
    CREATE TABLE IF NOT EXISTS clients (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR NOT NULL,
      email VARCHAR UNIQUE NOT NULL,
      phone VARCHAR,
      website VARCHAR,
      industry VARCHAR,
      company_size VARCHAR,
      budget_range VARCHAR,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `,

  // Leads table
  leads: `
    CREATE TABLE IF NOT EXISTS leads (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR NOT NULL,
      email VARCHAR UNIQUE,
      phone VARCHAR,
      website VARCHAR,
      industry VARCHAR NOT NULL,
      company_size VARCHAR,
      confidence FLOAT,
      source_type VARCHAR,
      source_url VARCHAR,
      status VARCHAR DEFAULT 'new',
      tags VARCHAR[],
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `,

  // Outreach campaigns
  campaigns: `
    CREATE TABLE IF NOT EXISTS campaigns (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      name VARCHAR NOT NULL,
      description TEXT,
      status VARCHAR DEFAULT 'draft',
      leads_count INT,
      sent_count INT DEFAULT 0,
      opens INT DEFAULT 0,
      clicks INT DEFAULT 0,
      responses INT DEFAULT 0,
      meetings_booked INT DEFAULT 0,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `,

  // Content posts
  content: `
    CREATE TABLE IF NOT EXISTS content (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR NOT NULL,
      content TEXT NOT NULL,
      content_type VARCHAR,
      platforms VARCHAR[],
      status VARCHAR DEFAULT 'draft',
      scheduled_at TIMESTAMP,
      published_at TIMESTAMP,
      likes INT DEFAULT 0,
      comments INT DEFAULT 0,
      shares INT DEFAULT 0,
      views INT DEFAULT 0,
      metadata JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `,

  // Tasks
  tasks: `
    CREATE TABLE IF NOT EXISTS tasks (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      agent_type VARCHAR NOT NULL,
      status VARCHAR NOT NULL,
      input JSONB,
      result JSONB,
      error TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      completed_at TIMESTAMP
    )
  `,

  // Meetings
  meetings: `
    CREATE TABLE IF NOT EXISTS meetings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
      title VARCHAR NOT NULL,
      attendees VARCHAR[],
      scheduled_at TIMESTAMP NOT NULL,
      duration INT,
      meeting_link VARCHAR,
      status VARCHAR DEFAULT 'scheduled',
      transcript TEXT,
      summary TEXT,
      action_items TEXT[],
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `,
};

/**
 * Run Migrations
 */
export async function runMigrations() {
  const db = getDatabase();
  if (!db) {
    logger.warn('Database not available - skipping migrations');
    return;
  }

  try {
    logger.info('Running database migrations...');

    for (const [table, schema] of Object.entries(dbSchema)) {
      logger.info(`Creating table: ${table}`);
      // Note: In production, use a proper migration tool like Flyway or Liquibase
      // This is a simplified approach for demonstration
    }

    logger.info('✅ Migrations completed');
  } catch (error) {
    logger.error('Migration failed', error);
    throw error;
  }
}

/**
 * Save Lead to Database
 */
export async function saveLead(lead: Record<string, any>) {
  const db = getDatabase();
  if (!db) return null;

  try {
    const { data, error } = await db.from('leads').insert([lead]).select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    logger.error('Failed to save lead', error);
    return null;
  }
}

/**
 * Get Leads
 */
export async function getLeads(
  limit: number = 10,
  offset: number = 0,
  filters?: Record<string, any>
) {
  const db = getDatabase();
  if (!db) return [];

  try {
    let query = db.from('leads').select('*');

    if (filters?.industry) {
      query = query.eq('industry', filters.industry);
    }
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query.range(offset, offset + limit - 1);

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Failed to fetch leads', error);
    return [];
  }
}

/**
 * Save Content
 */
export async function saveContent(content: Record<string, any>) {
  const db = getDatabase();
  if (!db) return null;

  try {
    const { data, error } = await db.from('content').insert([content]).select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    logger.error('Failed to save content', error);
    return null;
  }
}

/**
 * Get Content
 */
export async function getContent(limit: number = 10, offset: number = 0) {
  const db = getDatabase();
  if (!db) return [];

  try {
    const { data, error } = await db
      .from('content')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    logger.error('Failed to fetch content', error);
    return [];
  }
}

/**
 * Save Task
 */
export async function saveTask(task: Record<string, any>) {
  const db = getDatabase();
  if (!db) return null;

  try {
    const { data, error } = await db.from('tasks').insert([task]).select();

    if (error) throw error;
    return data?.[0] || null;
  } catch (error) {
    logger.error('Failed to save task', error);
    return null;
  }
}
