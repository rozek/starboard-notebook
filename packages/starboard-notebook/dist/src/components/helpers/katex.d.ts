import katex from "katex";
/**
 * Will eventually resolve to katex if loadModule is ever called (indirectly).
 */
export declare const katexEventualPromise: Promise<{
    katex: typeof katex;
}>;
export declare function katexLoader(): Promise<typeof katex>;
