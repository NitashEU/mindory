import * as vscode from 'vscode';
import { CodeEntity, LuaSymbolType } from '../types';
import { getDocumentSymbols } from '../core/editor';

/**
 * Service for parsing Lua code and extracting symbols using VSCode's DocumentSymbolProvider.
 * Converts VSCode symbols to CodeEntity format with Lua-specific information.
 */
export class LuaParserService {
	async parseDocument(document: vscode.TextDocument): Promise<CodeEntity[]> {
		const symbols = await getDocumentSymbols(document);
		return this.convertToCodeEntities(symbols, document.uri.fsPath);
	}

	private convertToCodeEntities(symbols: vscode.DocumentSymbol[], filePath: string): CodeEntity[] {
		return symbols.map(symbol => this.convertSymbol(symbol, filePath));
	}

	private convertSymbol(symbol: vscode.DocumentSymbol, filePath: string): CodeEntity {
		const result: CodeEntity = {
			type: this.convertSymbolKind(symbol.kind),
			name: symbol.name,
			content: symbol.detail || '',
			filePath: filePath,
			startLine: symbol.range.start.line,
			endLine: symbol.range.end.line,
			children: [],
			dependencies: [],
			references: [],
			callers: [],
			callees: [],
			// Add Lua-specific fields
			isLocal: symbol.name.startsWith('local '),
			tableFields: this.extractTableFields(symbol)
		};

		if (symbol.children?.length > 0) {
			result.children = symbol.children.map(child => this.convertSymbol(child, filePath));
		}

		return result;
	}

	private extractTableFields(symbol: vscode.DocumentSymbol): string[] {
		if (symbol.kind === vscode.SymbolKind.Object) {
			return symbol.children?.map(child => child.name) || [];
		}
		return [];
	}

	private convertSymbolKind(kind: vscode.SymbolKind): LuaSymbolType {
		switch (kind) {
			case vscode.SymbolKind.Function:
				return 'function';
			case vscode.SymbolKind.Method:
				return 'method';
			case vscode.SymbolKind.Variable:
				return 'variable';
			case vscode.SymbolKind.Object:
				return 'table';
			case vscode.SymbolKind.String:
				return 'string';
			case vscode.SymbolKind.Number:
				return 'number';
			case vscode.SymbolKind.Boolean:
				return 'boolean';
			case vscode.SymbolKind.Module:
				return 'module';
			case vscode.SymbolKind.Field:
				return 'field';
			default:
				return 'nil';
		}
	}
}