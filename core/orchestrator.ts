import { Task, TaskResult, AgentRequest } from '../types';
import { Logger } from '../utils/logger';
import { MemoryEngine } from '../memory/memory_store';
import { Agent } from '../agents/base_agent';

/**
 * Jarvis Core Orchestrator
 * Central intelligence that coordinates all agents and workflows
 */
export class JarvisOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private taskQueue: Task[] = [];
  private memory: MemoryEngine;
  private logger: Logger;
  private isRunning: boolean = false;

  constructor(memory: MemoryEngine, logger: Logger) {
    this.memory = memory;
    this.logger = logger;
  }

  /**
   * Register an agent with the orchestrator
   */
  registerAgent(name: string, agent: Agent): void {
    this.agents.set(name, agent);
    this.logger.info(`Agent registered: ${name}`);
  }

  /**
   * Parse user command and break into tasks
   */
  async parseCommand(command: string, context?: Record<string, any>): Promise<Task[]> {
    this.logger.info(`Parsing command: ${command}`);
    
    // TODO: Use Gemini to understand command intent
    // For now, return placeholder
    const tasks: Task[] = [];
    
    // Store command in memory
    await this.memory.store('user_command', {
      command,
      timestamp: new Date(),
      context,
    });

    return tasks;
  }

  /**
   * Delegate task to appropriate agent
   */
  async delegateTask(task: Task): Promise<TaskResult> {
    this.logger.info(`Delegating task: ${task.id}`);

    const agent = this.agents.get(task.agentType);
    if (!agent) {
      throw new Error(`Agent not found: ${task.agentType}`);
    }

    try {
      const result = await agent.execute(task);
      
      // Store result in memory
      await this.memory.store(`task_${task.id}`, result);
      
      this.logger.info(`Task completed: ${task.id}`);
      return result;
    } catch (error) {
      this.logger.error(`Task failed: ${task.id}`, error);
      throw error;
    }
  }

  /**
   * Execute a workflow (sequence of tasks)
   */
  async executeWorkflow(tasks: Task[]): Promise<TaskResult[]> {
    this.logger.info(`Executing workflow with ${tasks.length} tasks`);
    const results: TaskResult[] = [];

    for (const task of tasks) {
      try {
        const result = await this.delegateTask(task);
        results.push(result);
      } catch (error) {
        this.logger.error(`Workflow failed at task ${task.id}`);
        // Continue with next task or halt based on task config
        if (task.haltOnError) {
          throw error;
        }
      }
    }

    return results;
  }

  /**
   * Main execution loop
   */
  async start(): Promise<void> {
    this.isRunning = true;
    this.logger.info('Jarvis Core started');

    while (this.isRunning) {
      if (this.taskQueue.length > 0) {
        const task = this.taskQueue.shift();
        if (task) {
          await this.delegateTask(task);
        }
      }
      // Small delay to prevent CPU spinning
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  /**
   * Stop the execution loop
   */
  stop(): void {
    this.isRunning = false;
    this.logger.info('Jarvis Core stopped');
  }

  /**
   * Add task to queue
   */
  queueTask(task: Task): void {
    this.taskQueue.push(task);
    this.logger.debug(`Task queued: ${task.id}`);
  }

  /**
   * Get current system status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      agentCount: this.agents.size,
      queuedTasks: this.taskQueue.length,
      registeredAgents: Array.from(this.agents.keys()),
    };
  }
}
