const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const glob = require("glob");

const TEMPLATE_DIR = __dirname;

const generateTable = (items, columns) => {
    if (!items || !Array.isArray(items)) {
        return "";
    }
    return items
        .map((item) => {
            const cells = columns.map((col) => item[col]);
            return `      | ${cells.join(" | ")} |`;
        })
        .join("\n");
};

const expandTemplate = (template, context) => {
    return template.replace(/\${([^}]+)}/g, (match, key) => {
        const trimmedKey = key.trim();

        // Handle table generation for arrays with _table suffix
        if (trimmedKey.endsWith("_table")) {
            const arrayKey = trimmedKey.replace("_table", "");
            const array = context[arrayKey];
            if (array && Array.isArray(array)) {
                const columns = array[0] ? Object.keys(array[0]) : [];
                return generateTable(array, columns);
            }
        }

        if (context[trimmedKey] !== undefined) {
            return context[trimmedKey];
        }

        return match;
    });
};

const processTemplateFile = (yamlPath) => {
    try {
        const yamlContent = fs.readFileSync(yamlPath, "utf8");
        const config = yaml.load(yamlContent);

        const templatePath = path.join(TEMPLATE_DIR, config.template);
        const templateContent = fs.readFileSync(templatePath, "utf8");

        config.cases.forEach((testCase) => {
            validateTestCase(testCase, config.templateSchema);

            const context = {
                ...testCase,
                feature_path: config.feature_path,
            };

            const expandedContent = expandTemplate(templateContent, context);
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
};

const validateTestCase = (testCase, schema) => {
    for (const [field, fieldSchema] of Object.entries(schema)) {
        const value = testCase[field];

        if (value === undefined) {
            throw new Error(`Missing required field: ${field}`);
        }

        if (fieldSchema.type === "array") {
            if (!Array.isArray(value)) {
                throw new Error(`Field ${field} should be an array`);
            }

            if (fieldSchema.items && value.length > 0) {
                value.forEach((item, index) => {
                    for (const [prop, propSchema] of Object.entries(fieldSchema.items.properties)) {
                        const itemValue = item[prop];
                        if (itemValue === undefined) {
                            throw new Error(
                                `Missing required property ${prop} in ${field}[${index}]`,
                            );
                        }
                        validateType(itemValue, propSchema.type, `${field}[${index}].${prop}`);
                    }
                });
            }
        } else {
            validateType(value, fieldSchema.type, field);
        }
    }
};

const validateType = (value, type, field) => {
    switch (type) {
        case "string":
            if (typeof value !== "string") {
                throw new Error(`Field ${field} should be a string`);
            }
            break;
        case "integer":
            if (!Number.isInteger(value)) {
                throw new Error(`Field ${field} should be an integer`);
            }
            break;
    }
};

const yamlFiles = glob.sync(path.join(TEMPLATE_DIR, "*.yaml"));
yamlFiles.forEach(processTemplateFile);
