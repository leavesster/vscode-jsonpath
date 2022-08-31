// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { PerformanceNodeTiming } from 'perf_hooks';
import * as vscode from 'vscode';


let panel : vscode.WebviewPanel | undefined;

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


    console.log("Extension 'json-path-generator' is now active!");

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('jsonpath.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from JSONPath!');
	});

    const column = vscode.window.activeTextEditor
    ? vscode.window.activeTextEditor.viewColumn
    : undefined;

    if (!panel) {
        panel = vscode.window.createWebviewPanel("jsonpath", "JSONPath", column || vscode.ViewColumn.Two, getWebviewOptions(context.extensionUri));
        panel.webview.html = getWebviewContent();
    } else {
        panel.reveal();
    }



	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}


function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
	};
}

function getWebviewContent() {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">

        <!--
            Use a content security policy to only allow loading images from https or from our extension directory,
            and only allow scripts that have a specific nonce.
        -->
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <title>Cat Coding</title>
    </head>
    <body>
        <h1>JSON Path generator</h1>
    </body>
    </html>
    `;
}