import * as vscode from 'vscode';
import { getActiveEditor, isLuaFile } from '../core/editor';
import { SymbolAnalysisService } from '../services/symbolAnalysis';
import { showError } from '../utils/output';

export async function gotoDefinition() {
	try {
		const editor = getActiveEditor();
		const document = editor.document;

		if (!isLuaFile(document)) {
			throw new Error('Only Lua files can be analyzed');
		}

		const position = editor.selection.active;
		const symbolAnalyzer = new SymbolAnalysisService(vscode.workspace.rootPath || '');
		const definitions = await symbolAnalyzer.getDefinition(document.uri, position);

		if (!definitions || definitions.length === 0) {
			vscode.window.showInformationMessage('No definition found');
			return;
		}

		// Open the first definition
		const definition = definitions[0];
		const definitionUri = definition.uri;
		const definitionRange = definition.range;

		await vscode.window.showTextDocument(definitionUri, {
			selection: definitionRange
		});
	} catch (error) {
		showError('Failed to go to definition', error as Error);
	}
}