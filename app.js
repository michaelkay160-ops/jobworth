const PRICE_PROFILE = { loadedLaborRateMinor: 9500, overheadPercent: 0.12, targetGrossMargin: 0.35, roundingIncrementMinor: 500 };
const CATEGORIES = [
  { id: "all", name: "All work" }, { id: "outlets-switches", name: "Outlets & switches" }, { id: "lighting", name: "Lighting & fans" },
  { id: "circuits", name: "Circuits" }, { id: "panels", name: "Panels" }, { id: "safety", name: "Safety" }, { id: "ev", name: "EV charging" }, { id: "diagnostics", name: "Troubleshooting" }
];
const TASKS = [
  { id: "task-outlet-standard", name: "Replace standard receptacle", categoryId: "outlets-switches", laborHours: .5, materialCostMinor: 750, description: "One accessible standard receptacle." },
  { id: "task-outlet-gfci", name: "Replace GFCI receptacle", categoryId: "outlets-switches", laborHours: .75, materialCostMinor: 2300, description: "Replace and test one GFCI device." },
  { id: "task-switch-standard", name: "Replace standard switch", categoryId: "outlets-switches", laborHours: .5, materialCostMinor: 700, description: "One accessible single-pole switch." },
  { id: "task-breaker-20a", name: "Replace single-pole breaker", categoryId: "panels", laborHours: .5, materialCostMinor: 1200, description: "Replace one compatible 20A breaker." },
  { id: "task-surge-protector", name: "Install whole-home surge protector", categoryId: "safety", laborHours: 1.5, materialCostMinor: 9000, description: "Install and test a service-panel surge protector." },
  { id: "task-diagnostic-basic", name: "Electrical troubleshooting visit", categoryId: "diagnostics", laborHours: 1, materialCostMinor: 500, description: "Initial diagnostic visit for one electrical issue." },
  { id: "task-dedicated-circuit", name: "Install dedicated branch circuit", categoryId: "circuits", laborHours: 3, materialCostMinor: 5000, description: "Standard-access dedicated branch circuit allowance." },
  { id: "task-ceiling-fan", name: "Install customer-supplied ceiling fan", categoryId: "lighting", laborHours: 2, materialCostMinor: 500, description: "Install a fan where an approved box is present." },
  { id: "task-ev-ready", name: "Install EV charger circuit allowance", categoryId: "ev", laborHours: 4, materialCostMinor: 9500, description: "Standard-access circuit allowance for an EV charger." }
];
const state = { step: 1, category: "all", search: "", selected: [], customer: {} };
const money = minor => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(minor / 100);
function priceTask(task, quantity = 1) {
  const labor = task.laborHours * PRICE_PROFILE.loadedLaborRateMinor * quantity;
  const materials = task.materialCostMinor * quantity;
  const direct = labor + materials;
  const overhead = direct * PRICE_PROFILE.overheadPercent;
  const costBasis = direct + overhead;
  const target = costBasis / (1 - PRICE_PROFILE.targetGrossMargin);
  return Math.round(target / PRICE_PROFILE.roundingIncrementMinor) * PRICE_PROFILE.roundingIncrementMinor;
}
function getTask(id) { return TASKS.find(task => task.id === id); }
function quoteTotal() { return state.selected.reduce((sum, item) => sum + priceTask(getTask(item.taskId), item.quantity), 0); }
function renderCategories() {
  document.querySelector("#category-tabs").innerHTML = CATEGORIES.map(category => `<button class="category-tab ${state.category === category.id ? "selected" : ""}" data-category="${category.id}">${category.name}</button>`).join("");
  document.querySelectorAll("[data-category]").forEach(button => button.addEventListener("click", () => { state.category = button.dataset.category; renderCatalog(); }));
}
function renderCatalog() {
  renderCategories();
  const term = state.search.trim().toLowerCase();
  const visible = TASKS.filter(task => (state.category === "all" || task.categoryId === state.category) && (!term || `${task.name} ${task.description}`.toLowerCase().includes(term)));
  document.querySelector("#task-list").innerHTML = visible.length ? visible.map(task => `<div class="task-row"><div><h3>${task.name}</h3><p>${task.description}</p></div><button class="add-task" data-add="${task.id}" aria-label="Add ${task.name}">+</button></div>`).join("") : `<div class="empty-state">No matching work found.</div>`;
  document.querySelectorAll("[data-add]").forEach(button => button.addEventListener("click", () => addTask(button.dataset.add)));
}
function addTask(taskId) { const existing = state.selected.find(item => item.taskId === taskId); if (existing) existing.quantity += 1; else state.selected.push({ taskId, quantity: 1 }); renderSelected(); }
function removeTask(index) { state.selected.splice(index, 1); renderSelected(); }
function renderSelected() {
  const target = document.querySelector("#selected-tasks");
  target.innerHTML = state.selected.length ? state.selected.map((item, index) => { const task = getTask(item.taskId); return `<div class="selected-row"><div class="selected-row-top"><div><h3>${item.quantity} × ${task.name}</h3><small>${task.description}</small></div><button class="remove-task" data-remove="${index}" aria-label="Remove ${task.name}">Remove</button></div></div>`; }).join("") : `<div class="empty-state">Your selected work will appear here.</div>`;
  document.querySelectorAll("[data-remove]").forEach(button => button.addEventListener("click", () => removeTask(Number(button.dataset.remove))));
  document.querySelector("#task-count").textContent = state.selected.reduce((sum, item) => sum + item.quantity, 0);
  document.querySelector("#quote-total").textContent = money(quoteTotal());
  document.querySelector("#to-review").disabled = !state.selected.length;
}
function showStep(step) { state.step = step; document.querySelectorAll(".step-panel").forEach(panel => panel.classList.add("hidden")); document.querySelector(`#step-${step === 1 ? "customer" : step === 2 ? "work" : "review"}`).classList.remove("hidden"); document.querySelectorAll(".progress-step").forEach(item => { const itemStep = Number(item.dataset.step); item.classList.toggle("active", itemStep === step); item.classList.toggle("complete", itemStep < step); }); window.scrollTo({ top: 0, behavior: "smooth" }); }
function customerIsValid() { const name = document.querySelector("#customer-name").value.trim(); const address = document.querySelector("#service-address").value.trim(); document.querySelector("#customer-error").textContent = name && address ? "" : "Customer name and service address are required."; return Boolean(name && address); }
function populateReview() { state.customer = { name: document.querySelector("#customer-name").value.trim(), contact: document.querySelector("#customer-contact").value.trim(), address: document.querySelector("#service-address").value.trim(), project: document.querySelector("#project-title").value.trim() || "Electrical service quote" }; document.querySelector("#quote-customer").textContent = state.customer.name; document.querySelector("#review-customer").textContent = state.customer.name; document.querySelector("#review-address").textContent = state.customer.address; document.querySelector("#review-project").textContent = state.customer.project; document.querySelector("#review-lines").innerHTML = state.selected.map(item => { const task = getTask(item.taskId); return `<div class="review-line"><div><h3>${item.quantity} × ${task.name}</h3><p>${task.description}</p></div><strong>${money(priceTask(task, item.quantity))}</strong></div>`; }).join(""); document.querySelector("#review-total").textContent = money(quoteTotal()); }
document.querySelector("#to-work").addEventListener("click", () => { if (customerIsValid()) { showStep(2); renderCatalog(); renderSelected(); } });
document.querySelector("#back-customer").addEventListener("click", () => showStep(1));
document.querySelector("#task-search").addEventListener("input", event => { state.search = event.target.value; renderCatalog(); });
document.querySelector("#to-review").addEventListener("click", () => { populateReview(); showStep(3); });
document.querySelector("#back-work").addEventListener("click", () => showStep(2));
document.querySelector("#present-quote").addEventListener("click", () => { document.querySelector("#toast").textContent = "Quote ready to present — snapshot saved in this prototype."; document.querySelector("#toast").classList.add("show"); setTimeout(() => document.querySelector("#toast").classList.remove("show"), 3500); });
