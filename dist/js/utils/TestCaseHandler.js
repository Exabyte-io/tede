"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCaseHandler = void 0;
const ajv_1 = require("@mat3ra/esse/dist/js/utils/ajv");
const utils_1 = require("@mat3ra/utils");
class TestCaseHandler {
    // @ts-ignore
    constructor({ testCase, templateSchema, templateContent }) {
        this.testCase = testCase;
        this.templateSchema = templateSchema;
        this.templateContent = templateContent;
    }
    static generateTable(items, columns) {
        if (!items || !Array.isArray(items)) {
            return "";
        }
        return items
            .map((item) => {
            const cells = columns.map((col) => item[col]);
            return `      | ${cells.join(" | ")} |`;
        })
            .join("\n");
    }
    validateTestCase() {
        // Convert the template schema directly to JSON Schema format
        // TODO: this should be taken directly from YAML
        const jsonSchema = {
            type: "object",
            properties: this.templateSchema,
            required: Object.keys(this.templateSchema),
            additionalProperties: true,
            $id: `testCase_${Math.random()}`,
        };
        const { isValid, errors } = (0, ajv_1.validate)(this.testCase, jsonSchema);
        if (!isValid) {
            // @ts-ignore
            const errorDetails = errors
                .map((err) => `${err.instancePath} ${err.message}`)
                .join("; ");
            throw new Error(`Validation failed for test case "${this.testCase.feature_name}": ${errorDetails}`);
        }
        return true;
    }
    renderTemplate(context = {}) {
        const processedContext = { ...context };
        Object.keys(context).forEach((key) => {
            // @ts-ignore
            const maybeArray = context[key];
            if (Array.isArray(maybeArray)) {
                const columns = maybeArray[0] ? Object.keys(maybeArray[0]) : [];
                // @ts-ignore
                processedContext[`${key}_table`] = TestCaseHandler.generateTable(maybeArray, columns);
            }
        });
        return utils_1.Utils.str.renderTemplateString(this.templateContent, processedContext);
    }
    getFeatureContent() {
        const context = {
            ...this.testCase,
            feature_path: this.testCase.feature_path,
        };
        return this.renderTemplate(context);
    }
}
exports.TestCaseHandler = TestCaseHandler;
