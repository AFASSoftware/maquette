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
   * Navigate to the TodoMVC application
   */
  async goto() {
    await this.page.goto("/examples/todomvc/index.html");
    // Wait for the app to be ready
    await this.newTodoInput.waitFor();
  }

  /**
   * Clear localStorage to reset application state
   */
  async clearStorage() {
    await this.page.evaluate(() => {
      window.localStorage.setItem("todomvc-maquette", "");
    });
  }

  /**
   * Add a new todo item
   */
  async addTodo(text: string) {
    await this.newTodoInput.fill(text);
    await this.newTodoInput.press("Enter");
    // Wait for the UI to update
    await this.page.waitForTimeout(50);
  }

  /**
   * Add multiple todo items
   */
  async addTodos(...texts: string[]) {
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
  async toggleTodoAt(index: number) {
    await this.todoItems.nth(index).locator(".toggle").click();
    await this.page.waitForTimeout(50);
  }

  /**
   * Double-click a todo item to edit it
   */
  async doubleClickTodoAt(index: number) {
    await this.todoItems.nth(index).locator("label").dblclick();
    await this.page.waitForTimeout(50);
  }

  /**
   * Edit the currently focused todo item
   */
  async editTodo(text: string, options?: { submit?: "enter" | "escape" | "blur" }) {
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
    await this.page.waitForTimeout(50);
  }

  /**
   * Click the "Mark all as completed" checkbox
   */
  async toggleAll_click() {
    await this.toggleAll.click();
    await this.page.waitForTimeout(50);
  }

  /**
   * Click the "Clear completed" button
   */
  async clickClearCompleted() {
    await this.clearCompletedButton.click();
    await this.page.waitForTimeout(50);
  }

  /**
   * Filter by "All" items
   */
  async filterAll() {
    await this.filterLinks.nth(0).click();
    await this.page.waitForTimeout(50);
  }

  /**
   * Filter by "Active" items
   */
  async filterActive() {
    await this.filterLinks.nth(1).click();
    await this.page.waitForTimeout(50);
  }

  /**
   * Filter by "Completed" items
   */
  async filterCompleted() {
    await this.filterLinks.nth(2).click();
    await this.page.waitForTimeout(50);
  }

  /**
   * Go back in browser history
   */
  async goBack() {
    await this.page.goBack();
    await this.page.waitForTimeout(50);
  }

  // ==================== Assertions ====================

  /**
   * Assert the new todo input is focused
   */
  async assertInputFocused() {
    await expect(this.newTodoInput).toBeFocused();
  }

  /**
   * Assert the todo items match the expected texts
   */
  async assertTodos(expected: string[]) {
    await expect(this.todoItems.locator("label")).toHaveText(expected);
  }

  /**
   * Assert the new todo input is empty
   */
  async assertInputEmpty() {
    await expect(this.newTodoInput).toHaveValue("");
  }

  /**
   * Assert the main section visibility
   */
  async assertMainSectionVisible(visible: boolean) {
    if (visible) {
      await expect(this.mainSection).toBeVisible();
    } else {
      await expect(this.mainSection).toBeHidden();
    }
  }

  /**
   * Assert the footer visibility
   */
  async assertFooterVisible(visible: boolean) {
    if (visible) {
      await expect(this.footer).toBeVisible();
    } else {
      await expect(this.footer).toBeHidden();
    }
  }

  /**
   * Assert which items are completed
   */
  async assertCompletedStates(expectedStates: boolean[]) {
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
  async assertToggleAllChecked(checked: boolean) {
    if (checked) {
      await expect(this.toggleAll).toBeChecked();
    } else {
      await expect(this.toggleAll).not.toBeChecked();
    }
  }

  /**
   * Assert the todo count text
   */
  async assertTodoCount(expected: string) {
    await expect(this.todoCount).toHaveText(expected);
  }

  /**
   * Assert the clear completed button text
   */
  async assertClearCompletedText(expected: string) {
    await expect(this.clearCompletedButton).toHaveText(expected);
  }

  /**
   * Assert the clear completed button visibility
   */
  async assertClearCompletedVisible(visible: boolean) {
    if (visible) {
      await expect(this.clearCompletedButton).toBeVisible();
    } else {
      await expect(this.clearCompletedButton).toBeHidden();
    }
  }

  /**
   * Assert which filter is currently selected
   */
  async assertFilterSelected(index: number) {
    await expect(this.filterLinks.nth(index)).toHaveClass("selected");
  }

  /**
   * Assert the toggle checkbox is hidden for item at index (during editing)
   */
  async assertItemToggleHidden(index: number) {
    await expect(this.todoItems.nth(index).locator(".toggle")).toBeHidden();
  }

  /**
   * Assert the label is hidden for item at index (during editing)
   */
  async assertItemLabelHidden(index: number) {
    await expect(this.todoItems.nth(index).locator("label")).toBeHidden();
  }
}
