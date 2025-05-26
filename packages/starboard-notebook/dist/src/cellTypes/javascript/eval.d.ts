declare global {
    interface Window {
        eval: (command: string) => any;
    }
}
interface RunResult {
    error: boolean;
    code: string;
    value?: any;
}
export declare class JavascriptEvaluator {
    run(code: string): Promise<RunResult>;
    precompile(code: string): Promise<string>;
}
export {};
