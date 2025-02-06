/// <reference types="cypress" />
/// <reference types="cypress" />
/// <reference types="cypress" />
export interface UntilProps<T = boolean> {
    it: () => Cypress.Chainable<JQuery<T> | Cypress.Chainable<T>>;
    become?: T;
    delay?: number;
    timeout?: number;
}
declare global {
    interface UntilProps<T = boolean> {
        it: () => Cypress.Chainable;
        become?: T;
        delay?: number;
        timeout?: number;
    }
    namespace Cypress {
        interface Chainable<Subject> {
            until<T>(prop: UntilProps<T>): void;
            getIframeBody(selector: string): Chainable;
            /**
             * Same as then, except that undefined and null become the new subject as well
             * @see what default then() yields: https://docs.cypress.io/api/commands/then#Yields
             * @example
             * cy.wrap("test").then((subject1: "test") => {
             *      return null;
             * }).then((subject2: "test") => {
             *      return undefined;
             * }).thenWithNull((subject3: "test") => {
             *      return null;
             * }).thenWithNull((subject4: null) => {
             *      return undefined;
             * }).then(subject5: undefined) => {
             *      return subject5;
             * });
             *
             * subject1 - "test";
             * subject2 - "test" (null was ignored);
             * subject3 - "test" (undefined was ignored);
             * subject4 - null (thenWithNull keeps null);
             * subject5 - null (thenWithNull keeps undefined);
             */
            thenWithNull<S>(cb: (currentSubject: Subject) => Bluebird.Promise<S> | Chainable<S> | S): Chainable<S>;
        }
    }
}
