import { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import { validate } from "@mat3ra/esse/dist/js/utils/ajv";
import { Utils } from "@mat3ra/utils";

export class TestCaseHandler {
    private testCaseConfig: AnyObject;

    private testCaseSchema: AnyObject;

    private templateContent: string;

    constructor({
        testCaseConfig,
        testCaseSchema,
        templateContent,
    }: {
        testCaseConfig: AnyObject;
        testCaseSchema: AnyObject;
        templateContent: string;
    }) {
        this.testCaseConfig = testCaseConfig;
        this.testCaseSchema = testCaseSchema;
        this.templateContent = templateContent;
    }

    static generateTable(arrayOfObjects: AnyObject[]): string {
        const csv = Utils.array.convertToCompactCSVArrayOfObjects(arrayOfObjects);

        return csv.map((entries) => `      | ${entries.join(" | ")} |`).join("\n");
    }

    validateTestCase(): boolean {
        const { isValid, errors } = validate(this.testCaseConfig, this.testCaseSchema);

        if (!isValid) {
            const errorDetails =
                errors?.map((err) => `${err.instancePath} ${err.message}`).join("; ") ?? "";
            throw new Error(
                `Validation failed for test case "${this.testCaseConfig.feature_name}": ${errorDetails}`,
            );
        }

        return true;
    }

    renderTemplate(context: AnyObject = {}): string {
        const defaultContext = { convertToTable: TestCaseHandler.generateTable };
        return Utils.str.renderTemplateStringWithEval(this.templateContent, {
            ...defaultContext,
            ...context,
        });
    }

    getFeatureContent(): string {
        return this.renderTemplate(this.testCaseConfig);
    }
}
