import { Utils } from "@mat3ra/utils";
import { expect } from "chai";

import { generateTestFeaturesFromTestConfig } from "../../src/js/utils";
import { TestCaseHandler } from "../../src/js/utils/TestCaseHandler";

const testCaseConfig = {
    feature_name: "feature1",
    key1: "value1",
};

const testCaseSchema = {
    type: "object",
    properties: {
        key1: { type: "string" },
    },
    required: ["key1"],
};

// eslint-disable-next-line no-template-curly-in-string
const templateContent = "This is key1 = ${key1}";

describe("TestCaseHandler test", () => {
    it("should replace key1 in templateContent with value1", () => {
        const testCaseHandler = new TestCaseHandler({
            testCaseConfig,
            testCaseSchema,
            templateContent,
        });
        const result = testCaseHandler.getFeatureContent();
        expect(result).to.be.equal("This is key1 = value1");
    });
});
describe("Template rendering with eval", () => {
    it("should correctly render the template with the provided context", () => {
        const testCaseSchema = {
            type: "object",
            properties: {
                tags: { type: "string" },
                notebook_name: { type: "string" },
                material_name: { type: "string" },
                output_materials: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            material_name: { type: "string" },
                            material_index: { type: "number" },
                        },
                        required: ["material_name", "material_index"],
                    },
                },
            },
            required: ["tags", "notebook_name", "material_name", "output_materials"],
        };

        const testCaseConfigs = [
            {
                tags: "@notebook_healthcheck",
                feature_name: "material_import",
                notebook_name: "import_material.ipynb",
                material_name: "Material",
                output_materials: [
                    { material_name: "Te2 Mo1", material_index: 2 },
                    { material_name: "Ga2 Te2", material_index: 3 },
                ],
            },
        ];

        const templateContent = `
\${tags}
Feature: Healthcheck to import \${material_name}

  Scenario:
    # Open notebook
    When I double click on "\${notebook_name}" entry in sidebar
    And I see file "\${notebook_name}" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
\${convertToTable(output_materials)}
`;

        const expectedOutput = `
@notebook_healthcheck
Feature: Healthcheck to import Material

  Scenario:
    # Open notebook
    When I double click on "import_material.ipynb" entry in sidebar
    And I see file "import_material.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
      | material_name | material_index |
      | Te2 Mo1 | 2 |
      | Ga2 Te2 | 3 |
`.trim();

        const renderedOutput = generateTestFeaturesFromTestConfig(
            templateContent,
            testCaseSchema,
            testCaseConfigs,
        )[0].content;
        expect(renderedOutput.trim()).to.equal(expectedOutput);
    });
});
