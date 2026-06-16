import dotenv from 'dotenv';
import { JarvisCore } from './core/jarvis_core';
import { Logger } from './utils/logger';

// Load environment variables
dotenv.config();

const logger = new Logger('Main');
let jarvisCore: JarvisCore;

/**
 * Main Entry Point for JARVIS OS
 */
async function main() {
  logger.info('🚀 JARVIS OS Starting...');
  logger.info('═'.repeat(50));

  try {
    // Initialize JARVIS Core
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not set in environment variables');
    }

    jarvisCore = new JarvisCore(apiKey);
    await jarvisCore.initialize();

    // Get and display status
    const status = jarvisCore.getStatus();
    logger.info('\n📊 System Status:');
    logger.info(JSON.stringify(status, null, 2));

    // Example command
    logger.info('\n📝 Processing example command...');
    const result = await jarvisCore.processCommand(
      'Create a LinkedIn post about AI marketing and an Instagram reel script',
      {
        company: 'Slay Ads',
        industry: 'Digital Marketing',
      }
    );

    logger.info('\n✅ Command executed:');
    logger.info(JSON.stringify(result, null, 2));

    logger.info('\n═'.repeat(50));
    logger.info('🎉 JARVIS OS is ready!');
    logger.info('Commands can be sent via API or CLI');
  } catch (error) {
    logger.error('Fatal error during startup', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('\n\n🛑 Shutting down gracefully...');
  if (jarvisCore) {
    await jarvisCore.shutdown();
  }
  process.exit(0);
});

// Run main function
if (require.main === module) {
  main().catch(error => {
    logger.error('Failed to start JARVIS OS', error);
    process.exit(1);
  });
}

export { JarvisCore };
