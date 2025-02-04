import { AnyObject } from "@mat3ra/esse/dist/js/esse/types";
import { JSONSchema } from "@mat3ra/esse/dist/js/esse/utils";
import { validate } from "@mat3ra/esse/dist/js/utils/ajv";
import fs from "fs";
import glob from "glob";
import yaml from "js-yaml";
import path from "path";

interface SchemaField {
    type: string;
    items?: {
        properties: Record<string, { type: string }>;
    };
}

export class TestFeatureGenerator {
    templateDir: string;

    constructor(templateDir: string = __dirname) {
        this.templateDir = templateDir;
    }

    static generateTable(items: any[], columns: string[]): string {
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

    static validateTestCase(testCase: AnyObject, schema: Record<string, SchemaField>): void {
        const jsonSchema: JSONSchema = {
            type: "object",
            properties: {} as Record<string, any>,
            required: Object.keys(schema),
            additionalProperties: false,
            $id: "testCase",
        } as const;

        Object.entries(schema).forEach(([field, fieldSchema]) => {
            if (fieldSchema.type === "array" && fieldSchema.items) {
                jsonSchema.properties[field] = {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {},
                        required: Object.keys(fieldSchema.items.properties),
                        additionalProperties: false,
                    },
                };

                Object.entries(fieldSchema.items.properties).forEach(([prop, propSchema]) => {
                    jsonSchema.properties[field].items.properties[prop] = {
                        type: propSchema.type.toLowerCase(),
                    };
                });
            } else {
                jsonSchema.properties[field] = {
                    type: fieldSchema.type.toLowerCase(),
                };
            }
        });

        const { isValid, errors } = validate(testCase, jsonSchema);

        if (!isValid) {
            throw new Error(`Validation failed: ${JSON.stringify(errors)}`);
        }
    }

    static expandTemplate(template: string, context: AnyObject): string {
        return template.replace(/\${([^}]+)}/g, (match, key) => {
            const trimmedKey = key.trim();

            if (trimmedKey.endsWith("_table")) {
                const arrayKey = trimmedKey.replace("_table", "");
                const array = context[arrayKey];
                if (array && Array.isArray(array)) {
                    const columns = array[0] ? Object.keys(array[0]) : [];
                    return TestFeatureGenerator.generateTable(array, columns);
                }
                return "";
            }

            return context[trimmedKey] !== undefined ? String(context[trimmedKey]) : match;
        });
    }

    processTemplateFile(yamlPath: string): void {
        try {
            const yamlContent = fs.readFileSync(yamlPath, "utf8");
            const config = yaml.load(yamlContent) as AnyObject;

            const templatePath = path.join(this.templateDir, config.template);
            const templateContent = fs.readFileSync(templatePath, "utf8");

            config.cases.forEach((testCase: AnyObject) => {
                TestFeatureGenerator.validateTestCase(testCase, config.templateSchema);

                const context = {
                    ...testCase,
                    feature_path: config.feature_path,
                };

                const expandedContent = this.expandTemplate(templateContent, context);
                const featuresDir = config.feature_path;
                const outputPath = path.join(`${featuresDir}`, `${testCase.feature_name}.feature`);

                if (!fs.existsSync(featuresDir)) {
                    fs.mkdirSync(featuresDir, { recursive: true });
                }

                fs.writeFileSync(outputPath, expandedContent);
                console.log(`Generated: ${outputPath}`);
            });
        } catch (error) {
            console.error(`Error processing ${yamlPath}:`, error);
        }
    }

    generate(): void {
        const yamlFiles = glob.sync(path.join(this.templateDir, "*.yaml"));
        yamlFiles.forEach((file) => this.processTemplateFile(file));
    }
}
