import * as vscode from 'vscode';
import { CodeEntity } from './types';
import { SymbolAnalysisService } from './services/symbolAnalysis';


export class WorkspaceScanner {
	private workspaceRoot: string;
	private excludePatterns: string[];
	private filePatterns: string[];
	private symbolAnalyzer: SymbolAnalysisService;

	constructor(workspaceRoot: string, filePatterns?: string[]) {
		this.workspaceRoot = workspaceRoot;
		this.excludePatterns = ['node_modules', '.git', 'out', 'dist'];
		this.filePatterns = filePatterns || ['lua'];
		this.symbolAnalyzer = new SymbolAnalysisService(workspaceRoot);
	}

	async scanWorkspace(): Promise<Map<string, CodeEntity[]>> {
		const fileMap = new Map<string, CodeEntity[]>();
		
		if (!this.workspaceRoot) {
			throw new Error('No workspace root directory found');
		}

		const globPattern = `**/*.{${this.filePatterns.join(',')}}`;
		const files = await vscode.workspace.findFiles(
			globPattern,
			`{${this.excludePatterns.map(p => `**/${p}/**`).join(',')}}`
		);

		for (const file of files) {
			try {
				const document = await vscode.workspace.openTextDocument(file);
				const entities = await this.analyzeDocument(document);
				fileMap.set(file.fsPath, entities);
			} catch (error) {
				console.error(`Error analyzing file ${file.fsPath}:`, error);
			}
		}

		return fileMap;
	}

	private async analyzeDocument(document: vscode.TextDocument): Promise<CodeEntity[]> {
		const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
			'vscode.executeDocumentSymbolProvider',
			document.uri
		);

		if (!symbols) {
			return [];
		}

		// Analyze dependencies first
		const dependencies = await this.symbolAnalyzer.analyzeDependencies(document);
		const entities = await this.processSymbols(symbols, document);

		// Attach dependencies to the root-level entities
		entities.forEach(entity => {
			entity.dependencies = dependencies;
		});

		return entities;
	}

	private async processSymbols(
		symbols: vscode.DocumentSymbol[],
		document: vscode.TextDocument
	): Promise<CodeEntity[]> {
		const entities: CodeEntity[] = [];

		for (const symbol of symbols) {
			const entity = await this.createCodeEntity(symbol, document);
			entities.push(entity);
		}

		return entities;
	}

	private async createCodeEntity(
		symbol: vscode.DocumentSymbol,
		document: vscode.TextDocument
	): Promise<CodeEntity> {
		const range = symbol.range;
		const uri = document.uri;
		const content = document.getText(range);

		const references = await this.symbolAnalyzer.getReferences(uri, range.start);
		const definition = (await this.symbolAnalyzer.getDefinition(uri, range.start))?.[0];
		const implementation = await this.symbolAnalyzer.getImplementation(uri, range.start);

		const callers = await this.symbolAnalyzer.findCallers(document, symbol.name);
		const callees = await this.symbolAnalyzer.findCallees(content);

		return {
			type: this.getSymbolType(symbol.kind),
			name: symbol.name,
			content,
			filePath: uri.fsPath,
			startLine: range.start.line + 1,
			endLine: range.end.line + 1,
			children: await this.processSymbols(symbol.children, document),
			dependencies: [],
			references: references || [],
			definition,
			implementation,
			callers,
			callees
		};

	}




	private getSymbolType(kind: vscode.SymbolKind): string {
		const symbolTypes: Record<number, string> = {
			[vscode.SymbolKind.Function]: 'function',
			[vscode.SymbolKind.Class]: 'class',
			[vscode.SymbolKind.Interface]: 'interface',
			[vscode.SymbolKind.Method]: 'method',
			[vscode.SymbolKind.Property]: 'property',
			[vscode.SymbolKind.Variable]: 'variable',
			[vscode.SymbolKind.Module]: 'module',
			[vscode.SymbolKind.Namespace]: 'namespace',
			[vscode.SymbolKind.Package]: 'package',
			[vscode.SymbolKind.String]: 'string',
			[vscode.SymbolKind.Number]: 'number',
			[vscode.SymbolKind.Boolean]: 'boolean',
			[vscode.SymbolKind.Object]: 'table',
			[vscode.SymbolKind.Field]: 'field'
		};

		return symbolTypes[kind] || 'unknown';
	}

	setFilePatterns(patterns: string[]): void {
		this.filePatterns = patterns;
	}
}
