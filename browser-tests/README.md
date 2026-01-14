# Maquette Browser Tests

End-to-end browser tests for Maquette using [Playwright](https://playwright.dev/).

## Prerequisites

Before running the tests, make sure maquette is built and the TodoMVC example dependencies are installed:

```bash
# From the repository root
npm ci
npm run dist

# Install TodoMVC bower dependencies
cd examples/todomvc
npm install --no-save bower
npx bower install
cd ../..
```

## Setup

Install the test dependencies:

```bash
cd browser-tests
npm install
npx playwright install chromium
```

## Running Tests

### Run all tests (headless)

```bash
npm test
```

### Run tests with browser visible

```bash
npm run test:headed
```

### Debug tests interactively

```bash
npm run test:debug
```

### Run tests with Playwright UI

```bash
npm run test:ui
```

### View test report

```bash
npm run report
```

## Project Structure

```
browser-tests/
├── playwright.config.ts    # Playwright configuration
├── package.json            # Dependencies and scripts
├── tests/
│   ├── TodoPage.ts         # Page Object Model for TodoMVC
│   └── todomvc.spec.ts     # Test specifications
└── README.md               # This file
```

## Page Object Model

The tests use the [Page Object pattern](https://playwright.dev/docs/pom) to encapsulate page interactions. The `TodoPage` class in `tests/TodoPage.ts` provides a clean API for:

- **Navigation**: `goto()`, `goBack()`
- **Actions**: `addTodo()`, `toggleTodoAt()`, `doubleClickTodoAt()`, etc.
- **Assertions**: `assertTodos()`, `assertCompletedStates()`, etc.

## Configuration

The `playwright.config.ts` file configures:

- **Web server**: Automatically starts `http-server` on port 8080
- **Browser**: Chrome/Chromium by default
- **CI mode**: Detects CI environment and adjusts settings (retries, workers)
- **Reports**: HTML report locally, GitHub reporter on CI

## CI Integration

These tests run automatically on GitHub Actions as part of the `browser-tests` job. The workflow:

1. Builds maquette
2. Installs TodoMVC dependencies
3. Installs Playwright and Chromium
4. Runs the tests
5. Uploads the test report as an artifact

## Writing New Tests

1. Add page interactions to `TodoPage.ts` if needed
2. Write tests in `todomvc.spec.ts` or create new spec files
3. Use `test.describe()` to group related tests
4. Use the page object for all interactions and assertions

Example:

```typescript
test('should do something', async () => {
  await todoPage.addTodo('My todo');
  await todoPage.assertTodos(['My todo']);
});
```
