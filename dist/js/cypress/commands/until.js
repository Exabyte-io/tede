"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const isEqual_1 = __importDefault(require("lodash/isEqual"));
/**
 * @see https://github.com/cypress-io/cypress/issues/1936#issuecomment-536424157
 * @example
 *   it('should retry task', function() {
 *      let result = 0;
 *      cy.until({
 *          it: () => ++result,
 *          become: 3,
 *          timeout: 5000,
 *          delay: 500,
 *      });
 *  });
 */
Cypress.Commands.add("until", ({ it, become, delay = 500, timeout = Cypress.config("defaultCommandTimeout"), }) => {
    cy.log("Until start:");
    let latestResult;
    setTimeout(() => {
        if (typeof become === "function") {
            // eslint-disable-next-line no-unused-expressions
            expect(become(latestResult), `${become}`).to.be.true;
        }
        else {
            expect(latestResult).to.be.equal(typeof become === "undefined" ? true : become);
        }
    }, timeout);
    const retry = () => {
        const originalResult = it();
        const wrappedResult = Cypress.isCy(originalResult)
            ? originalResult
            : cy.wrap(originalResult, { log: false });
        wrappedResult.then((result) => {
            latestResult = result;
            let checkResult = false;
            if (typeof become === "function") {
                checkResult = become(result);
            }
            else {
                checkResult = (0, isEqual_1.default)(result, typeof become === "undefined" ? true : become);
            }
            if (checkResult) {
                cy.log(`Until end: "${result}" is expected`);
                return cy.wrap(result, { log: false });
            }
            cy.log(`Until retry: "${result}" is not expected`);
            cy.wait(delay);
            return retry();
        });
    };
    return retry();
});
Cypress.Commands.add("thenWithNull", 
// @ts-ignore
{ prevSubject: true }, (prevSubject, callback) => {
    return (cy
        .wrap(null)
        .then(() => {
        const result = callback(prevSubject);
        if (typeof result === "undefined") {
            return cy.wrap(result);
        }
        if (result === null) {
            return cy.wrap(result);
        }
        return result;
    })
        // @ts-ignore
        .then((newResult) => {
        return cy.wrap(newResult);
    }));
});
