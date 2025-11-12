const storageKey = "spa-linen-tracker-v1";

const initialData = {
  linens: [
    {
      name: "Dark blue towels",
      plus: [10, 20, 10, 20],
      minus: [10, 5, 4],
    },
    {
      name: "Light blue towels",
      plus: [20, 20, 10],
      minus: [10, 8, 3],
    },
    {
      name: "Brown large towels",
      plus: [10, 10, 20],
      minus: [13, 12],
    },
    {
      name: "Brown medium towels",
      plus: [15, 8],
      minus: [4, 3],
    },
    {
      name: "Brown small towels",
      plus: [10, 4],
      minus: [5, 1],
    },
  ],
  transactions: [],
};

let store = loadState();

const linenTypeForm = document.querySelector("#linen-type-form");
const linenNameInput = document.querySelector("#linen-name");
const movementForm = document.querySelector("#movement-form");
const linenSelect = document.querySelector("#linen-select");
const movementAmountInput = document.querySelector("#movement-amount");
const summaryTableBody = document.querySelector("#summary-table tbody");
const summaryRowTemplate = document.querySelector("#summary-row-template");
const grandPlusCell = document.querySelector("#grand-plus");
const grandMinusCell = document.querySelector("#grand-minus");
const grandBalanceCell = document.querySelector("#grand-balance");
const resetButton = document.querySelector("#reset-day");
const printSummaryButton = document.querySelector("#print-summary");
const transactionsWrapper = document.querySelector("#transactions-wrapper");
const transactionsBody = document.querySelector("#transactions-table tbody");
const transactionsEmptyState = document.querySelector("#transactions-empty");
const transactionsTable = document.querySelector("#transactions-table");
const menuToggleButton = document.querySelector("[data-menu-toggle]");
const topNav = document.querySelector("[data-nav-panel]");
const toastStack = document.querySelector("#toast-stack");
const storageModal = document.querySelector("#storage-modal");
const storageModalDismiss = document.querySelector("#storage-modal-dismiss");
const storageNoticeKey = `${storageKey}-storage-notice`;
const linenList = document.querySelector("#linen-list");
const linenListEmpty = document.querySelector("#linen-list-empty");
const linenToggleButton = document.querySelector("#linen-toggle");
const linenToggleText = document.querySelector("#linen-toggle-text");
const linenToggleIcon = document.querySelector("#linen-toggle-icon");
const linenPanelBody = document.querySelector("#linen-panel-body");
const linenCountBadge = document.querySelector("#linen-count");

const toastVariants = {
  success: {
    dot: "bg-emerald-500",
    progress: "bg-emerald-500/80",
  },
  error: {
    dot: "bg-rose-500",
    progress: "bg-rose-500/80",
  },
  warning: {
    dot: "bg-amber-500",
    progress: "bg-amber-500/80",
  },
  info: {
    dot: "bg-brand-500",
    progress: "bg-brand-500/80",
  },
};

let linenPanelOpen = false;

function dismissToast(toast) {
  if (!toast) return;
  toast.classList.add("toast-leaving");
  window.setTimeout(() => {
    toast.remove();
  }, 180);
}

function showToast({ title, message, type = "info", duration = 4200 } = {}) {
  if (!toastStack) return;
  const variant = toastVariants[type] ?? toastVariants.info;

  const toast = document.createElement("div");
  toast.className =
    "toast pointer-events-auto border border-slate-200/70 bg-white/95 p-4 text-slate-900 shadow-2xl shadow-slate-900/10 ring-1 ring-white/40 backdrop-blur-lg";
  toast.setAttribute("role", "status");
  toast.setAttribute("aria-live", "polite");
  toast.style.setProperty("--toast-duration", `${duration}ms`);

  const contentWrapper = document.createElement("div");
  contentWrapper.className = "flex items-start gap-3";

  const dot = document.createElement("span");
  dot.className = `mt-2 inline-flex h-2.5 w-2.5 flex-none rounded-full ${variant.dot}`;
  contentWrapper.appendChild(dot);

  const textContainer = document.createElement("div");
  textContainer.className = "flex-1 space-y-1";

  if (title) {
    const titleEl = document.createElement("p");
    titleEl.className = "text-sm font-semibold text-slate-900";
    titleEl.textContent = title;
    textContainer.appendChild(titleEl);
  }

  if (message) {
    const messageEl = document.createElement("p");
    messageEl.className = "text-sm text-slate-600";
    messageEl.textContent = message;
    textContainer.appendChild(messageEl);
  }

  contentWrapper.appendChild(textContainer);

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className =
    "inline-flex h-8 w-8 flex-none items-center justify-center rounded-full text-slate-400 transition hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300";
  closeButton.innerHTML =
    '<span class="sr-only">Dismiss notification</span><svg viewBox="0 0 24 24" class="h-4 w-4" aria-hidden="true"><path fill="currentColor" d="M6.7 5.3a1 1 0 0 1 1.4 0L12 9.17l3.9-3.88a1 1 0 0 1 1.4 1.42L13.42 10.6l3.88 3.88a1 1 0 1 1-1.42 1.42L12 12.03l-3.88 3.87a1 1 0 0 1-1.42-1.41l3.88-3.88-3.88-3.88a1 1 0 0 1 0-1.42Z"/></svg>';
  closeButton.addEventListener("click", () => dismissToast(toast));
  contentWrapper.appendChild(closeButton);

  toast.appendChild(contentWrapper);

  const progress = document.createElement("div");
  progress.className = `toast-progress mt-3 rounded-full ${variant.progress}`;
  toast.appendChild(progress);

  toastStack.appendChild(toast);

  if (toastStack.children.length > 4) {
    const firstToast = toastStack.firstElementChild;
    if (firstToast && firstToast !== toast) {
      dismissToast(firstToast);
    }
  }

  window.setTimeout(() => {
    dismissToast(toast);
  }, duration);
}

function showStorageModalDialog() {
  if (!storageModal) return;
  storageModal.classList.remove("hidden");
  storageModal.classList.add("flex");
  storageModal.setAttribute("aria-hidden", "false");
  window.setTimeout(() => {
    storageModalDismiss?.focus({ preventScroll: true });
  }, 120);
}

function hideStorageModalDialog() {
  if (!storageModal) return;
  storageModal.classList.add("hidden");
  storageModal.classList.remove("flex");
  storageModal.setAttribute("aria-hidden", "true");
}

function acknowledgeStorageNotice() {
  const modalVisible =
    storageModal && !storageModal.classList.contains("hidden");
  localStorage.setItem(storageNoticeKey, "1");
  if (!modalVisible) {
    return;
  }
  hideStorageModalDialog();
  showToast({
    type: "info",
    title: "Reminder saved",
    message: "You can review this notice anytime from the footer.",
  });
}

function loadState() {
  const saved = localStorage.getItem(storageKey);
  if (!saved) {
    return structuredClone(initialData);
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed.linens)) {
      throw new Error("Invalid data");
    }
    if (!Array.isArray(parsed.transactions)) {
      parsed.transactions = [];
    }
    return parsed;
  } catch (err) {
    console.warn("Failed to parse stored data, resetting.", err);
    return structuredClone(initialData);
  }
}

function persistState() {
  localStorage.setItem(storageKey, JSON.stringify(store));
}

function createOption(name, index) {
  const option = document.createElement("option");
  option.value = index;
  option.textContent = name;
  return option;
}

function renderLinenOptions() {
  linenSelect.innerHTML = "";
  store.linens.forEach((linen, index) => {
    linenSelect.appendChild(createOption(linen.name, index));
  });

  const hasLinens = store.linens.length > 0;
  linenSelect.disabled = !hasLinens;
  movementAmountInput.disabled = !hasLinens;
  const movementRadios = movementForm.querySelectorAll('input[name="movement"]');
  movementRadios.forEach((radio) => {
    radio.disabled = !hasLinens;
  });
  movementForm.querySelector("button[type=submit]").disabled = !hasLinens;
}

function formatEntries(numbers, prefix) {
  if (!numbers.length) return "—";
  return numbers
    .map((value) => `${prefix}${value}`)
    .join(", ");
}

function sumTotal(numbers) {
  return numbers.reduce((acc, value) => acc + value, 0);
}

function recalculateLinensFromTransactions() {
  const linenLookup = new Map();
  store.linens.forEach((linen) => {
    linen.plus = [];
    linen.minus = [];
    linenLookup.set(linen.name, linen);
  });

  store.transactions.forEach((transaction) => {
    let linen = linenLookup.get(transaction.linenName);
    if (!linen) {
      linen = {
        name: transaction.linenName,
        plus: [],
        minus: [],
      };
      store.linens.push(linen);
      linenLookup.set(linen.name, linen);
    }
    const amount = Number.parseInt(transaction.amount, 10);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }
    if (transaction.movement === "add") {
      linen.plus.push(amount);
    } else if (transaction.movement === "remove") {
      linen.minus.push(amount);
    }
  });
}

function setLinenPanelOpen(open) {
  linenPanelOpen = open;
  if (!linenToggleButton || !linenPanelBody) return;

  linenToggleButton.setAttribute("aria-expanded", String(open));
  linenPanelBody.classList.toggle("hidden", !open);

  if (linenToggleText) {
    linenToggleText.textContent = open ? "Hide list" : "Show list";
  }
  if (linenToggleIcon) {
    linenToggleIcon.classList.toggle("rotate-180", open);
  }
}

function renderLinenList() {
  if (!linenList) return;

  linenList.innerHTML = "";
  const hasLinens = store.linens.length > 0;

  if (linenCountBadge) {
    linenCountBadge.textContent = String(store.linens.length);
  }

  linenList.classList.toggle("hidden", !hasLinens);
  if (linenListEmpty) {
    linenListEmpty.classList.toggle("hidden", hasLinens);
  }

  if (!hasLinens) {
    setLinenPanelOpen(false);
    return;
  }

  store.linens.forEach((linen, index) => {
    const plusTotal = sumTotal(linen.plus);
    const minusTotal = sumTotal(linen.minus);
    const balance = plusTotal - minusTotal;
    const balanceLabel =
      balance > 0 ? `+${balance}` : balance < 0 ? `${balance}` : "0";

    const item = document.createElement("li");
    item.className =
      "flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm";

    const info = document.createElement("div");
    info.className = "min-w-0 flex-1";

    const nameEl = document.createElement("p");
    nameEl.className = "truncate font-medium text-slate-900";
    nameEl.textContent = linen.name;

    const statsEl = document.createElement("p");
    statsEl.className = "text-xs text-slate-500";
    statsEl.textContent = `Deliveries ${plusTotal} · Collections ${minusTotal} · Balance ${balanceLabel}`;

    info.append(nameEl, statsEl);

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.dataset.action = "delete-linen";
    removeButton.dataset.index = String(index);
    removeButton.className =
      "inline-flex items-center gap-1 rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300";
    removeButton.textContent = "Remove";

    item.append(info, removeButton);
    linenList.appendChild(item);
  });
}

function renderTable() {
  summaryTableBody.innerHTML = "";

  let totalPlus = 0;
  let totalMinus = 0;

  store.linens.forEach((linen) => {
    const plusTotal = sumTotal(linen.plus);
    const minusTotal = sumTotal(linen.minus);
    totalPlus += plusTotal;
    totalMinus += minusTotal;

    const row = summaryRowTemplate.content.cloneNode(true);
    const nameCell = row.querySelector(".linen-name");
    const plusCell = row.querySelector(".plus-list");
    const minusCell = row.querySelector(".minus-list");
    const totalPlusCell = row.querySelector(".total-plus");
    const totalMinusCell = row.querySelector(".total-minus");
    const balanceCell = row.querySelector(".balance");

    nameCell.textContent = linen.name;
    plusCell.textContent = formatEntries(linen.plus, "+");
    minusCell.textContent = formatEntries(linen.minus, "-");
    totalPlusCell.textContent = plusTotal;
    totalMinusCell.textContent = minusTotal;
    const balance = plusTotal - minusTotal;
    balanceCell.textContent = balance;
    balanceCell.classList.remove(
      "text-emerald-600",
      "text-rose-600",
      "text-slate-900"
    );
    if (balance > 0) {
      balanceCell.classList.add("text-emerald-600");
    } else if (balance < 0) {
      balanceCell.classList.add("text-rose-600");
    } else {
      balanceCell.classList.add("text-slate-900");
    }

    summaryTableBody.appendChild(row);
  });

  grandPlusCell.textContent = totalPlus;
  grandMinusCell.textContent = totalMinus;
  const grandBalance = totalPlus - totalMinus;
  grandBalanceCell.textContent = grandBalance;
  grandBalanceCell.classList.remove(
    "text-emerald-600",
    "text-rose-600",
    "text-slate-900"
  );
  if (grandBalance > 0) {
    grandBalanceCell.classList.add("text-emerald-600");
  } else if (grandBalance < 0) {
    grandBalanceCell.classList.add("text-rose-600");
  } else {
    grandBalanceCell.classList.add("text-slate-900");
  }

  renderLinenList();
}

function generateId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }
  return `txn-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createTransactionRecord(linenName, movement, amount, timestamp = new Date().toISOString()) {
  return {
    id: generateId(),
    linenName,
    movement,
    amount,
    timestamp,
  };
}

function formatMovementLabel(movement) {
  if (movement === "add") {
    return "Delivery (+)";
  }
  if (movement === "remove") {
    return "Dirty collection (-)";
  }
  return movement;
}

function formatTimestamp(timestamp) {
  if (!timestamp) return "—";
  try {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch (error) {
    console.warn("Failed to format timestamp", error);
    return timestamp;
  }
}

function renderTransactions() {
  if (!transactionsBody) return;

  transactionsBody.innerHTML = "";

  const toTime = (value) => {
    const result = new Date(value).getTime();
    return Number.isNaN(result) ? 0 : result;
  };

  const entries = Array.isArray(store.transactions)
    ? [...store.transactions].sort(
        (a, b) => toTime(b.timestamp) - toTime(a.timestamp)
      )
    : [];

  const hasEntries = entries.length > 0;

  if (transactionsWrapper) {
    transactionsWrapper.classList.toggle("hidden", !hasEntries);
  }
  if (transactionsEmptyState) {
    transactionsEmptyState.classList.toggle("hidden", hasEntries);
  }

  if (!hasEntries) {
    return;
  }

  entries.forEach((transaction) => {
    const row = document.createElement("tr");
    row.className =
      "bg-white/70 transition hover:bg-slate-50";
    row.dataset.transactionId = transaction.id;

    const timeCell = document.createElement("td");
    timeCell.textContent = formatTimestamp(transaction.timestamp);
    timeCell.className =
      "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500";

    const linenCell = document.createElement("td");
    linenCell.textContent = transaction.linenName;
    linenCell.className = "px-4 py-3 text-sm font-semibold text-slate-800";

    const movementCell = document.createElement("td");
    movementCell.textContent = formatMovementLabel(transaction.movement);
    movementCell.className = "px-4 py-3 text-sm text-slate-500";

    const amountCell = document.createElement("td");
    const sign = transaction.movement === "add" ? "+" : "-";
    amountCell.textContent = `${sign}${transaction.amount}`;
    amountCell.className = `px-4 py-3 text-right text-sm font-semibold ${
      transaction.movement === "add" ? "text-emerald-600" : "text-rose-600"
    }`;

    const actionsCell = document.createElement("td");
    actionsCell.className = "px-4 py-3 text-right text-sm";
    actionsCell.innerHTML = `
      <div class="flex justify-end gap-2">
        <button
          type="button"
          class="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300"
          data-action="edit-transaction"
          data-transaction-id="${transaction.id}"
        >
          Edit
        </button>
        <button
          type="button"
          class="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          data-action="delete-transaction"
          data-transaction-id="${transaction.id}"
        >
          Delete
        </button>
      </div>
    `;

    row.append(timeCell, linenCell, movementCell, amountCell, actionsCell);
    transactionsBody.appendChild(row);
  });
}

function seedTransactionsFromLinens(linens) {
  const seeds = [];
  let offset = 0;
  const seedCount = linens.reduce(
    (acc, linen) => acc + linen.plus.length + linen.minus.length,
    0
  );
  const startTime = Date.now() - seedCount * 60000;

  linens.forEach((linen) => {
    linen.plus.forEach((amount) => {
      const timestamp = new Date(startTime + offset * 60000).toISOString();
      seeds.push(createTransactionRecord(linen.name, "add", amount, timestamp));
      offset += 1;
    });
    linen.minus.forEach((amount) => {
      const timestamp = new Date(startTime + offset * 60000).toISOString();
      seeds.push(
        createTransactionRecord(linen.name, "remove", amount, timestamp)
      );
      offset += 1;
    });
  });

  return seeds;
}

function addLinen(name) {
  const isDuplicate = store.linens.some(
    (linen) => linen.name.toLowerCase() === name.toLowerCase()
  );
  if (isDuplicate) {
    showToast({
      type: "error",
      title: "Duplicate linen",
      message: "That linen name already exists.",
    });
    return;
  }

  store.linens.push({
    name,
    plus: [],
    minus: [],
  });
  persistState();
  renderLinenOptions();
  renderTable();
  linenNameInput.value = "";
  showToast({
    type: "success",
    title: "Linen added",
    message: `${name} is now ready to track.`,
  });
}

function addMovement(index, amount, movement) {
  const linen = store.linens[index];
  if (!linen) return;

  store.transactions.push(createTransactionRecord(linen.name, movement, amount));
  recalculateLinensFromTransactions();
  persistState();
  renderTable();
  renderTransactions();
  movementAmountInput.value = "";
  const movementLabel =
    movement === "add" ? "Delivery saved" : "Collection saved";
  const sign = movement === "add" ? "+" : "-";
  showToast({
    type: movement === "add" ? "success" : "warning",
    title: movementLabel,
    message: `${sign}${amount} for ${linen.name}`,
  });
}

function removeLinen(index) {
  const linen = store.linens[index];
  if (!linen) return;

  const confirmed = window.confirm(
    `Remove "${linen.name}"?\nThis will delete its totals and transactions.`
  );
  if (!confirmed) return;

  store.linens.splice(index, 1);
  store.transactions = store.transactions.filter(
    (transaction) => transaction.linenName !== linen.name
  );
  recalculateLinensFromTransactions();
  persistState();
  renderLinenOptions();
  renderTable();
  renderTransactions();
  showToast({
    type: "warning",
    title: "Linen removed",
    message: `${linen.name} and its history were deleted.`,
  });
}

function deleteTransaction(transactionId) {
  const index = store.transactions.findIndex(
    (transaction) => transaction.id === transactionId
  );
  if (index === -1) return;

  const transaction = store.transactions[index];
  const confirmDelete = window.confirm(
    `Delete this entry?\n${formatTimestamp(transaction.timestamp)} · ${
      transaction.linenName
    } · ${formatMovementLabel(transaction.movement)} ${transaction.amount}`
  );
  if (!confirmDelete) return;

  store.transactions.splice(index, 1);
  recalculateLinensFromTransactions();
  renderLinenOptions();
  persistState();
  renderTable();
  renderTransactions();
  showToast({
    type: "warning",
    title: "Transaction removed",
    message: "The entry was deleted from today's history.",
  });
}

function editTransaction(transactionId) {
  const transaction = store.transactions.find(
    (entry) => entry.id === transactionId
  );
  if (!transaction) return;

  const amountInput = window.prompt(
    "Update quantity (must be a positive number):",
    String(transaction.amount)
  );

  if (amountInput === null) {
    return;
  }

  const parsedAmount = Number.parseInt(amountInput, 10);
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
    showToast({
      type: "error",
      title: "Invalid quantity",
      message: "Enter a number greater than zero.",
    });
    return;
  }

  const movementInput = window
    .prompt(
      'Movement type ("add" for delivery, "remove" for dirty collection):',
      transaction.movement
    )
    ?.trim()
    .toLowerCase();

  if (movementInput === undefined || movementInput === null) {
    return;
  }

  if (movementInput !== "add" && movementInput !== "remove") {
    showToast({
      type: "error",
      title: "Invalid movement",
      message: 'Type "add" or "remove" to set the movement type.',
    });
    return;
  }

  transaction.amount = parsedAmount;
  transaction.movement = movementInput;
  recalculateLinensFromTransactions();
  renderLinenOptions();
  persistState();
  renderTable();
  renderTransactions();
  showToast({
    type: "success",
    title: "Transaction updated",
    message: "The entry was updated successfully.",
  });
}

if (linenList) {
  linenList.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action='delete-linen']");
    if (!button) return;
    const index = Number.parseInt(button.dataset.index, 10);
    if (Number.isNaN(index)) return;
    removeLinen(index);
  });
}

if (transactionsTable) {
  transactionsTable.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) return;
    const transactionId = button.dataset.transactionId;
    if (!transactionId) return;

    if (button.dataset.action === "edit-transaction") {
      editTransaction(transactionId);
    } else if (button.dataset.action === "delete-transaction") {
      deleteTransaction(transactionId);
    }
  });
}

linenTypeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const name = linenNameInput.value.trim();
  if (!name) {
    showToast({
      type: "error",
      title: "Linen name required",
      message: "Enter a name so we can track this linen.",
    });
    return;
  }
  addLinen(name);
});

movementForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const index = Number.parseInt(linenSelect.value, 10);
  const amount = Number.parseInt(movementAmountInput.value, 10);
  const movementType = movementForm.elements.movement.value;

  if (Number.isNaN(index) || Number.isNaN(amount) || amount <= 0) {
    showToast({
      type: "error",
      title: "Missing details",
      message: "Choose a linen type and enter a quantity greater than zero.",
    });
    return;
  }

  addMovement(index, amount, movementType);
});

resetButton.addEventListener("click", () => {
  const confirmed = window.confirm(
    "Reset the day? This keeps your linen types but clears daily movements."
  );
  if (!confirmed) return;

  store.linens.forEach((linen) => {
    linen.plus = [];
    linen.minus = [];
  });
  store.transactions = [];
  recalculateLinensFromTransactions();
  persistState();
  renderTable();
  renderTransactions();
  showToast({
    type: "info",
    title: "Day reset",
    message: "All delivery and collection entries were cleared.",
  });
});

if (printSummaryButton) {
  printSummaryButton.addEventListener("click", () => {
    window.print();
  });
}

if (storageModalDismiss) {
  storageModalDismiss.addEventListener("click", acknowledgeStorageNotice);
}

if (storageModal) {
  storageModal.addEventListener("click", (event) => {
    if (event.target === storageModal) {
      acknowledgeStorageNotice();
    }
  });
}

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    storageModal &&
    !storageModal.classList.contains("hidden")
  ) {
    acknowledgeStorageNotice();
  }
});

window.addEventListener("DOMContentLoaded", () => {
  let stateChanged = false;

  if (store.linens.length === 0) {
    store = structuredClone(initialData);
    stateChanged = true;
  }

  if (!Array.isArray(store.transactions)) {
    store.transactions = [];
    stateChanged = true;
  }

  if (store.transactions.length === 0) {
    const seededTransactions = seedTransactionsFromLinens(store.linens);
    if (seededTransactions.length > 0) {
      store.transactions = seededTransactions;
      stateChanged = true;
    }
  }

  if (stateChanged) {
    persistState();
  }
  recalculateLinensFromTransactions();
  renderLinenOptions();
  renderTable();
  renderTransactions();
  if (!localStorage.getItem(storageNoticeKey)) {
    showStorageModalDialog();
  }
  setLinenPanelOpen(false);
});

function setupNavigationToggle() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const navPanel = document.querySelector("[data-nav-panel]");

  if (!menuButton || !navPanel) return;

  const applyState = (expanded) => {
    menuButton.setAttribute("aria-expanded", String(expanded));
    if (expanded) {
      navPanel.classList.remove("hidden");
      navPanel.classList.add("flex");
    } else {
      navPanel.classList.add("hidden");
      navPanel.classList.remove("flex");
    }
  };

  const toggleNav = () => {
    const expanded = menuButton.getAttribute("aria-expanded") === "true";
    applyState(!expanded);
  };

  menuButton.addEventListener("click", toggleNav);

  navPanel.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      if (window.innerWidth < 768) {
        applyState(false);
      }
    });
  });

  const syncNav = () => {
    if (window.innerWidth >= 768) {
      navPanel.classList.remove("hidden");
      navPanel.classList.add("flex");
      menuButton.setAttribute("aria-expanded", "false");
    } else {
      applyState(false);
    }
  };

  window.addEventListener("resize", syncNav);
  syncNav();
}

setupNavigationToggle();

if (linenToggleButton) {
  linenToggleButton.addEventListener("click", () => {
    setLinenPanelOpen(!linenPanelOpen);
  });
}

