import { DataTable } from "@badeball/cypress-cucumber-preprocessor";
import { expect } from "chai";

import { parseTable } from "../../../../src/js/cypress/utils/table";

describe("Table parsing utilities", () => {
    it("correctly parses table with CONTAINS_STRING", () => {
        const mockTable = {
            hashes: () => [
                {
                    field1: "$CONTAINS{value1}",
                    field2: "$CONTAINS{target {text}}",
                },
            ],
        } as unknown as DataTable;

        const parsed = parseTable(mockTable);

        const expected = [
            {
                field1: "value1",
                field2: "target {text}",
            },
        ];
        expect(parsed).to.deep.equal(expected);
    });
});
