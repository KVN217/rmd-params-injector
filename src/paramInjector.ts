import * as vscode from 'vscode';
import { RmdParams } from './paramParser';

export async function injectParamsIntoR(
    params: RmdParams,
    fileName: string,
    silent = false
): Promise<void> {

    const rCode = buildRParamsList(params);

    const singleLine = rCode
        .replace(/\r?\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    // ── Try Positron's executeCode API first ──────────────────────────────
    // This sends directly to the R console, not a terminal
    try {
        await vscode.commands.executeCommand(
            'positron.executeCode',
            'r',        // language ID
            singleLine, // code to execute
            true,       // focus console
            true        // allow incomplete (false = must be complete expression)
        );

        console.log('[RMD Params] Injected via positron.executeCode');

    } catch (err) {
        console.log('[RMD Params] positron.executeCode failed, trying fallback...', err);

        // ── Fallback: try workbench execute command ───────────────────────
        try {
            await vscode.commands.executeCommand(
                'workbench.action.executeCode.console',
                singleLine
            );
        } catch {
            // ── Last resort: find R terminal by name ──────────────────────
            const rTerminal = vscode.window.terminals.find(t =>
                t.name.toLowerCase().includes('console') ||
                t.name.toLowerCase().startsWith('r ')   ||
                t.name === 'R'
            );

            if (rTerminal) {
                rTerminal.show(true);
                rTerminal.sendText(singleLine, true);
            } else {
                vscode.window.showErrorMessage(
                    '❌ Could not find R console. Is R running in Positron?'
                );
                return;
            }
        }
    }

    // ── Notify user ───────────────────────────────────────────────────────
    if (!silent) {
        vscode.window.showInformationMessage(
            `✅ Injected ${Object.keys(params).length} param(s) from ${getFileName(fileName)}`
        );
    } else {
        vscode.window.setStatusBarMessage(
            `$(sync) RMD Params: Loaded from ${getFileName(fileName)}`,
            4000
        );
    }
}

export function buildRParamsList(params: RmdParams): string {
    const entries = Object.entries(params)
        .map(([key, val]) => `${key} = ${toRValue(val)}`)
        .join(', ');
    return `params = list(${entries})`;
}

export function toRValue(val: any): string {
    if (val === null || val === undefined) return 'NULL';
    if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
    if (typeof val === 'number') return String(val);
    if (typeof val === 'string') {
        const escaped = val.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
        return `"${escaped}"`;
    }
    if (Array.isArray(val)) return `c(${val.map(toRValue).join(', ')})`;
    if (typeof val === 'object') {
        const entries = Object.entries(val)
            .map(([k, v]) => `${k} = ${toRValue(v)}`)
            .join(', ');
        return `list(${entries})`;
    }
    return `"${String(val)}"`;
}

function getFileName(filePath: string): string {
    return filePath.split(/[\\/]/).pop() ?? filePath;
}