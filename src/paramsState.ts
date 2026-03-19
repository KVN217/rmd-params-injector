/**
 * Tracks which file's params are currently loaded in the R session,
 * so we only re-inject when the active .Rmd file changes.
 */
export class ParamsState {
    private static _lastInjectedFile: string | null = null;
    private static _lastInjectedHash: string | null = null;

    /** Returns true if we need to re-inject (file or params changed) */
    static needsUpdate(filePath: string, paramsHash: string): boolean {
        return (
            this._lastInjectedFile !== filePath ||
            this._lastInjectedHash !== paramsHash
        );
    }

    static update(filePath: string, paramsHash: string): void {
        this._lastInjectedFile = filePath;
        this._lastInjectedHash = paramsHash;
    }

    static reset(): void {
        this._lastInjectedFile = null;
        this._lastInjectedHash = null;
    }

    static getLastFile(): string | null {
        return this._lastInjectedFile;
    }
}

/** Simple hash to detect if params values have changed */
export function hashParams(params: Record<string, any>): string {
    return JSON.stringify(params);
}