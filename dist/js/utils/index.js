"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTestFeaturesFromYAMLConfig = void 0;
const utils_1 = require("@mat3ra/utils");
const TestCaseHandler_1 = require("./TestCaseHandler");
function generateTestFeaturesFromYAMLConfig(yamlContent, templateContent) {
    const features = [];
    try {
        const config = utils_1.Utils.yaml.convertYAMLStringToJSON(yamlContent);
        // @ts-ignore
        config.cases.forEach((testCase) => {
            const testCaseHandler = new TestCaseHandler_1.TestCaseHandler({
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
    }
    catch (error) {
        console.error(`Error processing YAML Content:`, error);
    }
    return features;
}
exports.generateTestFeaturesFromYAMLConfig = generateTestFeaturesFromYAMLConfig;
