const { validate } = require("@mat3ra/esse/dist/js/utils/ajv");
const yaml = require("js-yaml");

/**
 * TestFeatureGenerator generates Gherkin feature files from YAML templates.
 *
 * This class processes YAML configuration files that define test cases and generates
 * corresponding .feature files using predefined templates.
 *
 * @example
 * ```javascript
 * // Initialize generator with template directory
 * const generator = new TestFeatureGenerator('./templates');
 *
 * // Generate feature files from all YAML files in template directory
 * generator.generate();
 * ```
 *
 * Expected YAML structure:
 * ```yaml
 * template: "template-file.feature"  # Template file name
 * feature_path: "path/to/output"     # Output directory for generated features
 * templateSchema:                    # Schema for validating test cases
 *   field1:
 *     type: "string"
 *   field2:
 *     type: "array"
 *     items:
 *       properties:
 *         prop1:
 *           type: "string"
 * cases:                            # Test cases to generate
 *   - feature_name: "test1"
 *     field1: "value1"
 *     field2: [{ prop1: "value2" }]
 * ```
 */
class TestFeatureGenerator {
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

    static validateTestCase(testCase, schema) {
        // Convert the template schema directly to JSON Schema format
        const jsonSchema = {
            type: "object",
            properties: schema,
            required: Object.keys(schema),
            additionalProperties: true,
            $id: `testCase_${Math.random()}`,
        };

        const { isValid, errors } = validate(testCase, jsonSchema);

        if (!isValid) {
            const errorDetails = errors
                .map((err) => `${err.instancePath} ${err.message}`)
                .join("; ");
            throw new Error(
                `Validation failed for test case "${testCase.feature_name}": ${errorDetails}`,
            );
        }

        return true;
    }

    static expandTemplate(template, context) {
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

    static processTestCase(testCase, templateContent) {
        const context = {
            ...testCase,
            feature_path: testCase.feature_path,
        };

        return TestFeatureGenerator.expandTemplate(templateContent, context);
    }

    static generate(yamlContent, templateContent) {
        const features = [];
        try {
            const config = yaml.load(yamlContent);
            config.cases.forEach((testCase) => {
                TestFeatureGenerator.validateTestCase(testCase, config.templateSchema);

                const featureContent = TestFeatureGenerator.processTestCase(
                    testCase,
                    templateContent,
                );

                features.push(featureContent);
            });
        } catch (error) {
            console.error(`Error processing ${yamlContent}:`, error);
        }
        return features;
    }
}

module.exports = { TestFeatureGenerator };
