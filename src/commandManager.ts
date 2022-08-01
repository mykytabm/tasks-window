import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

let registeredCommands: { [id: string]: vscode.Disposable } = {};

export function registerCommands(context: vscode.ExtensionContext, scriptsJsonPath: string) {
    if (scriptsJsonPath !== '') {
        // unregister commands
        for (let key in registeredCommands) {
            registeredCommands[key].dispose();
        }
        registeredCommands = {};

        const scriptsJson = JSON.parse(fs.readFileSync(scriptsJsonPath, 'utf-8'));

        // register commands
        for (let index = 0; index < scriptsJson.scripts.length; index++) {
            const script = scriptsJson.scripts[index];
            const commandName = `se-script.${script.name}`;

            if (registeredCommands[commandName]) {
                vscode.window.showErrorMessage(commandName + ' is already registered. Make sure to assign a unique name to each of your scripts.');
                continue;
            }

            registeredCommands[commandName] = vscode.commands.registerCommand(commandName, () => {
                vscode.window.activeTerminal?.sendText(script.script);
            });
            context.subscriptions.push(registeredCommands[commandName]);
        }
    }
}