import { DataTable } from "@badeball/cypress-cucumber-preprocessor";
import { expect } from "chai";

import { parseTable } from "../../../../src/js/cypress/utils/table";

describe("Table parsing utilities", () => {
    describe("parseTable", () => {
        const tableTestCases = [
            {
                name: "CONTAINS_STRING values",
                input: [
                    {
                        name: "test",
                        contains: "$CONTAINS{hello}",
                        empty: "$CONTAINS{}",
                    },
                ],
                output: [
                    {
                        name: "test",
                        contains: true,
                        empty: true,
                    },
                ],
            },
            {
                name: "mixed regex types",
                input: [
                    {
                        text: "plain",
                        bool: "$BOOLEAN{true}",
                        contains: "$CONTAINS{test}",
                        number: "$INT{42}",
                    },
                ],
                output: [
                    {
                        text: "plain",
                        bool: true,
                        contains: true,
                        number: 42,
                    },
                ],
            },
        ];

        tableTestCases.forEach(({ name, input, output }) => {
            it(`should parse ${name}`, () => {
                const mockTable = {
                    hashes: () => input,
                } as unknown as DataTable;

                const result = parseTable(mockTable);
                expect(result).to.deep.equal(output);
            });
        });
    });

    describe("CONTAINS_STRING regex", () => {
        const testCases = [
            { input: "$CONTAINS{text}", output: "text" },
            { input: "$CONTAINS{123}", output: "123" },
            { input: "$CONTAINS{special symbols: ^{$}", output: "special symbols: ^{$" },
            { input: "$CONTAINS{}", output: "" },
        ];

        testCases.forEach(({ input, output }) => {
            it(`"${input}" captures ${JSON.stringify(output)}`, () => {
                const regex = /^\$CONTAINS\{(.*)}/;
                const match = input.match(regex);
                const captured = match ? match[1] : null;
                expect(captured).to.equal(output);
            });
        });
    });
});
