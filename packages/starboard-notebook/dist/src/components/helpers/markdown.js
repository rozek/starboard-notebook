import mdlib from "markdown-it";
import { hookMarkdownItCrossOriginImages } from "./crossOriginIsolated";
import { hookMarkdownItToCodemirrorHighlighter } from "./highlight";
export function getMarkdownItWithDefaultPlugins(markdownitOpts = { html: true }) {
    const md = new mdlib(markdownitOpts);
    hookMarkdownItToCodemirrorHighlighter(md);
    hookMarkdownItCrossOriginImages(md);
    return {
        md,
        katexLoaded: Promise.resolve(undefined),
    };
}
//# sourceMappingURL=markdown.js.map