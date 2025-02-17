import * as vscode from 'vscode';
import { getActiveEditor, isLuaFile } from '../core/editor';
import { SymbolAnalysisService } from '../services/symbolAnalysis';
import { showError } from '../utils/output';

export async function findReferences() {
	try {
		const editor = getActiveEditor();
		const document = editor.document;

		if (!isLuaFile(document)) {
			throw new Error('Only Lua files can be analyzed');
		}

		const position = editor.selection.active;
		const symbolAnalyzer = new SymbolAnalysisService(vscode.workspace.rootPath || '');
		const references = await symbolAnalyzer.getReferences(document.uri, position);

		if (!references || references.length === 0) {
			vscode.window.showInformationMessage('No references found');
			return;
		}

		// Show references in the References view
		await vscode.commands.executeCommand(
			'editor.action.showReferences',
			document.uri,
			position,
			references
		);
	} catch (error) {
		showError('Failed to find references', error as Error);
	}
}