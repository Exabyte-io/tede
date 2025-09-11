import { DataTable } from "@badeball/cypress-cucumber-preprocessor";
/**
 * Parses passed string and returns evaluated value.
 */
export declare function parseValue<T = string>(str: string): T;
/**
 * Helper function to check if actual value matches expected value, handling CONTAINS logic and number conversion
 */
export declare function assertTableValue(actual: unknown, expected: unknown, originalValue: string): boolean;
/**
 * @summary Parses values from table rows. Each column's value for each row are parsed by parseValue.
 * @param table Table passed from Cucumber step definition.
 * @param context  Context for extracting cached values.
 */
export declare function parseTable<T = object>(table: DataTable): T[];
/**
 * Compares actual values against table expectations, handling CONTAINS and JSON patterns
 */
export declare function assertEqualityForTable(table: DataTable, response: Record<string, unknown>): void;
interface Regex {
    name: string;
    regex: RegExp;
    func: (str: string, regex: RegExp, context: object) => unknown;
}
export declare const REGEXES: Regex[];
export {};
