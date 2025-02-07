import { expect } from "chai";

import { TestCaseHandler } from "../../src/js/utils/TestCaseHandler";
import { Utils } from "@mat3ra/utils";

const testCaseConfig = {
    feature_name: "feature1",
    key1: "value1",
};

const templateSchema = {
    type: "object",
    properties: {
        key1: { type: "string" },
    },
    required: ["key1"],
}

const templateContent = "This is key1 = ${key1}";

describe("TestCaseHandler test", () => {
    it("should replace key1 in templateContent with value1", () => {
        const testCaseHandler = new TestCaseHandler({
            testCaseConfig,
            templateSchema,
            templateContent,
        });
        const result = testCaseHandler.getFeatureContent();
        expect(result).to.be.equal("This is key1 = value1");
    });
});
describe("Template rendering with eval", () => {
    it("should correctly render the template with the provided context", () => {
        const context = {
            tags: "@notebook_healthcheck",
            notebook_name: "import_material_from_jarvis_db_entry.ipynb",
            material_name: "JARVIS Material",
            output_materials: [
                { material_name: "Te2 Mo1", material_index: 2 },
                { material_name: "Ga2 Te2", material_index: 3 },
            ],
        };

        function convertToTable(outputMaterials: any[]) {
            return outputMaterials
                .map(
                    ({
                         material_name,
                         material_index,
                     }: {
                        material_name: string;
                        material_index: number;
                    }) => `      | ${material_name} | ${material_index} |`,
                )
                .join("\n");
        }

        const template = `
\${tags}
Feature: Healthcheck to import \${material_name}

  Scenario:
    When I open materials designer page
    Then I see material designer page

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I double click on "\${notebook_name}" entry in sidebar
    And I see file "\${notebook_name}" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
      | name | index |
\${convertToTable(output_materials)}
`;

        const expectedOutput = `
@notebook_healthcheck
Feature: Healthcheck to import JARVIS Material

  Scenario:
    When I open materials designer page
    Then I see material designer page

    # Open
    When I open JupyterLite Transformation dialog
    Then I see JupyterLite Transformation dialog
    And I see file "Introduction.ipynb" opened

    # Open notebook
    When I double click on "import_material_from_jarvis_db_entry.ipynb" entry in sidebar
    And I see file "import_material_from_jarvis_db_entry.ipynb" opened

    # Run
    And I Run All Cells
    And I see kernel status is Idle
    And I submit materials
    Then material with following name exists in state
      | name | index |
      | Te2 Mo1 | 2 |
      | Ga2 Te2 | 3 |
`.trim();

        const renderedOutput =  Utils.str.renderTemplateStringWithEval(template, {
            ...context,
            convertToTable,
        });
        expect(renderedOutput.trim()).to.equal(expectedOutput);
    });
