import { Utils } from "@mat3ra/utils";

import { TestCaseHandler } from "./TestCaseHandler";

export function generateTestFeaturesFromYAMLConfig(yamlContent: string, templateContent: any) {
    const features: { name: any; content: string }[] = [];
    try {
        const config = Utils.yaml.convertYAMLStringToJSON(yamlContent);
        // @ts-ignore
        config.cases.forEach((testCase) => {
            const testCaseHandler = new TestCaseHandler({
                testCase,
                // @ts-ignore
                templateSchema: config.templateSchema,
                templateContent,
            });

            const featureContent = testCaseHandler.getFeatureContent();

            features.push({
                name: testCase.feature_name,
                content: featureContent,
            });
        });
    } catch (error) {
        console.error(`Error processing YAML Content:`, error);
    }
    return features;
}
