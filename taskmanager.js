const tasks = [];
let currentEditId = null;
let currentColumnId = "todo";

const taskCounter = document.getElementById("taskCounter");
const taskModal = document.getElementById("taskModal");
const taskTitle = document.getElementById("taskTitle");
const taskDescription = document.getElementById("taskDescription");
const taskPriority = document.getElementById("taskPriority");
const taskDueDate = document.getElementById("taskDueDate");
const saveTaskBtn = document.getElementById("saveTaskBtn");
const cancelTaskBtn = document.getElementById("cancelTaskBtn");

const priorityFilter = document.getElementById("priorityFilter");
const searchTask = document.getElementById("searchTask");
const todoList = document.getElementById("todoList");
const inprogressList = document.getElementById("inprogressList");
const doneList = document.getElementById("doneList");
const addTaskButtons = document.querySelectorAll(".addTaskBtn");
const clearDoneBtn = document.getElementById("clearDoneBtn");

function updateTaskCounter() {
  taskCounter.textContent = tasks.length + " Tasks";
}

function clearModalFields() {
  taskTitle.value = "";
  taskDescription.value = "";
  taskPriority.value = "high";
  taskDueDate.value = "";
}

function getTaskById(taskId) {
  return tasks.find(function (task) {
    return task.id === taskId;
  });
}

function createTaskCard(taskObj) {
  const li = document.createElement("li");
  li.setAttribute("data-id", taskObj.id);
  li.classList.add("task-card");

  const title = document.createElement("h3");
  title.textContent = taskObj.title;
  title.classList.add("task-title");

  const description = document.createElement("p");
  description.textContent = taskObj.description;

  const priorityBadge = document.createElement("span");
  priorityBadge.textContent = taskObj.priority;
  priorityBadge.classList.add("priority-badge");
  priorityBadge.classList.add(taskObj.priority.toLowerCase());

  const dueDate = document.createElement("p");
  dueDate.textContent = taskObj.dueDate ? "Due: " + taskObj.dueDate : "";

  const editBtn = document.createElement("button");
  editBtn.textContent = "Edit";
  editBtn.classList.add("edit-btn");
  editBtn.setAttribute("data-action", "edit");
  editBtn.setAttribute("data-id", taskObj.id);

  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "Delete";
  deleteBtn.classList.add("delete-btn");
  deleteBtn.setAttribute("data-action", "delete");
  deleteBtn.setAttribute("data-id", taskObj.id);

  li.appendChild(title);
  li.appendChild(description);
  li.appendChild(priorityBadge);
  li.appendChild(dueDate);
  li.appendChild(editBtn);
  li.appendChild(deleteBtn);

  return li;
}

function updateEmptyMessages() {
  const columns = ["todo", "inprogress", "done"];
  columns.forEach(function (col) {
    const list = document.getElementById(col + "List");
    const section = document.getElementById(col);
    const emptyMsg = section.querySelector(".empty-message");
    if (!emptyMsg) return;
    const visibleCards = list.querySelectorAll(".task-card:not(.is-hidden)");
    emptyMsg.style.display = visibleCards.length === 0 ? "block" : "none";
  });
}

function addTask(columnId, taskObj) {
  tasks.push(taskObj);
  const columnList = document.getElementById(columnId + "List");
  const card = createTaskCard(taskObj);
  columnList.appendChild(card);
  updateTaskCounter();
  applyFilters();
}

function deleteTask(taskId) {
  const taskIndex = tasks.findIndex(function (task) {
    return task.id === taskId;
  });

  if (taskIndex === -1) return;

  const taskCard = document.querySelector('.task-card[data-id="' + taskId + '"]');

  if (taskCard) {
    taskCard.classList.add("fade-out");
    taskCard.addEventListener("animationend", function () {
      taskCard.remove();
      updateEmptyMessages();
    }, { once: true });
  }

  tasks.splice(taskIndex, 1);
  updateTaskCounter();
}

function editTask(taskId) {
  const task = getTaskById(taskId);
  if (!task) return;

  currentEditId = taskId;
  taskTitle.value = task.title;
  taskDescription.value = task.description;
  taskPriority.value = task.priority.toLowerCase();
  taskDueDate.value = task.dueDate;
  taskModal.hidden = false;
}

function updateTask(taskId, updatedData) {
  const task = getTaskById(taskId);
  if (!task) return;

  task.title = updatedData.title;
  task.description = updatedData.description;
  task.priority = updatedData.priority;
  task.dueDate = updatedData.dueDate;

  const oldCard = document.querySelector('.task-card[data-id="' + taskId + '"]');
  if (!oldCard) return;

  const parentList = oldCard.parentElement;
  const newCard = createTaskCard(task);
  parentList.replaceChild(newCard, oldCard);
  applyFilters();
}

function openAddModal(columnId) {
  currentEditId = null;
  currentColumnId = columnId;
  clearModalFields();
  taskModal.hidden = false;
}

function handleListClick(event) {
  const action = event.target.getAttribute("data-action");
  const idStr = event.target.getAttribute("data-id");
  if (!action || !idStr) return;

  const taskId = parseInt(idStr, 10);
  if (action === "edit") editTask(taskId);
  if (action === "delete") deleteTask(taskId);
}

function enableInlineEdit(taskId, titleElement) {
  const task = getTaskById(taskId);
  if (!task) return;

  const input = document.createElement("input");
  input.setAttribute("type", "text");
  input.value = task.title;

  function saveInlineEdit() {
    const newTitle = input.value.trim();
    if (newTitle === "") {
      const restoredTitle = document.createElement("h3");
      restoredTitle.textContent = task.title;
      restoredTitle.classList.add("task-title");
      input.replaceWith(restoredTitle);
      return;
    }
    updateTask(taskId, {
      title: newTitle,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate
    });
  }

  input.addEventListener("keydown", function (event) {
    if (event.key === "Enter") saveInlineEdit();
  });

  input.addEventListener("blur", function () {
    saveInlineEdit();
  });

  titleElement.replaceWith(input);
  input.focus();
}

function handleTitleDoubleClick(event) {
  if (!event.target.classList.contains("task-title")) return;
  const card = event.target.closest(".task-card");
  if (!card) return;
  const taskId = parseInt(card.getAttribute("data-id"), 10);
  enableInlineEdit(taskId, event.target);
}

function applyFilters() {
  const selectedPriority = priorityFilter.value;
  const searchQuery = searchTask.value.trim().toLowerCase();
  const cards = document.querySelectorAll(".task-card");

  cards.forEach(function (card) {
    const taskId = parseInt(card.getAttribute("data-id"), 10);
    const task = getTaskById(taskId);
    if (!task) return;

    const priorityMatch =
      selectedPriority === "all" ||
      task.priority.toLowerCase() === selectedPriority.toLowerCase();

    const searchMatch =
      searchQuery === "" ||
      task.title.toLowerCase().includes(searchQuery) ||
      task.description.toLowerCase().includes(searchQuery);

    card.classList.toggle("is-hidden", !(priorityMatch && searchMatch));
  });

  updateEmptyMessages();
}

function clearDoneColumn() {
  const doneCards = doneList.querySelectorAll(".task-card");
  doneCards.forEach(function (card, index) {
    setTimeout(function () {
      const taskId = parseInt(card.getAttribute("data-id"), 10);
      deleteTask(taskId);
    }, index * 100);
  });
}

// Event listeners
todoList.addEventListener("click", handleListClick);
inprogressList.addEventListener("click", handleListClick);
doneList.addEventListener("click", handleListClick);

todoList.addEventListener("dblclick", handleTitleDoubleClick);
inprogressList.addEventListener("dblclick", handleTitleDoubleClick);
doneList.addEventListener("dblclick", handleTitleDoubleClick);

addTaskButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const columnId = button.getAttribute("data-column");
    openAddModal(columnId);
  });
});

priorityFilter.addEventListener("change", function () {
  applyFilters();
});

searchTask.addEventListener("input", function () {
  applyFilters();
});

if (clearDoneBtn) {
  clearDoneBtn.addEventListener("click", function () {
    clearDoneColumn();
  });
}

saveTaskBtn.addEventListener("click", function () {
  if (taskTitle.value.trim() === "") return;

  if (currentEditId === null) {
    const newTask = {
      id: Date.now(),
      title: taskTitle.value.trim(),
      description: taskDescription.value.trim(),
      priority: taskPriority.value,
      dueDate: taskDueDate.value
    };
    addTask(currentColumnId, newTask);
  } else {
    const updatedData = {
      title: taskTitle.value.trim(),
      description: taskDescription.value.trim(),
      priority: taskPriority.value,
      dueDate: taskDueDate.value
    };
    updateTask(currentEditId, updatedData);
  }

  taskModal.hidden = true;
  currentEditId = null;
  clearModalFields();
});

cancelTaskBtn.addEventListener("click", function () {
  taskModal.hidden = true;
  currentEditId = null;
  clearModalFields();
});