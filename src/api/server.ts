import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { JarvisCore } from './core/jarvis_core';
import { Logger } from './utils/logger';

dotenv.config();

const logger = new Logger('API');
const app = express();
let jarvisCore: JarvisCore;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Request logging
app.use((req: Request, res: Response, next: NextFunction) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

/**
 * Health Check Endpoint
 */
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    uptime: process.uptime(),
  });
});

/**
 * System Status
 */
app.get('/api/status', (req: Request, res: Response) => {
  try {
    const status = jarvisCore.getStatus();
    res.json(status);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

/**
 * Execute Command
 */
app.post('/api/execute', async (req: Request, res: Response) => {
  try {
    const { command, context } = req.body;

    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }

    logger.info(`Executing command: ${command}`);
    const result = await jarvisCore.processCommand(command, context);

    res.json({
      success: true,
      result,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Create Content
 */
app.post('/api/content/generate', async (req: Request, res: Response) => {
  try {
    const { contentType, topic, platforms, tone, keywords } = req.body;

    if (!contentType || !topic || !platforms) {
      return res.status(400).json({
        error: 'contentType, topic, and platforms are required',
      });
    }

    const command = `Create ${contentType} content about ${topic} for ${platforms.join(
      ', '
    )} with ${tone || 'professional'} tone`;

    const result = await jarvisCore.processCommand(command, {
      contentType,
      topic,
      platforms,
      tone,
      keywords,
    });

    res.json({
      success: true,
      content: result,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Find Leads
 */
app.post('/api/leads/find', async (req: Request, res: Response) => {
  try {
    const { industry, region, criteria, limit } = req.body;

    if (!industry) {
      return res.status(400).json({ error: 'industry is required' });
    }

    const command = `Find ${limit || 50} leads in ${industry} industry in ${region || 'all regions'}`;

    const result = await jarvisCore.processCommand(command, {
      industry,
      region,
      criteria,
      limit,
    });

    res.json({
      success: true,
      leads: result,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Send Outreach
 */
app.post('/api/outreach/send', async (req: Request, res: Response) => {
  try {
    const { leads, channels, message, followUpDays } = req.body;

    if (!leads || !channels) {
      return res.status(400).json({ error: 'leads and channels are required' });
    }

    const command = `Send outreach to ${leads.length} leads via ${channels.join(
      ', '
    )} with follow-up in ${followUpDays || 3} days`;

    const result = await jarvisCore.processCommand(command, {
      leads,
      channels,
      message,
      followUpDays,
    });

    res.json({
      success: true,
      result,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Schedule Content
 */
app.post('/api/content/schedule', async (req: Request, res: Response) => {
  try {
    const { content, platforms, scheduledTime } = req.body;

    if (!content || !platforms || !scheduledTime) {
      return res.status(400).json({
        error: 'content, platforms, and scheduledTime are required',
      });
    }

    const command = `Schedule content for ${platforms.join(', ')} at ${scheduledTime}`;

    const result = await jarvisCore.processCommand(command, {
      content,
      platforms,
      scheduledTime,
    });

    res.json({
      success: true,
      scheduled: result,
      timestamp: new Date(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Get Content History
 */
app.get('/api/content/history', (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0 } = req.query;

    // TODO: Implement database query
    res.json({
      success: true,
      content: [],
      total: 0,
      limit,
      offset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * Get Lead History
 */
app.get('/api/leads/history', (req: Request, res: Response) => {
  try {
    const { limit = 10, offset = 0, industry, status } = req.query;

    // TODO: Implement database query
    res.json({
      success: true,
      leads: [],
      total: 0,
      limit,
      offset,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: (error as Error).message,
    });
  }
});

/**
 * 404 Handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not found',
    path: req.path,
  });
});

/**
 * Error Handler
 */
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
  });
});

/**
 * Start Server
 */
async function startServer() {
  try {
    logger.info('🚀 Starting JARVIS OS API Server...');

    // Initialize JARVIS Core
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not set');
    }

    jarvisCore = new JarvisCore(apiKey);
    await jarvisCore.initialize();

    // Start Express server
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      logger.info(`✅ Server running on http://localhost:${port}`);
      logger.info(`📚 API Documentation: http://localhost:${port}/api/docs`);
      logger.info(`💓 Health check: http://localhost:${port}/api/health`);
    });
  } catch (error) {
    logger.error('Failed to start server', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('\n🛑 Shutting down server...');
  if (jarvisCore) {
    await jarvisCore.shutdown();
  }
  process.exit(0);
});

// Start server if this is the main module
if (require.main === module) {
  startServer();
}

export { app };
