import * as vscode from 'vscode';
import { parseFrontMatter } from './paramParser';
import { injectParamsIntoR } from './paramInjector';
import { ParamsState, hashParams } from './paramsState';

export function activate(context: vscode.ExtensionContext) {
    console.log('[RMD Params] Extension activated');

    // ── Inject when switching to an .Rmd tab ──────────────────────────────
    const onEditorChange = vscode.window.onDidChangeActiveTextEditor(
        async (editor) => {
            if (!editor) return;
            await ensureParamsInjected(editor.document, true);
        }
    );

    // ── Re-inject when saving ─────────────────────────────────────────────
    const onSave = vscode.workspace.onDidSaveTextDocument(async (doc) => {
        ParamsState.reset();
        await ensureParamsInjected(doc, false);
    });

    // ── Manual inject command ─────────────────────────────────────────────
    const injectCmd = vscode.commands.registerCommand(
        'rmdParams.inject',
        async () => {
            const editor = vscode.window.activeTextEditor;
            if (!editor) {
                vscode.window.showWarningMessage('No active editor found.');
                return;
            }
            ParamsState.reset();
            await ensureParamsInjected(editor.document, false);
        }
    );

    context.subscriptions.push(onEditorChange, onSave, injectCmd);

    // Handle already open file
    if (vscode.window.activeTextEditor) {
        ensureParamsInjected(
            vscode.window.activeTextEditor.document,
            true
        );
    }
}

async function ensureParamsInjected(
    doc: vscode.TextDocument,
    silent: boolean
): Promise<void> {
    const isRmd =
        doc.fileName.endsWith('.Rmd') ||
        doc.fileName.endsWith('.rmd') ||
        doc.fileName.endsWith('.qmd');

    if (!isRmd) return;

    const { params } = parseFrontMatter(doc.getText());
    if (!params || Object.keys(params).length === 0) return;

    const currentHash = hashParams(params);
    if (!ParamsState.needsUpdate(doc.fileName, currentHash)) {
        console.log('[RMD Params] Already up to date, skipping.');
        return;
    }

    await injectParamsIntoR(params, doc.fileName, silent);
	
    ParamsState.update(doc.fileName, currentHash);
}

export function deactivate() {
    ParamsState.reset();
}