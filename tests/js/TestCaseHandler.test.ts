import { expect } from "chai";

import { TestCaseHandler } from "../../src/js/utils/TestCaseHandler";

const testCase = {
    feature_name: "feature1",
    key1: "value1",
};

const templateSchema = {};

const templateContent = `This is key1 = \${key1}`;

describe("TestCaseHandler test", () => {
    it("should replace key1 in templateContent with value1", () => {
        const testCaseHandler = new TestCaseHandler({
            testCase,
            templateSchema,
            templateContent,
        });
        const result = testCaseHandler.getFeatureContent();
        expect(result).to.be.equal(`This is key1 = value1`);
    });
});
