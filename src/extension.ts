// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


let panel : vscode.WebviewPanel | undefined;

function updateWebViewPanel(context: vscode.ExtensionContext) {

    console.log("updateWebViewPanel and panel: ", !!panel);
    if (panel) {
        const content = vscode.window.activeTextEditor?.document.getText();
        panel.webview.html = getWebviewContent(panel.webview, context, content || '');
        return;
    }
}

function createWebviewPanel(context: vscode.ExtensionContext) {
    const content = vscode.window.activeTextEditor?.document.getText();

    panel = vscode.window.createWebviewPanel("jsonpath", "JSONPath", vscode.ViewColumn.Two, getWebviewOptions(context.extensionUri));
    panel.webview.html = getWebviewContent(panel.webview, context, content || '');
    console.log("panel created");

    panel.onDidDispose(() => {
        panel = undefined;
    });
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {


    console.log("Extension 'json-path-generator' is now active!");
    const showJsonPathList = vscode.workspace.getConfiguration('jsonpath').get('showJsonPathList');
    console.log("showJsonPathList: ", showJsonPathList);
    context.subscriptions.push(vscode.workspace.onDidChangeTextDocument((e) => {
        try {
            const json = JSON.parse(e.document.getText());
            panel?.webview.postMessage({ json, showPathList: showJsonPathList });
        } catch (error) {
            console.log("Not a valid JSON");   
        }
    }));

    context.subscriptions.push(vscode.workspace.onDidChangeConfiguration(event => {
        console.log("onDidChangeConfiguration", event);
        if (event.affectsConfiguration('jsonpath.showJsonPathList')) {
            const newValue = vscode.workspace.getConfiguration('jsonpath').get('showJsonPathList');
            console.log("jsonpath.showJsonPathList changed: ", newValue);
            panel?.webview.postMessage({ showPathList: newValue });
        }
    }));

    context.subscriptions.push(vscode.window.onDidChangeActiveTextEditor((e) => {
        e?.document.languageId === 'json' && updateWebViewPanel(context);
    }));

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	context.subscriptions.push(vscode.commands.registerCommand('jsonPath.helloWorld', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from JSONPath!');
	}));

    context.subscriptions.push(vscode.commands.registerCommand("jsonPath.showView", () => {
        console.log("showView");
        createWebviewPanel(context);
        panel?.reveal();
    }));
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
                    if (message.json) {
                        window.json.set(message.json);
                    }
                    if (message.showPathList !== undefined) {
                        window.showPathList.set(message.showPathList);
                    }
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