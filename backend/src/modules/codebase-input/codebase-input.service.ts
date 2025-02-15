import * as fs from 'fs';
import * as path from 'path';
import * as walk from 'ignore-walk';
import { Injectable } from '@nestjs/common';
import Parser from 'tree-sitter';
import Lua from '@tree-sitter-grammars/tree-sitter-lua';
import { VoyageService } from '@/common/services/voyage.service';

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
  constructor(
    private voyageService: VoyageService,
  ) { }
  async processPathInput(
    inputPath: string,
    options?: CodebaseFilterOptions
  ): Promise<{ name: string; files: { file: string; tree: Parser.Tree }[] }> {
    if (!fs.existsSync(inputPath)) {
      throw new Error("Directory not found");
    }
    const files = this.getFilesRecursive(inputPath);
    const filteredFiles = this.applyFilters(files, options);
    const parser = new Parser();
    parser.setLanguage(Lua as unknown as Parser.Language);

    const parsedFiles: { file: string; tree: Parser.Tree }[] = [];
    const nodeTypes = ["assignment_statement", "function_declaration"];
    for (const file of filteredFiles) {

      if (!file.endsWith(".lua")) continue;
      const content = fs.readFileSync(path.join(inputPath, file), 'utf8')
      const tree = parser.parse(content);
      const snippets = []
      const cursor = tree.walk();
      while (cursor.gotoFirstChild()) {
        if (nodeTypes.includes(cursor.nodeType)) {
          snippets.push(cursor.currentNode.text)
        }
        while (cursor.gotoNextSibling()) {
          if (nodeTypes.includes(cursor.nodeType)) {
            snippets.push(cursor.currentNode.text)
          }
        }
      }
      if (snippets.length > 0) {
        console.log(snippets)
        const maxBatchSize = 120;
        const batches = [];
        for (let i = 0; i < snippets.length; i += maxBatchSize) {
          batches.push(snippets.slice(i, i + maxBatchSize));
        }
        for (const batch of batches) {
          const b = await this.voyageService.generateEmbeddings(batch, "voyage-code-3")
          console.log(b)
        }
      }
      parsedFiles.push({ file, tree });
      // Process the tree here
    }
    return { name: "Path Input", files: parsedFiles };
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
