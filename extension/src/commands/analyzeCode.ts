import * as vscode from 'vscode';
import { LuaParserService } from '../services/luaParser';
import { getActiveEditor, isLuaFile } from '../core/editor';
import { ensureOutputChannel, showError } from '../utils/output';

export async function analyzeCode() {
	try {
		const editor = getActiveEditor();
		const document = editor.document;

		if (!isLuaFile(document)) {
			throw new Error('Only Lua files can be analyzed');
		}

		const luaParser = new LuaParserService();
		const analysis = await luaParser.parseDocument(document);
		
		const output = ensureOutputChannel();
		output.show();
		output.appendLine('=== Lua Code Analysis Results ===');
		output.appendLine('\nSymbols:');
		output.appendLine(JSON.stringify(analysis.symbols, null, 2));
		output.appendLine('\nDependencies:');
		output.appendLine(JSON.stringify(analysis.dependencies, null, 2));
	} catch (error) {
		showError('Failed to analyze code', error as Error);
	}
}