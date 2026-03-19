"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = require("vscode");
const paramParser_1 = require("./paramParser");
const paramInjector_1 = require("./paramInjector");
const paramsState_1 = require("./paramsState");
function activate(context) {
    console.log('[RMD Params] Extension activated');
    // ── Inject when switching to an .Rmd tab ──────────────────────────────
    const onEditorChange = vscode.window.onDidChangeActiveTextEditor(async (editor) => {
        if (!editor)
            return;
        await ensureParamsInjected(editor.document, true);
    });
    // ── Re-inject when saving ─────────────────────────────────────────────
    const onSave = vscode.workspace.onDidSaveTextDocument(async (doc) => {
        paramsState_1.ParamsState.reset();
        await ensureParamsInjected(doc, false);
    });
    // ── Manual inject command ─────────────────────────────────────────────
    const injectCmd = vscode.commands.registerCommand('rmdParams.inject', async () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showWarningMessage('No active editor found.');
            return;
        }
        paramsState_1.ParamsState.reset();
        await ensureParamsInjected(editor.document, false);
    });
    context.subscriptions.push(onEditorChange, onSave, injectCmd);
    // Handle already open file
    if (vscode.window.activeTextEditor) {
        ensureParamsInjected(vscode.window.activeTextEditor.document, true);
    }
}
async function ensureParamsInjected(doc, silent) {
    const isRmd = doc.fileName.endsWith('.Rmd') ||
        doc.fileName.endsWith('.rmd') ||
        doc.fileName.endsWith('.qmd');
    if (!isRmd)
        return;
    const { params } = (0, paramParser_1.parseFrontMatter)(doc.getText());
    if (!params || Object.keys(params).length === 0)
        return;
    const currentHash = (0, paramsState_1.hashParams)(params);
    if (!paramsState_1.ParamsState.needsUpdate(doc.fileName, currentHash)) {
        console.log('[RMD Params] Already up to date, skipping.');
        return;
    }
    await (0, paramInjector_1.injectParamsIntoR)(params, doc.fileName, silent);
    paramsState_1.ParamsState.update(doc.fileName, currentHash);
}
function deactivate() {
    paramsState_1.ParamsState.reset();
}
//# sourceMappingURL=extension.js.map