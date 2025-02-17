import * as vscode from 'vscode';
import { getActiveEditor, isLuaFile } from '../core/editor';
import { SymbolAnalysisService } from '../services/symbolAnalysis';
import { ensureOutputChannel, showError } from '../utils/output';

export async function findDependencies() {
	try {
		const editor = getActiveEditor();
		const document = editor.document;

		if (!isLuaFile(document)) {
			throw new Error('Only Lua files can be analyzed');
		}

		const symbolAnalyzer = new SymbolAnalysisService(vscode.workspace.rootPath || '');
		const dependencies = await symbolAnalyzer.analyzeDependencies(document);

		if (dependencies.length === 0) {
			vscode.window.showInformationMessage('No dependencies found');
			return;
		}

		const output = ensureOutputChannel();
		output.show();
		output.appendLine('=== Dependencies Analysis Results ===');
		dependencies.forEach(dep => {
			output.appendLine(`\n${dep.type}: ${dep.path}`);
			output.appendLine(`  Line: ${dep.startLine}`);
			output.appendLine(`  Type: ${dep.moduleType}`);
			if (dep.resolvedPath) {
				output.appendLine(`  Resolved: ${dep.resolvedPath}`);
			}
		});
	} catch (error) {
		showError('Failed to find dependencies', error as Error);
	}
}