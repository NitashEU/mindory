import { Controller, Post, Body } from '@nestjs/common';
import { VoyageService } from '../../common/services/voyage.service';

@Controller('embeddings')
export class EmbeddingsController {
  constructor(private readonly voyageService: VoyageService) {}

  @Post('single')
  async generateEmbedding(
    @Body() body: { input: string; model: string }
  ) {
    return await this.voyageService.generateEmbeddings(body.input, body.model);
  }

  @Post('batch')
  async generateBatchEmbeddings(
    @Body() body: { inputs: string[]; model: string }
  ) {
    return await this.voyageService.generateEmbeddings(body.inputs, body.model);
  }

  @Post('with-options')
  async generateWithOptions(
    @Body() body: {
      input: string | string[];
      model: string;
      maxRetries?: number;
      timeoutInSeconds?: number;
    }
  ) {
    return await this.voyageService.generateEmbeddingsWithOptions(
      body.input,
      body.model,
      {
        maxRetries: body.maxRetries,
        timeoutInSeconds: body.timeoutInSeconds,
      }
    );
  }
}