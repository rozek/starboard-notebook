// @ts-nocheck
/* global window File Promise */
import * as React from "react";
import memoize from "lodash/memoize";
import { EditorState, Selection } from "prosemirror-state";
import { dropCursor } from "prosemirror-dropcursor";
import { gapCursor } from "prosemirror-gapcursor";
import { EditorView } from "prosemirror-view";
import { Schema } from "prosemirror-model";
import { inputRules } from "prosemirror-inputrules";
import { keymap } from "prosemirror-keymap";
import { baseKeymap } from "prosemirror-commands";
import { selectColumn, selectRow, selectTable } from "prosemirror-utils";
import { ThemeProvider } from "styled-components";
import { light as lightTheme, dark as darkTheme } from "rich-markdown-editor/dist/styles/theme";
import baseDictionary from "rich-markdown-editor/dist/dictionary";
import Flex from "rich-markdown-editor/dist/components/Flex";
import SelectionToolbar from "rich-markdown-editor/dist/components/SelectionToolbar";
import BlockMenu from "rich-markdown-editor/dist/components/BlockMenu";
import EmojiMenu from "rich-markdown-editor/dist/components/EmojiMenu";
import LinkToolbar from "rich-markdown-editor/dist/components/LinkToolbar";
import Tooltip from "rich-markdown-editor/dist/components/Tooltip";
import ExtensionManager from "rich-markdown-editor/dist/lib/ExtensionManager";
import ComponentView from "rich-markdown-editor/dist/lib/ComponentView";
import headingToSlug from "rich-markdown-editor/dist/lib/headingToSlug";
import markdownItMathPlugin from "./lib/markdown/math";
// styles
import { StyledEditor } from "./styles/editor";
import Doc from "rich-markdown-editor/dist/nodes/Doc";
import Text from "rich-markdown-editor/dist/nodes/Text";
import Blockquote from "rich-markdown-editor/dist/nodes/Blockquote";
import BulletList from "rich-markdown-editor/dist/nodes/BulletList";
import CodeBlock from "./nodes/CodeBlock";
import CodeFence from "./nodes/CodeFence";
import HardBreak_ from "./nodes/HardBreak";
import CheckboxList from "rich-markdown-editor/dist/nodes/CheckboxList";
import Emoji from "rich-markdown-editor/dist/nodes/Emoji";
import CheckboxItem from "rich-markdown-editor/dist/nodes/CheckboxItem";
import Embed from "rich-markdown-editor/dist/nodes/Embed";
import HardBreak from "rich-markdown-editor/dist/nodes/HardBreak";
import Heading from "rich-markdown-editor/dist/nodes/Heading";
import HorizontalRule from "rich-markdown-editor/dist/nodes/HorizontalRule";
import Image from "rich-markdown-editor/dist/nodes/Image";
import ListItem from "rich-markdown-editor/dist/nodes/ListItem";
import Notice from "rich-markdown-editor/dist/nodes/Notice";
import OrderedList from "rich-markdown-editor/dist/nodes/OrderedList";
import Paragraph from "rich-markdown-editor/dist/nodes/Paragraph";
import Table from "rich-markdown-editor/dist/nodes/Table";
import TableCell from "rich-markdown-editor/dist/nodes/TableCell";
import TableHeadCell from "rich-markdown-editor/dist/nodes/TableHeadCell";
import TableRow from "rich-markdown-editor/dist/nodes/TableRow";
// marks
import Bold from "rich-markdown-editor/dist/marks/Bold";
import Code from "rich-markdown-editor/dist/marks/Code";
import Highlight from "rich-markdown-editor/dist/marks/Highlight";
import Italic from "rich-markdown-editor/dist/marks/Italic";
import Link from "rich-markdown-editor/dist/marks/Link";
import Strikethrough from "rich-markdown-editor/dist/marks/Strikethrough";
import TemplatePlaceholder from "rich-markdown-editor/dist/marks/Placeholder";
import Underline from "rich-markdown-editor/dist/marks/Underline";
// plugins
import BlockMenuTrigger from "rich-markdown-editor/dist/plugins/BlockMenuTrigger";
import EmojiTrigger from "rich-markdown-editor/dist/plugins/EmojiTrigger";
// import Folding from "rich-markdown-editor/dist/plugins/Folding";
import History from "rich-markdown-editor/dist/plugins/History";
import Keys from "rich-markdown-editor/dist/plugins/Keys";
import MaxLength from "rich-markdown-editor/dist/plugins/MaxLength";
import Placeholder from "rich-markdown-editor/dist/plugins/Placeholder";
import SmartText from "rich-markdown-editor/dist/plugins/SmartText";
import TrailingNode from "rich-markdown-editor/dist/plugins/TrailingNode";
import PasteHandler from "./plugins/PasteHandler";
// export { schema, parser, serializer, renderToHtml } from "rich-markdown-editor/dist/server";
export { default as Extension } from "rich-markdown-editor/dist/lib/Extension";
export const theme = lightTheme;
class RichMarkdownEditor extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            isRTL: false,
            isEditorFocused: false,
            selectionMenuOpen: false,
            blockMenuOpen: false,
            linkMenuOpen: false,
            blockMenuSearch: "",
            emojiMenuOpen: false,
        };
        this.calculateDir = () => {
            if (!this.element)
                return;
            const isRTL = this.props.dir === "rtl" || getComputedStyle(this.element).direction === "rtl";
            if (this.state.isRTL !== isRTL) {
                this.setState({ isRTL });
            }
        };
        this.value = () => {
            return this.serializer.serialize(this.view.state.doc);
        };
        this.handleChange = () => {
            if (!this.props.onChange)
                return;
            this.props.onChange(() => {
                return this.value();
            });
        };
        this.handleSave = () => {
            const { onSave } = this.props;
            if (onSave) {
                onSave({ done: false });
            }
        };
        this.handleSaveAndExit = () => {
            const { onSave } = this.props;
            if (onSave) {
                onSave({ done: true });
            }
        };
        this.handleEditorBlur = () => {
            this.setState({ isEditorFocused: false });
        };
        this.handleEditorFocus = () => {
            this.setState({ isEditorFocused: true });
        };
        this.handleOpenSelectionMenu = () => {
            this.setState({ blockMenuOpen: false, selectionMenuOpen: true });
        };
        this.handleCloseSelectionMenu = () => {
            this.setState({ selectionMenuOpen: false });
        };
        this.handleOpenLinkMenu = () => {
            this.setState({ blockMenuOpen: false, linkMenuOpen: true });
        };
        this.handleCloseLinkMenu = () => {
            this.setState({ linkMenuOpen: false });
        };
        this.handleOpenBlockMenu = (search) => {
            this.setState({ blockMenuOpen: true, blockMenuSearch: search });
        };
        this.handleCloseBlockMenu = () => {
            if (!this.state.blockMenuOpen)
                return;
            this.setState({ blockMenuOpen: false });
        };
        this.handleSelectRow = (index, state) => {
            this.view.dispatch(selectRow(index)(state.tr));
        };
        this.handleSelectColumn = (index, state) => {
            this.view.dispatch(selectColumn(index)(state.tr));
        };
        this.handleSelectTable = (state) => {
            this.view.dispatch(selectTable(state.tr));
        };
        // 'public' methods
        this.focusAtStart = () => {
            const selection = Selection.atStart(this.view.state.doc);
            const transaction = this.view.state.tr.setSelection(selection);
            this.view.dispatch(transaction);
            this.view.focus();
        };
        this.focusAtEnd = () => {
            const selection = Selection.atEnd(this.view.state.doc);
            const transaction = this.view.state.tr.setSelection(selection);
            this.view.dispatch(transaction);
            this.view.focus();
        };
        this.getHeadings = () => {
            const headings = [];
            const previouslySeen = {};
            this.view.state.doc.forEach((node) => {
                if (node.type.name === "heading") {
                    // calculate the optimal slug
                    const slug = headingToSlug(node);
                    let id = slug;
                    // check if we've already used it, and if so how many times?
                    // Make the new id based on that number ensuring that we have
                    // unique ID's even when headings are identical
                    if (previouslySeen[slug] > 0) {
                        id = headingToSlug(node, previouslySeen[slug]);
                    }
                    // record that we've seen this slug for the next loop
                    previouslySeen[slug] = previouslySeen[slug] !== undefined ? previouslySeen[slug] + 1 : 1;
                    headings.push({
                        title: node.textContent,
                        level: node.attrs.level,
                        id,
                    });
                }
            });
            return headings;
        };
        this.theme = () => {
            return this.props.theme || (this.props.dark ? darkTheme : lightTheme);
        };
        this.dictionary = memoize((providedDictionary) => {
            return { ...baseDictionary, ...providedDictionary };
        });
    }
    componentDidMount() {
        this.init();
        if (this.props.scrollTo) {
            this.scrollToAnchor(this.props.scrollTo);
        }
        this.calculateDir();
        if (this.props.readOnly)
            return;
        if (this.props.autoFocus) {
            this.focusAtEnd();
        }
    }
    componentDidUpdate(prevProps) {
        // Allow changes to the 'value' prop to update the editor from outside
        if (this.props.value && prevProps.value !== this.props.value) {
            const newState = this.createState(this.props.value);
            this.view.updateState(newState);
        }
        // pass readOnly changes through to underlying editor instance
        if (prevProps.readOnly !== this.props.readOnly) {
            this.view.update({
                ...this.view.props,
                editable: () => !this.props.readOnly,
            });
        }
        if (this.props.scrollTo && this.props.scrollTo !== prevProps.scrollTo) {
            this.scrollToAnchor(this.props.scrollTo);
        }
        // Focus at the end of the document if switching from readOnly and autoFocus
        // is set to true
        if (prevProps.readOnly && !this.props.readOnly && this.props.autoFocus) {
            this.focusAtEnd();
        }
        if (prevProps.dir !== this.props.dir) {
            this.calculateDir();
        }
        if (!this.isBlurred &&
            !this.state.isEditorFocused &&
            !this.state.blockMenuOpen &&
            !this.state.linkMenuOpen &&
            !this.state.selectionMenuOpen) {
            this.isBlurred = true;
            if (this.props.onBlur) {
                this.props.onBlur();
            }
        }
        if (this.isBlurred &&
            (this.state.isEditorFocused ||
                this.state.blockMenuOpen ||
                this.state.linkMenuOpen ||
                this.state.selectionMenuOpen)) {
            this.isBlurred = false;
            if (this.props.onFocus) {
                this.props.onFocus();
            }
        }
    }
    init() {
        this.extensions = this.createExtensions();
        this.nodes = this.createNodes();
        this.marks = this.createMarks();
        this.schema = this.createSchema();
        this.plugins = this.createPlugins();
        this.keymaps = this.createKeymaps();
        this.serializer = this.createSerializer();
        this.parser = this.createParser();
        this.pasteParser = this.createPasteParser();
        this.inputRules = this.createInputRules();
        this.nodeViews = this.createNodeViews();
        this.view = this.createView();
        this.commands = this.createCommands();
    }
    createExtensions() {
        const dictionary = this.dictionary(this.props.dictionary);
        // adding nodes here? Update schema.ts for serialization on the server
        return new ExtensionManager([
            ...[
                new Doc(),
                new HardBreak(),
                new HardBreak_(),
                new Paragraph(),
                new Blockquote(),
                new CodeBlock({
                    dictionary,
                    onShowToast: this.props.onShowToast,
                }),
                new CodeFence({
                    dictionary,
                    onShowToast: this.props.onShowToast,
                }),
                new Emoji(),
                new Text(),
                new CheckboxList(),
                new CheckboxItem(),
                new BulletList(),
                new Embed(),
                new ListItem(),
                new Notice({
                    dictionary,
                }),
                new Heading({
                    dictionary,
                    onShowToast: this.props.onShowToast,
                    offset: this.props.headingsOffset,
                }),
                new HorizontalRule(),
                new Image({
                    dictionary,
                    uploadImage: this.props.uploadImage,
                    onImageUploadStart: this.props.onImageUploadStart,
                    onImageUploadStop: this.props.onImageUploadStop,
                    onShowToast: this.props.onShowToast,
                }),
                new Table(),
                new TableCell({
                    onSelectTable: this.handleSelectTable,
                    onSelectRow: this.handleSelectRow,
                }),
                new TableHeadCell({
                    onSelectColumn: this.handleSelectColumn,
                }),
                new TableRow(),
                new Bold(),
                new Code(),
                new Highlight(),
                new Italic(),
                new TemplatePlaceholder(),
                new Underline(),
                new Link({
                    onKeyboardShortcut: this.handleOpenLinkMenu,
                    onClickLink: this.props.onClickLink,
                    onClickHashtag: this.props.onClickHashtag,
                    onHoverLink: this.props.onHoverLink,
                }),
                new Strikethrough(),
                new OrderedList(),
                new History(),
                // new Folding(),
                new SmartText(),
                new TrailingNode(),
                new PasteHandler(),
                new Keys({
                    onBlur: this.handleEditorBlur,
                    onFocus: this.handleEditorFocus,
                    onSave: this.handleSave,
                    onSaveAndExit: this.handleSaveAndExit,
                    onCancel: this.props.onCancel,
                }),
                new BlockMenuTrigger({
                    dictionary,
                    onOpen: this.handleOpenBlockMenu,
                    onClose: this.handleCloseBlockMenu,
                }),
                new EmojiTrigger({
                    onOpen: (search) => {
                        this.setState({ emojiMenuOpen: true, blockMenuSearch: search });
                    },
                    onClose: () => {
                        this.setState({ emojiMenuOpen: false });
                    },
                }),
                new Placeholder({
                    placeholder: this.props.placeholder,
                }),
                new MaxLength({
                    maxLength: this.props.maxLength,
                }),
            ].filter((extension) => {
                // Optionaly disable extensions
                if (this.props.disableExtensions) {
                    return !this.props.disableExtensions.includes(extension.name);
                }
                return true;
            }),
            ...this.props.extensions,
        ], this);
    }
    createPlugins() {
        return this.extensions.plugins;
    }
    createKeymaps() {
        return this.extensions.keymaps({
            schema: this.schema,
        });
    }
    createInputRules() {
        return this.extensions.inputRules({
            schema: this.schema,
        });
    }
    createNodeViews() {
        return this.extensions.extensions
            .filter((extension) => extension.component)
            .reduce((nodeViews, extension) => {
            const nodeView = (node, view, getPos, decorations) => {
                return new ComponentView(extension.component, {
                    editor: this,
                    extension,
                    node,
                    view,
                    getPos,
                    decorations,
                });
            };
            return {
                ...nodeViews,
                [extension.name]: nodeView,
            };
        }, {});
    }
    createCommands() {
        return this.extensions.commands({
            schema: this.schema,
            view: this.view,
        });
    }
    createNodes() {
        return this.extensions.nodes;
    }
    createMarks() {
        return this.extensions.marks;
    }
    createSchema() {
        return new Schema({
            nodes: this.nodes,
            marks: this.marks,
        });
    }
    createSerializer() {
        return this.extensions.serializer();
    }
    createParser() {
        const parser = this.extensions.parser({
            schema: this.schema,
        });
        parser.tokenizer.use(markdownItMathPlugin);
        return parser;
    }
    createPasteParser() {
        const parser = this.extensions.parser({
            schema: this.schema,
            rules: { linkify: true },
        });
        parser.tokenizer.use(markdownItMathPlugin);
        return parser;
    }
    createState(value) {
        const doc = this.createDocument(value || this.props.defaultValue);
        return EditorState.create({
            schema: this.schema,
            doc,
            plugins: [
                ...this.plugins,
                ...this.keymaps,
                dropCursor({ color: this.theme().cursor }),
                gapCursor(),
                inputRules({
                    rules: this.inputRules,
                }),
                keymap(baseKeymap),
            ],
        });
    }
    createDocument(content) {
        return this.parser.parse(content);
    }
    createView() {
        if (!this.element) {
            throw new Error("createView called before ref available");
        }
        const isEditingCheckbox = (tr) => {
            return tr.steps.some((step) => { var _a, _b, _c; return ((_c = (_b = (_a = step.slice) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.firstChild) === null || _c === void 0 ? void 0 : _c.type.name) === this.schema.nodes.checkbox_item.name; });
        };
        const self = this; // eslint-disable-line
        const view = new EditorView(this.element, {
            state: this.createState(this.props.value),
            editable: () => !this.props.readOnly,
            nodeViews: this.nodeViews,
            handleDOMEvents: this.props.handleDOMEvents,
            dispatchTransaction: function (transaction) {
                // callback is bound to have the view instance as its this binding
                const { state, transactions } = this.state.applyTransaction(transaction);
                this.updateState(state);
                // If any of the transactions being dispatched resulted in the doc
                // changing then call our own change handler to let the outside world
                // know
                if (transactions.some((tr) => tr.docChanged) &&
                    (!self.props.readOnly || (self.props.readOnlyWriteCheckboxes && transactions.some(isEditingCheckbox)))) {
                    self.handleChange();
                }
                self.calculateDir();
                // Because Prosemirror and React are not linked we must tell React that
                // a render is needed whenever the Prosemirror state changes.
                self.forceUpdate();
            },
        });
        // Tell third-party libraries and screen-readers that this is an input
        view.dom.setAttribute("role", "textbox");
        return view;
    }
    scrollToAnchor(hash) {
        if (!hash)
            return;
        try {
            const element = document.querySelector(hash);
            if (element)
                element.scrollIntoView({ behavior: "smooth" });
        }
        catch (err) {
            // querySelector will throw an error if the hash begins with a number
            // or contains a period. This is protected against now by safeSlugify
            // however previous links may be in the wild.
            console.warn(`Attempted to scroll to invalid hash: ${hash}`, err);
        }
    }
    render() {
        const { dir, readOnly, readOnlyWriteCheckboxes, style, tooltip, className, onKeyDown } = this.props;
        const { isRTL } = this.state;
        const dictionary = this.dictionary(this.props.dictionary);
        return (React.createElement(Flex, { onKeyDown: onKeyDown, style: style, className: className, align: "flex-start", justify: "center", dir: dir, column: true },
            React.createElement(ThemeProvider, { theme: this.theme() },
                React.createElement(React.Fragment, null,
                    React.createElement(StyledEditor, { dir: dir, rtl: isRTL, readOnly: readOnly, readOnlyWriteCheckboxes: readOnlyWriteCheckboxes, ref: (ref) => (this.element = ref) }),
                    !readOnly && this.view && (React.createElement(React.Fragment, null,
                        React.createElement(SelectionToolbar, { view: this.view, dictionary: dictionary, commands: this.commands, rtl: isRTL, isTemplate: this.props.template === true, onOpen: this.handleOpenSelectionMenu, onClose: this.handleCloseSelectionMenu, onSearchLink: this.props.onSearchLink, onClickLink: this.props.onClickLink, onCreateLink: this.props.onCreateLink, tooltip: tooltip }),
                        React.createElement(LinkToolbar, { view: this.view, dictionary: dictionary, isActive: this.state.linkMenuOpen, onCreateLink: this.props.onCreateLink, onSearchLink: this.props.onSearchLink, onClickLink: this.props.onClickLink, onShowToast: this.props.onShowToast, onClose: this.handleCloseLinkMenu, tooltip: tooltip }),
                        React.createElement(EmojiMenu, { view: this.view, commands: this.commands, dictionary: dictionary, rtl: isRTL, isActive: this.state.emojiMenuOpen, search: this.state.blockMenuSearch, onClose: () => this.setState({ emojiMenuOpen: false }) }),
                        React.createElement(BlockMenu, { view: this.view, commands: this.commands, dictionary: dictionary, rtl: isRTL, isActive: this.state.blockMenuOpen, search: this.state.blockMenuSearch, onClose: this.handleCloseBlockMenu, uploadImage: this.props.uploadImage, onLinkToolbarOpen: this.handleOpenLinkMenu, onImageUploadStart: this.props.onImageUploadStart, onImageUploadStop: this.props.onImageUploadStop, onShowToast: this.props.onShowToast, embeds: this.props.embeds })))))));
    }
}
RichMarkdownEditor.defaultProps = {
    defaultValue: "",
    dir: "auto",
    placeholder: "Write something nice…",
    onImageUploadStart: () => {
        // no default behavior
    },
    onImageUploadStop: () => {
        // no default behavior
    },
    onClickLink: (href) => {
        window.open(href, "_blank");
    },
    embeds: [],
    extensions: [],
    tooltip: Tooltip,
};
export default RichMarkdownEditor;
//# sourceMappingURL=index.js.map