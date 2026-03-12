export function serializeForInlineScript(value: string) {
	return JSON.stringify(value)
		.replace(/</g, '\\u003C')
		.replace(/>/g, '\\u003E')
		.replace(/&/g, '\\u0026')
		.replace(/\u2028/g, '\\u2028')
		.replace(/\u2029/g, '\\u2029');
}

type WebviewContentOptions = {
	content: string;
	scriptUri: string;
	showJsonPathList: unknown;
	stylesMainUri: string;
	stylesResetUri: string;
};

export function buildWebviewContent({
	content,
	scriptUri,
	showJsonPathList,
	stylesMainUri,
	stylesResetUri,
}: WebviewContentOptions) {
	const serializedContent = serializeForInlineScript(content);

	return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset='utf-8'>
            <meta content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" name="viewport" />
            <title>JSONPath generator</title>
            <script>
                window.addEventListener('load', event => {
                    window.json.set(JSON.parse(${serializedContent}));
                    window.showPathList.set(${showJsonPathList});
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
