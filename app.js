// 待辦清單資料的儲存鍵名稱
const STORAGE_KEY = 'todo-list-items';

// 取得 DOM 元素
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const remainingCount = document.getElementById('remainingCount');

// 預設初始資料，若 localStorage 沒有資料則使用空陣列
let todos = loadTodos();

// 載入資料：從 localStorage 讀取待辦清單
function loadTodos() {
  const savedTodos = localStorage.getItem(STORAGE_KEY);

  if (!savedTodos) {
    return [];
  }

  try {
    return JSON.parse(savedTodos);
  } catch (error) {
    console.error('讀取待辦資料失敗：', error);
    return [];
  }
}

// 儲存資料：將待辦清單寫回 localStorage
function saveTodos() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
}

// 計算未完成項目數量，並更新底部顯示文字
function updateRemainingCount() {
  const remaining = todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `未完成: ${remaining} 項`;
}

// 渲染待辦列表
function renderTodos() {
  todoList.innerHTML = '';

  if (todos.length === 0) {
    const emptyState = document.createElement('li');
    emptyState.className = 'empty-state';
    emptyState.textContent = '還沒有任何待辦事項,新增一個吧!';
    todoList.appendChild(emptyState);
    updateRemainingCount();
    return;
  }

  todos.forEach((todo) => {
    const item = document.createElement('li');
    item.className = `todo-item ${todo.completed ? 'completed' : ''}`;

    const main = document.createElement('div');
    main.className = 'todo-item-main';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = todo.completed;
    checkbox.setAttribute('aria-label', `標記待辦 ${todo.text} 為完成`);
    checkbox.addEventListener('change', () => toggleTodo(todo.id));

    const text = document.createElement('span');
    text.className = 'todo-text';
    text.textContent = todo.text;

    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.className = 'delete-btn';
    deleteBtn.textContent = '刪除';
    deleteBtn.setAttribute('aria-label', `刪除待辦 ${todo.text}`);
    deleteBtn.addEventListener('click', () => deleteTodo(todo.id));

    main.appendChild(checkbox);
    main.appendChild(text);
    item.appendChild(main);
    item.appendChild(deleteBtn);
    todoList.appendChild(item);
  });

  updateRemainingCount();
}

// 新增待辦事項
function addTodo() {
  const value = todoInput.value.trim();

  if (!value) {
    todoInput.focus();
    return;
  }

  todos.unshift({
    id: Date.now(),
    text: value,
    completed: false,
  });

  todoInput.value = '';
  saveTodos();
  renderTodos();
  todoInput.focus();
}

// 切換完成狀態
function toggleTodo(id) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, completed: !todo.completed };
    }
    return todo;
  });

  saveTodos();
  renderTodos();
}

// 刪除指定待辦
function deleteTodo(id) {
  todos = todos.filter((todo) => todo.id !== id);
  saveTodos();
  renderTodos();
}

// 監聽新增按鈕與 Enter 鍵
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addTodo();
  }
});

// 初始化頁面
renderTodos();
