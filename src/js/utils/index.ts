import { AnyObject } from "@mat3ra/esse/dist/js/esse/types";

import { TestCaseHandler } from "./TestCaseHandler";

interface TestCase extends AnyObject {
    feature_name: string;
}

interface TestConfig {
    cases: TestCase[];
    templateSchema: AnyObject;
}

/**
 * Generates test features from a test configuration object
 * @param testConfig Configuration object containing test cases and schema
 * @param templateContent Template string to use for generating features
 * @returns Array of generated features with names and content
 */
export function generateTestFeaturesFromTestConfig(
    testConfig: TestConfig,
    templateContent: string,
): Array<{ name: string; content: string }> {
    const features: Array<{ name: string; content: string }> = [];

    try {
        testConfig.cases.forEach((testCaseConfig) => {
            const testCaseHandler = new TestCaseHandler({
                testCaseConfig,
                testCaseSchema: testConfig.templateSchema,
                templateContent,
            });

            testCaseHandler.validateTestCase();
            
            const featureContent = testCaseHandler.getFeatureContent();

            features.push({
                name: testCaseConfig.feature_name,
                content: featureContent,
            });
        });
    } catch (error) {
        console.error(`Error processing test configuration:`, error);
        throw error;
    }

    return features;
}
