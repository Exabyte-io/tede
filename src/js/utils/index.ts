import { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import fs from "fs";
import path from "path";

import { TestCaseHandler } from "./TestCaseHandler";

interface TestCase extends AnyObject {
    feature_name: string;
}

interface TestConfig extends AnyObject {
    template_path: string;
    feature_path: string;
    schema: AnyObject;
    cases: TestCase[];
}

export function generateTestFeatureContentsFromTestCases(
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

export function generateFeatureFilesFromConfig(
    testConfig: TestConfig,
    inputDir: string,
    outputDir: string,
): void {
    try {
        const { template_path, feature_path, schema, cases } = testConfig;
        const templatePath = path.join(inputDir, template_path);
        const templateContent = fs.readFileSync(templatePath, "utf8");

        const features = generateTestFeatureContentsFromTestCases(templateContent, schema, cases);

        const featurePath = path.join(outputDir, feature_path);
        if (!fs.existsSync(featurePath)) {
            fs.mkdirSync(featurePath, { recursive: true });
        }

        features.forEach(({ name, content }) => {
            const outputPath = path.join(featurePath, `${name}.feature`);
            fs.writeFileSync(outputPath, content);
            console.log(`Generated: ${outputPath}`);
        });
    } catch (error) {
        console.error(`Error generating feature files: ${error}`);
    }
}
