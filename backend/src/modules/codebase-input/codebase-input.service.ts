import * as fs from 'fs';
import * as path from 'path';
import * as unzipper from 'unzipper';
import * as walk from 'ignore-walk';
import Lua from '@tree-sitter-grammars/tree-sitter-lua';
import Parser from 'tree-sitter';
import { Injectable, NotFoundException } from '@nestjs/common';
import { simpleGit } from 'simple-git';
import { VoyageService } from '@/common/services/voyage.service';

interface CodebaseFilterOptions {
  includeDocs?: boolean;
  codeFilters?: string[];
  docsFilters?: string[];
}

@Injectable()
export class CodebaseInputService {
  constructor(private readonly voyageService: VoyageService) {}

  async processPathInput(
    inputPath: string,
    options?: CodebaseFilterOptions
  ): Promise<{
    name: string;
    files: { file: string; tree: Parser.Tree }[];
    repoMap: { [key: string]: { name: string; text: string }[] };
  }> {
    if (!fs.existsSync(inputPath)) {
      throw new NotFoundException(`Directory not found: ${inputPath}`);
    }

    const files = this.getFilesRecursive(inputPath);
    const filteredFiles = this.applyFilters(files, options);
    const { parsedFiles, repoMap } = this.parseFiles(filteredFiles, inputPath);
    const cleanedRepoMap = this.cleanRepoMap(repoMap);

    return { name: "Path Input", files: parsedFiles, repoMap: cleanedRepoMap };
  }

  async processRepoInput(
    repoUrl: string,
    options?: CodebaseFilterOptions
  ): Promise<{ name: string; files: string[] }> {
    const tempDir = path.join(__dirname, "tempRepo");
    const git = simpleGit();

    // Clone the repository to a temporary directory
    await git.clone(repoUrl, tempDir);

    const files = this.getFilesRecursive(tempDir);
    const filteredFiles = this.applyFilters(files, options);

    // Clean up the temporary directory
    fs.rmdirSync(tempDir, { recursive: true });

    return { name: "Repo Input", files: filteredFiles };
  }

  async processZipInput(
    zipFilePath: string,
    options?: CodebaseFilterOptions
  ): Promise<{ name: string; files: string[] }> {
    const tempDir = path.join(__dirname, "tempZip");

    // Create a temporary directory for unzipping
    fs.mkdirSync(tempDir, { recursive: true });

    // Unzip the file to the temporary directory
    await fs
      .createReadStream(zipFilePath)
      .pipe(unzipper.Extract({ path: tempDir }))
      .promise();

    const files = this.getFilesRecursive(tempDir);
    const filteredFiles = this.applyFilters(files, options);

    // Clean up the temporary directory
    fs.rmdirSync(tempDir, { recursive: true });

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
    const includeDocs: boolean = options?.includeDocs !== false;
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

  private parseFiles(
    files: string[],
    inputPath: string
  ): {
    parsedFiles: { file: string; tree: Parser.Tree }[];
    repoMap: { [key: string]: { name: string; text: string }[] };
  } {
    const parser = new Parser();
    parser.setLanguage(Lua as unknown as Parser.Language);
    const query = new Parser.Query(
      Lua as unknown as Parser.Language,
      `(function_declaration
  name: [
    (identifier) @name
    (dot_index_expression
      field: (identifier) @name)
  ]) @definition.function

(function_declaration
  name: (method_index_expression
    method: (identifier) @name)) @definition.method

(assignment_statement
  (variable_list .
    name: [
      (identifier) @name
      (dot_index_expression
        field: (identifier) @name)
    ])
  (expression_list .
    value: (function_definition))) @definition.as

(table_constructor
  (field
    name: (identifier) @name
    value: (function_definition))) @definition.table

(function_call
  name: [
    (identifier) @name
    (dot_index_expression
      field: (identifier) @name)
    (method_index_expression
      method: (identifier) @name)
  ]) @reference.call`
    );

    const parsedFiles: { file: string; tree: Parser.Tree }[] = [];
    const repoMap: { [key: string]: { name: string; text: string }[] } = {};

    for (const file of files) {
      if (!file.endsWith(".lua")) continue;

      repoMap[file] = [];
      const content = fs.readFileSync(path.join(inputPath, file), "utf8");
      const tree = parser.parse(content);
      const captures = query.captures(tree.rootNode);

      for (const capture of captures) {
        repoMap[file].push({ name: capture.name, text: capture.node.text });
      }

      parsedFiles.push({ file, tree });
    }

    return { parsedFiles, repoMap };
  }

  private cleanRepoMap(repoMap: {
    [key: string]: { name: string; text: string }[];
  }): { [key: string]: { name: string; text: string }[] } {
    const used = new Set<string>([
      "main.lua",
      "_api/core.lua",
      "_api/game_object.lua",
      "_api/menu.lua",
    ]);

    for (const file in repoMap) {
      for (const { name, text } of repoMap[file]) {
        if (name !== "reference.call" || !text.startsWith("require(")) continue;

        const requireExpression = text
          .replace("common/", "_api/common/")
          .slice(1)
          .slice(8, -2)
          .replace('require("', "")
          .replace('")', "");

        used.add(`${requireExpression}.lua`);
      }
    }

    const cleanedRepoMap: { [key: string]: { name: string; text: string }[] } =
      {};
    for (const file in repoMap) {
      if (used.has(file)) {
        cleanedRepoMap[file] = repoMap[file];
      }
    }

    return cleanedRepoMap;
  }
}
