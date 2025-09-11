import { DataTable } from "@badeball/cypress-cucumber-preprocessor";
import { expect } from "chai";

import {
    assertEqualityForTable,
    assertTableValue,
    parseTable,
} from "../../../../src/js/cypress/utils/table";

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

    it("passes when all values match", () => {
        const mockTable = {
            hashes: () => [
                {
                    "data.array": "$JSON{[1,2,3]}",
                    "nested.content": "$CONTAINS{target text}",
                },
            ],
        } as unknown as DataTable;

        const response = {
            data: {
                array: [1, 2, 3],
            },
            nested: {
                content: "This text has target text inside",
            },
        };

        expect(() => assertEqualityForTable(mockTable, response)).to.not.throw();
    });

    it("handles CONTAINS patterns correctly", () => {
        const actual = "This is a long string with K_POINTS automatic\\n1 2 3 0 0 0 inside it";
        const expected = "K_POINTS automatic\\n1 2 3 0 0 0";
        const originalValue = "$CONTAINS{K_POINTS automatic\\n1 2 3 0 0 0}";

        const result = assertTableValue(actual, expected, originalValue);
        expect(result).to.be.true;
    });

    it("handles regular equality correctly", () => {
        const actual = "success";
        const expected = "success";
        const originalValue = "success";

        const result = assertTableValue(actual, expected, originalValue);
        expect(result).to.be.true;
    });

    it("handles nested JSON structures", () => {
        const actual = { arr: [1, 2], obj: { num: "42" } };
        const expected = { arr: [1, 2], obj: { num: "42" } };
        const originalValue = "$JSON{{'arr': [1, 2], 'obj': {'num': '42'}}}";

        const result = assertTableValue(actual, expected, originalValue);
        expect(result).to.be.true;
    });
});
