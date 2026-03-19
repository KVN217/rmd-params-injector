"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParamsState = void 0;
exports.hashParams = hashParams;
/**
 * Tracks which file's params are currently loaded in the R session,
 * so we only re-inject when the active .Rmd file changes.
 */
class ParamsState {
    /** Returns true if we need to re-inject (file or params changed) */
    static needsUpdate(filePath, paramsHash) {
        return (this._lastInjectedFile !== filePath ||
            this._lastInjectedHash !== paramsHash);
    }
    static update(filePath, paramsHash) {
        this._lastInjectedFile = filePath;
        this._lastInjectedHash = paramsHash;
    }
    static reset() {
        this._lastInjectedFile = null;
        this._lastInjectedHash = null;
    }
    static getLastFile() {
        return this._lastInjectedFile;
    }
}
exports.ParamsState = ParamsState;
ParamsState._lastInjectedFile = null;
ParamsState._lastInjectedHash = null;
/** Simple hash to detect if params values have changed */
function hashParams(params) {
    return JSON.stringify(params);
}
//# sourceMappingURL=paramsState.js.map