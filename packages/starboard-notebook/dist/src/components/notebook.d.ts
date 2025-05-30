import { LitElement } from "lit";
import "./helpers/minimumBodySize";
import { RuntimeConfig } from "../types";
declare global {
    interface Window {
        starboardEditUrl?: string;
    }
}
export declare class StarboardNotebookElement extends LitElement {
    private runtime;
    config?: RuntimeConfig;
    private cellsParentElement;
    private sourceModalElement;
    private sourceModal;
    createRenderRoot(): this;
    initialRunStarted: boolean;
    connectedCallback(): void;
    loadPlugins(): Promise<void>;
    notebookInitialize(): Promise<void>;
    firstUpdated(changedProperties: any): void;
    moveCellDomElement(fromIndex: number, toIndex: number): void;
    performUpdate(): void;
    showSourceModal(): void;
    render(): import("lit-html").TemplateResult<1>;
}
