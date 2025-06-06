/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { CellElement } from "./cell";
import "./helpers/minimumBodySize"; // registers starboard-ensure-fits
import { createCellProxy } from "./helpers/proxy/cellProxy";
import { StarboardLogo } from "./icons";
import { insertHTMLChildAtIndex } from "./helpers/dom";
import { setupRuntime } from "../runtime/create";
import Modal from "bootstrap/js/dist/modal";
import { copyToClipboard } from "./helpers/clipboard";
import { flatPromise } from "./helpers/flatPromise";
import { renderIcon } from "./helpers/icon";
import { downloadAsHtml } from "../content/export";
import { arrayMoveElement } from "./helpers/array";
import { initPythonExecutionMode } from "../runtime/core";
let StarboardNotebookElement = class StarboardNotebookElement extends LitElement {
    constructor() {
        super(...arguments);
        this.initialRunStarted = false;
    }
    createRenderRoot() {
        return this;
    }
    connectedCallback() {
        super.connectedCallback();
        this.runtime = setupRuntime(this);
    }
    async loadPlugins() {
        var _a, _b;
        const pluginsToLoad = (_b = (_a = this.runtime.content.metadata.starboard) === null || _a === void 0 ? void 0 : _a.plugins) !== null && _b !== void 0 ? _b : [];
        let previousPluginRegistered = Promise.resolve();
        let syncPluginsPromise = Promise.resolve();
        for (const pluginDef of pluginsToLoad) {
            const { resolve, reject, promise } = flatPromise();
            const promiseToAwaitBeforeRegistering = previousPluginRegistered;
            previousPluginRegistered = promise;
            (async () => {
                try {
                    const { plugin } = await import(/* webpackIgnore: true */ pluginDef.src);
                    if (plugin === undefined) {
                        console.error(`Plugin loaded from ${pluginDef.src} does not have an export "plugin"`);
                        reject();
                        return;
                    }
                    await promiseToAwaitBeforeRegistering;
                    await this.runtime.controls.registerPlugin(plugin, pluginDef.args);
                    resolve();
                }
                catch (e) {
                    console.error(`Failed to load plugin from ${pluginDef.src}`);
                    reject(e);
                }
            })();
            if (!pluginDef.async) {
                syncPluginsPromise = syncPluginsPromise.then(() => promise);
            }
        }
        initPythonExecutionMode(this.runtime);
        return syncPluginsPromise;
    }
    async notebookInitialize() {
        await this.updateComplete;
        if (!this.initialRunStarted) {
            await this.loadPlugins();
            this.initialRunStarted = true;
            this.runtime.controls.runAllCells({ onlyRunOnLoad: true, isInitialRun: true });
        }
    }
    firstUpdated(changedProperties) {
        super.firstUpdated(changedProperties);
        this.sourceModal = new Modal(this.sourceModalElement, {});
        this.notebookInitialize();
    }
    moveCellDomElement(fromIndex, toIndex) {
        const el = this.runtime.dom.cells[fromIndex];
        const moveBeforeIndex = toIndex <= fromIndex ? toIndex : toIndex + 1;
        // A bit hacky: without this the connectedCallback and disconnectedCallback would
        // prompt creation or cleanup of the cell handler.
        el.isBeingMoved = true;
        this.cellsParentElement.insertBefore(el, this.runtime.dom.cells[moveBeforeIndex] || null);
        el.isBeingMoved = false;
        arrayMoveElement(this.runtime.dom.cells, fromIndex, toIndex);
    }
    performUpdate() {
        super.performUpdate();
        // We manually manage the cell elements, lit doesn't do a good job here
        // (or put differently: a too good job, it reuses components which is problematic)
        const content = this.runtime.content;
        const desiredCellIds = new Set(content.cells.map((c) => c.id));
        const mounted = this.cellsParentElement.children;
        for (let i = 0; i < mounted.length; i++) {
            const child = mounted[i];
            if (!desiredCellIds.has(child.cell.id)) {
                child.remove();
            }
        }
        this.runtime.dom.cells = this.runtime.dom.cells.filter((c) => desiredCellIds.has(c.cell.id) && !!this.querySelector(`[id="${c.cell.id}"]`));
        for (let i = 0; i < content.cells.length; i++) {
            const cell = content.cells[i];
            if (this.runtime.dom.cells.length > i && cell.id === this.runtime.dom.cells[i].cell.id) {
                // The cell is already present
                continue;
            }
            // We actually pass a proxy to cell handlers of the cell object so that we can
            // monitor any changes.
            const cellProxy = createCellProxy(cell, () => {
                const changeListeners = this.runtime.internal.listeners.cellContentChanges.get(cell.id);
                if (changeListeners) {
                    changeListeners.forEach((v) => v());
                }
                this.runtime.controls.contentChanged();
            });
            // We need to insert a cell here
            const newCellElement = new CellElement(cellProxy, this.runtime);
            this.runtime.dom.cells.splice(i, 0, newCellElement);
            insertHTMLChildAtIndex(this.cellsParentElement, newCellElement, i);
        }
    }
    showSourceModal() {
        const source = this.runtime.exports.core.notebookContentToText(this.runtime.content);
        this.querySelector("#starboard-source-modal-content").textContent = source;
        this.querySelector("#download-source-button").href = `data:nb;charset=utf-8,${encodeURIComponent(source)}`;
        this.sourceModal.show();
    }
    render() {
        return html `
      <main class="cells-container"></main>
      <footer class="starboard-notebook-footer line-grid">
        <div class="starboard-notebook-footer-content d-flex align-items-center">
          <span
            >${StarboardLogo({ width: 10, height: 10 })} Starboard Notebook v${this.runtime.version}
            ${window.starboardEditUrl ? html `- <a href=${window.starboardEditUrl}>Edit on Starboard.gg</a>` : ""}
          </span>
          <button @click=${() => this.showSourceModal()} class="btn btn-sm py-0 px-1 ms-2">
            <span>${renderIcon("bi bi-code-slash")}</span>
            Source
          </button>

          <button
            @click="${() => this.runtime.controls.insertCell({ position: "notebookEnd" })}"
            class="cell-controls-button"
            title="Add Cell Here"
            style="opacity: 0.7; margin-left: auto; padding: 0px 1px 0px 18px"
          >
            Add Cell <span class="bi bi-plus-square ms-2 me-1"></span>
          </button>
        </div>
      </footer>

      <div
        class="modal fade"
        id="starboard-source-modal"
        tabindex="-1"
        aria-labelledby="starboard-source-modal-label"
        aria-hidden="true"
      >
        <div class="modal-dialog modal-xl modal-fullscreen-lg-down modal-dialog-scrollable" style="min-height: 240px;">
          <starboard-ensure-parent-fits></starboard-ensure-parent-fits>
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="starboard-source-modal-label">Notebook Source</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body bg-light py-1" style="overflow-x: auto">
              <pre
                id="starboard-source-modal-content"
                class="my-1 p-0"
                style="overflow: visible; line-height: 1.2;"
              ></pre>
            </div>
            <div class="modal-footer">
              <button
                @click=${() => {
            downloadAsHtml(this.runtime);
        }}
                class="btn text-dark"
              >
                Export HTML
              </button>
              <button
                @click=${() => {
            copyToClipboard(this.runtime.exports.core.notebookContentToText(this.runtime.content));
        }}
                class="btn text-dark"
              >
                Copy to clipboard
              </button>
              <a id="download-source-button" download="notebook.sb" target="_blank" class="btn text-dark"
                >Download notebook</a
              >
              <button type="button" class="btn btn-primary" data-bs-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `;
    }
};
__decorate([
    property({ type: Object })
], StarboardNotebookElement.prototype, "config", void 0);
__decorate([
    query(".cells-container")
], StarboardNotebookElement.prototype, "cellsParentElement", void 0);
__decorate([
    query("#starboard-source-modal")
], StarboardNotebookElement.prototype, "sourceModalElement", void 0);
StarboardNotebookElement = __decorate([
    customElement("starboard-notebook")
], StarboardNotebookElement);
export { StarboardNotebookElement };
//# sourceMappingURL=notebook.js.map