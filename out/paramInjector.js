"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectParamsIntoR = injectParamsIntoR;
exports.buildRParamsList = buildRParamsList;
exports.toRValue = toRValue;
const vscode = require("vscode");
const positron_1 = require("@posit-dev/positron");
async function injectParamsIntoR(params, fileName, silent = false) {
    const rCode = buildRParamsList(params);
    const positronApi = (0, positron_1.tryAcquirePositronApi)();
    if (positronApi) {
        // ── Running in Positron — use native runtime API ──────────────────
        console.log('[RMD Params] ✅ Positron detected, using runtime API');
        await positronApi.runtime.executeCode('r', // language
        rCode, // R code to run
        true // focus console
        );
    }
    else {
        // ── Running in VS Code — fall back to terminal ────────────────────
        console.log('[RMD Params] VS Code detected, using terminal fallback');
        await tryTerminalFallback(rCode);
    }
    // ── Notify user ───────────────────────────────────────────────────────
    if (!silent) {
        vscode.window.showInformationMessage(`✅ Injected ${Object.keys(params).length} param(s) from ${getFileName(fileName)}`);
    }
    else {
        vscode.window.setStatusBarMessage(`$(sync) RMD Params: Loaded from ${getFileName(fileName)}`, 4000);
    }
}
/**
 * Fallback for VS Code — uses = instead of <- to avoid PowerShell conflicts
 */
async function tryTerminalFallback(rCode) {
    const terminal = vscode.window.terminals.find(t => t.name === 'R Console' ||
        t.name === 'R' ||
        t.name.toLowerCase().includes('r console') ||
        t.name.toLowerCase().startsWith('r ')) ?? vscode.window.activeTerminal;
    if (!terminal) {
        vscode.window.showErrorMessage('❌ Could not find R console. Is R running?');
        return;
    }
    const singleLine = rCode
        .replace(/\r?\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    console.log(`[RMD Params] Injecting via terminal: "${terminal.name}"`);
    terminal.show(true);
    terminal.sendText(singleLine, true);
}
function buildRParamsList(params) {
    const entries = Object.entries(params)
        .map(([key, val]) => `${key} = ${toRValue(val)}`)
        .join(', ');
    return `params = list(${entries})`;
}
function toRValue(val) {
    if (val === null || val === undefined)
        return 'NULL';
    if (typeof val === 'boolean')
        return val ? 'TRUE' : 'FALSE';
    if (typeof val === 'number')
        return String(val);
    if (typeof val === 'string') {
        const escaped = val.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return `"${escaped}"`;
    }
    if (Array.isArray(val))
        return `c(${val.map(toRValue).join(', ')})`;
    if (typeof val === 'object') {
        const entries = Object.entries(val)
            .map(([k, v]) => `${k} = ${toRValue(v)}`)
            .join(', ');
        return `list(${entries})`;
    }
    return `"${String(val)}"`;
}
function getFileName(filePath) {
    return filePath.split(/[\\/]/).pop() ?? filePath;
}
//# sourceMappingURL=paramInjector.js.map