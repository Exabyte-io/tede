import { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
interface TestCase extends AnyObject {
    feature_name: string;
}
interface TestConfig extends AnyObject {
    template_path: string;
    feature_path: string;
    schema: AnyObject;
    cases: TestCase[];
}
export declare function generateTestFeatureContentsFromTestCases(templateContent: string, testCaseSchema: AnyObject, testCaseConfigs: TestCase[]): Array<{
    name: string;
    content: string;
}>;
export declare function generateFeatureFilesFromConfig(testConfig: TestConfig, inputDir: string, outputDir: string): void;
export {};
