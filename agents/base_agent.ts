import { Task, TaskResult } from '../types';
import { Logger } from '../utils/logger';

/**
 * Base Agent Class
 * All specialized agents extend this class
 */
export abstract class Agent {
  protected name: string;
  protected description: string;
  protected logger: Logger;
  protected isActive: boolean = false;

  constructor(name: string, description: string, logger: Logger) {
    this.name = name;
    this.description = description;
    this.logger = logger;
  }

  /**
   * Main task execution method (implemented by subclasses)
   */
  abstract execute(task: Task): Promise<TaskResult>;

  /**
   * Validate input before execution
   */
  abstract validate(input: any): Promise<boolean>;

  /**
   * Get agent info
   */
  getInfo() {
    return {
      name: this.name,
      description: this.description,
      isActive: this.isActive,
    };
  }

  /**
   * Activate agent
   */
  activate(): void {
    this.isActive = true;
    this.logger.info(`${this.name} activated`);
  }

  /**
   * Deactivate agent
   */
  deactivate(): void {
    this.isActive = false;
    this.logger.info(`${this.name} deactivated`);
  }

  /**
   * Safe execution with error handling
   */
  protected async executeWithRetry<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Attempt ${i + 1} failed, retrying...`);
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
      }
    }

    throw lastError || new Error('Operation failed after all retries');
  }
}
