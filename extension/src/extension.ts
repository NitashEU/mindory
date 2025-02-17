import * as vscode from 'vscode';
import { analyzeCode } from './commands/analyzeCode';
import { findReferences } from './commands/findReferences';
import { findDependencies } from './commands/findDependencies';
import { gotoDefinition } from './commands/gotoDefinition';
import { disposeOutputChannel } from './utils/output';

export function activate(context: vscode.ExtensionContext) {
  const commands = [
    vscode.commands.registerCommand('mindory.getLuaCodeEntities', analyzeCode),
    vscode.commands.registerCommand('mindory.findReferences', findReferences),
    vscode.commands.registerCommand('mindory.findDependencies', findDependencies),
    vscode.commands.registerCommand('mindory.gotoDefinition', gotoDefinition)
  ];

  context.subscriptions.push(...commands);
}

export function deactivate() {
  disposeOutputChannel();
}

