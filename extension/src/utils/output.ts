import * as vscode from 'vscode';

const OUTPUT_CHANNEL_NAME = "Code Analysis";
let outputChannel: vscode.OutputChannel | undefined;

export function ensureOutputChannel(): vscode.OutputChannel {
	if (!outputChannel) {
		outputChannel = vscode.window.createOutputChannel(OUTPUT_CHANNEL_NAME);
	}
	return outputChannel;
}

export function disposeOutputChannel() {
	if (outputChannel) {
		outputChannel.dispose();
	}
}

export function showError(message: string, error?: Error) {
	vscode.window.showErrorMessage(`${message}: ${error?.message || 'Unknown error'}`);
	if (error) {
		console.error(error);
	}
}