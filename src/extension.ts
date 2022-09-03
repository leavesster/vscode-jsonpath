// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


let panel : vscode.WebviewPanel | undefined;

function generateWebViewPanel(context: vscode.ExtensionContext) {
    const content = vscode.window.activeTextEditor?.document.getText();

    if (panel?.visible) {
        panel.webview.html = getWebviewContent(panel.webview, context, content || '');
        return;
    } else if (panel) {
        // do nothing
        return;
    }
    // const column = vscode.window.activeTextEditor
    // ? vscode.window.activeTextEditor.viewColumn
    // : undefined;

    panel = vscode.window.createWebviewPanel("jsonpath", "JSONPath", vscode.ViewColumn.Two, getWebviewOptions(context.extensionUri));
    panel.webview.html = getWebviewContent(panel.webview, context, content || '');

    panel.onDidDispose(() => {
        panel = undefined;
    });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


    console.log("Extension 'json-path-generator' is now active!");

    vscode.workspace.onDidChangeTextDocument((e) => {
        try {
            const json = JSON.parse(e.document.getText());
            panel?.webview.postMessage({ json });
        } catch (error) {
            console.log("Not a valid JSON");   
        }
    });

    vscode.window.onDidChangeActiveTextEditor((e) => {
        e?.document.languageId === 'json' && generateWebViewPanel(context);
    });

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('jsonPath.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from JSONPath!');
	});

    context.subscriptions.push(vscode.commands.registerCommand("jsonPath.showView", () => {
        generateWebViewPanel(context);
        panel?.reveal();
    }));


	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}


function getWebviewOptions(extensionUri: vscode.Uri): vscode.WebviewOptions {
	return {
		// Enable javascript in the webview
		enableScripts: true,

		// And restrict the webview to only loading content from our extension's `media` directory.
		localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'public')]
	};
}

function getWebviewContent(webview: vscode.Webview, context: vscode.ExtensionContext, content: string) {
    const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'public', 'build', 'bundle.js'));

    // Local path to css styles
    const styleResetPath = vscode.Uri.joinPath(context.extensionUri, 'public', 'global.css');
    const stylesPathMainPath = vscode.Uri.joinPath(context.extensionUri, 'public', 'build', 'bundle.css');

    // Uri to load styles into webview
    const stylesResetUri = webview.asWebviewUri(styleResetPath);
    const stylesMainUri = webview.asWebviewUri(stylesPathMainPath);

    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset='utf-8'>
            <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" />

            <title>JSONPath generator</title>
            <script>
                window.addEventListener('load', event => {
                    window.json.set(JSON.parse(${JSON.stringify(content)}));
                });
                window.addEventListener('message', event => {

                    const message = event.data; // The JSON data our extension sent
                    window.json.set(message.json);
                });
            </script>

            <link rel='stylesheet' href='${stylesResetUri}'>
            <link rel='stylesheet' href='${stylesMainUri}'>

            <script defer src='${scriptUri}'></script>
        </head>

        <body>
        </body>
        </html>
    `;
}