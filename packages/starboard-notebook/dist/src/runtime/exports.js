/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */
import { cellControlsTemplate } from "../components/controls";
import { StarboardLogo } from "../components/icons";
import { JavascriptEvaluator } from "../cellTypes/javascript/eval";
import { createCellProxy } from "../components/helpers/proxy/cellProxy";
import { StarboardTextEditor } from "../components/textEditor";
import { ConsoleOutputElement } from "../components/output/consoleOutput";
import * as lit from "lit";
import * as litDirectives from "./helpers/litDirectives";
import * as litDecorators from "lit/decorators.js";
import MarkdownIt from "markdown-it";
import * as popper from "@popperjs/core";
import * as StarboardPython from "starboard-python";
import { precompileJavascriptCode } from "../cellTypes/javascript/precompile";
import * as YAML from "js-yaml";
import { katexLoader } from "../components/helpers/katex";
import { ConsoleCatcher } from "../console/console";
import { cellToText, notebookContentToText } from "../content/serialization";
import { renderIfHtmlOutput } from "../components/output/htmlOutput";
import { textToNotebookContent } from "../content/parsing";
import { getMarkdownItWithDefaultPlugins } from "../components/helpers/markdown";
import { StarboardRichEditorElement } from "starboard-rich-editor";
export function createExports() {
    return {
        templates: {
            cellControls: cellControlsTemplate,
            icons: {
                StarboardLogo: StarboardLogo,
                AssetsAddedIcon: "bi bi-plus-square",
                DeleteIcon: "bi bi-trash-fill",
                BooleanIcon: "bi bi-toggle",
                ClockIcon: "bi bi-hourglass",
                PlayCircleIcon: "bi bi-play-circle",
                TextEditIcon: "bi bi-pencil-square",
                GearsIcon: "bi bi-gear",
                LockClosedIcon: "bi bi-lock",
            },
        },
        core: {
            ConsoleCatcher: ConsoleCatcher,
            JavascriptEvaluator: JavascriptEvaluator,
            renderIfHtmlOutput: renderIfHtmlOutput,
            createCellProxy: createCellProxy,
            cellToText: cellToText,
            notebookContentToText: notebookContentToText,
            precompileJavascriptCode: precompileJavascriptCode,
            textToNotebookContent: textToNotebookContent,
            getMarkdownItWithDefaultPlugins: getMarkdownItWithDefaultPlugins,
        },
        elements: {
            StarboardTextEditor: StarboardTextEditor,
            ConsoleOutputElement: ConsoleOutputElement,
            StarboardRichEditorElement: StarboardRichEditorElement,
        },
        libraries: {
            /* @deprecated, to be removed in a later version */
            LitElement: lit,
            /* @deprecated, to be removed in a later version */
            LitHtml: lit,
            lit: lit,
            litDirectives: litDirectives,
            litDecorators: litDecorators,
            MarkdownIt: MarkdownIt,
            YAML: YAML,
            Popper: popper,
            async: {
                KaTeX: katexLoader,
                StarboardPython: () => Promise.resolve(StarboardPython),
            },
        },
    };
}
//# sourceMappingURL=exports.js.map