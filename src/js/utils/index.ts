import { AnyObject } from "@mat3ra/esse/dist/js/esse/types";

import { TestCaseHandler } from "./TestCaseHandler";

interface TestCase extends AnyObject {
    feature_name: string;
}

/**
 * Generates test features from a test configuration object
 */
export function generateTestFeaturesFromTestConfig(
    templateContent: string,
    testCaseSchema: AnyObject,
    testCaseConfigs: TestCase[],
): Array<{ name: string; content: string }> {
    return testCaseConfigs.map((testCaseConfig) => {
        if (!testCaseSchema.$id) {
            testCaseSchema.$id = `testCaseSchema + ${Math.random()}`;
        }

        const testCaseHandler = new TestCaseHandler({
            testCaseConfig,
            testCaseSchema,
            templateContent,
        });

        testCaseHandler.validateTestCase();

        return {
            name: testCaseConfig.feature_name,
            content: testCaseHandler.getFeatureContent(),
        };
    });
}
