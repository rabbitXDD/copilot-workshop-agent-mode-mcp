// 待辦清單資料的儲存鍵名稱
const STORAGE_KEY = 'todo-list-items';
const THEME_STORAGE_KEY = 'todo-theme-preference';

// 取得 DOM 元素
const todoInput = document.getElementById('todoInput');
const addBtn = document.getElementById('addBtn');
const todoList = document.getElementById('todoList');
const remainingCount = document.getElementById('remainingCount');
const themeToggle = document.getElementById('themeToggle');
const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));

// 預設初始資料，若 localStorage 沒有資料則使用空陣列
let todos = loadTodos();
let currentFilter = 'all';

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

// 取得系統目前的深淺色偏好
function getSystemThemePreference() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// 取得使用者自訂的主題設定，若沒有則回傳 null
function getSavedThemePreference() {
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  return null;
}

// 更新主題按鈕文字與 icon
function updateThemeButton() {
  const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
  themeToggle.innerHTML = `
    <span class="theme-toggle-icon" aria-hidden="true">${isDarkMode ? '☀️' : '🌙'}</span>
    <span class="theme-toggle-label">${isDarkMode ? '淺色模式' : '深色模式'}</span>
  `;
  themeToggle.setAttribute(
    'aria-label',
    isDarkMode ? '切換到淺色模式' : '切換到深色模式'
  );
}

// 設定頁面主題，並更新資料屬性
function applyTheme(theme) {
  const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', normalizedTheme);
  updateThemeButton();
}

// 儲存使用者手動選擇的主題
function setThemePreference(theme) {
  const normalizedTheme = theme === 'dark' ? 'dark' : 'light';
  localStorage.setItem(THEME_STORAGE_KEY, normalizedTheme);
  applyTheme(normalizedTheme);
}

// 初始化主題：若沒有手動設定，則跟隨系統設定
function initializeTheme() {
  const savedTheme = getSavedThemePreference();
  const initialTheme = savedTheme || getSystemThemePreference();
  applyTheme(initialTheme);

  // 若使用者沒有手動設定，就同步系統主題變更
  const systemThemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleSystemThemeChange = () => {
    if (!getSavedThemePreference()) {
      applyTheme(getSystemThemePreference());
    }
  };

  if (typeof systemThemeQuery.addEventListener === 'function') {
    systemThemeQuery.addEventListener('change', handleSystemThemeChange);
  } else if (typeof systemThemeQuery.addListener === 'function') {
    systemThemeQuery.addListener(handleSystemThemeChange);
  }
}

// 切換主題並持久化到 localStorage
function toggleTheme() {
  const nextTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  setThemePreference(nextTheme);
}

// 依照目前過濾條件取得可顯示的待辦列表
function getVisibleTodos() {
  switch (currentFilter) {
    case 'active':
      return todos.filter((todo) => !todo.completed);
    case 'completed':
      return todos.filter((todo) => todo.completed);
    case 'all':
    default:
      return todos;
  }
}

// 取得空狀態提示文字
function getEmptyMessage() {
  switch (currentFilter) {
    case 'active':
      return '目前沒有未完成的待辦事項，項目只是被篩選條件過濾掉，並未刪除。';
    case 'completed':
      return '目前沒有已完成的待辦事項，項目只是被篩選條件過濾掉，並未刪除。';
    case 'all':
    default:
      return '還沒有任何待辦事項，新增一個吧！';
  }
}

// 更新篩選按鈕的選取狀態
function updateFilterButtons() {
  filterButtons.forEach((button) => {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });
}

// 計算未完成項目數量，並更新底部顯示文字
function updateRemainingCount() {
  const remaining = todos.filter((todo) => !todo.completed).length;
  remainingCount.textContent = `未完成: ${remaining} 項`;
}

// 渲染待辦列表
function renderTodos() {
  todoList.innerHTML = '';
  const visibleTodos = getVisibleTodos();

  if (visibleTodos.length === 0) {
    const emptyState = document.createElement('li');
    emptyState.className = 'empty-state';
    emptyState.textContent = getEmptyMessage();
    todoList.appendChild(emptyState);
    updateRemainingCount();
    return;
  }

  visibleTodos.forEach((todo) => {
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

// 監聽主題切換按鈕
themeToggle.addEventListener('click', toggleTheme);

// 監聽篩選按鈕
filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    currentFilter = button.dataset.filter;
    updateFilterButtons();
    renderTodos();
  });
});

// 監聽新增按鈕與 Enter 鍵
addBtn.addEventListener('click', addTodo);

todoInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    addTodo();
  }
});

// 初始化頁面
updateFilterButtons();
initializeTheme();
renderTodos();
