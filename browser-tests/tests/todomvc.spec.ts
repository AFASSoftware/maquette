import { test } from "@playwright/test";
import { TodoPage } from "./TodoPage";

// Standard test items
const TODO_ITEM_ONE = "buy some cheese";
const TODO_ITEM_TWO = "feed the cat";
const TODO_ITEM_THREE = "book a doctors appointment";

test.describe("TodoMVC - Maquette", () => {
  let todoPage: TodoPage;

  test.beforeEach(async ({ page }) => {
    todoPage = new TodoPage(page);
    await todoPage.goto();
  });

  test.afterEach(async () => {
    await todoPage.clearStorage();
  });

  test.describe("Initial State", () => {
    test("should focus on the todo input field", async () => {
      await todoPage.assertInputFocused();
    });
  });

  test.describe("No Todos", () => {
    test("should hide #main and #footer when there are no todos", async () => {
      await todoPage.assertTodos([]);
      await todoPage.assertMainSectionVisible(false);
      await todoPage.assertFooterVisible(false);
    });
  });

  test.describe("New Todo", () => {
    test("should allow me to add todo items", async () => {
      await todoPage.addTodo(TODO_ITEM_ONE);
      await todoPage.assertTodos([TODO_ITEM_ONE]);

      await todoPage.addTodo(TODO_ITEM_TWO);
      await todoPage.assertTodos([TODO_ITEM_ONE, TODO_ITEM_TWO]);
    });

    test("should clear text input field when an item is added", async () => {
      await todoPage.addTodo(TODO_ITEM_ONE);
      await todoPage.assertInputEmpty();
    });

    test("should append new items to the bottom of the list", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);
      await todoPage.assertTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    });

    test("should trim text input", async () => {
      await todoPage.addTodo(`   ${TODO_ITEM_ONE}  `);
      await todoPage.assertTodos([TODO_ITEM_ONE]);
    });

    test("should show #main and #footer when items added", async () => {
      await todoPage.addTodo(TODO_ITEM_ONE);
      await todoPage.assertMainSectionVisible(true);
      await todoPage.assertFooterVisible(true);
    });
  });

  test.describe("Mark all as completed", () => {
    test("should allow me to mark all items as completed", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);
      await todoPage.toggleAll_click();
      await todoPage.assertCompletedStates([true, true, true]);
    });

    test("should allow me to clear the completion state of all items", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);
      await todoPage.toggleAll_click();
      await todoPage.assertCompletedStates([true, true, true]);

      await todoPage.toggleAll_click();
      await todoPage.assertCompletedStates([false, false, false]);
    });

    test("complete all checkbox should update state when items are completed/cleared", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      await todoPage.toggleAll_click();
      await todoPage.assertToggleAllChecked(true);

      // Uncheck first item
      await todoPage.toggleTodoAt(0);
      await todoPage.assertToggleAllChecked(false);

      // Check first item again
      await todoPage.toggleTodoAt(0);
      await todoPage.assertToggleAllChecked(true);
    });
  });

  test.describe("Item", () => {
    test("should allow me to mark items as complete", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO);

      await todoPage.toggleTodoAt(0);
      await todoPage.assertCompletedStates([true, false]);

      await todoPage.toggleTodoAt(1);
      await todoPage.assertCompletedStates([true, true]);
    });

    test("should allow me to un-mark items as complete", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO);

      await todoPage.toggleTodoAt(0);
      await todoPage.assertCompletedStates([true, false]);

      await todoPage.toggleTodoAt(0);
      await todoPage.assertCompletedStates([false, false]);
    });

    test("should allow me to edit an item", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      await todoPage.doubleClickTodoAt(1);
      await todoPage.editTodo("buy some sausages", { submit: "enter" });

      await todoPage.assertTodos([TODO_ITEM_ONE, "buy some sausages", TODO_ITEM_THREE]);
    });
  });

  test.describe("Editing", () => {
    test("should hide other controls when editing", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      await todoPage.doubleClickTodoAt(1);

      await todoPage.assertItemToggleHidden(1);
      await todoPage.assertItemLabelHidden(1);
    });

    test("should save edits on enter", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      await todoPage.doubleClickTodoAt(1);
      await todoPage.editTodo("buy some sausages", { submit: "enter" });

      await todoPage.assertTodos([TODO_ITEM_ONE, "buy some sausages", TODO_ITEM_THREE]);
    });

    test("should save edits on blur", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      await todoPage.doubleClickTodoAt(1);
      await todoPage.editTodo("buy some sausages", { submit: "blur" });

      await todoPage.assertTodos([TODO_ITEM_ONE, "buy some sausages", TODO_ITEM_THREE]);
    });

    test("should trim entered text", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      await todoPage.doubleClickTodoAt(1);
      await todoPage.editTodo("    buy some sausages  ", { submit: "enter" });

      await todoPage.assertTodos([TODO_ITEM_ONE, "buy some sausages", TODO_ITEM_THREE]);
    });

    test("should remove the item if an empty text string was entered", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      await todoPage.doubleClickTodoAt(1);
      await todoPage.editTodo(" ", { submit: "enter" });

      await todoPage.assertTodos([TODO_ITEM_ONE, TODO_ITEM_THREE]);
    });

    test("should cancel edits on escape", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      await todoPage.doubleClickTodoAt(1);
      await todoPage.editTodo("foo", { submit: "escape" });

      await todoPage.assertTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    });
  });

  test.describe("Counter", () => {
    test("should display the current number of todo items", async () => {
      await todoPage.addTodo(TODO_ITEM_ONE);
      await todoPage.assertTodoCount("1 item left");

      await todoPage.addTodo(TODO_ITEM_TWO);
      await todoPage.assertTodoCount("2 items left");
    });
  });

  test.describe("Clear completed button", () => {
    test("should display the number of completed items", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      await todoPage.toggleTodoAt(1);
      await todoPage.assertClearCompletedText("Clear completed (1)");

      await todoPage.toggleTodoAt(2);
      await todoPage.assertClearCompletedText("Clear completed (2)");
    });

    test("should remove completed items when clicked", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      await todoPage.toggleTodoAt(1);
      await todoPage.clickClearCompleted();

      await todoPage.assertTodos([TODO_ITEM_ONE, TODO_ITEM_THREE]);
    });

    test("should be hidden when there are no completed items", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      await todoPage.toggleTodoAt(1);
      await todoPage.assertClearCompletedVisible(true);

      await todoPage.clickClearCompleted();
      await todoPage.assertClearCompletedVisible(false);
    });
  });

  test.describe("Routing", () => {
    test("should allow me to display active items", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      await todoPage.toggleTodoAt(1);
      await todoPage.filterActive();

      await todoPage.assertTodos([TODO_ITEM_ONE, TODO_ITEM_THREE]);
    });

    test("should respect the back button", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      await todoPage.toggleTodoAt(1);
      await todoPage.filterActive();
      await todoPage.filterCompleted();
      await todoPage.assertTodos([TODO_ITEM_TWO]);

      await todoPage.goBack();
      await todoPage.assertTodos([TODO_ITEM_ONE, TODO_ITEM_THREE]);

      await todoPage.goBack();
      await todoPage.assertTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    });

    test("should allow me to display completed items", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      await todoPage.toggleTodoAt(1);
      await todoPage.filterCompleted();

      await todoPage.assertTodos([TODO_ITEM_TWO]);
    });

    test("should allow me to display all items", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      await todoPage.toggleTodoAt(1);
      await todoPage.filterActive();
      await todoPage.filterCompleted();
      await todoPage.filterAll();

      await todoPage.assertTodos([TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE]);
    });

    test("should highlight the currently applied filter", async () => {
      await todoPage.addTodos(TODO_ITEM_ONE, TODO_ITEM_TWO, TODO_ITEM_THREE);

      // Initially 'All' should be selected
      await todoPage.assertFilterSelected(0);

      await todoPage.filterActive();
      await todoPage.assertFilterSelected(1);

      await todoPage.filterCompleted();
      await todoPage.assertFilterSelected(2);
    });
  });
});
