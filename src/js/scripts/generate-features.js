const { validate } = require("@mat3ra/esse/dist/js/utils/ajv");
const fs = require("fs");
const glob = require("glob");
const yaml = require("js-yaml");
const path = require("path");

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
    constructor(templateDir = __dirname, outputDirRoot = __dirname) {
        this.templateDir = templateDir;
        this.outputDirRoot = outputDirRoot;
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

    processTemplateFile(yamlPath) {
        try {
            const yamlContent = fs.readFileSync(yamlPath, "utf8");
            const config = yaml.load(yamlContent);

            const templatePath = path.join(this.templateDir, config.template);
            const templateContent = fs.readFileSync(templatePath, "utf8");

            config.cases.forEach((testCase) => {
                TestFeatureGenerator.validateTestCase(testCase, config.templateSchema);

                const context = {
                    ...testCase,
                    feature_path: config.feature_path,
                };

                const expandedContent = TestFeatureGenerator.expandTemplate(
                    templateContent,
                    context,
                );
                const featuresDir = path.join(this.outputDirRoot, config.feature_path);
                const outputPath = path.join(featuresDir, `${testCase.feature_name}.feature`);

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

    generate() {
        const yamlFiles = glob.sync(path.join(this.templateDir, "*.yaml"));
        yamlFiles.forEach((file) => this.processTemplateFile(file));
    }
}

module.exports = { TestFeatureGenerator };
