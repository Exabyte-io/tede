export declare class TestCaseHandler {
    private testCase;
    private templateSchema;
    private templateContent;
    constructor({ testCase, templateSchema, templateContent }: {
        testCase: any;
        templateSchema: any;
        templateContent: any;
    });
    static generateTable(items: any[], columns: (string | number)[]): string;
    validateTestCase(): boolean;
    renderTemplate(context?: {}): string;
    getFeatureContent(): string;
}
