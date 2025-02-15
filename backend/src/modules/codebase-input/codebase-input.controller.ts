import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CodebaseInputService } from './codebase-input.service';
import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import {
  PathInputDto,
  RepoInputDto,
  ZipInputDto,
} from "./dto/codebase-input.dto";

@ApiTags("codebase-input")
@Controller("codebase-input")
export class CodebaseInputController {
  constructor(private readonly codebaseInputService: CodebaseInputService) {}

  @Post("path")
  @ApiOperation({ summary: "Process input from a file path" })
  @ApiResponse({
    status: 200,
    description: "Successfully processed path input",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  async inputPath(@Body() body: PathInputDto) {
    try {
      const result = await this.codebaseInputService.processPathInput(
        body.inputPath,
        {
          includeDocs: body.includeDocs,
          codeFilters: body.codeFilters,
          docsFilters: body.docsFilters,
        }
      );
      return result;
    } catch (error: any) {
      console.error("Error processing path input:", error);
      throw new HttpException(
        error?.message || "Error processing path input",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post("repo")
  @ApiOperation({ summary: "Process input from a repository URL" })
  @ApiResponse({
    status: 200,
    description: "Successfully processed repository input",
  })
  @ApiResponse({ status: 400, description: "Bad request" })
  async inputRepo(@Body() body: RepoInputDto) {
    try {
      const options = {
        includeDocs: body.includeDocs,
        codeFilters: body.codeFilters,
        docsFilters: body.docsFilters,
      };
      const result = await this.codebaseInputService.processRepoInput(
        body.repoUrl,
        options
      );
      return result;
    } catch (error: any) {
      console.error("Error processing repository input:", error);
      throw new HttpException(
        error?.message || "Error processing repository input",
        HttpStatus.BAD_REQUEST
      );
    }
  }

  @Post("zip")
  @ApiOperation({ summary: "Process input from a ZIP file" })
  @ApiResponse({ status: 200, description: "Successfully processed ZIP input" })
  @ApiResponse({ status: 400, description: "Bad request" })
  async inputZip(@Body() body: ZipInputDto) {
    try {
      const options = {
        includeDocs: body.includeDocs,
        codeFilters: body.codeFilters,
        docsFilters: body.docsFilters,
      };
      const result = await this.codebaseInputService.processZipInput(
        body.zipFilePath,
        options
      );
      return result;
    } catch (error: any) {
      console.error("Error processing zip input:", error);
      throw new HttpException(
        error?.message || "Error processing zip input",
        HttpStatus.BAD_REQUEST
      );
    }
  }
}
