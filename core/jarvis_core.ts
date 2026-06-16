import { GoogleGenerativeAI } from '@google/generative-ai';
import { Logger } from '../utils/logger';
import { JarvisOrchestrator } from './orchestrator';
import { ReasoningEngine } from './reasoning_engine';
import { TaskQueue } from './task_queue';
import { StateManager } from './state_manager';
import { MemoryEngine } from '../memory/memory_store';
import { LeadFinderAgent } from '../agents/lead_finder/lead_finder';
import { OutreachAgent } from '../agents/outreach/outreach';
import { ContentCreatorAgent } from '../agents/content_creator/content_creator';

/**
 * Jarvis Core - Main Application
 * Initializes and manages all systems
 */
export class JarvisCore {
  private orchestrator: JarvisOrchestrator;
  private reasoning: ReasoningEngine;
  private taskQueue: TaskQueue;
  private stateManager: StateManager;
  private memory: MemoryEngine;
  private logger: Logger;

  constructor(apiKey: string) {
    this.logger = new Logger('JarvisCore');

    // Initialize core systems
    this.memory = new MemoryEngine(new Logger('Memory'));
    this.stateManager = new StateManager(new Logger('StateManager'));
    this.taskQueue = new TaskQueue(new Logger('TaskQueue'));
    this.reasoning = new ReasoningEngine(apiKey, new Logger('ReasoningEngine'));
    this.orchestrator = new JarvisOrchestrator(this.memory, new Logger('Orchestrator'));
  }

  /**
   * Initialize JARVIS Core
   */
  async initialize(): Promise<void> {
    this.logger.info('🤖 JARVIS Core initializing...');

    try {
      // Start state manager
      this.stateManager.start();
      this.logger.info('✅ State manager started');

      // Register agents
      const apiKey = process.env.GEMINI_API_KEY || '';
      this.orchestrator.registerAgent('LeadFinder', new LeadFinderAgent(new Logger('LeadFinder')));
      this.orchestrator.registerAgent('Outreach', new OutreachAgent(new Logger('Outreach')));
      this.orchestrator.registerAgent(
        'ContentCreator',
        new ContentCreatorAgent(new Logger('ContentCreator'), apiKey)
      );
      this.logger.info('✅ Agents registered');

      // Start scheduler
      this.startAutoPublish();

      this.logger.info('🎉 JARVIS Core initialized successfully!');
    } catch (error) {
      this.logger.error('Initialization failed', error);
      throw error;
    }
  }

  /**
   * Process natural language command
   */
  async processCommand(command: string, context?: Record<string, any>): Promise<any> {
    this.logger.info(`Processing command: ${command}`);

    try {
      // Parse command using reasoning engine
      const tasks = await this.reasoning.parseCommand(command, context);
      this.logger.info(`Parsed ${tasks.length} tasks from command`);

      // Queue tasks
      for (const task of tasks) {
        this.taskQueue.enqueue(task);
      }

      // Execute tasks
      const results = await this.executeTasks();

      // Analyze results
      const analysis = await this.reasoning.analyzeResults(results);

      return {
        command,
        tasksExecuted: results.length,
        results,
        analysis,
      };
    } catch (error) {
      this.logger.error(`Command processing failed: ${error}`);
      throw error;
    }
  }

  /**
   * Execute queued tasks
   */
  private async executeTasks(): Promise<any[]> {
    const results = [];
    let task = this.taskQueue.dequeue();

    while (task) {
      this.stateManager.taskStarted();
      try {
        const result = await this.orchestrator.delegateTask(task);
        this.taskQueue.complete(task.id, result);
        this.stateManager.taskCompleted();
        results.push(result);
      } catch (error) {
        this.logger.error(`Task ${task.id} failed`, error);
        const retried = this.taskQueue.fail(task.id, error as Error);
        if (!retried) {
          this.stateManager.taskFailed();
        }
      }
      task = this.taskQueue.dequeue();
    }

    return results;
  }

  /**
   * Start auto-publishing scheduler
   */
  private startAutoPublish(): void {
    // TODO: Initialize content scheduler
    this.logger.info('Auto-publish scheduler started');
  }

  /**
   * Get system status
   */
  getStatus(): Record<string, any> {
    return {
      orchestrator: this.orchestrator.getStatus(),
      queue: this.taskQueue.getStats(),
      state: this.stateManager.getMetrics(),
    };
  }

  /**
   * Shutdown JARVIS Core
   */
  async shutdown(): Promise<void> {
    this.logger.info('Shutting down JARVIS Core...');
    this.orchestrator.stop();
    this.stateManager.stop();
    this.logger.info('JARVIS Core shut down');
  }
}
