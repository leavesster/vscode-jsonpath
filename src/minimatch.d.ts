declare module "minimatch" {
    interface IOptions {
        debug?: boolean | undefined;
        nobrace?: boolean | undefined;
        noglobstar?: boolean | undefined;
        dot?: boolean | undefined;
        noext?: boolean | undefined;
        nocase?: boolean | undefined;
        nonull?: boolean | undefined;
        matchBase?: boolean | undefined;
        nocomment?: boolean | undefined;
        nonegate?: boolean | undefined;
        flipNegate?: boolean | undefined;
        partial?: boolean | undefined;
    }

    interface IMinimatch {
        pattern: string;
        options: IOptions;
        set: ReadonlyArray<ReadonlyArray<string | RegExp>>;
        regexp: RegExp | null;
        negate: boolean;
        comment: boolean;
        empty: boolean;
        makeRe(): RegExp | false;
        match(path: string, partial?: boolean): boolean;
    }

    function minimatch(target: string, pattern: string, options?: IOptions): boolean;

    namespace minimatch {
        export { IMinimatch, IOptions };
    }

    export = minimatch;
}
