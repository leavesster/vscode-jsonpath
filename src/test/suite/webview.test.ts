import * as assert from 'assert';

import { buildWebviewContent, serializeForInlineScript } from '../../webviewContent';

suite('Webview Content Suite', () => {
	test('serializeForInlineScript escapes embedded script terminators', () => {
		const serialized = serializeForInlineScript('{"html":"</script><p>owned</p>"}');

		assert.ok(!serialized.includes('</script>'));
		assert.ok(serialized.includes('\\u003C/script\\u003E\\u003Cp\\u003Eowned\\u003C/p\\u003E'));
	});

	test('getWebviewContent does not inline raw HTML from JSON text', () => {
		const html = buildWebviewContent({
			content: '{"html":"</script><p>owned</p>"}',
			scriptUri: 'bundle.js',
			showJsonPathList: false,
			stylesMainUri: 'bundle.css',
			stylesResetUri: 'global.css',
		});

		assert.ok(!html.includes('</script><p>owned</p>'));
		assert.ok(html.includes('\\u003C/script\\u003E\\u003Cp\\u003Eowned\\u003C/p\\u003E'));
	});
});
