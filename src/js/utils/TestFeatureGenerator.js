const { yaml } = require("@mat3ra/utils/server");

const { validate } = require("@mat3ra/esse/dist/js/utils/ajv");

const utils = require("@mat3ra/utils");

/**
 * TestFeatureGenerator generates Gherkin feature files from YAML templates.
 *
 * This class processes YAML configuration files that define test cases and generates
 * corresponding .feature files using predefined templates.
 *
 * @example
 * ```javascript
 * const generator = new TestFeatureGenerator();
 *
 * // Generate features from a YAML configuration file and a template file
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

    static processTemplate(template, context) {
        const processedContext = { ...context };

        Object.keys(context).forEach((key) => {
            const array = context[key];
            if (Array.isArray(array)) {
                const columns = array[0] ? Object.keys(array[0]) : [];
                processedContext[`${key}_table`] = this.generateTable(array, columns);
            }
        });

        return utils.str.renderTemplateString(template, processedContext);
    }

    static processTestCase(testCase, templateContent) {
        const context = {
            ...testCase,
            feature_path: testCase.feature_path,
        };

        return TestFeatureGenerator.processTemplate(templateContent, context);
    }

    static generate(yamlContent, templateContent) {
        const features = [];
        try {
            const config = yaml.readYAMLFile(yamlContent);
            config.cases.forEach((testCase) => {
                TestFeatureGenerator.validateTestCase(testCase, config.templateSchema);

                const featureContent = TestFeatureGenerator.processTestCase(
                    testCase,
                    templateContent,
                );

                features.push({
                    name: testCase.feature_name,
                    content: featureContent,
                });
            });
        } catch (error) {
            console.error(`Error processing ${yamlContent}:`, error);
        }
        return features;
    }
}

module.exports = { TestFeatureGenerator };
