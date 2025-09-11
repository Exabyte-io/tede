import { DataTable } from "@badeball/cypress-cucumber-preprocessor";
/**
 * Parses passed string and returns evaluated value.
 */
export declare function parseValue<T = string>(str: string): T;
/**
 * @summary Parses values from table rows. Each column's value for each row are parsed by parseValue.
 * @param table Table passed from Cucumber step definition.
 * @param context  Context for extracting cached values.
 */
export declare function parseTable<T = object>(table: DataTable): T[];
interface Regex {
    name: string;
    regex: RegExp;
    func: (str: string, regex: RegExp, context: object) => unknown;
}
export declare const REGEXES: Regex[];
export {};
