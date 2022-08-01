import * as vscode from 'vscode';
import { ScriptsViewProvider } from './scriptsViewProvider';
import { registerCommands } from './commandManager';
import path = require('path');

const rootPath =
	vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0
		? vscode.workspace.workspaceFolders[0].uri.fsPath
		: "";

const tasksJsonPath = path.join(rootPath, '.\\.vscode\\tasks.json');

export function activate(context: vscode.ExtensionContext) {
	registerCommands(context, tasksJsonPath);

	const onDidSaveTextDocument = vscode.workspace.onDidSaveTextDocument((savedTextDocument: vscode.TextDocument) => {
		if (savedTextDocument.uri.fsPath === tasksJsonPath) {
			registerCommands(context, tasksJsonPath);
		}
		// update tasks view
		vscode.commands.executeCommand('script-explorer-view.refresh');
	});
	context.subscriptions.push(onDidSaveTextDocument);
}

const scriptsViewProvider = new ScriptsViewProvider(rootPath);
vscode.window.registerTreeDataProvider('script-explorer', scriptsViewProvider);
vscode.commands.registerCommand('script-explorer-view.refresh', () =>
	scriptsViewProvider.refresh()
);
