import * as vscode from 'vscode';
import { showError } from '../utils/output';

export function getActiveEditor(): vscode.TextEditor {
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		throw new Error('No active editor found');
	}
	return editor;
}

export function isLuaFile(document: vscode.TextDocument): boolean {
	return document.languageId === 'lua' || document.fileName.endsWith('.lua');
}

export async function getDocumentSymbols(document: vscode.TextDocument): Promise<vscode.DocumentSymbol[]> {
	try {
		const symbols = await vscode.commands.executeCommand<vscode.DocumentSymbol[]>(
			'vscode.executeDocumentSymbolProvider',
			document.uri
		);
		return symbols || [];
	} catch (error) {
		showError('Failed to fetch document symbols', error as Error);
		return [];
	}
}