"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateFeatureFilesFromConfig = exports.generateTestFeatureContentsFromTestCases = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const TestCaseHandler_1 = require("./TestCaseHandler");
function generateTestFeatureContentsFromTestCases(templateContent, testCaseSchema, testCaseConfigs) {
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
exports.generateTestFeatureContentsFromTestCases = generateTestFeatureContentsFromTestCases;
function generateFeatureFilesFromConfig(testConfig, inputDir, outputDir) {
    try {
        const { testCaseSchema } = testConfig;
        const templatePath = path_1.default.join(inputDir, testConfig.template_path);
        const templateContent = fs_1.default.readFileSync(templatePath, "utf8");
        const features = generateTestFeatureContentsFromTestCases(templateContent, testCaseSchema, testConfig.cases);
        const featurePath = path_1.default.join(outputDir, testConfig.feature_path);
        if (!fs_1.default.existsSync(featurePath)) {
            fs_1.default.mkdirSync(featurePath, { recursive: true });
        }
        features.forEach(({ name, content }) => {
            const outputPath = path_1.default.join(featurePath, `${name}.feature`);
            fs_1.default.writeFileSync(outputPath, content);
            console.log(`Generated: ${outputPath}`);
        });
    }
    catch (error) {
        console.error(`Error generating feature files: ${error}`);
    }
}
exports.generateFeatureFilesFromConfig = generateFeatureFilesFromConfig;
