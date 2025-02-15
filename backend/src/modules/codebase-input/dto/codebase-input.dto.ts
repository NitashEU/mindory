import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PathInputDto {
  @ApiProperty({ description: "Path to the directory to process" })
  inputPath: string;

  @ApiPropertyOptional({
    description: "Include documentation files",
    default: true,
  })
  includeDocs?: boolean;

  @ApiPropertyOptional({
    description: "Filters to apply to code files",
    type: [String],
  })
  codeFilters?: string[];

  @ApiPropertyOptional({
    description: "Filters to apply to documentation files",
    type: [String],
  })
  docsFilters?: string[];

  @ApiPropertyOptional({
    description: "Whether to vectorize the repository content",
    default: false,
  })
  vectorize?: boolean;
}

export class RepoInputDto {
  [x: string]: any;
  @ApiProperty({ description: "URL of the repository to process" })
  repoUrl: string;

  @ApiPropertyOptional({
    description: "Include documentation files",
    default: true,
  })
  includeDocs?: boolean;

  @ApiPropertyOptional({
    description: "Filters to apply to code files",
    type: [String],
  })
  codeFilters?: string[];

  @ApiPropertyOptional({
    description: "Filters to apply to documentation files",
    type: [String],
  })
  docsFilters?: string[];
  vectorize?: boolean;
}

export class ZipInputDto {
  @ApiProperty({ description: "Path to the ZIP file to process" })
  zipFilePath: string;

  @ApiPropertyOptional({
    description: "Include documentation files",
    default: true,
  })
  includeDocs?: boolean;

  @ApiPropertyOptional({
    description: "Filters to apply to code files",
    type: [String],
  })
  codeFilters?: string[];

  @ApiPropertyOptional({
    description: "Filters to apply to documentation files",
    type: [String],
  })
  docsFilters?: string[];
}
