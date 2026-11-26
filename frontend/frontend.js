const columns = [
  { id: "new", title: "Новые идеи", color: "blue" },
  { id: "review", title: "На рассмотрении", color: "orange" },
  { id: "progress", title: "В работе", color: "purple" },
  { id: "done", title: "Внедрено", color: "green" }
];

const categories = {
  "5s": { label: "5S", color: "green" },
  savings: { label: "Экономия", color: "orange" },
  safety: { label: "Безопасность", color: "red" },
  quality: { label: "Качество", color: "blue" }
};

const departments = ["Цех №1", "Цех №2", "Склад", "ОТК", "Офис"];
const months = ["янв", "фев", "мар", "апр", "мая", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"];
const year = new Date().getFullYear();

const periods = [
  { id: `q4-${year}`, label: `Q4 ${year}`, long: `Q4 ${year} (октябрь-декабрь)` },
  { id: `q3-${year}`, label: `Q3 ${year}`, long: `Q3 ${year} (июль-сентябрь)` },
  { id: `y-${year}`, label: `${year} год`, long: `${year} год` },
  { id: "all", label: "Все время", long: "Все время" }
];

const state = {
  items: [],
  view: "board",
  filters: {
    department: "all",
    category: "all",
    period: periods[0].id,
    search: ""
  }
};

const $ = (selector, root = document) => root.querySelector(selector);

const escapeHtml = value =>
  String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));

const icons = {
  document: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  gear: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m8 12 3 3 5-6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  done: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m8 12 3 3 5-6" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  money: '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M8 20V4h5.5a4 4 0 0 1 0 8H8M6 16h8" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
};

function renderFilters() {
  const optionList = (items, current) =>
    items.map(([value, label]) =>
      `<option value="${escapeHtml(value)}"${value === current ? " selected" : ""}>${escapeHtml(label)}</option>`
    ).join("");

  $("#f-dept").innerHTML = optionList(
    [["all", "Все"], ...departments.map(item => [item, item])],
    state.filters.department
  );

  $("#f-cat").innerHTML = optionList(
    [["all", "Все"], ...Object.entries(categories).map(([key, item]) => [key, item.label])],
    state.filters.category
  );

  $("#f-period").innerHTML = optionList(
    periods.map(item => [item.id, item.label]),
    state.filters.period
  );

  const selectedPeriod = periods.find(item => item.id === state.filters.period);
  $("#period-chip-text").textContent = `Период: ${selectedPeriod.long}`;
}

function getVisibleItems() {
  const { department, category, search } = state.filters;
  const query = search.trim().toLowerCase();

  return state.items.filter(item => {
    const matchesDepartment = department === "all" || item.department === department;
    const matchesCategory = category === "all" || item.category === category;
    const matchesSearch = !query || [item.id, item.title, item.author, item.department]
      .some(value => String(value).toLowerCase().includes(query));

    return matchesDepartment && matchesCategory && matchesSearch;
  });
}

function renderKpis() {
  const items = getVisibleItems();
  const completed = items.filter(item => item.status === "done");

  const cards = [
    { color: "blue", icon: icons.document, value: items.length, label: "Всего предложений", delta: 0, period: "за месяц" },
    { color: "yellow", icon: icons.gear, value: items.filter(item => item.status === "progress").length, label: "На стадии внедрения", delta: 0, period: "за неделю" },
    { color: "green", icon: icons.done, value: completed.length, label: "Успешно завершено", delta: 0, period: "за месяц" },
    { color: "purple", icon: icons.money, value: 0, unit: "тыс. ₽", label: "Суммарная экономия", delta: 0, period: "тыс. ₽ за месяц" }
  ];

  $("#kpis").innerHTML = cards.map(card => `
    <article class="kpi">
      <span class="kpi__icon kpi__icon--${card.color}">${card.icon}</span>
      <div class="kpi__body">
        <div class="kpi__value"><b>${card.value}</b>${card.unit ? ` <span>${card.unit}</span>` : ""}</div>
        <div class="kpi__label">${card.label}</div>
        <div class="kpi__delta">+${card.delta} ${card.period}</div>
      </div>
    </article>
  `).join("");
}

function renderBoard() {
  const items = getVisibleItems();

  $("#view").innerHTML = `
    <div class="board">
      ${columns.map(column => {
        const columnItems = items.filter(item => item.status === column.id);

        return `
          <section class="col col--${column.color}" aria-label="${escapeHtml(column.title)}">
            <header class="col__head">
              <h2><i class="dot"></i>${escapeHtml(column.title)}:</h2>
              <span class="count">${columnItems.length}</span>
            </header>
            <div class="col__list">
              ${columnItems.length
                ? columnItems.map(renderCard).join("")
                : '<p class="empty">Нет предложений</p>'}
            </div>
            <button class="drop" type="button" data-action="add">
              <span class="plus">+</span> Добавить идею
            </button>
          </section>
        `;
      }).join("")}
    </div>
  `;

  if (!state.items.length) {
    $("#view").querySelectorAll(".drop").forEach(button => {
      button.addEventListener("click", openCreateModal);
    });
  }
}

function renderCard(item) {
  const category = categories[item.category] || categories["5s"];

  return `
    <article class="card card--${columns.find(column => column.id === item.status)?.color || "blue"}" data-id="${escapeHtml(item.id)}" tabindex="0">
      <div class="card__id">${escapeHtml(item.id)}</div>
      <h3 class="card__title">${escapeHtml(item.title)}</h3>
      <span class="tag tag--${category.color}">${escapeHtml(category.label)}</span>
      <div class="effect">
        <div class="effect__head"><span>ОЖИДАЕМЫЙ ЭФФЕКТ</span></div>
        <div class="effect__val"><b>${escapeHtml(item.effectValue)}</b> <i>${escapeHtml(item.effectNote)}</i></div>
      </div>
      <footer class="card__foot">
        <span class="avatar">${escapeHtml(item.authorInitials || "АИ")}</span>
        <span class="who"><b>${escapeHtml(item.author)}</b><small>${escapeHtml(item.position)}</small></span>
        <time class="date">${formatDate(item.createdAt)}</time>
      </footer>
    </article>
  `;
}

function renderList() {
  const items = getVisibleItems();

  $("#view").innerHTML = `
    <div class="table-wrap">
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Предложение</th>
            <th>Категория</th>
            <th>Статус</th>
            <th>Эффект</th>
            <th>Автор</th>
            <th>Дата</th>
          </tr>
        </thead>
        <tbody>
          ${items.length ? items.map(item => {
            const category = categories[item.category] || categories["5s"];
            const column = columns.find(value => value.id === item.status);

            return `
              <tr data-id="${escapeHtml(item.id)}" tabindex="0">
                <td class="mono">${escapeHtml(item.id)}</td>
                <td class="t-title">${escapeHtml(item.title)}</td>
                <td><span class="tag tag--${category.color}">${escapeHtml(category.label)}</span></td>
                <td><span class="status status--${column.color}"><i class="dot"></i>${escapeHtml(column.title)}</span></td>
                <td>${escapeHtml(item.effectValue)} <small>${escapeHtml(item.effectNote)}</small></td>
                <td>${escapeHtml(item.author)}<small class="block">${escapeHtml(item.department)}</small></td>
                <td>${formatDate(item.createdAt)}</td>
              </tr>
            `;
          }).join("") : '<tr><td colspan="7" class="empty">Нет предложений</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function render() {
  renderFilters();
  renderKpis();

  if (state.view === "board") {
    renderBoard();
  } else {
    renderList();
  }

  $("#v-board").classList.toggle("is-active", state.view === "board");
  $("#v-list").classList.toggle("is-active", state.view === "list");
  $("#v-board").setAttribute("aria-pressed", state.view === "board");
  $("#v-list").setAttribute("aria-pressed", state.view === "list");
}

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

function openCreateModal() {
  const departmentOptions = departments
    .map(department => `<option value="${escapeHtml(department)}">${escapeHtml(department)}</option>`)
    .join("");

  const categoryOptions = Object.entries(categories)
    .map(([key, value]) => `<option value="${key}">${escapeHtml(value.label)}</option>`)
    .join("");

  $("#modal-root").innerHTML = `
    <div class="overlay" data-close>
      <div class="modal" role="dialog" aria-modal="true" aria-labelledby="create-title">
        <form id="create-form">
          <header class="modal__head">
            <h2 id="create-title">Новое предложение</h2>
            <button type="button" class="icon-btn" data-close aria-label="Закрыть">✕</button>
          </header>

          <div class="modal__body grid2">
            <label class="span2">
              Название идеи *
              <input name="title" maxlength="140" required placeholder="Коротко: что улучшаем">
            </label>

            <label>
              Категория *
              <select name="category">${categoryOptions}</select>
            </label>

            <label>
              Отдел *
              <select name="department">${departmentOptions}</select>
            </label>

            <label class="span2">
              Текущая проблема *
              <textarea name="problem" rows="3" required placeholder="Что сейчас не так?"></textarea>
            </label>

            <label class="span2">
              Предлагаемое решение *
              <textarea name="solution" rows="3" required placeholder="Что предлагаете сделать?"></textarea>
            </label>

            <label>
              Ожидаемый эффект *
              <input name="effectValue" required placeholder="−15 мин">
            </label>

            <label>
              Пояснение к эффекту
              <input name="effectNote" placeholder="/смена на поиск">
            </label>

            <label>
              Автор *
              <input name="author" required placeholder="Имя Фамилия">
            </label>

            <label>
              Должность
              <input name="position" placeholder="Должность">
            </label>
          </div>

          <footer class="modal__foot">
            <button type="button" class="btn btn--ghost" data-close>Отмена</button>
            <button class="btn btn--primary" type="submit">Добавить предложение</button>
          </footer>
        </form>
      </div>
    </div>
  `;

  const form = $("#create-form");

  form.addEventListener("submit", event => {
    event.preventDefault();

    if (!form.reportValidity()) return;

    const data = Object.fromEntries(new FormData(form));

    state.items.unshift({
      id: `KZ-${year}-${String(state.items.length + 1).padStart(3, "0")}`,
      title: data.title.trim(),
      category: data.category,
      department: data.department,
      problem: data.problem.trim(),
      solution: data.solution.trim(),
      effectValue: data.effectValue.trim(),
      effectNote: data.effectNote.trim(),
      author: data.author.trim(),
      position: data.position.trim(),
      authorInitials: getInitials(data.author),
      status: "new",
      createdAt: new Date().toISOString()
    });

    closeModal();
    render();
    showToast("Предложение добавлено");
  });

  document.body.classList.add("no-scroll");
  $("input", form)?.focus();
}

function getInitials(name) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word => word[0]?.toUpperCase() || "")
    .join("");
}

function closeModal() {
  $("#modal-root").innerHTML = "";
  document.body.classList.remove("no-scroll");
}

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  $("#toasts").append(toast);
  setTimeout(() => toast.remove(), 3000);
}

$("#f-dept").addEventListener("change", event => {
  state.filters.department = event.target.value;
  render();
});

$("#f-cat").addEventListener("change", event => {
  state.filters.category = event.target.value;
  render();
});

$("#f-period").addEventListener("change", event => {
  state.filters.period = event.target.value;
  render();
});

$("#search").addEventListener("input", event => {
  state.filters.search = event.target.value;
  render();
});

$("#v-board").addEventListener("click", () => {
  state.view = "board";
  render();
});

$("#v-list").addEventListener("click", () => {
  state.view = "list";
  render();
});

$("#btn-new").addEventListener("click", openCreateModal);

document.addEventListener("click", event => {
  const closeButton = event.target.closest("[data-close]");

  if (closeButton) {
    closeModal();
    return;
  }

  const card = event.target.closest("[data-id]");

  if (card && !event.target.closest(".modal")) {
    showToast("Карточка готова к подключению");
  }
});

document.addEventListener("keydown", event => {
  if (event.key === "Escape" && $("#modal-root").firstChild) {
    closeModal();
  }
});

render();
