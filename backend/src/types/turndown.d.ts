declare module 'turndown' {
    interface Options {
        headingStyle?: 'setext' | 'atx';
        hr?: string;
        br?: string;
        bulletListMarker?: '-' | '+' | '*';
        codeBlockStyle?: 'indented' | 'fenced';
        emDelimiter?: '_' | '*';
        fence?: '```' | '~~~';
        strongDelimiter?: '__' | '**';
        linkStyle?: 'inlined' | 'referenced';
        linkReferenceStyle?: 'full' | 'collapsed' | 'shortcut';
    }

    class TurndownService {
        constructor(options?: Options);
        turndown(html: string): string;
        use(plugin: any): void;
        addRule(key: string, rule: any): void;
        keep(filter: any): void;
        remove(filter: any): void;
        escape(string: string): string;
    }

    export = TurndownService;
}
