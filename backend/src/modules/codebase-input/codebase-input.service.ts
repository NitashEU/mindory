import * as fs from 'fs';
import * as path from 'path';
import * as unzipper from 'unzipper';
import * as walk from 'ignore-walk';
import Lua from '@tree-sitter-grammars/tree-sitter-lua';
import Parser from 'tree-sitter';
import { CodeProcessingService } from '@/modules/code-processing/code-processing.service';
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
  constructor(
    private readonly voyageService: VoyageService,
    private readonly codeProcessingService: CodeProcessingService
  ) {}

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
    const { parsedFiles, repoMap } = await this.parseFiles(
      filteredFiles,
      inputPath
    );
    const cleanedRepoMap = this.cleanRepoMap(repoMap);

    return { name: "", files: [], repoMap: cleanedRepoMap };
  }

  async processRepoInput(
    repoUrl: string,
    options?: CodebaseFilterOptions & { vectorize?: boolean }
  ): Promise<{ name: string; files: string[]; vectorized?: boolean }> {
    const tempDir = path.join(__dirname, "tempRepo");
    const git = simpleGit();

    try {
      // Clone the repository to a temporary directory
      await git.clone(repoUrl, tempDir);

      // Change working directory and fetch latest changes
      git.cwd(tempDir);
      await git.fetch();

      const files = this.getFilesRecursive(tempDir);
      const filteredFiles = this.applyFilters(files, options);

      let vectorized = false;
      if (options?.vectorize) {
        try {
          const fileObjects = filteredFiles.map((filePath) => ({
            path: filePath,
            content: fs.readFileSync(path.join(tempDir, filePath), "utf-8"),
          }));

          await this.codeProcessingService.processRepository(fileObjects);
          vectorized = true;
        } catch (vectorizeError) {
          console.error("Error during vectorization:", vectorizeError);
          // Continue without vectorization if it fails
        }
      }

      return {
        name: "Repo Input",
        files: filteredFiles,
        vectorized,
      };
    } catch (error) {
      throw error;
    } finally {
      // Clean up the temporary directory
      if (fs.existsSync(tempDir)) {
        fs.rmdirSync(tempDir, { recursive: true });
      }
    }
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

  private async parseFiles(
    files: string[],
    inputPath: string
  ): Promise<{
    parsedFiles: { file: string; tree: Parser.Tree }[];
    repoMap: { [key: string]: { name: string; text: string }[] };
  }> {
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
    name: (identifier) @definition.function
    value: (function_definition
      )
  )
)

(function_call
name: [
(identifier) @name
(dot_index_expression
field: (identifier) @name)
(method_index_expression
method: (identifier) @name)
]) @reference.call

(assignment_statement
  (expression_list
    (table_constructor)
  )
) @definition.table-assignment`
    );

    const parsedFiles: { file: string; tree: Parser.Tree }[] = [];
    const repoMap: { [key: string]: { name: string; text: string }[] } = {};

    for (const file of files) {
      if (!file.endsWith(".lua")) {
        continue;
      }

      repoMap[file] = [];
      let content = fs.readFileSync(path.join(inputPath, file), "utf8");
      if (file.includes("_api/common")) {
        const lines = content.split("\n");
        let currentClass = "";
        const newLines = [];
        for (let line of lines) {
          if (line.startsWith("---@class")) {
            currentClass = line.split(" ")[1];
          } else if (line.startsWith("---@field")) {
            line = line.replace("---@field", "");
            line = line.replace("public", "").trim();
            if (line.includes("fun")) {
              newLines.push(
                `function ${currentClass}:${line.replace(" fun", "")} end`
              );
            } else {
              console.log(line);
              newLines.push(
                `local ${currentClass}.${line.split(" ")[0]} = "${
                  line.split(" ")[1]
                }"`
              );
            }
          }
        }
        content += newLines.join("\n");
      }

      const tree = parser.parse(content);

      const captures = query.captures(tree.rootNode);

      for (const capture of captures) {
        repoMap[file].push({ name: capture.name, text: capture.node.text });
      }

      parsedFiles.push({ file, tree });
    }

    return { parsedFiles, repoMap };
  }

  async createEmptyLuaCodeCursor(luaCode: string): Promise<any[]> {
    const parser = new Parser();
    parser.setLanguage(Lua as unknown as Parser.Language);

    const tree = parser.parse(luaCode);
    const cursor = tree.walk(); // Get a TreeCursor

    const captures: any[] = []; // Array to store capture objects

    // Start tree traversal from the root node
    let reachedRoot = false;

    while (true) {
      if (!reachedRoot) {
        reachedRoot = true; // Avoid processing root node's text directly
      } else {
        console.log(
          `Cursor visiting node type: ${cursor.nodeType}, isNamed: ${cursor.nodeIsNamed}`
        ); // Log node type

        if (cursor.nodeType === "program") {
          // Skip program node itself, process children in loop
        } else if (cursor.nodeIsNamed) {
          let captureName: string | undefined;

          switch (cursor.nodeType) {
            case "function_declaration":
              captureName = "definition.function";
              break;
            case "assignment_statement":
              captureName = "definition.as";
              break;
            case "table_constructor":
              captureName = "definition.table";
              break;
            case "function_call":
              captureName = "reference.call";
              break;
            case "identifier":
              captureName = "name";
              break;
            default:
              captureName = cursor.nodeType;
          }

          if (captureName) {
            console.log(`Capturing node: ${cursor.nodeType} as ${captureName}`);
            captures.push({
              name: captureName,
              text: cursor.nodeText,
            });
          }
        }
      }

      // Try to go to first child, if no children or already visited children, go to next sibling, if no siblings go to parent's sibling
      if (cursor.gotoFirstChild()) {
        continue; // Go deeper into the tree
      }

      // No children, try to go to next sibling
      if (cursor.gotoNextSibling()) {
        continue; // Move to next sibling at the same level
      }

      // No children and no next sibling, go up to parent and try next sibling from there
      let wentUp = false;
      while (cursor.gotoParent()) {
        if (cursor.gotoNextSibling()) {
          wentUp = true;
          break; // Found a sibling of a parent, continue from there
        }
      }
      if (!wentUp) {
        break; // No more siblings or parents with siblings, traversal is complete
      }
    }

    console.log("Cursor captures array:", JSON.stringify(captures, null, 2));
    return captures;
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
