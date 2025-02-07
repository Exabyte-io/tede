"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTestFeaturesFromTestConfig = void 0;
const TestCaseHandler_1 = require("./TestCaseHandler");
/**
 * Generates test features from a test configuration object
 */
function generateTestFeaturesFromTestConfig(templateContent, testCaseSchema, testCaseConfigs) {
    return testCaseConfigs.map((testCaseConfig) => {
        if (!testCaseSchema.$id) {
            testCaseSchema.$id = `testCaseSchema + ${Math.random()}`;
        }
        const testCaseHandler = new TestCaseHandler_1.TestCaseHandler({
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
exports.generateTestFeaturesFromTestConfig = generateTestFeaturesFromTestConfig;
