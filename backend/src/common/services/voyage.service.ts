import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { VoyageAIClient, VoyageAIError } from 'voyageai';
import type { VoyageAI } from "voyageai";

@Injectable()
export class VoyageService {
  private client: VoyageAIClient;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.getOrThrow<string>("VOYAGE_API_KEY");
    this.client = new VoyageAIClient({ apiKey });
  }

  async generateEmbeddings(input: string | string[], model: string) {
    try {
      const request: VoyageAI.EmbedRequest = {
        input,
        model,
      };

      return await this.client.embed(request);
    } catch (error) {
      if (error instanceof VoyageAIError) {
        console.error(`Status Code: ${error.statusCode}`);
        console.error(`Message: ${error.message}`);
        console.error(`Body: ${error.body}`);
      }
      throw error;
    }
  }

  // Example of using advanced options
  async generateEmbeddingsWithOptions(
    input: string | string[],
    model: string,
    options?: {
      maxRetries?: number;
      timeoutInSeconds?: number;
      abortSignal?: AbortSignal;
    }
  ) {
    try {
      const request: VoyageAI.EmbedRequest = {
        input,
        model,
      };

      return await this.client.embed(request, {
        maxRetries: options?.maxRetries,
        timeoutInSeconds: options?.timeoutInSeconds,
        abortSignal: options?.abortSignal,
      });
    } catch (error) {
      if (error instanceof VoyageAIError) {
        console.error(`Status Code: ${error.statusCode}`);
        console.error(`Message: ${error.message}`);
        console.error(`Body: ${error.body}`);
      }
      throw error;
    }
  }
}
