import * as vscode from 'vscode';
import { RmdParams } from './paramParser';
import { injectParamsIntoR } from './paramInjector';

export class ParamSidebarProvider implements vscode.WebviewViewProvider {
    public static readonly viewId = 'rmdParamsView';
    private _view?: vscode.WebviewView;
    private _params: RmdParams = {};
    private _fileName: string = '';

    constructor(private readonly _extensionUri: vscode.Uri) {}

    /** Called by VS Code when the sidebar view is opened */
    resolveWebviewView(
        webviewView: vscode.WebviewView,
        _context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ): void {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri],
        };

        webviewView.webview.html = this._buildHtml({});

        // Listen for messages from the webview (e.g. "Inject" button clicks)
        webviewView.webview.onDidReceiveMessage(message => {
            if (message.command === 'inject') {
                // Use the (possibly edited) params sent back from the webview
                injectParamsIntoR(message.params, this._fileName);
            }
        });
    }

    /** Update the sidebar with new params from a freshly opened/saved file */
    public updateParams(params: RmdParams, fileName: string): void {
        this._params = params;
        this._fileName = fileName;

        if (this._view) {
            this._view.webview.html = this._buildHtml(params);
        }
    }

    /** Build the HTML for the sidebar */
    private _buildHtml(params: RmdParams): string {
        const rows = Object.entries(params)
            .map(([key, val]) => {
                const displayVal = typeof val === 'object'
                    ? JSON.stringify(val)
                    : String(val ?? '');

                const inputType = typeof val === 'number'
                    ? 'number'
                    : 'text';

                return `
                    <div class="param-row">
                        <label>${key}</label>
                        <input
                            type="${inputType}"
                            data-key="${key}"
                            data-type="${typeof val}"
                            value="${displayVal.replace(/"/g, '&quot;')}"
                        />
                    </div>
                `;
            })
            .join('');

        const emptyMessage = Object.keys(params).length === 0
            ? '<p class="empty">Open an .Rmd or .qmd file with a <code>params:</code> block to get started.</p>'
            : '';

        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8" />
                <style>
                    body {
                        font-family: var(--vscode-font-family);
                        font-size: var(--vscode-font-size);
                        color: var(--vscode-foreground);
                        padding: 10px;
                    }
                    .param-row {
                        margin-bottom: 12px;
                    }
                    label {
                        display: block;
                        font-weight: bold;
                        margin-bottom: 4px;
                        color: var(--vscode-descriptionForeground);
                    }
                    input {
                        width: 100%;
                        padding: 4px 6px;
                        box-sizing: border-box;
                        background: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                        border: 1px solid var(--vscode-input-border);
                        border-radius: 3px;
                    }
                    button {
                        width: 100%;
                        padding: 8px;
                        margin-top: 8px;
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 13px;
                    }
                    button:hover {
                        background: var(--vscode-button-hoverBackground);
                    }
                    .empty {
                        color: var(--vscode-descriptionForeground);
                        font-style: italic;
                    }
                    code {
                        font-family: var(--vscode-editor-font-family);
                        background: var(--vscode-textCodeBlock-background);
                        padding: 1px 4px;
                        border-radius: 3px;
                    }
                </style>
            </head>
            <body>
                <h3>📄 RMD Params</h3>
                ${emptyMessage}
                ${rows}
                ${Object.keys(params).length > 0 ? `
                    <button onclick="inject()">
                        ▶ Inject into R Session
                    </button>
                ` : ''}

                <script>
                    const vscode = acquireVsCodeApi();

                    function inject() {
                        // Collect current (possibly edited) values from inputs
                        const inputs = document.querySelectorAll('input[data-key]');
                        const params = {};

                        inputs.forEach(input => {
                            const key   = input.dataset.key;
                            const type  = input.dataset.type;
                            let   value = input.value;

                            // Re-cast to original type
                            if (type === 'number')  value = Number(value);
                            if (type === 'boolean') value = value === 'true';

                            params[key] = value;
                        });

                        vscode.postMessage({ command: 'inject', params });
                    }
                </script>
            </body>
            </html>
        `;
    }
}