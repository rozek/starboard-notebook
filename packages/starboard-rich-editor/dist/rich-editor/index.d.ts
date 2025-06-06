/// <reference types="lodash" />
import * as React from "react";
import { EditorState, Plugin } from "prosemirror-state";
import { MarkdownParser, MarkdownSerializer } from "prosemirror-markdown";
import { EditorView } from "prosemirror-view";
import { Schema, NodeSpec, MarkSpec } from "prosemirror-model";
import { InputRule } from "prosemirror-inputrules";
import baseDictionary from "rich-markdown-editor/dist/dictionary";
import { SearchResult } from "rich-markdown-editor/dist/components/LinkEditor";
import { EmbedDescriptor, ToastType } from "rich-markdown-editor/dist/types";
import Tooltip from "rich-markdown-editor/dist/components/Tooltip";
import Extension from "rich-markdown-editor/dist/lib/Extension";
import ExtensionManager from "rich-markdown-editor/dist/lib/ExtensionManager";
import ComponentView from "rich-markdown-editor/dist/lib/ComponentView";
export { default as Extension } from "rich-markdown-editor/dist/lib/Extension";
export declare const theme: {
    background: string;
    text: string;
    code: string;
    cursor: string;
    divider: string;
    toolbarBackground: string;
    toolbarHoverBackground: string;
    toolbarInput: string;
    toolbarItem: string;
    tableDivider: string;
    tableSelected: string;
    tableSelectedBackground: string;
    quote: string;
    codeBackground: string;
    codeBorder: string;
    horizontalRule: string;
    imageErrorBackground: string;
    scrollbarBackground: string;
    scrollbarThumb: string;
    fontFamily: string;
    fontFamilyMono: string;
    fontWeight: number;
    zIndex: number;
    link: string;
    placeholder: string;
    textSecondary: string;
    textLight: string;
    textHighlight: string;
    textHighlightForeground: string;
    selected: string;
    codeComment: string;
    codePunctuation: string;
    codeNumber: string;
    codeProperty: string;
    codeTag: string;
    codeString: string;
    codeSelector: string;
    codeAttr: string;
    codeEntity: string;
    codeKeyword: string;
    codeFunction: string;
    codeStatement: string;
    codePlaceholder: string;
    codeInserted: string;
    codeImportant: string;
    blockToolbarBackground: string;
    blockToolbarTrigger: string;
    blockToolbarTriggerIcon: string;
    blockToolbarItem: string;
    blockToolbarIcon: undefined;
    blockToolbarIconSelected: string;
    blockToolbarText: string;
    blockToolbarTextSelected: string;
    blockToolbarSelectedBackground: string;
    blockToolbarHoverBackground: string;
    blockToolbarDivider: string;
    noticeInfoBackground: string;
    noticeInfoText: string;
    noticeTipBackground: string;
    noticeTipText: string;
    noticeWarningBackground: string;
    noticeWarningText: string;
    almostBlack: string;
    lightBlack: string;
    almostWhite: string;
    white: string;
    white10: string;
    black: string;
    black10: string;
    primary: string;
    greyLight: string;
    grey: string;
    greyMid: string;
    greyDark: string;
};
export declare type Props = {
    id?: string;
    value?: string;
    defaultValue: string;
    placeholder: string;
    extensions: Extension[];
    disableExtensions?: ("strong" | "code_inline" | "highlight" | "em" | "link" | "placeholder" | "strikethrough" | "underline" | "blockquote" | "bullet_list" | "checkbox_item" | "checkbox_list" | "code_block" | "code_fence" | "embed" | "br" | "heading" | "hr" | "image" | "list_item" | "container_notice" | "ordered_list" | "paragraph" | "table" | "td" | "th" | "tr" | "emoji")[];
    autoFocus?: boolean;
    readOnly?: boolean;
    readOnlyWriteCheckboxes?: boolean;
    dictionary?: Partial<typeof baseDictionary>;
    dark?: boolean;
    dir?: string;
    theme?: typeof theme;
    template?: boolean;
    headingsOffset?: number;
    maxLength?: number;
    scrollTo?: string;
    handleDOMEvents?: {
        [name: string]: (view: EditorView, event: Event) => boolean;
    };
    uploadImage?: (file: File) => Promise<string>;
    onBlur?: () => void;
    onFocus?: () => void;
    onSave?: ({ done: boolean }: {
        done: any;
    }) => void;
    onCancel?: () => void;
    onChange?: (value: () => string) => void;
    onImageUploadStart?: () => void;
    onImageUploadStop?: () => void;
    onCreateLink?: (title: string) => Promise<string>;
    onSearchLink?: (term: string) => Promise<SearchResult[]>;
    onClickLink: (href: string, event: MouseEvent) => void;
    onHoverLink?: (event: MouseEvent) => boolean;
    onClickHashtag?: (tag: string, event: MouseEvent) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    embeds: EmbedDescriptor[];
    onShowToast?: (message: string, code: ToastType) => void;
    tooltip: typeof React.Component | React.FC<any>;
    className?: string;
    style?: React.CSSProperties;
};
declare type State = {
    isRTL: boolean;
    isEditorFocused: boolean;
    selectionMenuOpen: boolean;
    blockMenuOpen: boolean;
    linkMenuOpen: boolean;
    blockMenuSearch: string;
    emojiMenuOpen: boolean;
};
declare class RichMarkdownEditor extends React.PureComponent<Props, State> {
    static defaultProps: {
        defaultValue: string;
        dir: string;
        placeholder: string;
        onImageUploadStart: () => void;
        onImageUploadStop: () => void;
        onClickLink: (href: any) => void;
        embeds: never[];
        extensions: never[];
        tooltip: typeof Tooltip;
    };
    state: {
        isRTL: boolean;
        isEditorFocused: boolean;
        selectionMenuOpen: boolean;
        blockMenuOpen: boolean;
        linkMenuOpen: boolean;
        blockMenuSearch: string;
        emojiMenuOpen: boolean;
    };
    isBlurred: boolean;
    extensions: ExtensionManager;
    element?: HTMLElement | null;
    view: EditorView;
    schema: Schema;
    serializer: MarkdownSerializer;
    parser: MarkdownParser;
    pasteParser: MarkdownParser;
    plugins: Plugin[];
    keymaps: Plugin[];
    inputRules: InputRule[];
    nodeViews: {
        [name: string]: (node: any, view: any, getPos: any, decorations: any) => ComponentView;
    };
    nodes: {
        [name: string]: NodeSpec;
    };
    marks: {
        [name: string]: MarkSpec;
    };
    commands: Record<string, any>;
    componentDidMount(): void;
    componentDidUpdate(prevProps: Props): void;
    init(): void;
    createExtensions(): ExtensionManager;
    createPlugins(): Plugin<any, any>[];
    createKeymaps(): Plugin<any, any>[];
    createInputRules(): InputRule<any>[];
    createNodeViews(): Extension;
    createCommands(): {};
    createNodes(): {};
    createMarks(): {};
    createSchema(): Schema<string, string>;
    createSerializer(): import("rich-markdown-editor/dist/lib/markdown/serializer").MarkdownSerializer;
    createParser(): MarkdownParser<any>;
    createPasteParser(): MarkdownParser<any>;
    createState(value?: string): EditorState<any>;
    createDocument(content: string): import("prosemirror-model").Node<any>;
    createView(): EditorView<any>;
    scrollToAnchor(hash: string): void;
    calculateDir: () => void;
    value: () => string;
    handleChange: () => void;
    handleSave: () => void;
    handleSaveAndExit: () => void;
    handleEditorBlur: () => void;
    handleEditorFocus: () => void;
    handleOpenSelectionMenu: () => void;
    handleCloseSelectionMenu: () => void;
    handleOpenLinkMenu: () => void;
    handleCloseLinkMenu: () => void;
    handleOpenBlockMenu: (search: string) => void;
    handleCloseBlockMenu: () => void;
    handleSelectRow: (index: number, state: EditorState) => void;
    handleSelectColumn: (index: number, state: EditorState) => void;
    handleSelectTable: (state: EditorState) => void;
    focusAtStart: () => void;
    focusAtEnd: () => void;
    getHeadings: () => {
        title: string;
        level: number;
        id: string;
    }[];
    theme: () => {
        background: string;
        text: string;
        code: string;
        cursor: string;
        divider: string;
        toolbarBackground: string;
        toolbarHoverBackground: string;
        toolbarInput: string;
        toolbarItem: string;
        tableDivider: string;
        tableSelected: string;
        tableSelectedBackground: string;
        quote: string;
        codeBackground: string;
        codeBorder: string;
        horizontalRule: string;
        imageErrorBackground: string;
        scrollbarBackground: string;
        scrollbarThumb: string;
        fontFamily: string;
        fontFamilyMono: string;
        fontWeight: number;
        zIndex: number;
        link: string;
        placeholder: string;
        textSecondary: string;
        textLight: string;
        textHighlight: string;
        textHighlightForeground: string;
        selected: string;
        codeComment: string;
        codePunctuation: string;
        codeNumber: string;
        codeProperty: string;
        codeTag: string;
        codeString: string;
        codeSelector: string;
        codeAttr: string;
        codeEntity: string;
        codeKeyword: string;
        codeFunction: string;
        codeStatement: string;
        codePlaceholder: string;
        codeInserted: string;
        codeImportant: string;
        blockToolbarBackground: string;
        blockToolbarTrigger: string;
        blockToolbarTriggerIcon: string;
        blockToolbarItem: string;
        blockToolbarIcon: undefined;
        blockToolbarIconSelected: string;
        blockToolbarText: string;
        blockToolbarTextSelected: string;
        blockToolbarSelectedBackground: string;
        blockToolbarHoverBackground: string;
        blockToolbarDivider: string;
        noticeInfoBackground: string;
        noticeInfoText: string;
        noticeTipBackground: string;
        noticeTipText: string;
        noticeWarningBackground: string;
        noticeWarningText: string;
        almostBlack: string;
        lightBlack: string;
        almostWhite: string;
        white: string;
        white10: string;
        black: string;
        black10: string;
        primary: string;
        greyLight: string;
        grey: string;
        greyMid: string;
        greyDark: string;
    };
    dictionary: ((providedDictionary?: Partial<{
        addColumnAfter: string;
        addColumnBefore: string;
        addRowAfter: string;
        addRowBefore: string;
        alignCenter: string;
        alignLeft: string;
        alignRight: string;
        bulletList: string;
        checkboxList: string;
        codeBlock: string;
        codeCopied: string;
        codeInline: string;
        createLink: string;
        createLinkError: string;
        createNewDoc: string;
        deleteColumn: string;
        deleteRow: string;
        deleteTable: string;
        deleteImage: string;
        downloadImage: string;
        alignImageLeft: string;
        alignImageRight: string;
        alignImageDefault: string;
        em: string;
        embedInvalidLink: string;
        findOrCreateDoc: string;
        h1: string;
        h2: string;
        h3: string;
        heading: string;
        hr: string;
        image: string;
        imageUploadError: string;
        imageCaptionPlaceholder: string;
        info: string;
        infoNotice: string;
        link: string;
        linkCopied: string;
        mark: string;
        newLineEmpty: string;
        newLineWithSlash: string;
        noResults: string;
        openLink: string;
        orderedList: string;
        pageBreak: string;
        pasteLink: string;
        pasteLinkWithTitle: (title: string) => string;
        placeholder: string;
        quote: string;
        removeLink: string;
        searchOrPasteLink: string;
        strikethrough: string;
        strong: string;
        subheading: string;
        table: string;
        tip: string;
        tipNotice: string;
        warning: string;
        warningNotice: string;
    }> | undefined) => {
        addColumnAfter: string;
        addColumnBefore: string;
        addRowAfter: string;
        addRowBefore: string;
        alignCenter: string;
        alignLeft: string;
        alignRight: string;
        bulletList: string;
        checkboxList: string;
        codeBlock: string;
        codeCopied: string;
        codeInline: string;
        createLink: string;
        createLinkError: string;
        createNewDoc: string;
        deleteColumn: string;
        deleteRow: string;
        deleteTable: string;
        deleteImage: string;
        downloadImage: string;
        alignImageLeft: string;
        alignImageRight: string;
        alignImageDefault: string;
        em: string;
        embedInvalidLink: string;
        findOrCreateDoc: string;
        h1: string;
        h2: string;
        h3: string;
        heading: string;
        hr: string;
        image: string;
        imageUploadError: string;
        imageCaptionPlaceholder: string;
        info: string;
        infoNotice: string;
        link: string;
        linkCopied: string;
        mark: string;
        newLineEmpty: string;
        newLineWithSlash: string;
        noResults: string;
        openLink: string;
        orderedList: string;
        pageBreak: string;
        pasteLink: string;
        pasteLinkWithTitle: (title: string) => string;
        placeholder: string;
        quote: string;
        removeLink: string;
        searchOrPasteLink: string;
        strikethrough: string;
        strong: string;
        subheading: string;
        table: string;
        tip: string;
        tipNotice: string;
        warning: string;
        warningNotice: string;
    }) & import("lodash").MemoizedFunction;
    render(): JSX.Element;
}
export default RichMarkdownEditor;
