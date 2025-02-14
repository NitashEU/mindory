import * as fs from 'fs';
import * as path from 'path';
import * as walk from 'ignore-walk';
import { Injectable } from '@nestjs/common';

// Define filtering options for codebase inputs
interface CodebaseFilterOptions {
  includeDocs?: boolean;
  codeFilters?: string[];
  docsFilters?: string[];
}

// Note: For real implementations, consider using proper async methods and external packages
// such as "simple-git" for repository operations and "adm-zip" or similar for ZIP handling.

@Injectable()
export class CodebaseInputService {
  async processPathInput(
    inputPath: string,
    options?: CodebaseFilterOptions
  ): Promise<{ name: string; files: string[] }> {
    if (!fs.existsSync(inputPath)) {
      throw new Error("Directory not found");
    }
    const files = this.getFilesRecursive(inputPath);
    const filteredFiles = this.applyFilters(files, options);
    return { name: "Path Input", files: filteredFiles };
  }

  async processRepoInput(
    repoUrl: string,
    options?: CodebaseFilterOptions
  ): Promise<{ name: string; files: string[] }> {
    // Pseudo-code:
    // 1. Clone the repository to a temporary directory.
    // 2. Read all files from the cloned directory.
    // 3. Clean up (delete temporary directory).
    // For now, simulate the behavior.
    const files = ["repoFile1.js", "repoFile2.ts"]; // Simulated file list
    const filteredFiles = this.applyFilters(files, options);
    return { name: "Repo Input", files: filteredFiles };
  }

  async processZipInput(
    zipFilePath: string,
    options?: CodebaseFilterOptions
  ): Promise<{ name: string; files: string[] }> {
    // Pseudo-code:
    // 1. Unzip the file to a temporary directory.
    // 2. Read all files from the unzipped directory.
    // 3. Clean up (delete temporary directory).
    // For now, simulate the behavior.
    const files = ["unzippedFile1.js", "unzippedFile2.ts"]; // Simulated file list
    const filteredFiles = this.applyFilters(files, options);
    return { name: "Zip Input", files: filteredFiles };
  }

  private getFilesRecursive(dir: string): string[] {
    return walk.sync({
      path: dir,
      ignoreFiles: [".gitignore", ".npmignore"], // Add more if needed
    });
  }

  private applyFilters(
    files: string[],
    options?: CodebaseFilterOptions
  ): string[] {
    const includeDocs: boolean = options?.includeDocs !== false; // default is true
    const codeFilters: string[] = options?.codeFilters || [];
    const docsFilters: string[] = options?.docsFilters || [];
    const docExtensions: string[] = [
      ".md",
      ".markdown",
      ".txt",
      ".doc",
      ".docx",
      ".pdf",
    ];
    const codeExtensions: string[] = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".py",
      ".java",
      ".c",
      ".cpp",
      ".cs",
      ".go",
      ".rb",
    ];

    return files.filter((file) => {
      // Ignore .git, node_modules, etc.
      if (file.includes(".git") || file.includes("node_modules")) {
        return false;
      }
      const ext = path.extname(file).toLowerCase();
      if (docExtensions.includes(ext)) {
        if (!includeDocs) return false;
        if (
          docsFilters.length > 0 &&
          !docsFilters.some((filter) => file.includes(filter))
        ) {
          return false;
        }
        return true;
      } else if (codeExtensions.includes(ext)) {
        if (
          codeFilters.length > 0 &&
          !codeFilters.some((filter) => file.includes(filter))
        ) {
          return false;
        }
        return true;
      }
      return true;
    });
  }
}
