/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
/* Adapted from jsconsole, MIT licensed */
import { precompileJavascriptCode } from "./precompile";
import { promiseState } from "./util";
export class JavascriptEvaluator {
    async run(code) {
        const res = {
            error: false,
            code,
        };
        try {
            // // trick from devtools
            // // via https://chromium.googlesource.com/chromium/src.git/+/4fd348fdb9c0b3842829acdfb2b82c86dacd8e0a%5E%21/#F2
            if (/^\s*\{/.test(code) && /\}\s*$/.test(code)) {
                code = `(${code})`;
            }
            const codeToRun = await this.precompile(code);
            if (!window) {
                res.error = true;
                res.value = "Run error: container or window is null";
                return res;
            }
            const cellResult = await window.eval(codeToRun);
            if (cellResult === undefined) {
                res.value = undefined;
                return res;
            }
            const state = await promiseState(cellResult.returnValue);
            if (state === "fulfilled") {
                // Result is either a promise that was awaited, or an not a promise.
                res.value = await cellResult.returnValue;
            }
            else {
                // Result is a promise that was not awaited, "finish" the cell.
                res.value = cellResult.returnValue;
            }
            return res;
        }
        catch (error) {
            res.error = true;
            res.value = error;
            return res;
        }
    }
    precompile(code) {
        return precompileJavascriptCode(code);
    }
}
//# sourceMappingURL=eval.js.map