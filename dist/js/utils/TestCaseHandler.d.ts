import { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
export declare class TestCaseHandler {
    private testCaseConfig;
    private testCaseSchema;
    private templateContent;
    constructor({ testCaseConfig, testCaseSchema, templateContent, }: {
        testCaseConfig: AnyObject;
        testCaseSchema: AnyObject;
        templateContent: string;
    });
    static generateTable(arrayOfObjects: AnyObject[]): string;
    validateTestCase(): boolean;
    renderTemplate(context?: AnyObject): string;
    getFeatureContent(): string;
}
