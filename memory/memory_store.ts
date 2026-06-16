import { Logger } from '../utils/logger';

/**
 * Memory Store Interface
 * Handles long-term memory storage and retrieval
 */
export class MemoryEngine {
  private memory: Map<string, any> = new Map();
  private logger: Logger;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  /**
   * Store data in memory
   */
  async store(key: string, data: any): Promise<void> {
    try {
      this.memory.set(key, {
        data,
        timestamp: new Date(),
      });
      this.logger.debug(`Data stored: ${key}`);
    } catch (error) {
      this.logger.error(`Memory store error: ${error}`);
      throw error;
    }
  }

  /**
   * Retrieve data from memory
   */
  async retrieve(key: string): Promise<any> {
    try {
      const item = this.memory.get(key);
      if (!item) {
        return null;
      }
      return item.data;
    } catch (error) {
      this.logger.error(`Memory retrieve error: ${error}`);
      throw error;
    }
  }

  /**
   * Search memory (basic implementation)
   */
  async search(query: string): Promise<any[]> {
    try {
      const results: any[] = [];
      for (const [key, value] of this.memory.entries()) {
        if (key.includes(query) || JSON.stringify(value).includes(query)) {
          results.push({
            key,
            ...value,
          });
        }
      }
      return results;
    } catch (error) {
      this.logger.error(`Memory search error: ${error}`);
      throw error;
    }
  }

  /**
   * Clear memory
   */
  async clear(): Promise<void> {
    this.memory.clear();
    this.logger.info('Memory cleared');
  }

  /**
   * Get memory statistics
   */
  getStats() {
    return {
      totalItems: this.memory.size,
      memoryUsage: JSON.stringify(this.memory).length,
    };
  }
}
