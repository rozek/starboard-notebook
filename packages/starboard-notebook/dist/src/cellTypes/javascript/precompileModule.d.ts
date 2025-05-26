/**
 * Precompile takes a cell's code as a string, parses it and transforms it.
 * In particular it wraps everything in an async function, handles the var->global magic.
 */
export declare function precompileJavascriptCode(content: string): Promise<string>;
