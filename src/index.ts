import dotenv from 'dotenv';
import { Logger } from './utils/logger';
import { JarvisOrchestrator } from './core/orchestrator';
import { MemoryEngine } from './memory/memory_store';
import { LeadFinderAgent } from './agents/lead_finder/lead_finder';
import { OutreachAgent } from './agents/outreach/outreach';
import { ContentCreatorAgent } from './agents/content_creator/content_creator';

// Load environment variables
dotenv.config();

const logger = new Logger('JARVIS');

/**
 * Main entry point for JARVIS OS
 */
async function initialize() {
  logger.info('🤖 JARVIS OS Initializing...');

  try {
    // Initialize memory engine
    const memory = new MemoryEngine(new Logger('Memory'));
    logger.info('✅ Memory engine initialized');

    // Initialize orchestrator
    const orchestrator = new JarvisOrchestrator(memory, logger);
    logger.info('✅ Orchestrator initialized');

    // Register agents
    orchestrator.registerAgent('LeadFinder', new LeadFinderAgent(new Logger('LeadFinder')));
    orchestrator.registerAgent('Outreach', new OutreachAgent(new Logger('Outreach')));
    orchestrator.registerAgent('ContentCreator', new ContentCreatorAgent(new Logger('ContentCreator')));
    logger.info('✅ Agents registered');

    // Log system status
    const status = orchestrator.getStatus();
    logger.info(`System Status: ${JSON.stringify(status)}`);

    // TODO: Start orchestrator
    // await orchestrator.start();

    return orchestrator;
  } catch (error) {
    logger.error('Initialization failed', error);
    throw error;
  }
}

// Run if this is the main module
if (require.main === module) {
  initialize().catch(error => {
    logger.error('Fatal error', error);
    process.exit(1);
  });
}

export { initialize };
