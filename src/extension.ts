import * as vscode from 'vscode';
import { ScriptsViewProvider } from './scriptsViewProvider';
import { registerCommands } from './commandManager';
import path = require('path');

const rootPath =
	vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
		? vscode.workspace.workspaceFolders[0].uri.fsPath
		: "";

const tasksJsonPath = path.join(rootPath, '.\\.vscode\\scripts.json');

export function activate(context: vscode.ExtensionContext) {
	registerCommands(context, tasksJsonPath);

	// subscribe to document changes to detect when project has required file .vscode\scripts.json
	const onDidRenameFiles = vscode.workspace.onDidRenameFiles((e) => {
		e.files.forEach(element => updateCommandsIfPathIsCorrect(element.newUri.fsPath, context));
	});

	const onDidDeleteFiles = vscode.workspace.onDidDeleteFiles((e) => {
		e.files.forEach(element => updateCommandsIfPathIsCorrect(element.fsPath, context));
	});

	const onDidSaveTextDocument = vscode.workspace.onDidSaveTextDocument((savedTextDocument: vscode.TextDocument) =>
		updateCommandsIfPathIsCorrect(savedTextDocument.uri.fsPath, context));

	context.subscriptions.push(onDidSaveTextDocument, onDidRenameFiles, onDidDeleteFiles);
}

function updateCommandsIfPathIsCorrect(path: string, context: vscode.ExtensionContext) {
	if (path === tasksJsonPath) {
		registerCommands(context, tasksJsonPath);
		// update tasks view
		vscode.commands.executeCommand('script-explorer-view.refresh');
	}
}

const scriptsViewProvider = new ScriptsViewProvider(rootPath);
vscode.window.registerTreeDataProvider('script-explorer', scriptsViewProvider);
vscode.commands.registerCommand('script-explorer-view.refresh', () =>
	scriptsViewProvider.refresh()
);
