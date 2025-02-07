import { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import { TestCaseHandler } from "./TestCaseHandler";

interface TestConfig {
    cases: AnyObject[];
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
    templateContent: string
): Array<{ name: string; content: string }> {
    const features: Array<{ name: string; content: string }> = [];
    
    try {
        testConfig.cases.forEach((testCaseConfig) => {
            const testCaseHandler = new TestCaseHandler({
                testCaseConfig: testCaseConfig,
                testCaseSchema: testConfig.templateSchema,
                templateContent,
            });

            const featureContent = testCaseHandler.getFeatureContent();

            features.push({
                name: testCaseConfig.feature_name,
                content: featureContent,
            });
        });
    } catch (error) {
        console.error(`Error processing test configuration:`, error);
    }
    
    return features;
}
