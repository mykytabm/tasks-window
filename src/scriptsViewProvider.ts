import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
export class ScriptsViewProvider implements vscode.TreeDataProvider<ScriptItem> {
  constructor(private workspaceRoot: string) { }


  private _onDidChangeTreeData: vscode.EventEmitter<ScriptItem | undefined | null | void> = new vscode.EventEmitter<ScriptItem | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<ScriptItem | undefined | null | void> = this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: ScriptItem): vscode.TreeItem {
    return element;
  }

  getChildren(element?: ScriptItem): Thenable<ScriptItem[]> {
    if (!this.workspaceRoot) {
      vscode.window.showInformationMessage("Can't find scripts.json in .vscode folder");
      return Promise.resolve([]);
    }

    const scriptsJsonPath = path.join(this.workspaceRoot, '/.vscode/scripts.json');
    if (this.pathExists(scriptsJsonPath)) {
      return Promise.resolve(this.getTasksInJson(scriptsJsonPath));
    } else {
      vscode.window.showInformationMessage("Can't find scripts.json in .vscode folder");
      return Promise.resolve([]);
    }
  }
  /**
   * Given the path to package.json, read all its dependencies and devDependencies.
   */
  private getTasksInJson(scriptsJsonPath: string): ScriptItem[] {
    const scriptsJson = JSON.parse(fs.readFileSync(scriptsJsonPath, 'utf-8'));

    let arr: ScriptItem[] = [];
    for (let index = 0; index < scriptsJson.scripts.length; index++) {
      const script = scriptsJson.scripts[index];

      arr.push(new ScriptItem(
        script.name || 'Script',
        script.description || '',
        script.tooltip || ''
      ));
    }
    return arr;
  }

  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
}

export class ScriptItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly description: string,
    public readonly tooltip: string
  ) {
    super(label);
    this.tooltip = tooltip || 'awesome script';
    this.description = description || '';
    this.command = new TaskCommand(label);
  }
}

class TaskCommand implements vscode.Command {
  constructor(public readonly title: string,
    public command: string = '') {
    this.title = title;
    this.command = `se-script.${title}`;
  }
};