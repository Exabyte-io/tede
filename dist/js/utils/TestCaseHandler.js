"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestCaseHandler = void 0;
const ajv_1 = require("@mat3ra/esse/dist/js/utils/ajv");
const utils_1 = require("@mat3ra/utils");
class TestCaseHandler {
    constructor({ testCaseConfig, testCaseSchema, templateContent, }) {
        this.testCaseConfig = testCaseConfig;
        this.testCaseSchema = testCaseSchema;
        this.templateContent = templateContent;
    }
    static generateTable(arrayOfObjects) {
        const csv = utils_1.Utils.array.convertToCompactCSVArrayOfObjects(arrayOfObjects);
        return csv.map((entries) => `      | ${entries.join(" | ")} |`).join("\n");
    }
    validateTestCase() {
        var _a;
        const { isValid, errors } = (0, ajv_1.validate)(this.testCaseConfig, this.testCaseSchema);
        if (!isValid) {
            const errorDetails = (_a = errors === null || errors === void 0 ? void 0 : errors.map((err) => `${err.instancePath} ${err.message}`).join("; ")) !== null && _a !== void 0 ? _a : "";
            throw new Error(`Validation failed for test case "${this.testCaseConfig.feature_name}": ${errorDetails}`);
        }
        return true;
    }
    renderTemplate(context = {}) {
        const defaultContext = { convertToTable: TestCaseHandler.generateTable };
        return utils_1.Utils.str.renderTemplateStringWithEval(this.templateContent, {
            ...defaultContext,
            ...context,
        });
    }
    getFeatureContent() {
        return this.renderTemplate(this.testCaseConfig);
    }
}
exports.TestCaseHandler = TestCaseHandler;
