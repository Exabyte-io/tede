import { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
interface TestCase extends AnyObject {
    feature_name: string;
}
/**
 * Generates test features from a test configuration object
 */
export declare function generateTestFeaturesFromTestConfig(templateContent: string, testCaseSchema: AnyObject, testCaseConfigs: TestCase[]): Array<{
    name: string;
    content: string;
}>;
export {};
