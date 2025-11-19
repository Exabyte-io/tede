/* eslint-disable no-template-curly-in-string */
import { DataTable } from "@badeball/cypress-cucumber-preprocessor";
import { expect } from "chai";

import {
    assertEqualityForTable,
    assertTableValue,
    parseTable,
    parseValue,
} from "../../../../src/js/cypress/utils/table";

interface MockWindow {
    __CACHE__?: {
        [key: string]: unknown;
    };
}

const mockGlobal = global as unknown as { window?: MockWindow };
/**
 * Sets up the window cache with the provided cache object
 */
function setWindowCache(cacheObject: Record<string, unknown>): void {
    mockGlobal.window = {
        __CACHE__: cacheObject,
    };
}

/**
 * Clears the window cache
 */
function clearWindowCache(): void {
    delete mockGlobal.window;
}

/**
 * Sets a cache value by key
 */
function setCacheValue(key: string, value: unknown): void {
    const mockWindow = mockGlobal.window;
    if (mockWindow) {
        mockWindow.__CACHE__ = mockWindow.__CACHE__ || {};
        mockWindow.__CACHE__[key] = value;
    }
}

/**
 * Deletes the cache object from window
 */
function deleteCache(): void {
    const mockWindow = mockGlobal.window;
    if (mockWindow) {
        delete mockWindow.__CACHE__;
    }
}

describe("Table parsing utilities", () => {
    it("correctly parses table with CONTAINS_STRING", () => {
        const mockTable = new DataTable([
            ["field1", "field2"],
            ["$CONTAINS{value1}", "$CONTAINS{target {text}}"],
        ]);

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
        const mockTable = new DataTable([
            ["data.array", "nested.content"],
            ["$JSON{[1,2,3]}", "$CONTAINS{target text}"],
        ]);

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
        expect(result).to.equal(true);
    });

    it("handles regular equality correctly", () => {
        const actual = "success";
        const expected = "success";
        const originalValue = "success";

        const result = assertTableValue(actual, expected, originalValue);
        expect(result).to.equal(true);
    });

    it("handles nested JSON structures", () => {
        const actual = { arr: [1, 2], obj: { num: "42" } };
        const expected = { arr: [1, 2], obj: { num: "42" } };
        const originalValue = "$JSON{{'arr': [1, 2], 'obj': {'num': '42'}}}";

        const result = assertTableValue(actual, expected, originalValue);
        expect(result).to.equal(true);
    });
});

describe("parseValue REGEXES", () => {
    describe("DATE_REGEX", () => {
        it("parses date string to ISO format", () => {
            const result = parseValue("$DATE{2023-01-15}");
            expect(result).to.be.a("string");
            expect(result).to.equal(new Date("2023-01-15").toISOString());
        });

        it("parses date with time to ISO format", () => {
            const result = parseValue("$DATE{2023-01-15T10:30:00Z}");
            expect(result).to.be.a("string");
            expect(result).to.equal(new Date("2023-01-15T10:30:00Z").toISOString());
        });
    });

    describe("DATE_AGO_REGEX", () => {
        it("parses date ago with days", () => {
            const result = parseValue<string>("$DATE_AGO{5/days}");
            expect(result).to.be.a("string");
            const expectedDate = new Date();
            expectedDate.setDate(expectedDate.getDate() - 5);
            // Allow some tolerance for test execution time
            const resultDate = new Date(result);
            expect(resultDate.getTime()).to.be.closeTo(expectedDate.getTime(), 1000);
        });

        it("parses date ago with hours", () => {
            const result = parseValue<string>("$DATE_AGO{2/hours}");
            expect(result).to.be.a("string");
            const expectedDate = new Date();
            expectedDate.setHours(expectedDate.getHours() - 2);
            const resultDate = new Date(result);
            expect(resultDate.getTime()).to.be.closeTo(expectedDate.getTime(), 1000);
        });

        it("parses date ago with months", () => {
            const result = parseValue<string>("$DATE_AGO{1/months}");
            expect(result).to.be.a("string");
            const expectedDate = new Date();
            expectedDate.setMonth(expectedDate.getMonth() - 1);
            const resultDate = new Date(result);
            expect(resultDate.getTime()).to.be.closeTo(expectedDate.getTime(), 1000);
        });
    });

    describe("BOOLEAN_REGEX", () => {
        it("parses true boolean", () => {
            const result = parseValue<boolean>("$BOOLEAN{true}");
            expect(result).to.equal(true);
        });

        it("parses false boolean", () => {
            const result = parseValue<boolean>("$BOOLEAN{false}");
            expect(result).to.equal(false);
        });
    });

    describe("ARRAY_REGEX", () => {
        it("parses comma-separated array", () => {
            const result = parseValue<string[]>("$ARRAY{a,b,c}");
            expect(result).to.deep.equal(["a", "b", "c"]);
        });

        it("parses array with numbers as strings", () => {
            const result = parseValue<string[]>("$ARRAY{1,2,3}");
            expect(result).to.deep.equal(["1", "2", "3"]);
        });

        it("parses array with single element", () => {
            const result = parseValue<string[]>("$ARRAY{single}");
            expect(result).to.deep.equal(["single"]);
        });

        it("parses array with spaces", () => {
            const result = parseValue<string[]>("$ARRAY{one, two, three}");
            expect(result).to.deep.equal(["one", " two", " three"]);
        });
    });

    describe("INT_REGEX", () => {
        it("parses positive integer", () => {
            const result = parseValue<number>("$INT{42}");
            expect(result).to.equal(42);
            expect(result).to.be.a("number");
        });

        it("parses zero", () => {
            const result = parseValue<number>("$INT{0}");
            expect(result).to.equal(0);
        });

        it("parses large integer", () => {
            const result = parseValue<number>("$INT{123456789}");
            expect(result).to.equal(123456789);
        });
    });

    describe("JSON_REGEX", () => {
        it("parses JSON object", () => {
            const result = parseValue<object>('$JSON{{"key":"value"}}');
            expect(result).to.deep.equal({ key: "value" });
        });

        it("parses JSON array", () => {
            const result = parseValue<number[]>("$JSON{[1,2,3]}");
            expect(result).to.deep.equal([1, 2, 3]);
        });

        it("parses nested JSON", () => {
            const result = parseValue<object>('$JSON{{"nested":{"key":"value"}}}');
            expect(result).to.deep.equal({ nested: { key: "value" } });
        });

        it("parses JSON with numbers and strings", () => {
            const result = parseValue<object>('$JSON{{"num":42,"str":"test"}}');
            expect(result).to.deep.equal({ num: 42, str: "test" });
        });
    });

    describe("EVAL_REGEX", () => {
        it("evaluates simple arithmetic expression", () => {
            const result = parseValue<number>("$EVAL{2 + 3}");
            expect(result).to.equal(5);
        });

        it("evaluates multiplication", () => {
            const result = parseValue<number>("$EVAL{10 * 5}");
            expect(result).to.equal(50);
        });

        it("evaluates string concatenation", () => {
            const result = parseValue<string>('$EVAL{"hello" + " world"}');
            expect(result).to.equal("hello world");
        });
    });

    describe("FLOAT_REGEX", () => {
        it("parses positive float", () => {
            const result = parseValue<number>("$FLOAT{3.14}");
            expect(result).to.equal(3.14);
            expect(result).to.be.a("number");
        });

        it("parses negative float", () => {
            const result = parseValue<number>("$FLOAT{-2.5}");
            expect(result).to.equal(-2.5);
        });

        it("parses float with scientific notation", () => {
            const result = parseValue<number>("$FLOAT{1.5e-10}");
            expect(result).to.equal(1.5e-10);
        });
    });

    describe("BASIS_REGEX", () => {
        it("parses basis string with single element", () => {
            const result = parseValue("$BASIS{Si 0 0 0}");
            expect(result).to.deep.equal({
                elements: [{ id: 1, value: "Si" }],
                coordinates: [{ id: 1, value: [0, 0, 0] }],
                units: "crystal",
            });
        });

        it("parses basis string with multiple elements", () => {
            const result = parseValue("$BASIS{Si 0 0 0, Li 0.5 0.5 0.5}");
            expect(result).to.deep.equal({
                elements: [
                    { id: 1, value: "Si" },
                    { id: 2, value: "Li" },
                ],
                coordinates: [
                    { id: 1, value: [0, 0, 0] },
                    { id: 2, value: [0.5, 0.5, 0.5] },
                ],
                units: "crystal",
            });
        });

        it("parses basis string with semicolon separator", () => {
            const result = parseValue("$BASIS{Si 0 0 0; Li 0.5 0.5 0.5}");
            expect(result).to.deep.equal({
                elements: [
                    { id: 1, value: "Si" },
                    { id: 2, value: "Li" },
                ],
                coordinates: [
                    { id: 1, value: [0, 0, 0] },
                    { id: 2, value: [0.5, 0.5, 0.5] },
                ],
                units: "crystal",
            });
        });
    });

    describe("EXPR_REGEX", () => {
        it("parses expression with random string length", () => {
            const result = parseValue<string>("${10}");
            expect(result).to.be.a("string");
            expect(result.length).to.equal(10);
            // Should contain at least one letter (per the implementation)
            expect(result).to.match(/[a-z]/);
        });

        it("parses literal string with exclamation mark", () => {
            const result = parseValue<string>("${!literal}");
            expect(result).to.equal("literal");
        });

        it("parses random numbers", () => {
            const result = parseValue<string>("${N5}");
            expect(result).to.be.a("string");
            expect(result.length).to.equal(5);
            expect(result).to.match(/^\d{5}$/);
        });

        it("parses multiple expressions", () => {
            const result = parseValue<string>("${!prefix,10,!suffix}");
            expect(result).to.be.a("string");
            expect(result).to.include("prefix");
            expect(result).to.include("suffix");
        });
    });

    describe("CONTAINS_STRING", () => {
        it("parses contains string", () => {
            const result = parseValue<string>("$CONTAINS{test value}");
            expect(result).to.equal("test value");
        });

        it("parses contains string with special characters", () => {
            const result = parseValue<string>("$CONTAINS{test {value}}");
            expect(result).to.equal("test {value}");
        });
    });

    describe("CACHE_REGEX", () => {
        beforeEach(() => {
            // Set up mock cache
            setWindowCache({
                user: { name: "John", age: 30 },
                token: "abc123",
                settings: { theme: "dark" },
            });
        });

        afterEach(() => {
            // Clean up mock cache
            clearWindowCache();
        });

        it("parses cache value without property", () => {
            const result = parseValue<string>("$CACHE{token}");
            expect(result).to.equal("abc123");
        });

        it("parses cache value with property", () => {
            const result = parseValue<string>("$CACHE{user:name}");
            expect(result).to.equal("John");
        });

        it("parses nested cache property", () => {
            const result = parseValue<string>("$CACHE{settings:theme}");
            expect(result).to.equal("dark");
        });

        it("parses cache value that needs further parsing", () => {
            // Cache value that contains another regex pattern
            setCacheValue("count", "$INT{42}");
            const result = parseValue<number>("$CACHE{count}");
            expect(result).to.equal(42);
        });

        it("handles missing cache gracefully", () => {
            deleteCache();
            const result = parseValue("$CACHE{missing}");
            // When cache is missing, undefined gets converted to string "undefined"
            expect(result).to.equal("undefined");
        });
    });

    describe("parseTable with REGEXES", () => {
        it("parses table with multiple regex patterns", () => {
            const mockTable = new DataTable([
                ["name", "count", "price", "active", "tags", "metadata"],
                [
                    "test",
                    "$INT{42}",
                    "$FLOAT{3.14}",
                    "$BOOLEAN{true}",
                    "$ARRAY{a,b,c}",
                    '$JSON{{"key":"value"}}',
                ],
            ]);

            const parsed = parseTable(mockTable);

            expect(parsed).to.deep.equal([
                {
                    name: "test",
                    count: 42,
                    price: 3.14,
                    active: true,
                    tags: ["a", "b", "c"],
                    metadata: { key: "value" },
                },
            ]);
        });

        it("parses table with date regexes", () => {
            const mockTable = new DataTable([
                ["created", "updated"],
                ["$DATE{2023-01-15}", "$DATE_AGO{1/days}"],
            ]);

            const parsed = parseTable<{ created: string; updated: string }>(mockTable);

            expect(parsed[0].created).to.equal(new Date("2023-01-15").toISOString());
            expect(parsed[0].updated).to.be.a("string");
            // Verify it's a valid ISO date string
            expect(new Date(parsed[0].updated).toISOString()).to.equal(parsed[0].updated);
        });

        it("parses table with basis regex", () => {
            const mockTable = new DataTable([["basis"], ["$BASIS{Si 0 0 0, Li 0.5 0.5 0.5}"]]);

            const parsed = parseTable<{
                basis: {
                    elements: Array<{ id: number; value: string }>;
                    coordinates: Array<{ id: number; value: number[] }>;
                    units: string;
                };
            }>(mockTable);

            expect(parsed[0].basis).to.deep.equal({
                elements: [
                    { id: 1, value: "Si" },
                    { id: 2, value: "Li" },
                ],
                coordinates: [
                    { id: 1, value: [0, 0, 0] },
                    { id: 2, value: [0.5, 0.5, 0.5] },
                ],
                units: "crystal",
            });
        });

        it("parses table with eval regex", () => {
            const mockTable = new DataTable([
                ["sum", "product"],
                ["$EVAL{10 + 20}", "$EVAL{5 * 6}"],
            ]);

            const parsed = parseTable<{ sum: number; product: number }>(mockTable);

            expect(parsed[0].sum).to.equal(30);
            expect(parsed[0].product).to.equal(30);
        });

        it("parses table with mixed regex and plain values", () => {
            const mockTable = new DataTable([
                ["plain", "number", "array"],
                ["plain value", "$INT{100}", "$ARRAY{x,y,z}"],
            ]);

            const parsed = parseTable(mockTable);

            expect(parsed).to.deep.equal([
                {
                    plain: "plain value",
                    number: 100,
                    array: ["x", "y", "z"],
                },
            ]);
        });
    });
});
