# TeDe

TEst DEfinitions. A dual repository (JavaScript and Python) containing useful code for testing.

## 1. Overview.

This repository contains the code for the test automation framework. It is meant to be reused across different projects. The framework is presently based on the Cucumber BDD approach. It uses Cypress as the test engine.

## 2. Methodology.

### 2.1. Architecture.

The following diagram shows the key items of the framework and their relationships.

![architecture](image.png)

1. **Feature** is the test case. We use Cucumber Gherkin syntax <https://cucumber.io/docs/gherkin/> to define the test case structure. Each feature consists of one or more steps.
2. **Step** one particular step for a user to do. It can also describe some background processes (like the creation of workflows). Uses widgets to define what exactly needs to be done in the step.
3. **Widget** / **TAO**:
   1. **Widget** - Javascript class that encapsulates the logic of one particular element on the page (button/dropdown/sidebar/header or even a whole page).
   1. **TAO** - Test data Access Object. Javascript class that encapsulates the access (CRUD operations) for one particular data collection - e.g. Accounts, Jobs - AccountTAO, JobTAO. Is used to pre-initialize the data for the test and to facilitate assertions. It is similar to DAO for test purposes <https://en.wikipedia.org/wiki/Data_access_object>.
4. **Browser** - Intermediate level between Widgets and Cypress. Aimed to encapsulate/hide the test engine/driver (cypress or chimp). This is meant to be the only level that is using the Driver (e.g. Cypress, Webdriver, Playwright) commands directly.
5. **Cy** (the Driver) - the driver that controls the web browser, for example - Cypress engine.

Note that:

- Widgets can use other Widgets or TAO. But TAO can't use Widgets.
- The terms "step definition" and "step" are used interchangeably.

### 2.2. The Browser abstraction.

The `browser` provides an intermediate level between widgets and test framework engine / Driver.  It is available as a window property (`window.browser`) for step definitions and as `this.browser` for any Widget and TAO.

Any Driver (Cypress) functions or commands should be used only through the browser object.

### 2.3. The Widget abstraction.

The Widgets extend browser with high-level specific business logic. They usually represent some particular UI element in the application.
For example, you could have `LeftSideMenuWidget` with method `clickOnMenuItem(menuItemName: string)` which internally uses `browser.clickOnText(selector: string, text: string)`;

### 2.4. The Browser / Widget / TAO methods

Four types of methods should exist in the Browser, and consequently through the Widgets and TAOs:

1. **Actions** - interactions with the page (or data in case of TAO) that can be done by the user (or the testing framework for tests initiation)
   - `click`, `type`, `select`, `refresh` for the browser
   - `clickOnTitle`, `typeEmail`, `selectGender` for the widget
   - `createUser`, `setServiceLevel`, `createJob` **for TAO only**
2. **Assertions with retry** - application state checks. For example, `assertTextWithRetry` will check if the text inside html component is equal to some reference value.
   - `assertTextWithRetry`, `assertInputValueWithRetry`, `assertSelectValue` for browser
   - `assertTitleTextWithRetry`, `assertEmailInputValueWithRetry`, `assertGenderSelectValue` for widget
   - `assertUserExistWithRetry`, `assertServiceLevelWithRetry`, `assertWorkflowsCreatedWithRetry` for TAO
3. **Getters** - methods that return any data required for further use in subsequent test logic.
   - `getText`, `getInputValue`, `getCssClass`, `getIsSelected` for browser
   - `getTitleText`, `getInputEmailText`, `getIsExplorerItemVisible` for widget
   - `getApplicationSettings`, `getUserSettings`, `getServiceLevel` for TAO
4. **Utils** - other system methods. Exist only in the browser object:
   - `retry`,
   - `dispatchEvent`,
   - `execute`

### 2.5. Restrictions on the above methods.

Due to the nature of the Cypress engine, the following conventions apply:

1. **Actions** and **Assertions** should not be async. They should return a value or a promise. The Cypress engine will handle the retries for the UI actions. Cypress will retry an action a couple of times for 4 seconds by default until it succeeds. For TAO actions we need to add the `retry` (see item 4 below) manually.
2. **Getters** are the only async methods in the browser object. These should return "Cypress.Chainable" to be chained with `.then()` subsequently. The getters should be called only inside Widgets/TAO. Do not expose the async nature of these methods to step definitions (there should be no `then` inside step definitions). See section 3 below for more details.
3. **Utils** execute is running code inside the browser context. Here something like <https://github.com/xolvio/meteor-backdoor> could be utilized to run code on the server side to prepare the test environment data, for example.

## 3. Specific Suggestions.

### 3.1. Use assertions instead of getters.

The below is discouraged:
```js
widget.browser.retry(() => {
  return widget.browser.getElementText(selector).then((elementText) => {
    return elementText === "expected text";
  })
});
```

Use this instead:
```js
widget.browser.assertText(selector, "expected text");
```

### 3.2. Use assertions with retry instead of `browser.retry`.

Don't use `browser.retry` inside step definitions. It should be encapsulated with methods `assertAndRetry`.

This pattern is discouraged:
```js
window.browser.retry(() => {
  return tao.isSomethingOnTheServerSide().then((isReady) => {
    return Boolean(isReady);
  })
});
```

Correct approach:
```js
// somewhere in TAO
assertSomethingOnTheServerSideIsReadyWithRetry() {
    this.browser.retry(() => {
       return this.isSomethingOnTheServerSide().then((isReady) => {
         return Boolean(isReady);
       });
    })
}

// in step definition
tao.assertSomethingOnTheServerSideIsReadyWithRetry();
```

### 3.3. Do not use `.then` in step definitions.

Do not use `then` in step definitions. Move such code inside Widgets or TAOs:

This pattern is discouraged inside step definitions:
```js
widget.browser.retry(() => {
  return tao.getElementIdFromServer().then((id) => {
    return tao.getOtherElementIdFromServer().then((otherId) => {
      const css = widget.getElementCSS(id, otherId);
      return widget.browser.isVisible(css).then(() => {
        return isVisible
      })
    });
  })
});
```
Use this instead:
```js
// Better
widget.assertElementExistsWithRetry();
```

### 3.4. Other specific suggestions.

As below:

- Avoid using Xpath for new steps as it is not supported by Cypress natively and was added via the plugin only for supporting old test steps.
- Avoid mixing TAO and Widgets in the same step definition.
- Put step definitions using TAO in the corresponding subfolder: `tao`. By default, we assume that step definitions use widgets only.

## 4. Links.

- [Cypress](https://www.cypress.io/)
- [Cucumber](https://cucumber.io/)
- [Gherkin](https://cucumber.io/docs/gherkin/)
- [DAO](https://en.wikipedia.org/wiki/Data_access_object)
- [Meteor Backdoor](https://github.com/xolvio/meteor-backdoor)
- [Xpath](https://www.w3schools.com/xml/xpath_intro.asp)
