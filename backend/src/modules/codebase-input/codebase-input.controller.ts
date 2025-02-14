import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CodebaseInputService } from './codebase-input.service';

@Controller('codebase-input')
export class CodebaseInputController {
  constructor(private readonly codebaseInputService: CodebaseInputService) {}

  @Post('path')
  async inputPath(
    @Body() body: { 
      inputPath: string; 
      includeDocs?: boolean; 
      codeFilters?: string[]; 
      docsFilters?: string[]; 
    }
  ) {
    try {
      const options = {
        includeDocs: body.includeDocs,
        codeFilters: body.codeFilters,
        docsFilters: body.docsFilters,
      };
      const result = await this.codebaseInputService.processPathInput(body.inputPath, options);
      return result;
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Error processing path input',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('repo')
  async inputRepo(
    @Body() body: { 
      repoUrl: string; 
      includeDocs?: boolean; 
      codeFilters?: string[]; 
      docsFilters?: string[]; 
    }
  ) {
    try {
      const options = {
        includeDocs: body.includeDocs,
        codeFilters: body.codeFilters,
        docsFilters: body.docsFilters,
      };
      const result = await this.codebaseInputService.processRepoInput(body.repoUrl, options);
      return result;
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Error processing repository input',
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post('zip')
  async inputZip(
    @Body() body: { 
      zipFilePath: string; 
      includeDocs?: boolean; 
      codeFilters?: string[]; 
      docsFilters?: string[]; 
    }
  ) {
    try {
      const options = {
        includeDocs: body.includeDocs,
        codeFilters: body.codeFilters,
        docsFilters: body.docsFilters,
      };
      const result = await this.codebaseInputService.processZipInput(body.zipFilePath, options);
      return result;
    } catch (error: any) {
      throw new HttpException(
        error?.message || 'Error processing zip input',
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
