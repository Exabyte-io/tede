import { validate } from "@mat3ra/esse/dist/js/utils/ajv";
import { Utils } from "@mat3ra/utils";

export class TestCaseHandler {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    private testCase: any;

    private templateSchema: any;

    private templateContent: any;

    // @ts-ignore
    constructor({ testCase, templateSchema, templateContent }) {
        this.testCase = testCase;
        this.templateSchema = templateSchema;
        this.templateContent = templateContent;
    }

    static generateTable(items: any[], columns: (string | number)[]) {
        if (!items || !Array.isArray(items)) {
            return "";
        }
        return items
            .map((item) => {
                const cells = columns.map((col: string | number) => item[col]);
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

        const { isValid, errors } = validate(this.testCase, jsonSchema);

        if (!isValid) {
            // @ts-ignore
            const errorDetails = errors
                .map((err) => `${err.instancePath} ${err.message}`)
                .join("; ");
            throw new Error(
                `Validation failed for test case "${this.testCase.feature_name}": ${errorDetails}`,
            );
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
                processedContext[`${key}_table`] = TestCaseHandler.generateTable(
                    maybeArray,
                    columns,
                );
            }
        });

        return Utils.str.renderTemplateString(this.templateContent, processedContext);
    }

    getFeatureContent() {
        const context = {
            ...this.testCase,
            feature_path: this.testCase.feature_path,
        };

        return this.renderTemplate(context);
    }
}
