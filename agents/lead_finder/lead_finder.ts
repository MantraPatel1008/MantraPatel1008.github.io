import { Agent } from '../base_agent';
import { Task, TaskResult } from '../../types';
import { Logger } from '../../utils/logger';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface LeadFinderConfig {
  industry: string;
  region?: string;
  targetCriteria?: Record<string, any>;
  limit?: number;
}

interface FoundLead {
  name: string;
  email: string;
  phone?: string;
  website?: string;
  industry: string;
  confidence: number;
  source: string;
}

/**
 * Lead Finder Agent
 * Discovers high-quality business leads from multiple sources
 */
export class LeadFinderAgent extends Agent {
  private geminiClient: GoogleGenerativeAI;
  private model: any;

  constructor(logger: Logger, apiKey?: string) {
    super(
      'LeadFinder',
      'Discovers high-quality business leads from social media and directories',
      logger
    );

    if (apiKey) {
      this.geminiClient = new GoogleGenerativeAI(apiKey);
      this.model = this.geminiClient.getGenerativeModel({ model: 'gemini-1.5-pro' });
    }
  }

  async execute(task: Task): Promise<TaskResult> {
    this.logger.info(`Lead Finder executing: ${task.id}`);

    try {
      const validated = await this.validate(task.input);
      if (!validated) {
        throw new Error('Invalid input for LeadFinder');
      }

      const config: LeadFinderConfig = task.input;
      const leads = await this.findLeads(config);

      return {
        taskId: task.id,
        agentType: this.name,
        status: 'completed',
        result: {
          leadsFound: leads.length,
          leads,
          searchCriteria: config,
          timestamp: new Date(),
        },
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Lead Finder error: ${error}`);
      throw error;
    }
  }

  async validate(input: any): Promise<boolean> {
    return input && input.industry && typeof input.industry === 'string';
  }

  /**
   * Find leads based on criteria
   */
  private async findLeads(config: LeadFinderConfig): Promise<FoundLead[]> {
    this.logger.info(`Searching for leads in ${config.industry}`);

    const leads: FoundLead[] = [];

    // Source 1: Generate synthetic leads using Gemini
    if (this.model) {
      leads.push(...(await this.generateLeadsFromGemini(config)));
    }

    // Source 2: Local directory simulation
    leads.push(...this.generateLocalLeads(config));

    // Filter by limit
    return leads.slice(0, config.limit || 50);
  }

  /**
   * Generate leads using Gemini
   */
  private async generateLeadsFromGemini(config: LeadFinderConfig): Promise<FoundLead[]> {
    try {
      const prompt = `Generate a list of 10 realistic business leads in the ${config.industry} industry${config.region ? ` in ${config.region}` : ''}.

For each lead, provide:
1. Company name
2. Contact email (realistic format)
3. Contact phone (realistic format)
4. Website (realistic domain)
5. Company size (small/medium/large)
6. Confidence score (0-1)

Return as JSON array with fields: name, email, phone, website, companySize, confidence

Focus on leads that would be interested in digital marketing services.`;

      const response = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });

      const responseText = response.response.text();
      const jsonMatch = responseText.match(/\[\s*{[\s\S]*}\s*\]/);

      if (jsonMatch) {
        const generatedLeads = JSON.parse(jsonMatch[0]);
        return generatedLeads.map((lead: any) => ({
          name: lead.name,
          email: lead.email,
          phone: lead.phone,
          website: lead.website,
          industry: config.industry,
          confidence: lead.confidence || 0.8,
          source: 'AI Generated',
        }));
      }

      return [];
    } catch (error) {
      this.logger.error(`Lead generation error: ${error}`);
      return [];
    }
  }

  /**
   * Generate local/mock leads
   */
  private generateLocalLeads(config: LeadFinderConfig): FoundLead[] {
    const mockLeads: Record<string, FoundLead[]> = {
      gym: [
        {
          name: 'Gold Fitness Center',
          email: 'owner@goldfitness.com',
          phone: '555-0101',
          website: 'goldfitness.com',
          industry: 'gym',
          confidence: 0.85,
          source: 'Local Directory',
        },
        {
          name: 'Elite Sports Club',
          email: 'manager@elitesports.com',
          phone: '555-0102',
          website: 'elitesports.com',
          industry: 'gym',
          confidence: 0.9,
          source: 'Local Directory',
        },
      ],
      restaurant: [
        {
          name: 'The Food House',
          email: 'info@foodhouse.com',
          phone: '555-0201',
          website: 'foodhouse.com',
          industry: 'restaurant',
          confidence: 0.8,
          source: 'Local Directory',
        },
        {
          name: 'Taste & Flavor Bistro',
          email: 'contact@tasteflavor.com',
          phone: '555-0202',
          website: 'tasteflavor.com',
          industry: 'restaurant',
          confidence: 0.82,
          source: 'Local Directory',
        },
      ],
      clinic: [
        {
          name: 'HealthCare Plus',
          email: 'appointments@healthcareplus.com',
          phone: '555-0301',
          website: 'healthcareplus.com',
          industry: 'clinic',
          confidence: 0.88,
          source: 'Local Directory',
        },
      ],
      realestate: [
        {
          name: 'Prime Properties',
          email: 'info@primeproperties.com',
          phone: '555-0401',
          website: 'primeproperties.com',
          industry: 'realestate',
          confidence: 0.86,
          source: 'Local Directory',
        },
      ],
      coaching: [
        {
          name: 'Success Coaching Academy',
          email: 'info@successcoach.com',
          phone: '555-0501',
          website: 'successcoach.com',
          industry: 'coaching',
          confidence: 0.84,
          source: 'Local Directory',
        },
      ],
    };

    const industryLower = config.industry.toLowerCase();
    return mockLeads[industryLower] || [];
  }

  /**
   * Analyze lead quality
   */
  private analyzeLeadQuality(lead: FoundLead): number {
    let score = lead.confidence;

    // Boost score if has email and phone
    if (lead.email && lead.phone) score += 0.05;

    // Boost score if has website
    if (lead.website) score += 0.05;

    return Math.min(score, 1);
  }
}
