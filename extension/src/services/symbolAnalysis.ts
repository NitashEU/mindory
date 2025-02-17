import * as vscode from 'vscode';
import * as path from 'path';
import { Dependency, ModuleType } from '../types';

export class SymbolAnalysisService {
	constructor(private workspaceRoot: string) {}

	async findCallers(document: vscode.TextDocument, symbolName: string): Promise<string[]> {
		const callers: string[] = [];
		const text = document.getText();
		const lines = text.split('\n');

		const patterns = [
			new RegExp(`${symbolName}\\s*\\([^)]*\\)`, 'g'),
			new RegExp(`${symbolName}\\s*{[^}]*}`, 'g'),
			new RegExp(`:\\s*${symbolName}\\s*\\(`, 'g')
		];

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i];
			for (const pattern of patterns) {
				const matches = line.match(pattern);
				if (matches) {
					callers.push(...matches);
				}
			}
		}

		return callers;
	}

	async findCallees(content: string): Promise<string[]> {
		const callees: string[] = [];
		const lines = content.split('\n');

		const patterns = [
			/(\w+)\s*\([^)]*\)/g,
			/(\w+)\s*{[^}]*}/g,
			/(\w+):(\w+)\s*\(/g
		];

		for (const line of lines) {
			for (const pattern of patterns) {
				const matches = [...line.matchAll(pattern)];
				for (const match of matches) {
					if (match[1] && !callees.includes(match[1])) {
						callees.push(match[1]);
					}
					if (match[2] && !callees.includes(match[2])) {
						callees.push(match[2]);
					}
				}
			}
		}

		return callees;
	}

	async analyzeDependencies(document: vscode.TextDocument): Promise<Dependency[]> {
		const dependencies: Dependency[] = [];
		const text = document.getText();
		const lines = text.split('\n');

		for (let i = 0; i < lines.length; i++) {
			const line = lines[i].trim();
			const requirePatterns = [
				/require\s*\(?['"]([^'"]+)['"]\)?/,
				/local\s+\w+\s*=\s*require\s*\(?['"]([^'"]+)['"]\)?/
			];

			for (const pattern of requirePatterns) {
				const match = line.match(pattern);
				if (match) {
					const modulePath = match[1];
					const isExternal = !modulePath.startsWith('./') && !modulePath.startsWith('../');
					const resolvedPath = isExternal ? undefined : await this.resolvePath(modulePath, document.uri.fsPath);

					dependencies.push({
						type: 'require',
						path: modulePath,
						moduleType: 'lua',
						specifiers: [],
						isTypeOnly: false,
						startLine: i + 1,
						endLine: i + 1,
						isExternal,
						isRelative: !isExternal,
						resolvedPath
					});
					break;
				}
			}
		}

		return dependencies;
	}

	async getReferences(uri: vscode.Uri, position: vscode.Position): Promise<vscode.Location[] | undefined> {
		return vscode.commands.executeCommand<vscode.Location[]>(
			'vscode.executeReferenceProvider',
			uri,
			position
		);
	}

	async getDefinition(uri: vscode.Uri, position: vscode.Position): Promise<vscode.Location[] | undefined> {
		return vscode.commands.executeCommand<vscode.Location[]>(
			'vscode.executeDefinitionProvider',
			uri,
			position
		);
	}

	async getImplementation(uri: vscode.Uri, position: vscode.Position): Promise<vscode.Location[] | undefined> {
		return vscode.commands.executeCommand<vscode.Location[]>(
			'vscode.executeImplementationProvider',
			uri,
			position
		);
	}

	private async resolvePath(importPath: string, currentFilePath: string): Promise<string | undefined> {
		if (this.isExternalModule(importPath)) {
			return undefined;
		}
		
		const basePath = path.dirname(currentFilePath);
		const normalizedPath = importPath.replace(/\./g, path.sep);
		
		const possiblePaths = [
			path.join(basePath, `${normalizedPath}.lua`),
			path.join(basePath, normalizedPath, 'init.lua'),
			path.join(this.workspaceRoot, `${normalizedPath}.lua`),
			path.join(this.workspaceRoot, normalizedPath, 'init.lua'),
			path.join(basePath, 'lua', `${normalizedPath}.lua`),
			path.join(this.workspaceRoot, 'lua', `${normalizedPath}.lua`),
			path.join(basePath, 'lib', `${normalizedPath}.lua`),
			path.join(this.workspaceRoot, 'lib', `${normalizedPath}.lua`)
		];

		for (const possiblePath of possiblePaths) {
			try {
				await vscode.workspace.fs.stat(vscode.Uri.file(possiblePath));
				return possiblePath;
			} catch {
				continue;
			}
		}

		return undefined;
	}

	private isExternalModule(importPath: string): boolean {
		if (importPath.includes('.') && !importPath.includes('/') && !importPath.includes('\\')) {
			return false;
		}
		return !importPath.startsWith('.') && !importPath.startsWith('/');
	}
}