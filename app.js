const STORAGE_KEY = "meal-planner-shopping-list-v4";
const LEGACY_STORAGE_KEYS = [
  "meal-planner-shopping-list-v3",
  "meal-planner-shopping-list-v2",
  "meal-planner-shopping-list-v1"
];

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snacks"];
const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const starterData = createStarterData();
let state = loadState();
let activeUserId = "";
let skipRemoteSync = false;

const tabButtons = document.querySelectorAll(".tab-button");
const panels = document.querySelectorAll(".tab-panel");
const appShell = document.querySelector(".app-shell");
const mobileMenuButton = document.querySelector("#mobile-menu-button");
const mobileMenuClose = document.querySelector("#mobile-menu-close");
const mobileNavBackdrop = document.querySelector("#mobile-nav-backdrop");
const mealControlsCard = document.querySelector("#meal-controls-card");
const toggleMealControlsButton = document.querySelector("#toggle-meal-controls");
const shoppingControlsCard = document.querySelector("#shopping-controls-card");
const toggleShoppingControlsButton = document.querySelector("#toggle-shopping-controls");
const storeControlsCard = document.querySelector("#store-controls-card");
const toggleStoreControlsButton = document.querySelector("#toggle-store-controls");
const accountButton = document.querySelector("#account-button");
const mealForm = document.querySelector("#meal-form");
const mealDeleteForm = document.querySelector("#meal-delete-form");
const recipeForm = document.querySelector("#recipe-form");
const recipeMealNameInput = document.querySelector("#recipe-meal-name");
const recipeNotesInput = document.querySelector("#recipe-notes");
const recipeFormStatus = document.querySelector("#recipe-form-status");
const saveRecipeButton = document.querySelector("#save-recipe-button");
const categoryForm = document.querySelector("#category-form");
const shoppingForm = document.querySelector("#shopping-form");
const shoppingDeleteForm = document.querySelector("#shopping-delete-form");
const shoppingCategoryForm = document.querySelector("#shopping-category-form");
const storeForm = document.querySelector("#store-form");
const storeColorOkButton = document.querySelector("#store-color-ok");
const copyRecipesButton = document.querySelector("#copy-recipes-button");
const recipeShareStatus = document.querySelector("#recipe-share-status");
const copyTodayMealButton = document.querySelector("#copy-today-meal-button");
const todayMealShareStatus = document.querySelector("#today-meal-share-status");
const copyWeekMealButton = document.querySelector("#copy-week-meal-button");
const weekMealShareStatus = document.querySelector("#week-meal-share-status");
const copyShoppingButton = document.querySelector("#copy-shopping-button");
const shoppingShareStatus = document.querySelector("#shopping-share-status");
const copyNextListButton = document.querySelector("#copy-next-list-button");
const nextListShareStatus = document.querySelector("#next-list-share-status");
const purchaseSelectedItemsButton = document.querySelector("#purchase-selected-items");
const clearNextListSelectedButton = document.querySelector("#clear-next-list-selected");
const mealBoard = document.querySelector("#meal-board");
const recipeBoard = document.querySelector("#recipe-board");
const todayPlanBoard = document.querySelector("#today-plan-board");
const weekPlanBoard = document.querySelector("#week-plan-board");
const shoppingBoard = document.querySelector("#shopping-board");
const shoppingCategoryTabs = document.querySelector("#shopping-category-tabs");
const storeSourceBoard = document.querySelector("#store-source-board");
const storeBoard = document.querySelector("#store-board");
const storeJumpTabs = document.querySelector("#store-jump-tabs");
const pantrySearchInput = document.querySelector("#pantry-search");
const pantryBoard = document.querySelector("#pantry-board");
const nextListBoard = document.querySelector("#next-list-board");
const reportStats = document.querySelector("#report-stats");
const reportChart = document.querySelector("#report-chart");
const reportHistory = document.querySelector("#report-history");
const clearReportHistoryButton = document.querySelector("#clear-report-history");
const reportItemFilter = document.querySelector("#report-item-filter");
const reportCategoryFilter = document.querySelector("#report-category-filter");
const reportDateFrom = document.querySelector("#report-date-from");
const reportDateTo = document.querySelector("#report-date-to");
const storeChips = document.querySelector("#store-chips");
const bulkStoreSelect = document.querySelector("#bulk-store-select");
const assignSelectedItemsButton = document.querySelector("#assign-selected-items");
const clearSelectedItemsButton = document.querySelector("#clear-selected-items");
const drawerLogoutButton = document.querySelector("#drawer-logout-button");

const mealColumnTemplate = document.querySelector("#meal-column-template");
const shoppingItemTemplate = document.querySelector("#shopping-item-template");
const pantryRowTemplate = document.querySelector("#pantry-row-template");

tabButtons.forEach((button) => {
  button.addEventListener("click", () => focusTab(button.dataset.tab));
});

mobileMenuButton?.addEventListener("click", () => setMobileMenuOpen(true));
mobileMenuClose?.addEventListener("click", () => setMobileMenuOpen(false));
mobileNavBackdrop?.addEventListener("click", () => setMobileMenuOpen(false));
accountButton?.addEventListener("click", () => {
  window.location.href = "account.html";
});
toggleMealControlsButton?.addEventListener("click", () => {
  const nextCollapsed = !mealControlsCard?.classList.contains("is-collapsed");
  setMealControlsCollapsed(nextCollapsed);
});
toggleShoppingControlsButton?.addEventListener("click", () => {
  const nextCollapsed = !shoppingControlsCard?.classList.contains("is-collapsed");
  setControlsCollapsed(shoppingControlsCard, toggleShoppingControlsButton, nextCollapsed);
});
toggleStoreControlsButton?.addEventListener("click", () => {
  const nextCollapsed = !storeControlsCard?.classList.contains("is-collapsed");
  setControlsCollapsed(storeControlsCard, toggleStoreControlsButton, nextCollapsed);
});
drawerLogoutButton?.addEventListener("click", () => {
  window.MealPlannerAuth?.logout?.();
});

[reportItemFilter, reportCategoryFilter, reportDateFrom, reportDateTo].forEach((control) => {
  control.addEventListener("input", () => renderReports());
  control.addEventListener("change", () => renderReports());
});

pantrySearchInput.addEventListener("input", () => renderPantryBoard());

clearReportHistoryButton.addEventListener("click", () => {
  state.purchaseHistory = [];
  saveAndRender();
});

storeColorOkButton.addEventListener("click", () => {
  storeForm.elements.color.blur();
});

mealForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(mealForm);
  state.mealOptions.push({
    id: crypto.randomUUID(),
    mealType: formData.get("mealType").toString(),
    dish: formData.get("dish").toString().trim(),
    notes: ""
  });
  mealForm.reset();
  mealForm.elements.mealType.value = "Breakfast";
  saveAndRender();
});

mealDeleteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const mealId = mealDeleteForm.elements.mealId.value;
  if (!mealId) {
    return;
  }
  state.mealOptions = state.mealOptions.filter((item) => item.id !== mealId);
  saveAndRender();
});

recipeMealNameInput.addEventListener("input", () => {
  syncRecipeFormFromMealName();
});

recipeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const mealName = recipeMealNameInput.value.trim();
  const notes = recipeNotesInput.value.trim();
  if (!mealName || !notes) {
    return;
  }

  const existingRecipe = state.recipes.find(
    (item) => item.mealName.trim().toLowerCase() === mealName.toLowerCase()
  );

  if (existingRecipe) {
    state.recipes = state.recipes.map((item) =>
      item.id === existingRecipe.id ? { ...item, mealName, notes } : item
    );
  } else {
    state.recipes.unshift({
      id: crypto.randomUUID(),
      mealName,
      notes
    });
  }

  recipeForm.reset();
  syncRecipeFormFromMealName();
  saveAndRender();
});

categoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(categoryForm);
  state.shoppingCategories.push({
    id: crypto.randomUUID(),
    name: formData.get("categoryName").toString().trim()
  });
  categoryForm.reset();
  saveAndRender();
});

shoppingForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(shoppingForm);
  state.shoppingItems.push({
    id: crypto.randomUUID(),
    name: formData.get("name").toString().trim(),
    categoryId: formData.get("categoryId").toString(),
    quantity: formData.get("quantity").toString().trim() || "1",
    notes: "",
    storeId: "",
    pantryStatus: "unknown"
  });
  shoppingForm.reset();
  saveAndRender();
});

shoppingDeleteForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const itemId = shoppingDeleteForm.elements.itemId.value;
  if (!itemId) {
    return;
  }
  state.shoppingItems = state.shoppingItems.filter((item) => item.id !== itemId);
  saveAndRender();
});

shoppingCategoryForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const itemId = shoppingCategoryForm.elements.itemId.value;
  const categoryId = shoppingCategoryForm.elements.categoryId.value;
  if (!itemId || !categoryId) {
    return;
  }

  state.shoppingItems = state.shoppingItems.map((item) =>
    item.id === itemId ? { ...item, categoryId } : item
  );
  saveAndRender();
});

storeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(storeForm);
  state.stores.push({
    id: crypto.randomUUID(),
    name: formData.get("name").toString().trim(),
    color: formData.get("color").toString()
  });
  storeForm.reset();
  storeForm.elements.color.value = "#2d8fcb";
  storeForm.elements.name.blur();
  saveAndRender();
});

assignSelectedItemsButton.addEventListener("click", () => {
  const storeId = bulkStoreSelect.value;
  if (!storeId || !state.selectedStoreItemIds.length) {
    return;
  }

  state.shoppingItems = state.shoppingItems.map((item) =>
    state.selectedStoreItemIds.includes(item.id) ? { ...item, storeId } : item
  );
  state.selectedStoreItemIds = [];
  saveAndRender();
});

clearSelectedItemsButton.addEventListener("click", () => {
  state.selectedStoreItemIds = [];
  saveAndRender();
});

purchaseSelectedItemsButton.addEventListener("click", () => {
  const selectedIds = new Set(state.selectedNextListItemIds);
  if (!selectedIds.size) {
    return;
  }

  state.shoppingItems = state.shoppingItems.map((item) => {
    if (!selectedIds.has(item.id) || item.pantryStatus !== "need") {
      return item;
    }

    state.purchaseHistory.unshift({
      id: crypto.randomUUID(),
      itemId: item.id,
      name: item.name,
      categoryId: item.categoryId,
      quantity: item.quantity,
      storeId: item.storeId,
      purchasedAt: getTodayLabel()
    });

    return {
      ...item,
      pantryStatus: "unknown"
    };
  });

  state.selectedNextListItemIds = [];
  saveAndRender();
});

clearNextListSelectedButton.addEventListener("click", () => {
  state.selectedNextListItemIds = [];
  saveAndRender();
});

copyRecipesButton.addEventListener("click", async () => {
  const text = buildRecipesShareText();
  const copied = await copyTextToClipboard(text);
  setShareStatus(recipeShareStatus, copied ? "Recipes copied." : "Could not copy recipes on this device.");
});

copyTodayMealButton.addEventListener("click", async () => {
  const text = buildTodayMealShareText();
  const copied = await copyTextToClipboard(text);
  setShareStatus(todayMealShareStatus, copied ? "Today's meal copied." : "Could not copy today's meal on this device.");
});

copyWeekMealButton.addEventListener("click", async () => {
  const text = buildWeekMealShareText();
  const copied = await copyTextToClipboard(text);
  setShareStatus(weekMealShareStatus, copied ? "Week meal plan copied." : "Could not copy week meal plan on this device.");
});

copyShoppingButton.addEventListener("click", async () => {
  const text = buildShoppingShareText();
  const copied = await copyTextToClipboard(text);
  setShareStatus(shoppingShareStatus, copied ? "Shopping list copied." : "Could not copy shopping list on this device.");
});

copyNextListButton.addEventListener("click", async () => {
  const text = buildNextListShareText();
  const copied = await copyTextToClipboard(text);
  setShareStatus(nextListShareStatus, copied ? "Next list copied." : "Could not copy next list on this device.");
});

function createStarterData() {
  return {
    mealOptions: [],
    shoppingCategories: [],
    shoppingItems: [],
    stores: [],
    todayMealPlan: createTodayMealPlan(),
    weekMealPlan: createWeekMealPlan(),
    recipes: [],
    sampleDataVersion: "",
    selectedStoreItemIds: [],
    selectedNextListItemIds: [],
    purchaseHistory: []
  };
}

function createMealSelections() {
  return mealTypes.reduce((acc, mealType) => {
    acc[mealType] = "";
    return acc;
  }, {});
}

function createTodayMealPlan() {
  return {
    date: getTodayLabel(),
    selections: createMealSelections()
  };
}

function createWeekMealPlan() {
  return weekDays.reduce((acc, day) => {
    acc[day] = createMealSelections();
    return acc;
  }, {});
}

function normalizeTodayMealPlan(rawTodayMealPlan, validMealIdSet) {
  const base = createTodayMealPlan();
  const rawSelections = rawTodayMealPlan && typeof rawTodayMealPlan === "object" ? rawTodayMealPlan.selections : null;

  if (rawTodayMealPlan?.date === base.date && rawSelections) {
    base.selections = normalizeMealSelections(rawSelections, validMealIdSet);
  }

  return base;
}

function normalizeWeekMealPlan(rawWeekMealPlan, validMealIdSet) {
  const base = createWeekMealPlan();

  if (!rawWeekMealPlan || typeof rawWeekMealPlan !== "object") {
    return base;
  }

  weekDays.forEach((day) => {
    base[day] = normalizeMealSelections(rawWeekMealPlan[day], validMealIdSet);
  });

  return base;
}

function normalizeMealSelections(rawSelections, validMealIdSet) {
  const selections = createMealSelections();

  if (!rawSelections || typeof rawSelections !== "object") {
    return selections;
  }

  mealTypes.forEach((mealType) => {
    const mealId = rawSelections[mealType];
    selections[mealType] = validMealIdSet.has(mealId) ? mealId : "";
  });

  return selections;
}

function loadState() {
  const saved =
    localStorage.getItem(getScopedStorageKey())
    ?? localStorage.getItem(STORAGE_KEY)
    ?? LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean);
  if (!saved) {
    return structuredClone(starterData);
  }

  try {
    const parsed = JSON.parse(saved);
    return normalizeState(parsed);
  } catch {
    return structuredClone(starterData);
  }
}

function normalizeState(raw) {
  const shoppingCategories = Array.isArray(raw.shoppingCategories) && raw.shoppingCategories.length
    ? raw.shoppingCategories.map((category) => ({
        id: category.id || crypto.randomUUID(),
        name: category.name || "Category"
      }))
    : structuredClone(starterData.shoppingCategories);

  const shoppingItems = Array.isArray(raw.shoppingItems)
    ? raw.shoppingItems.map((item) => ({
        id: item.id || crypto.randomUUID(),
        name: item.name || "Item",
        categoryId: item.categoryId || shoppingCategories[0]?.id || "",
        quantity: item.quantity || "1",
        notes: item.notes || "",
        storeId: item.storeId || "",
        pantryStatus: ["need", "have", "purchased", "unknown"].includes(item.pantryStatus) ? item.pantryStatus : "unknown"
      }))
    : structuredClone(starterData.shoppingItems);

  const validMealIdSet = new Set(
    (Array.isArray(raw.mealOptions) ? raw.mealOptions : Array.isArray(raw.meals) ? raw.meals : starterData.mealOptions)
      .map((item) => item.id)
      .filter(Boolean)
  );

  const mealOptionSource = Array.isArray(raw.mealOptions)
    ? raw.mealOptions
    : Array.isArray(raw.meals)
      ? raw.meals
      : starterData.mealOptions;

  const migratedRecipes = mealOptionSource
    .filter((item) => (item.notes || "").trim())
    .map((item) => ({
      id: crypto.randomUUID(),
      mealName: item.dish || "Meal",
      notes: item.notes || ""
    }));

  return {
    mealOptions: Array.isArray(raw.mealOptions)
      ? raw.mealOptions.map((item) => ({
          id: item.id || crypto.randomUUID(),
          mealType: mealTypes.includes(item.mealType) ? item.mealType : "Breakfast",
          dish: item.dish || "Meal idea",
          notes: item.notes || ""
        }))
      : Array.isArray(raw.meals)
        ? raw.meals.map((item) => ({
            id: item.id || crypto.randomUUID(),
            mealType: mealTypes.includes(item.mealType) ? item.mealType : "Breakfast",
            dish: item.dish || "Meal idea",
            notes: item.notes || ""
          }))
        : structuredClone(starterData.mealOptions),
    shoppingCategories,
    shoppingItems,
    stores: Array.isArray(raw.stores) && raw.stores.length
      ? raw.stores.map((store) => ({
          id: store.id || crypto.randomUUID(),
          name: store.name || "Store",
          color: store.color || "#59636a"
        }))
      : structuredClone(starterData.stores),
    todayMealPlan: normalizeTodayMealPlan(raw.todayMealPlan, validMealIdSet),
    weekMealPlan: normalizeWeekMealPlan(raw.weekMealPlan, validMealIdSet),
    recipes: Array.isArray(raw.recipes)
      ? raw.recipes.map((item) => ({
          id: item.id || crypto.randomUUID(),
          mealName: item.mealName || item.name || "Meal",
          notes: item.notes || ""
        }))
      : migratedRecipes,
    sampleDataVersion: raw.sampleDataVersion || "",
    selectedStoreItemIds: Array.isArray(raw.selectedStoreItemIds) ? raw.selectedStoreItemIds : [],
    selectedNextListItemIds: Array.isArray(raw.selectedNextListItemIds) ? raw.selectedNextListItemIds : [],
    purchaseHistory: Array.isArray(raw.purchaseHistory)
      ? raw.purchaseHistory.map((entry) => ({
          id: entry.id || crypto.randomUUID(),
          itemId: entry.itemId || "",
          name: entry.name || "Item",
          categoryId: entry.categoryId || "",
          quantity: entry.quantity || "1",
          storeId: entry.storeId || "",
          purchasedAt: entry.purchasedAt || getTodayLabel()
        }))
      : []
  };
}

function persistState() {
  localStorage.setItem(getScopedStorageKey(), JSON.stringify(state));
}

function getSupabaseClient() {
  return window.MealPlannerAuth?.supabaseClient || null;
}

function remoteSyncEnabled() {
  return Boolean(getSupabaseClient() && activeUserId);
}

function getCurrentWeekKey() {
  const today = new Date(`${getTodayLabel()}T12:00:00`);
  const dayOffset = (today.getDay() + 6) % 7;
  today.setDate(today.getDate() - dayOffset);
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function cloneLocalDataState(currentState) {
  return {
    ...structuredClone(currentState),
    selectedStoreItemIds: Array.isArray(currentState.selectedStoreItemIds) ? [...currentState.selectedStoreItemIds] : [],
    selectedNextListItemIds: Array.isArray(currentState.selectedNextListItemIds) ? [...currentState.selectedNextListItemIds] : []
  };
}

function hasRemotePlannerData(remote) {
  return Boolean(
    remote.mealOptions.length
    || remote.shoppingCategories.length
    || remote.shoppingItems.length
    || remote.stores.length
    || remote.recipes.length
    || remote.purchaseHistory.length
    || remote.todayMealPlan
    || remote.weekMealRows.length
  );
}

async function loadRemoteState() {
  if (!remoteSyncEnabled()) {
    return null;
  }

  const supabaseClient = getSupabaseClient();
  const currentWeekKey = getCurrentWeekKey();
  const todayLabel = getTodayLabel();

  const [
    mealOptionsResult,
    shoppingCategoriesResult,
    storesResult,
    shoppingItemsResult,
    recipesResult,
    todayMealPlanResult,
    weekMealPlanResult,
    purchaseHistoryResult
  ] = await Promise.all([
    supabaseClient.from("meal_options").select("id, meal_type, dish").eq("user_id", activeUserId).order("created_at", { ascending: true }),
    supabaseClient.from("shopping_categories").select("id, name").eq("user_id", activeUserId).order("created_at", { ascending: true }),
    supabaseClient.from("stores").select("id, name, color").eq("user_id", activeUserId).order("created_at", { ascending: true }),
    supabaseClient.from("shopping_items").select("id, category_id, store_id, name, quantity, pantry_status").eq("user_id", activeUserId).order("created_at", { ascending: true }),
    supabaseClient.from("recipes").select("id, meal_name, notes").eq("user_id", activeUserId).order("created_at", { ascending: true }),
    supabaseClient.from("today_meal_plans").select("plan_date, breakfast_meal_id, lunch_meal_id, dinner_meal_id, snacks_meal_id").eq("user_id", activeUserId).eq("plan_date", todayLabel).maybeSingle(),
    supabaseClient.from("week_meal_plans").select("day_name, breakfast_meal_id, lunch_meal_id, dinner_meal_id, snacks_meal_id").eq("user_id", activeUserId).eq("week_key", currentWeekKey),
    supabaseClient.from("purchase_history").select("id, shopping_item_id, name, quantity, category_name, store_name, purchased_at").eq("user_id", activeUserId).order("purchased_at", { ascending: false }).order("created_at", { ascending: false })
  ]);

  const results = [
    mealOptionsResult,
    shoppingCategoriesResult,
    storesResult,
    shoppingItemsResult,
    recipesResult,
    todayMealPlanResult,
    weekMealPlanResult,
    purchaseHistoryResult
  ];

  const firstError = results.find((result) => result.error)?.error;
  if (firstError) {
    console.error("Could not load meal planner data from Supabase.", firstError);
    return null;
  }

  const remote = {
    mealOptions: (mealOptionsResult.data || []).map((row) => ({
      id: row.id,
      mealType: row.meal_type,
      dish: row.dish,
      notes: ""
    })),
    shoppingCategories: (shoppingCategoriesResult.data || []).map((row) => ({
      id: row.id,
      name: row.name
    })),
    stores: (storesResult.data || []).map((row) => ({
      id: row.id,
      name: row.name,
      color: row.color || "#59636a"
    })),
    shoppingItems: (shoppingItemsResult.data || []).map((row) => ({
      id: row.id,
      name: row.name,
      categoryId: row.category_id || "",
      quantity: row.quantity || "1",
      notes: "",
      storeId: row.store_id || "",
      pantryStatus: row.pantry_status || "unknown"
    })),
    recipes: (recipesResult.data || []).map((row) => ({
      id: row.id,
      mealName: row.meal_name,
      notes: row.notes || ""
    })),
    todayMealPlan: todayMealPlanResult.data
      ? {
          date: todayMealPlanResult.data.plan_date,
          selections: {
            Breakfast: todayMealPlanResult.data.breakfast_meal_id || "",
            Lunch: todayMealPlanResult.data.lunch_meal_id || "",
            Dinner: todayMealPlanResult.data.dinner_meal_id || "",
            Snacks: todayMealPlanResult.data.snacks_meal_id || ""
          }
        }
      : null,
    weekMealRows: weekMealPlanResult.data || [],
    purchaseHistory: (purchaseHistoryResult.data || []).map((row) => ({
      id: row.id,
      itemId: row.shopping_item_id || "",
      name: row.name || "Item",
      categoryId: findCategoryIdByName(row.category_name, shoppingCategoriesResult.data || []),
      quantity: row.quantity || "1",
      storeId: findStoreIdByName(row.store_name, storesResult.data || []),
      purchasedAt: row.purchased_at || getTodayLabel()
    }))
  };

  if (!hasRemotePlannerData(remote)) {
    return null;
  }

  const remoteState = normalizeState({
    mealOptions: remote.mealOptions,
    shoppingCategories: remote.shoppingCategories,
    shoppingItems: remote.shoppingItems,
    stores: remote.stores,
    todayMealPlan: remote.todayMealPlan || createTodayMealPlan(),
    weekMealPlan: buildWeekMealPlanFromRows(remote.weekMealRows),
    recipes: remote.recipes,
    sampleDataVersion: "",
    selectedStoreItemIds: [],
    selectedNextListItemIds: [],
    purchaseHistory: remote.purchaseHistory
  });

  return remoteState;
}

function buildWeekMealPlanFromRows(rows) {
  const plan = createWeekMealPlan();

  rows.forEach((row) => {
    if (!plan[row.day_name]) {
      return;
    }

    plan[row.day_name] = {
      Breakfast: row.breakfast_meal_id || "",
      Lunch: row.lunch_meal_id || "",
      Dinner: row.dinner_meal_id || "",
      Snacks: row.snacks_meal_id || ""
    };
  });

  return plan;
}

function findCategoryIdByName(name, categoryRows) {
  if (!name) {
    return "";
  }
  return categoryRows.find((row) => row.name === name)?.id || "";
}

function findStoreIdByName(name, storeRows) {
  if (!name) {
    return "";
  }
  return storeRows.find((row) => row.name === name)?.id || "";
}

async function replaceUserTable(tableName, rows, onConflict = "id") {
  const supabaseClient = getSupabaseClient();
  if (!supabaseClient || !activeUserId) {
    return;
  }

  if (rows.length) {
    const { error } = await supabaseClient.from(tableName).upsert(rows, { onConflict });
    if (error) {
      throw error;
    }
  }

  if (onConflict === "id") {
    const ids = rows.map((row) => row.id).filter(Boolean);
    let deleteQuery = supabaseClient.from(tableName).delete().eq("user_id", activeUserId);
    if (ids.length) {
      deleteQuery = deleteQuery.not("id", "in", `(${ids.map((id) => `"${id}"`).join(",")})`);
    }
    const { error } = await deleteQuery;
    if (error) {
      throw error;
    }
  }
}

async function syncStateToSupabase() {
  if (!remoteSyncEnabled()) {
    return;
  }

  const supabaseClient = getSupabaseClient();
  const todayPlan = state.todayMealPlan || createTodayMealPlan();
  const weekKey = getCurrentWeekKey();

  const mealOptionRows = state.mealOptions.map((item) => ({
    id: item.id,
    user_id: activeUserId,
    meal_type: item.mealType,
    dish: item.dish
  }));

  const shoppingCategoryRows = state.shoppingCategories.map((category) => ({
    id: category.id,
    user_id: activeUserId,
    name: category.name
  }));

  const storeRows = state.stores.map((store) => ({
    id: store.id,
    user_id: activeUserId,
    name: store.name,
    color: store.color
  }));

  const shoppingItemRows = state.shoppingItems.map((item) => ({
    id: item.id,
    user_id: activeUserId,
    category_id: item.categoryId || null,
    store_id: item.storeId || null,
    name: item.name,
    quantity: item.quantity || "1",
    pantry_status: item.pantryStatus || "unknown"
  }));

  const recipeRows = state.recipes.map((recipe) => ({
    id: recipe.id,
    user_id: activeUserId,
    meal_name: recipe.mealName,
    notes: recipe.notes || ""
  }));

  const purchaseHistoryRows = state.purchaseHistory.map((entry) => ({
    id: entry.id,
    user_id: activeUserId,
    shopping_item_id: entry.itemId || null,
    name: entry.name,
    quantity: entry.quantity || "1",
    category_name: findCategory(entry.categoryId)?.name || null,
    store_name: findStore(entry.storeId)?.name || null,
    purchased_at: entry.purchasedAt || getTodayLabel()
  }));

  await replaceUserTable("meal_options", mealOptionRows);
  await replaceUserTable("shopping_categories", shoppingCategoryRows);
  await replaceUserTable("stores", storeRows);
  await replaceUserTable("shopping_items", shoppingItemRows);
  await replaceUserTable("recipes", recipeRows);
  await replaceUserTable("purchase_history", purchaseHistoryRows);

  const todaySelections = todayPlan.selections || createMealSelections();
  const todayRow = {
    user_id: activeUserId,
    plan_date: todayPlan.date,
    breakfast_meal_id: todaySelections.Breakfast || null,
    lunch_meal_id: todaySelections.Lunch || null,
    dinner_meal_id: todaySelections.Dinner || null,
    snacks_meal_id: todaySelections.Snacks || null
  };
  const todayUpsert = await supabaseClient.from("today_meal_plans").upsert(todayRow, {
    onConflict: "user_id,plan_date"
  });
  if (todayUpsert.error) {
    throw todayUpsert.error;
  }

  const weekRows = weekDays.map((day) => ({
    user_id: activeUserId,
    week_key: weekKey,
    day_name: day,
    breakfast_meal_id: state.weekMealPlan[day]?.Breakfast || null,
    lunch_meal_id: state.weekMealPlan[day]?.Lunch || null,
    dinner_meal_id: state.weekMealPlan[day]?.Dinner || null,
    snacks_meal_id: state.weekMealPlan[day]?.Snacks || null
  }));
  const weekUpsert = await supabaseClient.from("week_meal_plans").upsert(weekRows, {
    onConflict: "user_id,week_key,day_name"
  });
  if (weekUpsert.error) {
    throw weekUpsert.error;
  }

  const weekDelete = await supabaseClient
    .from("week_meal_plans")
    .delete()
    .eq("user_id", activeUserId)
    .neq("week_key", weekKey);
  if (weekDelete.error) {
    throw weekDelete.error;
  }
}

function syncNextListSelection() {
  const neededItemIds = new Set(
    state.shoppingItems
      .filter((item) => item.pantryStatus === "need")
      .map((item) => item.id)
  );

  state.selectedNextListItemIds = state.selectedNextListItemIds.filter((id) => neededItemIds.has(id));
}

function saveAndRender() {
  state.todayMealPlan = normalizeTodayMealPlan(state.todayMealPlan, new Set(state.mealOptions.map((item) => item.id)));
  state.weekMealPlan = normalizeWeekMealPlan(state.weekMealPlan, new Set(state.mealOptions.map((item) => item.id)));
  syncNextListSelection();
  persistState();
  if (!skipRemoteSync) {
    void syncStateToSupabase().catch((error) => {
      console.error("Could not sync meal planner data to Supabase.", error);
    });
  }
  renderMealBoard();
  renderMealDeleteSelect();
  renderRecipeBoard();
  syncRecipeFormFromMealName();
  renderTodayMealPlan();
  renderWeekMealPlan();
  renderShoppingCategorySelect();
  renderBulkStoreSelect();
  renderShoppingCategoryTabs();
  renderShoppingBoard();
  renderShoppingDeleteSelect();
  renderShoppingCategoryEditor();
  renderStoreChips();
  renderStoreSourceBoard();
  renderStoreJumpTabs();
  renderStoreBoard();
  renderPantryBoard();
  renderNextListBoard();
  renderReportFilterOptions();
  renderReports();
}

function getScopedStorageKey() {
  const userId = window.MealPlannerAuth?.getCurrentUserId?.() || "";
  return userId ? `${STORAGE_KEY}::${userId}` : STORAGE_KEY;
}

function renderMealBoard() {
  mealBoard.innerHTML = "";

  mealTypes.forEach((mealType) => {
    const column = mealColumnTemplate.content.firstElementChild.cloneNode(true);
    column.querySelector("h3").textContent = mealType;
    const body = column.querySelector(".sheet-column-body");
    const options = state.mealOptions.filter((item) => item.mealType === mealType);

    if (!options.length) {
      body.append(createEmptyState("No meal options yet."));
    } else {
      options.forEach((option) => body.append(createSimpleItem(option.dish)));
    }

    mealBoard.append(column);
  });
}

function renderRecipeBoard() {
  recipeBoard.innerHTML = "";

  const recipes = state.recipes
    .filter((item) => item.mealName.trim() && item.notes.trim())
    .slice()
    .sort((left, right) => left.mealName.localeCompare(right.mealName));

  if (!recipes.length) {
    recipeBoard.append(createEmptyState("No recipe notes yet."));
  } else {
    recipes.forEach((recipe) => recipeBoard.append(createRecipeNoteItem(recipe)));
  }
}

function syncRecipeFormFromMealName() {
  const mealName = recipeMealNameInput.value.trim().toLowerCase();
  const existingRecipe = state.recipes.find(
    (item) => item.mealName.trim().toLowerCase() === mealName
  );

  if (!mealName) {
    recipeFormStatus.textContent = "";
    saveRecipeButton.textContent = "Save recipe note";
    return;
  }

  if (existingRecipe) {
    if (document.activeElement !== recipeNotesInput) {
      recipeNotesInput.value = existingRecipe.notes;
    }
    recipeFormStatus.textContent = "Recipe found. You can update it here.";
    saveRecipeButton.textContent = "Update recipe note";
  } else {
    recipeFormStatus.textContent = "This will save as a new recipe.";
    saveRecipeButton.textContent = "Save recipe note";
  }
}

function renderTodayMealPlan() {
  todayPlanBoard.innerHTML = "";

  const heading = document.createElement("div");
  heading.className = "plan-date-banner";
  heading.innerHTML = `<strong>${escapeHtml(formatDisplayDate(state.todayMealPlan.date))}</strong>`;
  todayPlanBoard.append(heading, createTodayMealTable());
}

function renderWeekMealPlan() {
  weekPlanBoard.innerHTML = "";

  const table = document.createElement("div");
  table.className = "week-plan-table";

  const header = document.createElement("div");
  header.className = "week-plan-header week-plan-row";
  header.append(createWeekPlanHeadCell("Day"));
  mealTypes.forEach((mealType) => header.append(createWeekPlanHeadCell(mealType)));
  table.append(header);

  weekDays.forEach((day) => {
    const row = document.createElement("div");
    row.className = "week-plan-row";
    row.append(createWeekPlanDayCell(day));

    mealTypes.forEach((mealType) => {
      const cell = document.createElement("div");
      cell.className = "week-plan-cell";
      const currentMealId = state.weekMealPlan[day]?.[mealType] || "";
      const label = document.createElement("span");
      label.className = "week-plan-mobile-label";
      label.textContent = mealType;
      cell.append(label);

      const select = buildMealOptionSelect(mealType, currentMealId, (nextMealId) => {
        state.weekMealPlan[day][mealType] = nextMealId;
        saveAndRender();
      });
      select.classList.add("week-plan-select");
      cell.append(select);

      row.append(cell);
    });

    table.append(row);
  });

  weekPlanBoard.append(table);
}

function buildMealOptionSelect(mealType, selectedMealId, onChange) {
  const select = document.createElement("select");
  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = `Choose ${mealType.toLowerCase()}`;
  select.append(placeholder);

  state.mealOptions
    .filter((item) => item.mealType === mealType)
    .sort((left, right) => left.dish.localeCompare(right.dish))
    .forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.dish;
      select.append(option);
    });

  select.value = [...select.options].some((option) => option.value === selectedMealId)
    ? selectedMealId
    : "";

  select.addEventListener("change", () => onChange(select.value));
  return select;
}

function createWeekPlanHeadCell(label) {
  const cell = document.createElement("div");
  cell.className = "week-plan-head-cell";
  cell.textContent = label;
  return cell;
}

function createWeekPlanDayCell(day) {
  const cell = document.createElement("div");
  cell.className = "week-plan-day-cell";
  cell.textContent = day;
  return cell;
}

function getMealNameById(mealId) {
  return state.mealOptions.find((item) => item.id === mealId)?.dish || "";
}

function createTodayMealTable() {
  const wrap = document.createElement("section");
  wrap.className = "today-meal-table-card";

  const table = document.createElement("div");
  table.className = "today-meal-table";

  const header = document.createElement("div");
  header.className = "today-meal-table-row today-meal-table-header";
  header.innerHTML = `
    <span>Meal type</span>
    <span>Selected meal</span>
  `;
  table.append(header);

  mealTypes.forEach((mealType) => {
    const row = document.createElement("div");
    row.className = "today-meal-table-row";

    const name = document.createElement("strong");
    name.textContent = mealType;

    const currentMealId = state.todayMealPlan.selections[mealType] || "";
    const select = buildMealOptionSelect(mealType, currentMealId, (nextMealId) => {
      state.todayMealPlan.date = getTodayLabel();
      state.todayMealPlan.selections[mealType] = nextMealId;
      saveAndRender();
    });
    select.classList.add("table-select");

    row.append(name, select);
    table.append(row);
  });

  wrap.append(table);
  return wrap;
}

function renderShoppingCategorySelect() {
  const select = shoppingForm.elements.categoryId;
  select.innerHTML = "";

  state.shoppingCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    select.append(option);
  });
}

function renderMealDeleteSelect() {
  const select = mealDeleteForm.elements.mealId;
  const previousValue = select.value;
  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a meal option";
  select.append(placeholder);

  state.mealOptions
    .slice()
    .sort((left, right) => {
      if (left.mealType === right.mealType) {
        return left.dish.localeCompare(right.dish);
      }
      return mealTypes.indexOf(left.mealType) - mealTypes.indexOf(right.mealType);
    })
    .forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${item.mealType} - ${item.dish}`;
      select.append(option);
    });

  if ([...select.options].some((option) => option.value === previousValue)) {
    select.value = previousValue;
  }
}

function renderShoppingDeleteSelect() {
  const select = shoppingDeleteForm.elements.itemId;
  const previousValue = select.value;
  select.innerHTML = "";

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Choose a shopping item";
  select.append(placeholder);

  state.shoppingItems
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name))
    .forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${item.name} - ${findCategory(item.categoryId)?.name || "Category"}`;
      select.append(option);
    });

  if ([...select.options].some((option) => option.value === previousValue)) {
    select.value = previousValue;
  }
}

function renderShoppingCategoryEditor() {
  const itemSelect = shoppingCategoryForm.elements.itemId;
  const categorySelect = shoppingCategoryForm.elements.categoryId;
  const previousItemValue = itemSelect.value;

  itemSelect.innerHTML = "";
  categorySelect.innerHTML = "";

  const itemPlaceholder = document.createElement("option");
  itemPlaceholder.value = "";
  itemPlaceholder.textContent = "Choose an item";
  itemSelect.append(itemPlaceholder);

  state.shoppingItems
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name))
    .forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = `${item.name} - ${findCategory(item.categoryId)?.name || "Category"}`;
      itemSelect.append(option);
    });

  const categoryPlaceholder = document.createElement("option");
  categoryPlaceholder.value = "";
  categoryPlaceholder.textContent = "Choose a category";
  categorySelect.append(categoryPlaceholder);

  state.shoppingCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    categorySelect.append(option);
  });

  if ([...itemSelect.options].some((option) => option.value === previousItemValue)) {
    itemSelect.value = previousItemValue;
    const selectedItem = state.shoppingItems.find((item) => item.id === previousItemValue);
    if (selectedItem) {
      categorySelect.value = selectedItem.categoryId;
    }
  }

  itemSelect.onchange = () => {
    const selectedItem = state.shoppingItems.find((item) => item.id === itemSelect.value);
    categorySelect.value = selectedItem ? selectedItem.categoryId : "";
  };
}

function renderShoppingBoard() {
  shoppingBoard.innerHTML = "";

  const categoriesWithItems = state.shoppingCategories
    .map((category) => ({
      category,
      items: state.shoppingItems.filter((item) => item.categoryId === category.id)
    }))
    .filter(({ items }) => items.length > 0);

  if (!categoriesWithItems.length) {
    shoppingBoard.append(createEmptyState("No shopping categories with items yet."));
    return;
  }

  categoriesWithItems.forEach(({ category, items }) => {
    const column = mealColumnTemplate.content.firstElementChild.cloneNode(true);
    column.id = `shopping-category-${category.id}`;
    column.querySelector("h3").textContent = category.name;
    const body = column.querySelector(".sheet-column-body");
    items.forEach((item) => body.append(createShoppingCard(item, { selectable: false })));

    shoppingBoard.append(column);
  });
}

function renderShoppingCategoryTabs() {
  shoppingCategoryTabs.innerHTML = "";

  const categoriesWithItems = state.shoppingCategories
    .filter((category) => state.shoppingItems.some((item) => item.categoryId === category.id));

  categoriesWithItems.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "jump-tab-button";
    button.textContent = category.name;
    button.addEventListener("click", () => {
      scrollBoardToChild(shoppingBoard, `#shopping-category-${category.id}`);
    });
    shoppingCategoryTabs.append(button);
  });
}

function renderStoreChips() {
  storeChips.innerHTML = "";

  state.stores.forEach((store) => {
    const chip = document.createElement("div");
    chip.className = "store-chip";
    chip.style.background = store.color;
    chip.innerHTML = `<span>${escapeHtml(store.name)}</span>`;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "Remove";
    deleteButton.addEventListener("click", () => {
      state.stores = state.stores.filter((entry) => entry.id !== store.id);
      state.shoppingItems = state.shoppingItems.map((item) =>
        item.storeId === store.id ? { ...item, storeId: "" } : item
      );
      saveAndRender();
    });

    chip.append(deleteButton);
    storeChips.append(chip);
  });
}

function renderStoreSourceBoard() {
  storeSourceBoard.innerHTML = "";

  const categoryGroups = state.shoppingCategories
    .map((category) => ({
      category,
      items: state.shoppingItems.filter((item) => item.categoryId === category.id && !item.storeId)
    }))
    .filter((group) => group.items.length > 0);

  if (!categoryGroups.length) {
    storeSourceBoard.append(createEmptyState("All available items have been assigned to stores."));
    return;
  }

  categoryGroups.forEach(({ category, items }) => {
      const column = mealColumnTemplate.content.firstElementChild.cloneNode(true);
      const head = column.querySelector(".sheet-column-head");
      const allSelected = items.length > 0 && items.every((item) => state.selectedStoreItemIds.includes(item.id));
      head.innerHTML = `
        <div class="column-head-row">
          <h3>${escapeHtml(category.name)}</h3>
          <button type="button" class="ghost-button select-all-button">${allSelected ? "Unselect all" : "Select all"}</button>
        </div>
      `;
      const body = column.querySelector(".sheet-column-body");

      head.querySelector(".select-all-button").addEventListener("click", () => {
        if (allSelected) {
          const itemIds = new Set(items.map((item) => item.id));
          state.selectedStoreItemIds = state.selectedStoreItemIds.filter((id) => !itemIds.has(id));
        } else {
          state.selectedStoreItemIds = [...new Set([
            ...state.selectedStoreItemIds,
            ...items.map((item) => item.id)
          ])];
        }
        saveAndRender();
      });

      items.forEach((item) => body.append(createShoppingCard(item, { selectable: true })));

      storeSourceBoard.append(column);
    });
}

function renderStoreBoard() {
  storeBoard.innerHTML = "";

  state.stores.forEach((store) => {
    const items = state.shoppingItems.filter((item) => item.storeId === store.id);
    storeBoard.append(createDropStoreColumn(store.name, store.color, store.id, items, `No items assigned to ${store.name}.`));
  });
}

function renderStoreJumpTabs() {
  storeJumpTabs.innerHTML = "";

  state.stores.forEach((store) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "jump-tab-button";
    button.textContent = store.name;
    button.style.background = `linear-gradient(135deg, ${store.color}, ${store.color}dd)`;
    button.style.color = "#fff";
    button.addEventListener("click", () => {
      scrollBoardToChild(storeBoard, `#store-column-${store.id}`);
    });
    storeJumpTabs.append(button);
  });
}

function renderPantryBoard() {
  pantryBoard.innerHTML = "";
  const pantrySearchText = pantrySearchInput.value.trim().toLowerCase();

  if (!state.shoppingItems.length) {
    pantryBoard.append(createEmptyState("Shopping items will appear here for pantry check."));
    return;
  }

  let hasResults = false;

  state.shoppingCategories.forEach((category) => {
    const items = state.shoppingItems.filter((item) =>
      item.categoryId === category.id
      && (!pantrySearchText || item.name.toLowerCase().includes(pantrySearchText))
    );
    if (!items.length) {
      return;
    }

    hasResults = true;

    const section = document.createElement("section");
    section.className = "pantry-category-section";
    section.innerHTML = `
      <div class="pantry-category-head">
        <h3>${escapeHtml(category.name)}</h3>
      </div>
    `;

    const body = document.createElement("div");
    body.className = "pantry-category-body";

    items.forEach((item) => {
      const row = pantryRowTemplate.content.firstElementChild.cloneNode(true);
      const store = findStore(item.storeId);

      row.querySelector("strong").textContent = item.name;
      row.querySelector(".pantry-qty").textContent = item.quantity;
      row.querySelector(".pantry-meta").textContent = store ? store.name : "No store yet";

      const button = row.querySelector(".pantry-need-button");
      const isNeeded = item.pantryStatus === "need";
      button.textContent = isNeeded ? "Remove from list" : "Add to list";
      button.classList.toggle("ghost-button", isNeeded);
      button.classList.toggle("primary-button", !isNeeded);
      button.classList.toggle("danger-button", isNeeded);
      button.addEventListener("click", () => {
        item.pantryStatus = isNeeded ? "unknown" : "need";
        saveAndRender();
      });

      body.append(row);
    });

    section.append(body);
    pantryBoard.append(section);
  });

  if (!hasResults) {
    pantryBoard.append(createEmptyState("No pantry items match your search."));
  }
}

function renderNextListBoard() {
  nextListBoard.innerHTML = "";

  const neededItems = state.shoppingItems.filter((item) => item.pantryStatus === "need");
  if (!neededItems.length) {
    nextListBoard.append(createStoreColumn("Next Shopping List", "#7a3cff", [], "Use pantry check and mark items as 'Need to buy'."));
    return;
  }

  const unassigned = neededItems.filter((item) => !item.storeId);
  if (unassigned.length) {
    nextListBoard.append(createNextListStoreColumn("Unassigned", "#59636a", unassigned, "No items."));
  }

  state.stores.forEach((store) => {
    const items = neededItems.filter((item) => item.storeId === store.id);
    nextListBoard.append(createNextListStoreColumn(store.name, store.color, items, `Nothing to buy from ${store.name}.`));
  });
}

function renderReports() {
  reportStats.innerHTML = "";
  reportChart.innerHTML = "";
  reportHistory.innerHTML = "";

  const filters = getReportFilters();
  const purchaseHistory = [...state.purchaseHistory]
    .filter((entry) => matchesReportFilters(entry, filters))
    .sort((left, right) =>
      right.purchasedAt.localeCompare(left.purchasedAt)
    );

  const totalPurchased = purchaseHistory.length;
  const purchaseDays = new Set(purchaseHistory.map((entry) => entry.purchasedAt)).size;
  const purchasedThisWeek = purchaseHistory.filter((entry) => isWithinLastDays(entry.purchasedAt, 7)).length;

  [
    { label: "Total purchased", value: totalPurchased },
    { label: "Purchase days", value: purchaseDays },
    { label: "Last 7 days", value: purchasedThisWeek }
  ].forEach((stat) => {
    const card = document.createElement("article");
    card.className = "report-stat-card";
    card.innerHTML = `<span>${escapeHtml(stat.label)}</span><strong>${escapeHtml(String(stat.value))}</strong>`;
    reportStats.append(card);
  });

  const countsByDay = purchaseHistory.reduce((acc, entry) => {
    acc[entry.purchasedAt] = (acc[entry.purchasedAt] || 0) + 1;
    return acc;
  }, {});
  const chartEntries = Object.entries(countsByDay).sort((left, right) => left[0].localeCompare(right[0]));
  const maxCount = Math.max(1, ...chartEntries.map(([, count]) => count));

  if (!chartEntries.length) {
    reportChart.append(createEmptyState("Mark items as purchased from the next list to see the chart."));
    reportHistory.append(createEmptyState("No purchases recorded yet."));
    return;
  }

  chartEntries.forEach(([date, count]) => {
    const row = document.createElement("div");
    row.className = "chart-row";
    row.innerHTML = `
      <span class="chart-label">${escapeHtml(formatDisplayDate(date))}</span>
      <div class="chart-bar-track">
        <div class="chart-bar-fill" style="width: ${(count / maxCount) * 100}%"></div>
      </div>
      <span class="chart-value">${escapeHtml(String(count))}</span>
    `;
    reportChart.append(row);
  });

  const groupedHistory = chartEntries
    .slice()
    .sort((left, right) => right[0].localeCompare(left[0]))
    .map(([date]) => ({
      date,
      entries: purchaseHistory.filter((entry) => entry.purchasedAt === date)
    }));

  groupedHistory.forEach(({ date, entries }) => {
    const row = document.createElement("div");
    row.className = "report-history-row";
    const itemList = entries
      .map((entry) => `${entry.name}${entry.quantity ? ` (${entry.quantity})` : ""}`)
      .join(", ");
    row.innerHTML = `
      <span class="report-history-date">${escapeHtml(formatDisplayDate(date))}</span>
      <span class="report-history-items">${escapeHtml(itemList)}</span>
    `;
    reportHistory.append(row);
  });
}

function createShoppingCard(item, options = {}) {
  const { selectable = true } = options;
  const node = shoppingItemTemplate.content.firstElementChild.cloneNode(true);

  node.dataset.itemId = item.id;
  const checkbox = node.querySelector(".item-select");
  const checkWrap = node.querySelector(".item-check");
  node.querySelector("strong").textContent = item.name;
  node.querySelector(".item-qty").textContent = item.quantity;

  if (!selectable) {
    checkWrap.remove();
  } else {
    checkbox.checked = state.selectedStoreItemIds.includes(item.id);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        state.selectedStoreItemIds = [...new Set([...state.selectedStoreItemIds, item.id])];
      } else {
        state.selectedStoreItemIds = state.selectedStoreItemIds.filter((id) => id !== item.id);
      }
      persistState();
    });
  }

  return node;
}

function createDropStoreColumn(title, color, storeId, items, emptyMessage) {
  const column = document.createElement("section");
  column.className = "store-column";
  column.dataset.storeId = storeId;
  column.id = `store-column-${storeId}`;

  const head = document.createElement("div");
  head.className = "store-column-head";
  head.style.background = color;
  head.innerHTML = `<h3>${escapeHtml(title)}</h3>`;

  const body = document.createElement("div");
  body.className = "store-column-body";

  if (!items.length) {
    body.append(createEmptyState(emptyMessage));
  } else {
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "store-item-line";
      const categoryName = findCategory(item.categoryId)?.name || "Category";
      row.innerHTML = `
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <span class="empty-copy">${escapeHtml(categoryName)}</span>
        </div>
        <div class="store-item-controls">
          <span class="qty-pill">${escapeHtml(item.quantity)}</span>
        </div>
      `;
      const unassignButton = document.createElement("button");
      unassignButton.type = "button";
      unassignButton.className = "danger-button unassign-button";
      unassignButton.textContent = "Unassign";
      unassignButton.addEventListener("click", () => {
        item.storeId = "";
        saveAndRender();
      });
      row.querySelector(".store-item-controls").append(unassignButton);
      body.append(row);
    });
  }

  column.append(head, body);
  return column;
}

function createStoreColumn(title, color, items, emptyMessage) {
  const column = document.createElement("section");
  column.className = "store-column";

  const head = document.createElement("div");
  head.className = "store-column-head";
  head.style.background = color;
  head.innerHTML = `<h3>${escapeHtml(title)}</h3>`;

  const body = document.createElement("div");
  body.className = "store-column-body";

  if (!items.length) {
    body.append(createEmptyState(emptyMessage));
  } else {
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "store-item-line";
      row.innerHTML = `
        <div>
          <strong>${escapeHtml(item.name)}</strong>
          <span class="empty-copy">${escapeHtml(findCategory(item.categoryId)?.name || "Category")}</span>
        </div>
        <span class="qty-pill">${escapeHtml(item.quantity)}</span>
      `;
      body.append(row);
    });
  }

  column.append(head, body);
  return column;
}

function createNextListStoreColumn(title, color, items, emptyMessage) {
  const column = createStoreColumn(title, color, [], emptyMessage);
  const head = column.querySelector(".store-column-head");
  const body = column.querySelector(".store-column-body");
  const allSelected = items.length > 0 && items.every((item) => state.selectedNextListItemIds.includes(item.id));
  head.innerHTML = `
    <div class="column-head-row">
      <h3>${escapeHtml(title)}</h3>
      <button type="button" class="ghost-button select-all-button">${allSelected ? "Unselect all" : "Select all"}</button>
    </div>
  `;
  body.innerHTML = "";

  if (!items.length) {
    head.querySelector(".select-all-button").disabled = true;
    body.append(createEmptyState(emptyMessage));
    return column;
  }

  head.querySelector(".select-all-button").addEventListener("click", () => {
    if (allSelected) {
      const itemIds = new Set(items.map((item) => item.id));
      state.selectedNextListItemIds = state.selectedNextListItemIds.filter((id) => !itemIds.has(id));
    } else {
      state.selectedNextListItemIds = [...new Set([
        ...state.selectedNextListItemIds,
        ...items.map((item) => item.id)
      ])];
    }
    saveAndRender();
  });

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = "store-item-line";
    row.innerHTML = `
      <div>
        <strong>${escapeHtml(item.name)}</strong>
        <span class="empty-copy">${escapeHtml(findCategory(item.categoryId)?.name || "Category")}</span>
      </div>
      <div class="store-item-controls">
        <span class="qty-pill">${escapeHtml(item.quantity)}</span>
      </div>
    `;

    const selectWrap = document.createElement("label");
    selectWrap.className = "purchase-check";
    selectWrap.innerHTML = `
      <input type="checkbox" />
      <span>Select</span>
    `;
    const checkbox = selectWrap.querySelector("input");
    checkbox.checked = state.selectedNextListItemIds.includes(item.id);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        state.selectedNextListItemIds = [...new Set([...state.selectedNextListItemIds, item.id])];
      } else {
        state.selectedNextListItemIds = state.selectedNextListItemIds.filter((id) => id !== item.id);
      }
      persistState();
    });

    row.querySelector(".store-item-controls").append(selectWrap);
    body.append(row);
  });

  return column;
}

function createSimpleItem(title) {
  const card = document.createElement("article");
  card.className = "sheet-item";
  card.innerHTML = `
    <strong>${escapeHtml(title)}</strong>
  `;
  return card;
}

function createRecipeNoteItem(recipe) {
  const card = document.createElement("article");
  card.className = "recipe-note";
  const listItems = recipe.notes
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => `<li>${escapeHtml(line.replace(/^[\-\u2022]\s*/, ""))}</li>`)
    .join("");

  card.innerHTML = `
    <div class="recipe-note-header">
      <strong>${escapeHtml(recipe.mealName)}</strong>
    </div>
    <ul class="recipe-note-text">${listItems || `<li>${escapeHtml(recipe.notes)}</li>`}</ul>
  `;
  return card;
}

function createEmptyState(message) {
  const block = document.createElement("div");
  block.className = "empty-state";
  block.innerHTML = `<p class="empty-copy">${escapeHtml(message)}</p>`;
  return block;
}

function findCategory(categoryId) {
  return state.shoppingCategories.find((item) => item.id === categoryId);
}

function findStore(storeId) {
  return state.stores.find((item) => item.id === storeId);
}

function renderBulkStoreSelect() {
  populateStoreSelect(bulkStoreSelect, bulkStoreSelect.value, false);
}

function renderReportFilterOptions() {
  const previousItemValue = reportItemFilter.value;
  const previousValue = reportCategoryFilter.value;

  reportItemFilter.innerHTML = "";
  reportCategoryFilter.innerHTML = "";

  const allItemsOption = document.createElement("option");
  allItemsOption.value = "";
  allItemsOption.textContent = "All items";
  reportItemFilter.append(allItemsOption);

  const itemNames = [...new Set(
    state.shoppingItems
      .map((item) => item.name.trim())
      .filter(Boolean)
  )].sort((left, right) => left.localeCompare(right));

  itemNames.forEach((itemName) => {
    const option = document.createElement("option");
    option.value = itemName;
    option.textContent = itemName;
    reportItemFilter.append(option);
  });

  const allOption = document.createElement("option");
  allOption.value = "";
  allOption.textContent = "All categories";
  reportCategoryFilter.append(allOption);

  state.shoppingCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    reportCategoryFilter.append(option);
  });

  if ([...reportCategoryFilter.options].some((option) => option.value === previousValue)) {
    reportCategoryFilter.value = previousValue;
  }

  if ([...reportItemFilter.options].some((option) => option.value === previousItemValue)) {
    reportItemFilter.value = previousItemValue;
  }
}

function getReportFilters() {
  return {
    itemText: reportItemFilter.value.trim().toLowerCase(),
    categoryId: reportCategoryFilter.value,
    dateFrom: reportDateFrom.value,
    dateTo: reportDateTo.value
  };
}

function buildRecipesShareText() {
  const recipes = state.recipes
    .filter((item) => item.mealName.trim() && item.notes.trim())
    .slice()
    .sort((left, right) => left.mealName.localeCompare(right.mealName));

  if (!recipes.length) {
    return "Meal Planner Recipes\n\nNo recipe notes saved yet.";
  }

  return [
    "Meal Planner Recipes",
    "",
    ...recipes.flatMap((recipe) => [
      recipe.mealName.trim(),
      recipe.notes.trim(),
      ""
    ])
  ].join("\n").trim();
}

function buildShoppingShareText() {
  const categoriesWithItems = state.shoppingCategories
    .map((category) => ({
      category,
      items: state.shoppingItems
        .filter((item) => item.categoryId === category.id)
        .slice()
        .sort((left, right) => left.name.localeCompare(right.name))
    }))
    .filter(({ items }) => items.length);

  if (!categoriesWithItems.length) {
    return "Meal Planner Shopping List\n\nNo shopping items saved yet.";
  }

  return [
    "Meal Planner Shopping List",
    "",
    ...categoriesWithItems.flatMap(({ category, items }) => [
      category.name,
      ...items.map((item) => `- ${item.name}${item.quantity ? ` (${item.quantity})` : ""}`),
      ""
    ])
  ].join("\n").trim();
}

function buildTodayMealShareText() {
  const lines = [
    `Today's Meal - ${formatDisplayDate(state.todayMealPlan.date)}`,
    ""
  ];

  mealTypes.forEach((mealType) => {
    const mealName = getMealNameById(state.todayMealPlan.selections[mealType]) || "Not selected";
    lines.push(`${mealType}: ${mealName}`);
  });

  return lines.join("\n").trim();
}

function buildWeekMealShareText() {
  const lines = ["Week Meal Plan", ""];

  weekDays.forEach((day) => {
    lines.push(day);
    mealTypes.forEach((mealType) => {
      const mealName = getMealNameById(state.weekMealPlan[day]?.[mealType]) || "Not selected";
      lines.push(`- ${mealType}: ${mealName}`);
    });
    lines.push("");
  });

  return lines.join("\n").trim();
}

function buildNextListShareText() {
  const neededItems = state.shoppingItems.filter((item) => item.pantryStatus === "need");

  if (!neededItems.length) {
    return "Meal Planner Next List\n\nNo items are marked as need to buy.";
  }

  const lines = ["Meal Planner Next List", ""];

  const unassigned = neededItems
    .filter((item) => !item.storeId)
    .slice()
    .sort((left, right) => left.name.localeCompare(right.name));

  if (unassigned.length) {
    lines.push("Unassigned");
    unassigned.forEach((item) => {
      const categoryName = findCategory(item.categoryId)?.name || "Category";
      lines.push(`- ${item.name}${item.quantity ? ` (${item.quantity})` : ""} - ${categoryName}`);
    });
    lines.push("");
  }

  state.stores.forEach((store) => {
    const items = neededItems
      .filter((item) => item.storeId === store.id)
      .slice()
      .sort((left, right) => left.name.localeCompare(right.name));

    if (!items.length) {
      return;
    }

    lines.push(store.name);
    items.forEach((item) => {
      const categoryName = findCategory(item.categoryId)?.name || "Category";
      lines.push(`- ${item.name}${item.quantity ? ` (${item.quantity})` : ""} - ${categoryName}`);
    });
    lines.push("");
  });

  return lines.join("\n").trim();
}

async function copyTextToClipboard(text) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Fall through to textarea copy.
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.append(textarea);
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);
    const copied = document.execCommand("copy");
    textarea.remove();
    return copied;
  } catch {
    return false;
  }
}

function setShareStatus(node, message) {
  node.textContent = message;
  window.clearTimeout(node._clearTimer);
  node._clearTimer = window.setTimeout(() => {
    node.textContent = "";
  }, 2600);
}

function matchesReportFilters(entry, filters) {
  if (filters.itemText && !entry.name.toLowerCase().includes(filters.itemText)) {
    return false;
  }
  if (filters.categoryId && entry.categoryId !== filters.categoryId) {
    return false;
  }
  if (filters.dateFrom && entry.purchasedAt < filters.dateFrom) {
    return false;
  }
  if (filters.dateTo && entry.purchasedAt > filters.dateTo) {
    return false;
  }
  return true;
}

function getTodayLabel() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDisplayDate(dateString) {
  const date = new Date(`${dateString}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? dateString
    : new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(date);
}

function isWithinLastDays(dateString, days) {
  const date = new Date(`${dateString}T12:00:00`);
  if (Number.isNaN(date.getTime())) {
    return false;
  }
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  return diff >= 0 && diff <= days * 24 * 60 * 60 * 1000;
}

function populateStoreSelect(select, selectedId, includeBlank) {
  const previousValue = selectedId ?? select.value;
  select.innerHTML = "";

  if (includeBlank) {
    const blank = document.createElement("option");
    blank.value = "";
    blank.textContent = "No store";
    select.append(blank);
  } else {
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choose a store";
    select.append(placeholder);
  }

  state.stores.forEach((store) => {
    const option = document.createElement("option");
    option.value = store.id;
    option.textContent = store.name;
    select.append(option);
  });

  if ([...select.options].some((option) => option.value === previousValue)) {
    select.value = previousValue;
  } else if (!includeBlank) {
    select.value = "";
  }
}

function scrollBoardToChild(container, selector) {
  const target = container.querySelector(selector);
  if (!target) {
    return;
  }

  target.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
}

function setMobileMenuOpen(isOpen) {
  appShell?.classList.toggle("menu-open", isOpen);
  document.body.classList.toggle("drawer-open", isOpen);
  mobileMenuButton?.setAttribute("aria-expanded", String(isOpen));
}

function setMealControlsCollapsed(isCollapsed) {
  setControlsCollapsed(mealControlsCard, toggleMealControlsButton, isCollapsed);
}

function setControlsCollapsed(card, button, isCollapsed) {
  if (!card || !button) {
    return;
  }

  card.classList.toggle("is-collapsed", isCollapsed);
  button.textContent = isCollapsed ? "Show controls" : "Hide controls";
  button.setAttribute("aria-expanded", String(!isCollapsed));
}

function syncMealControlsForViewport() {
  if (window.innerWidth <= 920) {
    initializeCollapsedCard(mealControlsCard, toggleMealControlsButton);
    initializeCollapsedCard(shoppingControlsCard, toggleShoppingControlsButton);
    initializeCollapsedCard(storeControlsCard, toggleStoreControlsButton);
  } else {
    resetCollapsedCard(mealControlsCard, toggleMealControlsButton);
    resetCollapsedCard(shoppingControlsCard, toggleShoppingControlsButton);
    resetCollapsedCard(storeControlsCard, toggleStoreControlsButton);
  }
}

function initializeCollapsedCard(card, button) {
  if (!card || !button) {
    return;
  }
  if (!card.dataset.mobileInitialized) {
    setControlsCollapsed(card, button, true);
    card.dataset.mobileInitialized = "true";
  }
}

function resetCollapsedCard(card, button) {
  if (!card || !button) {
    return;
  }
  card.dataset.mobileInitialized = "";
  setControlsCollapsed(card, button, false);
}

function focusTab(tabName) {
  tabButtons.forEach((button) => button.classList.toggle("active", button.dataset.tab === tabName));
  panels.forEach((panel) => panel.classList.toggle("active", panel.id === `tab-${tabName}`));
  setMobileMenuOpen(false);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

async function initApp() {
  const authApi = window.MealPlannerAuth;

  if (authApi?.ensureAuthenticated) {
    const session = await authApi.ensureAuthenticated();
    if (document.body?.dataset.requiresAuth === "true" && !session) {
      return;
    }

    activeUserId = authApi.getCurrentUserId?.() || session?.user?.id || "";
    const localState = loadState();
    const remoteState = await loadRemoteState();
    skipRemoteSync = true;
    state = remoteState || localState;
    skipRemoteSync = false;
  } else if (document.body?.classList.contains("auth-pending")) {
    document.body.classList.remove("auth-pending");
  }

  saveAndRender();
  syncMealControlsForViewport();
  window.addEventListener("resize", syncMealControlsForViewport);
}

void initApp();
