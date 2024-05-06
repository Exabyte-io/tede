# TeDe

TEst DEfinitions. A dual repository (JavaScript and Python) containing useful code for testing.

## Usage

To be added.

## Developer Notes

(remaining from the template repository)

### GitHub workflow

The workflow requires the following variables to be defined:

- `secrets.BOT_GITHUB_TOKEN`
- `secrets.BOT_GITHUB_KEY`

### Package Initialization

When creating a new repository from this template, follow the items on the following checklist:

- [ ] In `pyproject.toml` update `project.name`, `project.description`, and `project.classifiers`
        (if applicable).
- [ ] Add Python dependencies to `pyproject.toml`. The `requirements*.txt` files can be generated
        automatically using `pip-compile`.
- [ ] In `./src/py` replace the `templator` directory with your Python package name.
- [ ] Install `pre-commit` if not already present (e.g. `pip install pre-commit`).
- [ ] In `package.json`, update `"name"` and `"description"`.
- [ ] Add JS/TS dependencies as usual (`npm install <pkg>` or `npm install --save-dev <pkg>`).

### Pre-Commit Hooks

The pre-commit hooks are managed by the `pre-commit` tool (see [docs](https://pre-commit.com/)) in **both** Python
and JavaScript/TypeScript. In order to set up the pre-commit hooks in the JS/TS development flow similar to `husky`,
the `bootstrap.js` script was added. With `pre-commit` installed, running the `bootstrap.js` script is equivalent
to `husky install`. Note that the hooks are only activated when the package is installed locally (`npm install`)
and not when installed as a dependency.

## Writing tests

### Common architecture

![architecture](image.png)

1. **Feature** is the test case. We use Cucumbers Gherkin syntax to define the test case structure. Each feature consists of one or more steps.
2. **Step** one particular step for a user to do. It can also describe some background processes (like the creation of workflows). Uses widgets to define what exactly needs to be done in the step.
3. **Widget** - Javascript class that encapsulates the logic of one particular element on the page (button/dropdown/sidebar/header or even a whole page)
4. **Browser** - Intermediate level between Widgets and Cypress. Aimed to encapsulate/hide the test engine (cypress or chimp). This is the only level that uses cypress.
5. **Cypress** - Cypress engine

### TAO definitions

Test data access object. It is similar to DAO for test purposes <https://en.wikipedia.org/wiki/Data_access_object>

### Browser object

Intermediate level between widgets and test framework (cypress in this case).
It is available as Cypress window property (`window.browser`) for step definitions and as `this.browser` for any widget and tao.
Any cypress functions or commands should be used only through the browser object.

### Widget object

Extends browser with high-level business-related logic. Usually represents some particular widget in the application.
For example, you could have `LeftSideMenuWidget` with method `clickOnMenuItem(menuItemName: string)` which internally uses `browser.clickOnText(selector: string, text: string)`;

## Browser / Widget / TAO methods

4 types of methods should exist in Browser / Widget / TAO:

1. **actions** - interactions with the page that can be done by the user
   - `click`, `type`, `select`, `refresh` for the browser
   - `clickOnTitle`, `typeEmail`, `selectGender` for the widget
   - `createUser`, `setServiceLevel`, `createJob` for TAO
2. **assertions with retry** - application state checks. For example, `assertTextWithRetry` will check if the text inside html component is equal to some reference value (cypress will retry this action a couple of times for 4 seconds by default until succeeds). For TAO actions we need to add the retry manually.
   - `assertTextWithRetry`, `assertInputValueWithRetry`, `assertSelectValue` for browser
   - `assertTitleTextWithRetry`, `assertEmailInputValueWithRetry`, `assertGenderSelectValue` for widget
   - `assertUserExistWithRetry`, `assertServiceLevelWithRetry`, `assertWorkflowsCreatedWithRetry` for TAO
3. **getters** - methods that return any data required for further test logic. The only async methods across all tests.
   - `getText`, `getInputValue`, `getCssClass`, `getIsSelected` for browser
   - `getTitleText`, `getInputEmailText`, `getIsExplorerItemVisible` for widget
   - `getApplicationSettings`, `getUserSettings`, `getServiceLevel` for TAO
4. **utils** - other system methods. Exist only in the browser object:
   - `retry`,
   - `dispatchEvent`,
   - `execute`

Getters are the only async methods in the browser object. They should be called only inside Widgets/TAO.
Do not expose the async nature of these methods to step definitions (there should be no `then` inside step definitions).

### Suggestions

- Try using getters as little as possible and use assertions instead:

```js
// Wrong:
widget.browser.retry(() => {
  return widget.browser.getElementText(selector).then((elementText) => {
    return elementText === "expected text";
  })
});

// This is much better: 
widget.browser.assertText(selector, "expected text");
```

- Don't use `browser.retry` inside step definitions. It should be encapsulated with methods `assertAndRetry`:

```js
// wrong
window.browser.retry(() => {
  return tao.isSomethingOnTheServerSide().then((isReady) => {
    return Boolean(isReady);
  })
});

// correct:

/**
 * somewhere in TAO:
 */
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

- Do not use `then` in step definitions. Move such code inside a widget or tao:

```js
// Not good, this has to be inside widget method
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

// Better
widget.assertElementExistingWithRetry();
```

- Do not use Xpath for new steps as it is not supported by Cypress natively and was added from the plugin only for supporting old test steps

- Do not mix TAO and Widgets in the same step definition

- Put step definitions using TAO in the corresponding subfolder. By default, we assume that they use widgets only

- Widgets can use other widgets or TAO. But TAO can't use widgets
