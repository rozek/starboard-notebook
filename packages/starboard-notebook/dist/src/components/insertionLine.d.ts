import { LitElement } from "lit";
export declare class InsertionLine extends LitElement {
    buttonElement?: HTMLButtonElement;
    hoverArea?: HTMLDivElement;
    private insertPosition;
    private runtime;
    createRenderRoot(): this;
    constructor();
    connectedCallback(): void;
    firstUpdated(): void;
    quickInsert(cellType: string): void;
    render(): import("lit-html").TemplateResult<1>;
}
