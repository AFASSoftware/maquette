import { type Locator, type Page, expect } from "@playwright/test";

/**
 * Page Object Model for the TodoMVC application.
 *
 * This class encapsulates all interactions with the TodoMVC page,
 * providing a clean API for tests to use without knowing about
 * the underlying DOM structure.
 */
export class TodoPage {
  // Main page element
  readonly page: Page;

  // Locators for various elements
  readonly newTodoInput: Locator;
  readonly todoList: Locator;
  readonly todoItems: Locator;
  readonly mainSection: Locator;
  readonly footer: Locator;
  readonly toggleAll: Locator;
  readonly todoCount: Locator;
  readonly clearCompletedButton: Locator;
  readonly filterLinks: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodoInput = page.locator("#new-todo");
    this.todoList = page.locator("#todo-list");
    this.todoItems = page.locator("#todo-list li");
    this.mainSection = page.locator("#main");
    this.footer = page.locator("#footer");
    this.toggleAll = page.locator("#toggle-all");
    this.todoCount = page.locator("#todo-count");
    this.clearCompletedButton = page.locator("#clear-completed");
    this.filterLinks = page.locator("#filters a");
  }

  /**
   * Wait for one animation frame to allow maquette to render
   */
  async waitForAnimationFrame(): Promise<void> {
    await this.page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)))
    );
  }

  /**
   * Navigate to the TodoMVC application
   */
  async goto(): Promise<void> {
    await this.page.goto("/examples/todomvc/index.html");
    // Clear any existing data and reload for a fresh state
    await this.page.evaluate(() => {
      window.localStorage.removeItem("todomvc-maquette");
    });
    await this.page.reload();
    // Wait for the app to be ready
    await this.newTodoInput.waitFor();
  }

  /**
   * Clear localStorage to reset application state
   */
  async clearStorage(): Promise<void> {
    await this.page.evaluate(() => {
      window.localStorage.setItem("todomvc-maquette", "");
    });
  }

  /**
   * Add a new todo item
   */
  async addTodo(text: string): Promise<void> {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press("Enter");
    // Wait for maquette to render
    await this.waitForAnimationFrame();
  }

  /**
   * Add multiple todo items
   */
  async addTodos(...texts: string[]): Promise<void> {
    for (const text of texts) {
      await this.addTodo(text);
    }
  }

  /**
   * Get all todo item texts
   */
  async getTodoTexts(): Promise<string[]> {
    return this.todoItems.locator("label").allTextContents();
  }

  /**
   * Toggle a todo item at the given index
   */
  async toggleTodoAt(index: number): Promise<void> {
    await this.todoItems.nth(index).locator(".toggle").click();
    // Wait for maquette to render
    await this.waitForAnimationFrame();
  }

  /**
   * Double-click a todo item to edit it
   */
  async doubleClickTodoAt(index: number): Promise<void> {
    await this.todoItems.nth(index).locator("label").dblclick();
    // Wait for maquette to render
    await this.waitForAnimationFrame();
  }

  /**
   * Edit the currently focused todo item
   */
  async editTodo(text: string, options?: { submit?: "enter" | "escape" | "blur" }): Promise<void> {
    const editInput = this.todoList.locator("input.edit");
    await editInput.clear();
    await editInput.fill(text);

    const submit = options?.submit ?? "enter";
    if (submit === "enter") {
      await editInput.press("Enter");
    } else if (submit === "escape") {
      await editInput.press("Escape");
    } else if (submit === "blur") {
      // Click somewhere else to blur
      await this.toggleAll.focus();
    }
    // Wait for maquette to render
    await this.waitForAnimationFrame();
  }

  /**
   * Click the "Mark all as completed" checkbox
   */
  async toggleAll_click(): Promise<void> {
    await this.toggleAll.click();
    // Wait for maquette to render
    await this.waitForAnimationFrame();
  }

  /**
   * Click the "Clear completed" button
   */
  async clickClearCompleted(): Promise<void> {
    await this.clearCompletedButton.click();
    // Wait for maquette to render
    await this.waitForAnimationFrame();
  }

  /**
   * Filter by "All" items
   */
  async filterAll(): Promise<void> {
    await this.filterLinks.nth(0).click();
    // Wait for maquette to render
    await this.waitForAnimationFrame();
  }

  /**
   * Filter by "Active" items
   */
  async filterActive(): Promise<void> {
    await this.filterLinks.nth(1).click();
    // Wait for maquette to render
    await this.waitForAnimationFrame();
  }

  /**
   * Filter by "Completed" items
   */
  async filterCompleted(): Promise<void> {
    await this.filterLinks.nth(2).click();
    // Wait for maquette to render
    await this.waitForAnimationFrame();
  }

  /**
   * Go back in browser history
   */
  async goBack(): Promise<void> {
    await this.page.goBack();
    // Wait for maquette to render after navigation
    await this.waitForAnimationFrame();
  }

  // ==================== Assertions ====================

  /**
   * Assert the new todo input is focused
   */
  async assertInputFocused(): Promise<void> {
    await expect(this.newTodoInput).toBeFocused();
  }

  /**
   * Assert the todo items match the expected texts
   */
  async assertTodos(expected: string[]): Promise<void> {
    await expect(this.todoItems.locator("label")).toHaveText(expected);
  }

  /**
   * Assert the new todo input is empty
   */
  async assertInputEmpty(): Promise<void> {
    await expect(this.newTodoInput).toHaveValue("");
  }

  /**
   * Assert the main section visibility
   */
  async assertMainSectionVisible(visible: boolean): Promise<void> {
    if (visible) {
      await expect(this.mainSection).toBeVisible();
    } else {
      await expect(this.mainSection).toBeHidden();
    }
  }

  /**
   * Assert the footer visibility
   */
  async assertFooterVisible(visible: boolean): Promise<void> {
    if (visible) {
      await expect(this.footer).toBeVisible();
    } else {
      await expect(this.footer).toBeHidden();
    }
  }

  /**
   * Assert which items are completed
   */
  async assertCompletedStates(expectedStates: boolean[]): Promise<void> {
    const count = await this.todoItems.count();
    expect(count).toBe(expectedStates.length);

    for (let i = 0; i < expectedStates.length; i++) {
      const item = this.todoItems.nth(i);
      if (expectedStates[i]) {
        await expect(item).toHaveClass(/completed/);
      } else {
        await expect(item).not.toHaveClass(/completed/);
      }
    }
  }

  /**
   * Assert the "mark all" checkbox is checked
   */
  async assertToggleAllChecked(checked: boolean): Promise<void> {
    if (checked) {
      await expect(this.toggleAll).toBeChecked();
    } else {
      await expect(this.toggleAll).not.toBeChecked();
    }
  }

  /**
   * Assert the todo count text
   */
  async assertTodoCount(expected: string): Promise<void> {
    await expect(this.todoCount).toHaveText(expected);
  }

  /**
   * Assert the clear completed button text
   */
  async assertClearCompletedText(expected: string): Promise<void> {
    await expect(this.clearCompletedButton).toHaveText(expected);
  }

  /**
   * Assert the clear completed button visibility
   */
  async assertClearCompletedVisible(visible: boolean): Promise<void> {
    if (visible) {
      await expect(this.clearCompletedButton).toBeVisible();
    } else {
      await expect(this.clearCompletedButton).toBeHidden();
    }
  }

  /**
   * Assert which filter is currently selected
   */
  async assertFilterSelected(index: number): Promise<void> {
    await expect(this.filterLinks.nth(index)).toHaveClass("selected");
  }

  /**
   * Assert the toggle checkbox is hidden for item at index (during editing)
   */
  async assertItemToggleHidden(index: number): Promise<void> {
    await expect(this.todoItems.nth(index).locator(".toggle")).toBeHidden();
  }

  /**
   * Assert the label is hidden for item at index (during editing)
   */
  async assertItemLabelHidden(index: number): Promise<void> {
    await expect(this.todoItems.nth(index).locator("label")).toBeHidden();
  }
}
